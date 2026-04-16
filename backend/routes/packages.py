"""Package Products API routes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
import sys
sys.path.append('/app/backend')
from models.package import Package, PackageCreate, PackageUpdate
from utils.auth import get_current_user
from database import db

router = APIRouter(prefix="/packages", tags=["packages"])

@router.get("", response_model=List[Package])
async def get_packages():
    """Get all packages"""
    packages = await db.packages.find({}, {"_id": 0}).to_list(1000)
    return packages

@router.post("", response_model=Package, dependencies=[Depends(get_current_user)])
async def create_package(package: PackageCreate):
    """Create a new package"""
    package_dict = package.model_dump()
    package_dict["id"] = package_dict.pop("_id", None) or str(db.packages.insert_one({}).inserted_id)
    await db.packages.insert_one(package_dict)
    created = await db.packages.find_one({"id": package_dict["id"]}, {"_id": 0})
    return created

@router.put("/{package_id}", response_model=Package, dependencies=[Depends(get_current_user)])
async def update_package(package_id: str, package: PackageUpdate):
    """Update a package"""
    update_data = {k: v for k, v in package.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.packages.update_one({"id": package_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    
    updated = await db.packages.find_one({"id": package_id}, {"_id": 0})
    return updated

@router.delete("/{package_id}", dependencies=[Depends(get_current_user)])
async def delete_package(package_id: str):
    """Delete a package"""
    result = await db.packages.delete_one({"id": package_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"message": "Package deleted successfully"}
