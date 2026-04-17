"""Box (Steak Box) models"""
from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId

class BoxItem(BaseModel):
    name: str
    quantity: int
    unit: str  # oz, pcs, etc.

class Box(BaseModel):
    id: str
    name: str
    description: str
    price: float
    items: List[BoxItem]
    features: Optional[List[str]] = []
    image: Optional[str] = None
    featured: bool = False

class BoxCreate(BaseModel):
    name: str
    description: str
    price: float
    items: List[BoxItem]
    features: Optional[List[str]] = []
    image: Optional[str] = None
    featured: bool = False

class BoxUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    items: Optional[List[BoxItem]] = None
    features: Optional[List[str]] = None
    image: Optional[str] = None
    featured: Optional[bool] = None
