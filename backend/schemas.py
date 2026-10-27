from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


# Item Schemas
class LostItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    date_lost: datetime
    location_lost: str = Field(..., min_length=1, max_length=150)
    category: str = Field(..., min_length=1, max_length=50)


class LostItemOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    date_lost: datetime
    location_lost: str
    category: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class FoundItemOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    date_found: datetime
    location_found: str
    category: str
    image_s3_key: Optional[str] = None
    presigned_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
