"""
CRM Admin Override - "God Mode"
Allows admin to control customer accounts from CRM
Includes audit logging for all actions
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
from uuid import uuid4
from utils.auth import get_current_user
from database import db
import bcrypt

router = APIRouter(prefix="/admin/customers", tags=["admin-crm"])

class AdminCustomerOverride(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    membership_tier: Optional[int] = None

class AdminPasswordReset(BaseModel):
    new_password: str

class AdminActionLog(BaseModel):
    admin_id: str
    admin_email: str
    action: str
    customer_id: str
    customer_email: str
    changes: dict
    timestamp: str
    ip_address: Optional[str] = None

async def log_admin_action(
    admin_user: dict,
    action: str,
    customer_id: str,
    customer_email: str,
    changes: dict,
    ip_address: str = None
):
    """Log admin actions for audit trail"""
    log_entry = {
        "id": str(uuid4()),
        "admin_id": admin_user.get("_id") or admin_user.get("id"),
        "admin_email": admin_user["email"],
        "action": action,
        "customer_id": customer_id,
        "customer_email": customer_email,
        "changes": changes,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip_address": ip_address
    }
    
    await db.admin_action_logs.insert_one(log_entry)
    print(f"[ADMIN ACTION] {admin_user['email']} → {action} on {customer_email}")

@router.put("/{customer_id}/override")
async def override_customer_data(
    customer_id: str,
    override_data: AdminCustomerOverride,
    current_user: dict = Depends(get_current_user)
):
    """
    CRM God Mode: Admin can override any customer field
    All changes are logged for audit trail
    """
    # Find customer
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Build update payload (only fields that are provided)
    update_data = {}
    changes = {}
    
    for field, value in override_data.model_dump(exclude_none=True).items():
        if value is not None:
            update_data[field] = value
            changes[field] = {
                "from": customer.get(field),
                "to": value
            }
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update customer
    result = await db.customers.update_one(
        {"id": customer_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Log the admin action
    await log_admin_action(
        admin_user=current_user,
        action="CUSTOMER_OVERRIDE",
        customer_id=customer_id,
        customer_email=customer["email"],
        changes=changes
    )
    
    # Get updated customer
    updated_customer = await db.customers.find_one({"id": customer_id}, {"_id": 0, "password": 0})
    
    return {
        "message": "Customer updated successfully by admin",
        "customer": updated_customer,
        "changes_made": list(changes.keys())
    }

@router.post("/{customer_id}/upgrade-membership")
async def admin_upgrade_membership(
    customer_id: str,
    new_tier: int,
    current_user: dict = Depends(get_current_user)
):
    """
    Admin forces a membership upgrade/downgrade
    Bypasses payment - useful for comps, support issues, etc.
    """
    if new_tier not in [0, 1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid tier level (0-3)")
    
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    old_tier = customer.get("membership_tier", 0)
    
    # Update membership
    result = await db.customers.update_one(
        {"id": customer_id},
        {"$set": {
            "membership_tier": new_tier,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log action
    tier_names = ["Free", "Select", "Prime", "Premium"]
    await log_admin_action(
        admin_user=current_user,
        action="MEMBERSHIP_UPGRADE",
        customer_id=customer_id,
        customer_email=customer["email"],
        changes={
            "membership_tier": {
                "from": f"{tier_names[old_tier]} (tier {old_tier})",
                "to": f"{tier_names[new_tier]} (tier {new_tier})"
            }
        }
    )
    
    # TODO: Send email notification to customer
    
    return {
        "message": f"Customer upgraded to {tier_names[new_tier]} tier by admin",
        "old_tier": old_tier,
        "new_tier": new_tier
    }

@router.post("/{customer_id}/reset-password")
async def admin_reset_password(
    customer_id: str,
    reset_data: AdminPasswordReset,
    current_user: dict = Depends(get_current_user)
):
    """
    Admin resets customer password (for support/recovery)
    Customer should change it on next login
    """
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Hash new password
    hashed_password = bcrypt.hashpw(
        reset_data.new_password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Update password
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {
            "password": hashed_password,
            "password_reset_required": True,  # Flag for customer to change
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log action (don't log the actual password)
    await log_admin_action(
        admin_user=current_user,
        action="PASSWORD_RESET",
        customer_id=customer_id,
        customer_email=customer["email"],
        changes={"password_reset": "Admin initiated password reset"}
    )
    
    # TODO: Send email to customer with new temp password
    
    return {
        "message": "Password reset successfully",
        "temporary_password": reset_data.new_password,
        "note": "Customer should change this on next login"
    }

@router.delete("/{customer_id}/revoke-access")
async def revoke_customer_access(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Admin can disable a customer account (suspend access)
    Does not delete the account, just marks it as disabled
    """
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {
            "account_disabled": True,
            "disabled_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log action
    await log_admin_action(
        admin_user=current_user,
        action="REVOKE_ACCESS",
        customer_id=customer_id,
        customer_email=customer["email"],
        changes={"account_status": {"from": "active", "to": "disabled"}}
    )
    
    return {
        "message": "Customer access revoked",
        "customer_email": customer["email"]
    }

@router.post("/{customer_id}/restore-access")
async def restore_customer_access(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Restore a previously disabled customer account"""
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {
            "account_disabled": False,
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        "$unset": {"disabled_at": ""}}
    )
    
    # Log action
    await log_admin_action(
        admin_user=current_user,
        action="RESTORE_ACCESS",
        customer_id=customer_id,
        customer_email=customer["email"],
        changes={"account_status": {"from": "disabled", "to": "active"}}
    )
    
    return {
        "message": "Customer access restored",
        "customer_email": customer["email"]
    }

@router.get("/{customer_id}/audit-log")
async def get_customer_audit_log(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """View all admin actions taken on a specific customer"""
    logs = await db.admin_action_logs.find(
        {"customer_id": customer_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    
    return {
        "customer_id": customer_id,
        "total_actions": len(logs),
        "actions": logs
    }

@router.get("/audit-log/recent")
async def get_recent_admin_actions(
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """View recent admin actions across all customers"""
    logs = await db.admin_action_logs.find(
        {},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(limit)
    
    return {
        "total_actions": len(logs),
        "actions": logs
    }
