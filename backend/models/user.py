"""Authentication and User models"""
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timezone
from bson import ObjectId

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: str
    name: str
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
