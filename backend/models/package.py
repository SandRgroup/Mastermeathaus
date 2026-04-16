"""Package Product models for Half/Quarter Cow packages"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId

class PackageItem(BaseModel):
    name: str
    quantity: int
    weight: str  # e.g., "1 lb", "8 oz"

class Package(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    packageType: str  # "half_cow", "quarter_cow", "custom"
    description: str
    regularPrice: float
    salePrice: Optional[float] = None
    onSale: bool = False
    items: List[PackageItem] = []
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class PackageCreate(BaseModel):
    name: str
    packageType: str
    description: str
    regularPrice: float
    salePrice: Optional[float] = None
    onSale: bool = False
    items: List[PackageItem] = []
    image_url: Optional[str] = None

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    packageType: Optional[str] = None
    description: Optional[str] = None
    regularPrice: Optional[float] = None
    salePrice: Optional[float] = None
    onSale: Optional[bool] = None
    items: Optional[List[PackageItem]] = None
    image_url: Optional[str] = None
