from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional
from datetime import datetime, timezone

class LeadInfo(BaseModel):
    first_name: str
    email: EmailStr
    zip_code: str

class BBQPlanCreate(BaseModel):
    prompt: str
    people: int
    event_type: str
    portion_per_person: float
    selected_categories: List[str]
    selected_cuts: Dict[str, List[str]]
    beef_quality: str
    addons: Optional[str] = ""
    total_lbs: float
    total_price: float
    lead: LeadInfo

class BBQPlanResponse(BaseModel):
    id: str
    prompt: str
    people: int
    event_type: str
    portion_per_person: float
    selected_categories: List[str]
    selected_cuts: Dict[str, List[str]]
    beef_quality: str
    addons: str
    total_lbs: float
    total_price: float
    lead: LeadInfo
    created_at: str
    
    class Config:
        from_attributes = True
