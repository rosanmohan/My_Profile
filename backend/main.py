from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import json
import os
import shutil
import uuid
import cloudinary
import cloudinary.uploader
import pydantic
from typing import Dict, Any
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr

load_dotenv() # Load environment variables

import models
import schemas
import auth
import database

# --- Cloudinary Config ---
cloudinary.config( 
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET"),
  secure = True
)


# Create Database Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static directory to serve images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Portfolio API"}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load default template
DEFAULT_DATA_FILE = "resume_data.json"
def get_default_resume_data():
    if os.path.exists(DEFAULT_DATA_FILE):
        with open(DEFAULT_DATA_FILE, "r") as f:
            return f.read() # Return as string
    return "{}"

# --- Auth Routes ---

@app.post("/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create initial resume for user (using template)
    default_data = get_default_resume_data()
    new_resume = models.Resume(user_id=new_user.id, data=default_data)
    db.add(new_resume)
    db.commit()

    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(auth.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

class PasswordVerification(pydantic.BaseModel):
    password: str

@app.post("/api/verify-password")
def verify_user_password(
    verification: PasswordVerification,
    current_user: models.User = Depends(auth.get_current_user), 
):
    if not auth.verify_password(verification.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    return {"message": "Password verified"}


# --- Email Config ---
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from uuid import uuid4
import random
import string

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_USERNAME"),
    MAIL_PORT = 465,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = False,
    MAIL_SSL_TLS = True,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

# Store OTPs in memory for simplicity (In production use Redis or DB)
otp_store = {} 

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

@app.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(auth.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # Don't reveal user existence, just fake success or ambiguous error
        # But for UX here we might verify.
        raise HTTPException(status_code=404, detail="Email not registered")
    
    # Generate OTP
    otp = ''.join(random.choices(string.digits, k=6))
    otp_store[request.email] = otp
    
    html = f"""
    <p>Your password reset code is: <strong>{otp}</strong></p>
    <p>If you did not request this, please ignore this email.</p>
    """

    message = MessageSchema(
        subject="Password Reset - Portfolio App",
        recipients=[request.email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        # Debug Logs
        print(f"Sending email to: {request.email}")
        print(f"Mail Config: User={os.getenv('MAIL_USERNAME')}, PwdSet={'Yes' if os.getenv('MAIL_PASSWORD') else 'No'}")
        
        await fm.send_message(message)
        print("Email sent successfully")
    except Exception as e:
        print(f"CRITICAL EMAIL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "Email sent"}

@app.post("/auth/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(auth.get_db)):
    # Verify OTP
    stored_otp = otp_store.get(request.email)
    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired Code")
    
    # Reset Password
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
         
    user.hashed_password = auth.get_password_hash(request.new_password)
    db.commit()
    
    # Clear OTP
    del otp_store[request.email]
    
    return {"message": "Password updated successfully"}

# --- Resume Routes ---

@app.get("/api/resume")
def get_resume(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if not resume:
        # Should not happen if registered correctly, but handle gracefully
        return {}
    return json.loads(resume.data)

@app.post("/api/resume")
def update_resume(resume_in: schemas.ResumeUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if not resume:
        # Create if missing
        resume = models.Resume(user_id=current_user.id, data=json.dumps(resume_in.data))
        db.add(resume)
    else:
        resume.data = json.dumps(resume_in.data)
    
    db.commit()
    return {"message": "Resume updated successfully"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    
    # Check if Cloudinary is configured
    if os.getenv("CLOUDINARY_CLOUD_NAME"):
        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(file.file, folder="portfolio_uploads")
            return {"url": result.get("secure_url")}
        except Exception as e:
            print(f"Cloudinary upload failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Image upload failed")
            
    # Fallback to Local Storage
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL
    # IMPORTANT: In production without cloudinary, this needs the real domain
    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    file_url = f"{base_url}/uploads/{unique_filename}"
    return {"url": file_url}

@app.post("/api/resume/public-link")
def generate_public_link(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(auth.get_db)):
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if not resume:
        # Create if missing (edge case) or error
        # Assuming resume exists if user is logged in usually, but to be safe:
        resume = models.Resume(user_id=current_user.id, data=get_default_resume_data())
        db.add(resume)
        db.commit() # Commit to get ID
        
    if not resume.public_id:
        resume.public_id = str(uuid.uuid4())
        db.commit()
    
    return {"public_id": resume.public_id}

@app.get("/api/public-resume/{public_id}")
def get_public_resume(public_id: str, db: Session = Depends(auth.get_db)):
    resume = db.query(models.Resume).filter(models.Resume.public_id == public_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return json.loads(resume.data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
