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
from typing import Dict, Any
from dotenv import load_dotenv

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
