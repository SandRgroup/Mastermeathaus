"""Menu and Settings models"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime, timezone
from bson import ObjectId

class MenuItem(BaseModel):
    id: str
    title: str
    url: str
    is_external: bool = False
    enabled: bool = True

class MenuItemCreate(BaseModel):
    title: str
    url: str
    is_external: bool = False
    enabled: bool = True

class BBQPricing(BaseModel):
    basePrice: float
    aging: dict[str, Any] = {}
    modes: dict[str, Any] = {}
    categories: dict[str, Any] = {}
    totalMeatPerPerson: float = 1.2
    label: str = "lb"

class SiteSettings(BaseModel):
    hero_headline: str = "Premium cuts. No shortcuts."
    brand_name: str = "Masters Meat Haus"
    brand_tagline: str = "MASTERS MEAT HAUS®"
