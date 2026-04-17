"""Package Product models for Half/Quarter Cow packages"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId

class PackageItem(BaseModel):
    name: str
    quantity: int
    unit: str

class Package(BaseModel):
    id: str
    name: str
    description: str
    salePrice: float
    regularPrice: float
    items: List[PackageItem] = []
    
class PackageCreate(BaseModel):
    name: str
    description: str
    salePrice: float
    regularPrice: float
    items: List[PackageItem] = []

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    salePrice: Optional[float] = None
    regularPrice: Optional[float] = None
    items: Optional[List[PackageItem]] = None
