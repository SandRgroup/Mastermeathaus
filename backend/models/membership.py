"""Membership models with comprehensive benefits"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId

class DeliveryBenefit(BaseModel):
    """Delivery benefit structure"""
    base_free_miles: int = 0
    extended_free_miles: int = 0
    order_threshold: float = 0
    local_discount_percent: Optional[float] = None
    local_discount_max_miles: Optional[int] = None

class MembershipBenefits(BaseModel):
    """All benefits for a membership tier"""
    discount_percent: float = 0
    select_steaks_discount: float = 0
    a5_wagyu_discount: float = 0
    custom_dry_aging: bool = False
    dry_aging_days: int = 0
    vip_cut_eligible: bool = False
    vip_cut_threshold: float = 150
    birthday_bonus: bool = False
    concierge_access: bool = False
    early_access: bool = False
    priority_delivery: bool = False
    delivery: DeliveryBenefit

class Membership(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    tier_name: str
    tier_level: int
    monthly_price: float
    yearly_price: float
    description: str
    features: list[str] = []
    benefits: MembershipBenefits
    highlight: bool = False
    best_value: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class MembershipCreate(BaseModel):
    tier_name: str
    tier_level: int
    monthly_price: float
    yearly_price: float
    description: str
    features: list[str] = []
    benefits: MembershipBenefits
    highlight: bool = False
    best_value: bool = False

class MembershipUpdate(BaseModel):
    tier_name: Optional[str] = None
    tier_level: Optional[int] = None
    monthly_price: Optional[float] = None
    yearly_price: Optional[float] = None
    description: Optional[str] = None
    features: Optional[list[str]] = None
    benefits: Optional[MembershipBenefits] = None
    highlight: Optional[bool] = None
    best_value: Optional[bool] = None
