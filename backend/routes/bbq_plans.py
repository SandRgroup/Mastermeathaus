from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from models.bbq_plan import BBQPlanCreate, BBQPlanResponse, BBQPlanUpdate
from datetime import datetime, timezone
from uuid import uuid4
import os

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Simple auth check for admin routes (reuse from main server.py)
def get_current_user_from_token(token: str):
    """Placeholder - should match your actual auth logic"""
    # In production, decode JWT and verify
    return {"name": "Admin", "email": "admin@example.com"}

@router.post("/bbq-plans", response_model=BBQPlanResponse, status_code=201)
async def create_bbq_plan(plan: BBQPlanCreate):
    """
    Create a new BBQ plan lead (public endpoint - no auth required)
    """
    try:
        plan_dict = plan.dict()
        plan_dict['id'] = str(uuid4())
        plan_dict['created_at'] = datetime.now(timezone.utc).isoformat()
        plan_dict['status'] = 'new'
        plan_dict['staff_messages'] = []
        plan_dict['updated_at'] = None
        
        # Insert into MongoDB
        await db.bbq_plans.insert_one(plan_dict)
        
        return BBQPlanResponse(**plan_dict)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create BBQ plan: {str(e)}")

@router.get("/bbq-plans", response_model=list[BBQPlanResponse])
async def get_all_bbq_plans():
    """
    Get all BBQ plan leads (admin endpoint - should be protected in production)
    """
    try:
        plans = await db.bbq_plans.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return plans
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch BBQ plans: {str(e)}")

@router.get("/bbq-plans/{plan_id}", response_model=BBQPlanResponse)
async def get_bbq_plan(plan_id: str):
    """
    Get a single BBQ plan by ID
    """
    try:
        plan = await db.bbq_plans.find_one({"id": plan_id}, {"_id": 0})
        if not plan:
            raise HTTPException(status_code=404, detail="BBQ plan not found")
        return BBQPlanResponse(**plan)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch BBQ plan: {str(e)}")

@router.put("/bbq-plans/{plan_id}", response_model=BBQPlanResponse)
async def update_bbq_plan(plan_id: str, update: BBQPlanUpdate):
    """
    Update BBQ plan status and/or add staff notes (admin endpoint)
    """
    try:
        plan = await db.bbq_plans.find_one({"id": plan_id}, {"_id": 0})
        if not plan:
            raise HTTPException(status_code=404, detail="BBQ plan not found")
        
        update_data = {}
        
        # Update status if provided
        if update.status:
            update_data['status'] = update.status
        
        # Add staff note if provided
        if update.staff_note:
            staff_message = {
                "id": str(uuid4()),
                "text": update.staff_note,
                "author": "Admin",  # In production, get from JWT token
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            current_messages = plan.get('staff_messages', [])
            current_messages.append(staff_message)
            update_data['staff_messages'] = current_messages
        
        # Update timestamp
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        # Perform update
        await db.bbq_plans.update_one(
            {"id": plan_id},
            {"$set": update_data}
        )
        
        # Fetch and return updated plan
        updated_plan = await db.bbq_plans.find_one({"id": plan_id}, {"_id": 0})
        return BBQPlanResponse(**updated_plan)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update BBQ plan: {str(e)}")

@router.delete("/bbq-plans/{plan_id}", status_code=204)
async def delete_bbq_plan(plan_id: str):
    """
    Delete a BBQ plan (admin endpoint)
    """
    try:
        result = await db.bbq_plans.delete_one({"id": plan_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="BBQ plan not found")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete BBQ plan: {str(e)}")
