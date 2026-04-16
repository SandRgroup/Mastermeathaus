"""BBQ Products API routes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
import sys
sys.path.append('/app/backend')
from models.bbq_product import BBQProduct, BBQProductCreate, BBQProductUpdate
from utils.auth import get_current_user
from database import db

router = APIRouter(prefix="/bbq-products", tags=["bbq-products"])

@router.get("")
async def get_bbq_products():
    """Get all BBQ products"""
    print(f"=== BBQ PRODUCTS ENDPOINT CALLED ===")
    print(f"Database object: {db}")
    print(f"Database name: {db.name}")
    
    try:
        products = await db.bbq_products.find({}).to_list(1000)
        print(f"Found {len(products)} BBQ products in database")
        
        # Convert ObjectId to string and ensure proper format
        result = []
        for product in products:
            if '_id' in product:
                product.pop('_id')  # Remove MongoDB _id
            result.append(product)
        
        print(f"Returning {len(result)} products to client")
        return result
    except Exception as e:
        print(f"ERROR in BBQ products endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=BBQProduct, dependencies=[Depends(get_current_user)])
async def create_bbq_product(product: BBQProductCreate):
    """Create a new BBQ product"""
    product_dict = product.model_dump()
    product_dict["id"] = product_dict.pop("_id", None) or str(db.bbq_products.insert_one({}).inserted_id)
    await db.bbq_products.insert_one(product_dict)
    created = await db.bbq_products.find_one({"id": product_dict["id"]}, {"_id": 0})
    return created

@router.put("/{product_id}", response_model=BBQProduct, dependencies=[Depends(get_current_user)])
async def update_bbq_product(product_id: str, product: BBQProductUpdate):
    """Update a BBQ product"""
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.bbq_products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated = await db.bbq_products.find_one({"id": product_id}, {"_id": 0})
    return updated

@router.delete("/{product_id}", dependencies=[Depends(get_current_user)])
async def delete_bbq_product(product_id: str):
    """Delete a BBQ product"""
    result = await db.bbq_products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
