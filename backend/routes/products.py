"""Product routes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.product import Product, ProductCreate, ProductUpdate
from utils.auth import get_current_user
from database import db

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[Product])
async def get_products():
    """Get all products"""
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@router.post("", response_model=Product, dependencies=[Depends(get_current_user)])
async def create_product(product: ProductCreate):
    """Create a new product"""
    product_dict = product.model_dump()
    result = await db.products.insert_one(product_dict)
    created_product = await db.products.find_one({"_id": result.inserted_id}, {"_id": 0})
    return created_product

@router.put("/{product_id}", response_model=Product, dependencies=[Depends(get_current_user)])
async def update_product(product_id: str, product: ProductUpdate):
    """Update a product"""
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated_product

@router.delete("/{product_id}", dependencies=[Depends(get_current_user)])
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
