"""Membership models"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

class Membership(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    price: str
    yearly_price: Optional[str] = None
    features: list[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class MembershipCreate(BaseModel):
    name: str
    price: str
    yearly_price: Optional[str] = None
    features: list[str] = []

class MembershipUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[str] = None
    yearly_price: Optional[str] = None
    features: Optional[list[str]] = None
