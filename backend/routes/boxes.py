"""Steak Boxes routes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.box import Box, BoxCreate, BoxUpdate
from ..database import get_database

router = APIRouter()
db = get_database()

# Import auth dependency
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from server import get_current_user

@router.get("", response_model=List[Box])
async def get_boxes():
    """Get all steak boxes"""
    boxes = await db.boxes.find({}, {"_id": 0}).to_list(1000)
    return boxes

@router.post("", response_model=Box, dependencies=[Depends(get_current_user)])
async def create_box(box: BoxCreate):
    """Create a new steak box"""
    from uuid import uuid4
    box_dict = box.model_dump()
    box_id = f"box_{uuid4().hex[:8]}"
    box_dict["id"] = box_id
    
    await db.boxes.insert_one(box_dict)
    created = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    return created

@router.put("/{box_id}", response_model=Box, dependencies=[Depends(get_current_user)])
async def update_box(box_id: str, box: BoxUpdate):
    """Update a steak box"""
    update_data = {k: v for k, v in box.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.boxes.update_one({"id": box_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Box not found")
    
    updated = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    return updated

@router.delete("/{box_id}", dependencies=[Depends(get_current_user)])
async def delete_box(box_id: str):
    """Delete a steak box"""
    result = await db.boxes.delete_one({"id": box_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Box not found")
    return {"message": "Box deleted successfully"}
