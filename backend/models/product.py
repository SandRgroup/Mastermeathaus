"""Product models"""
from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId
from uuid import uuid4

class Product(BaseModel):
    id: str = Field(default_factory=lambda: f"prod_{uuid4().hex[:8]}")
    name: str
    description: str
    price: str  # Stored as string in DB (e.g., "$42.00")
    grade: Optional[str] = None
    weight: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    featured: bool = False
    inStock: bool = True
    badgeText: Optional[str] = None
    badgeColor: Optional[str] = "gold"
    isBBQProduct: bool = False
    wagyuUpcharge: Optional[float] = None
    grassFedUpcharge: Optional[float] = None
    dryAgedUpcharge: Optional[float] = None
    meatType: Optional[str] = None
    originalPrice: Optional[str] = None
    cookingTemp: Optional[str] = None
    weight_unit: Optional[str] = "oz"

    class Config:
        populate_by_name = True

class ProductCreate(BaseModel):
    name: str
    description: str
    price: str
    grade: Optional[str] = "Prime"
    weight: Optional[str] = None
    image: Optional[str] = "/api/placeholder/400/300"
    category: Optional[str] = "beef"
    featured: bool = False
    inStock: bool = True
    badgeText: Optional[str] = None
    badgeColor: Optional[str] = "gold"
    isBBQProduct: bool = False
    wagyuUpcharge: Optional[float] = None
    grassFedUpcharge: Optional[float] = None
    dryAgedUpcharge: Optional[float] = None
    meatType: Optional[str] = None
    originalPrice: Optional[str] = None
    cookingTemp: Optional[str] = None
    weight_unit: Optional[str] = "oz"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    grade: Optional[str] = None
    weight: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    featured: Optional[bool] = None
    inStock: Optional[bool] = None
    badgeText: Optional[str] = None
    badgeColor: Optional[str] = None
    isBBQProduct: Optional[bool] = None
    wagyuUpcharge: Optional[float] = None
    grassFedUpcharge: Optional[float] = None
    dryAgedUpcharge: Optional[float] = None
    meatType: Optional[str] = None
    originalPrice: Optional[str] = None
    cookingTemp: Optional[str] = None
    weight_unit: Optional[str] = None
