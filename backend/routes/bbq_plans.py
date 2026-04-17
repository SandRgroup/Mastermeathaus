from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from models.bbq_plan import BBQPlanCreate, BBQPlanResponse
from datetime import datetime, timezone
from uuid import uuid4
import os

router = APIRouter()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("/bbq-plans", response_model=BBQPlanResponse, status_code=201)
async def create_bbq_plan(plan: BBQPlanCreate):
    """
    Create a new BBQ plan lead
    """
    try:
        plan_dict = plan.dict()
        plan_dict['id'] = str(uuid4())
        plan_dict['created_at'] = datetime.now(timezone.utc).isoformat()
        
        # Insert into MongoDB
        await db.bbq_plans.insert_one(plan_dict)
        
        return BBQPlanResponse(**plan_dict)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create BBQ plan: {str(e)}")

@router.get("/bbq-plans", response_model=list[BBQPlanResponse])
async def get_all_bbq_plans():
    """
    Get all BBQ plan leads (admin only in production)
    """
    try:
        plans = await db.bbq_plans.find({}, {"_id": 0}).to_list(1000)
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
