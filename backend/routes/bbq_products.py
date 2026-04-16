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
    print("=== BBQ PRODUCTS ENDPOINT CALLED ===")
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
    """Create a new BBQ product and sync to regular products"""
    from uuid import uuid4
    product_dict = product.model_dump()
    product_id = f"bbq_{uuid4().hex[:8]}"
    product_dict["id"] = product_id
    
    # Insert into bbq_products
    await db.bbq_products.insert_one(product_dict)
    
    # Also create as regular product
    regular_product = {
        "id": product_id,
        "name": product_dict['name'],
        "description": product_dict.get('description', ''),
        "price": f"${product_dict['basePrice']:.2f}",  # Format as string
        "weight": f"{product_dict.get('weight', 1.0)} lb",  # Add weight with unit
        "grade": product_dict.get('gradeLabel', 'PREMIUM'),
        "image": "/api/placeholder/400/300",
        "category": product_dict.get('category', 'meat'),
        "featured": True,
        "inStock": True,
        "badgeText": "BBQ Special",
        "badgeColor": "gold",
        "isBBQProduct": True,
        "wagyuUpcharge": product_dict.get('wagyuUpcharge', 0),
        "grassFedUpcharge": product_dict.get('grassFedUpcharge', 0),
        "dryAgedUpcharge": product_dict.get('dryAgedUpcharge', 0),
        "meatType": product_dict.get('meatType', 'beef')
    }
    await db.products.insert_one(regular_product)
    
    created = await db.bbq_products.find_one({"id": product_id}, {"_id": 0})
    return created

@router.put("/{product_id}", response_model=BBQProduct, dependencies=[Depends(get_current_user)])
async def update_bbq_product(product_id: str, product: BBQProductUpdate):
    """Update a BBQ product and sync to regular products"""
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Update bbq_products
    result = await db.bbq_products.update_one({"id": product_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Sync to regular products
    updated_bbq = await db.bbq_products.find_one({"id": product_id}, {"_id": 0})
    if updated_bbq:
        regular_update = {
            "name": updated_bbq['name'],
            "description": updated_bbq.get('description', ''),
            "price": f"${updated_bbq['basePrice']:.2f}",  # Format as string
            "weight": f"{updated_bbq.get('weight', 1.0)} lb",  # Add weight with unit
            "grade": updated_bbq.get('gradeLabel', 'PREMIUM'),
            "wagyuUpcharge": updated_bbq.get('wagyuUpcharge', 0),
            "grassFedUpcharge": updated_bbq.get('grassFedUpcharge', 0),
            "dryAgedUpcharge": updated_bbq.get('dryAgedUpcharge', 0),
            "meatType": updated_bbq.get('meatType', 'beef')
        }
        await db.products.update_one({"id": product_id}, {"$set": regular_update})
    
    return updated_bbq

@router.delete("/{product_id}", dependencies=[Depends(get_current_user)])
async def delete_bbq_product(product_id: str):
    """Delete a BBQ product and sync to regular products"""
    # Delete from bbq_products
    result = await db.bbq_products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Also delete from regular products
    await db.products.delete_one({"id": product_id})
    
    return {"message": "Product deleted successfully"}
