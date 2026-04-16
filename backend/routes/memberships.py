"""Membership routes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.membership import Membership, MembershipCreate, MembershipUpdate
from utils.auth import get_current_user
from database import db

router = APIRouter(prefix="/memberships", tags=["memberships"])

@router.get("", response_model=List[Membership])
async def get_memberships():
    """Get all memberships"""
    memberships = await db.memberships.find({}, {"_id": 0}).to_list(1000)
    return memberships

@router.post("", response_model=Membership, dependencies=[Depends(get_current_user)])
async def create_membership(membership: MembershipCreate):
    """Create a new membership"""
    membership_dict = membership.model_dump()
    result = await db.memberships.insert_one(membership_dict)
    created_membership = await db.memberships.find_one({"_id": result.inserted_id}, {"_id": 0})
    return created_membership

@router.put("/{membership_id}", response_model=Membership, dependencies=[Depends(get_current_user)])
async def update_membership(membership_id: str, membership: MembershipUpdate):
    """Update a membership"""
    update_data = {k: v for k, v in membership.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.memberships.update_one({"id": membership_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    updated_membership = await db.memberships.find_one({"id": membership_id}, {"_id": 0})
    return updated_membership

@router.delete("/{membership_id}", dependencies=[Depends(get_current_user)])
async def delete_membership(membership_id: str):
    """Delete a membership"""
    result = await db.memberships.delete_one({"id": membership_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Membership not found")
    return {"message": "Membership deleted successfully"}
