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
import requests
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

# --- Pydantic Models for Auth ---
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# --- Auth Routes ---

# Logger Setup
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/auth/send-register-otp")
async def send_register_otp(request: ForgotPasswordRequest, db: Session = Depends(auth.get_db)):
    logger.info(f"OTP Request for email: {request.email}")

    # 1. Strict Email Validation
    try:
        from email_validator import validate_email, EmailNotValidError
        validate_email(request.email, check_deliverability=True)
    except EmailNotValidError as e:
        logger.warning(f"Invalid email: {request.email} - {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid email address: {str(e)}")

    # 2. Check if already exists
    db_user = db.query(models.User).filter(models.User.email == request.email).first()
    if db_user:
        logger.warning(f"Email already registered: {request.email}")
        raise HTTPException(status_code=400, detail="Email already registered")

    # 3. Generate and Send OTP
    otp = ''.join(random.choices(string.digits, k=6))
    otp_store[request.email] = otp
    
    # Use the Google Apps Script Relay
    SCRIPT_URL = os.getenv("GOOGLE_SCRIPT_URL")
    
    if not SCRIPT_URL:
        logger.error("GOOGLE_SCRIPT_URL not found in environment variables!")
        raise HTTPException(status_code=500, detail="Server misconfiguration: Missing Email Service URL")

    try:
        logger.info(f"Sending OTP via Relay to: {request.email} using URL: {SCRIPT_URL}")
        response = requests.post(SCRIPT_URL, json={"email": request.email, "otp": otp})
        logger.info(f"Relay Response Status: {response.status_code}")
        logger.info(f"Relay Response Body: {response.text}")
        
        if response.status_code != 200:
             logger.error(f"Script returned non-200 status: {response.status_code}")
             raise Exception(f"Script returned {response.status_code}")
             
    except Exception as e:
        logger.critical(f"CRITICAL RELAY ERROR for {request.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "OTP sent"}

@app.post("/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(auth.get_db)):
    # 1. Verify OTP
    stored_otp = otp_store.get(user.email)
    if not stored_otp or stored_otp != user.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # 2. Check if already exists (Double check)
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        title=user.title,
        first_name=user.first_name,
        middle_name=user.middle_name,
        last_name=user.last_name,
        mobile_no=user.mobile_no
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create initial resume for user (using template)
    default_data = get_default_resume_data()
    new_resume = models.Resume(user_id=new_user.id, data=default_data)
    db.add(new_resume)
    db.commit()
    
    # Clear OTP
    del otp_store[user.email]

    # Send Welcome Email
    try:
        SCRIPT_URL = os.getenv("GOOGLE_SCRIPT_URL")
        review_link = "https://portfolio-builder-app.com/feedback" # Replace with actual link if available or generic
        
        # Construct email body
        full_name = f"{user.first_name} {user.last_name}"
        subject = "Welcome to Portfolio Builder!"
        body = f"Dear {user.title or ''} {full_name},\n\nWelcome to Portfolio Builder! We are thrilled to have you onboard.\n\nTo help us improve, please share your thoughts and reviews here: {review_link}\n\nBest Regards,\nThe Team"
        
        # We send 'otp' as 'Welcome' or similar if the script depends on it, but better to send a proper payload.
        # Assuming the user updates the script to handle 'subject' and 'body'.
        print(f"Sending Welcome Email to: {user.email}")
        requests.post(SCRIPT_URL, json={
            "email": user.email, 
            "subject": subject, 
            "body": body,
            "type": "welcome" 
        })
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

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




# --- Email Config (Google Scripts Relay) ---
from uuid import uuid4
import random
import string

# Store OTPs in memory for simplicity (In production use Redis or DB)
otp_store = {} 

@app.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(auth.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
    
    # Generate OTP
    otp = ''.join(random.choices(string.digits, k=6))
    otp_store[request.email] = otp
    
    # Use the Google Apps Script Relay (Free, no domain needed)
    SCRIPT_URL = "https://script.google.com/macros/s/AKfycbywhObhpQe6ySwjj3kiGTFGPpzGIs9mrd7qJ0eKg642oAqzneMyLcyY2qxl8W0_Gh-F/exec"
    
    try:
        print(f"Sending email via Relay to: {request.email}")
        response = requests.post(SCRIPT_URL, json={"email": request.email, "otp": otp})
        print(f"Relay Response: {response.text}")
        
        if response.status_code != 200:
             raise Exception(f"Script returned {response.status_code}")
             
    except Exception as e:
        print(f"CRITICAL RELAY ERROR: {str(e)}")
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
