"""Product models"""
from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    grade: Optional[str] = None
    description: str
    price: float
    image_url: Optional[str] = None
    availableForBBQ: bool = False
    pricePerLb: Optional[float] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ProductCreate(BaseModel):
    name: str
    grade: Optional[str] = None
    description: str
    price: float
    image_url: Optional[str] = None
    availableForBBQ: bool = False
    pricePerLb: Optional[float] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    availableForBBQ: Optional[bool] = None
    pricePerLb: Optional[float] = None
