from pydantic import BaseModel
from typing import Optional, Dict, Any

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    otp: str
    title: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    mobile_no: str

class UserLogin(UserBase):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ResumeUpdate(BaseModel):
    data: Dict[str, Any]
