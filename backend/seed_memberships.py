"""
Seed the 4 membership tiers for Masters Meat Haus
"""
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_memberships():
    """Seed all 4 membership tiers"""
    
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing memberships
    await db.memberships.delete_many({})
    print("✓ Cleared existing memberships")
    
    memberships = [
        {
            "tier_name": "The Stockyard Block",
            "tier_level": 0,
            "monthly_price": 0.0,
            "yearly_price": 0.0,
            "description": "Free tier with select benefits",
            "features": [
                "5% Off Select Steaks",
                "50% Local Delivery Discount (orders under $499 within 5 miles)",
                "Free Local Delivery (orders $499+ within 5 miles)"
            ],
            "benefits": {
                "discount_percent": 0,
                "select_steaks_discount": 5,
                "a5_wagyu_discount": 0,
                "custom_dry_aging": False,
                "dry_aging_days": 0,
                "vip_cut_eligible": False,
                "vip_cut_threshold": 0,
                "birthday_bonus": False,
                "concierge_access": False,
                "early_access": False,
                "priority_delivery": False,
                "delivery": {
                    "base_free_miles": 5,
                    "extended_free_miles": 0,
                    "order_threshold": 499,
                    "local_discount_percent": 50,
                    "local_discount_max_miles": 5
                }
            },
            "highlight": False,
            "best_value": False
        },
        {
            "tier_name": "The Rancher's Select",
            "tier_level": 1,
            "monthly_price": 14.99,
            "yearly_price": 150.0,
            "description": "Premium tier with enhanced benefits",
            "features": [
                "10% Off All Cuts",
                "Custom Dry Aging Included",
                "Free Delivery up to 15 miles",
                "Extended Delivery: +10 miles on orders $150+",
                "Birthday Bonus: Free MasterMeat Salt or Custom Rub"
            ],
            "benefits": {
                "discount_percent": 10,
                "select_steaks_discount": 0,
                "a5_wagyu_discount": 0,
                "custom_dry_aging": True,
                "dry_aging_days": 30,
                "vip_cut_eligible": False,
                "vip_cut_threshold": 0,
                "birthday_bonus": True,
                "concierge_access": False,
                "early_access": False,
                "priority_delivery": False,
                "delivery": {
                    "base_free_miles": 15,
                    "extended_free_miles": 10,
                    "order_threshold": 150,
                    "local_discount_percent": None,
                    "local_discount_max_miles": None
                }
            },
            "highlight": False,
            "best_value": True
        },
        {
            "tier_name": "The Steakhouse Syndicate",
            "tier_level": 2,
            "monthly_price": 29.99,
            "yearly_price": 300.0,
            "description": "Elite tier with premium perks",
            "features": [
                "15% Off All Purchases",
                "Custom Dry Aging Included",
                "Free Premium Cut on orders $150+ (8oz Filet or Baseball Steak)",
                "Free Delivery up to 15 miles",
                "Extended Delivery: +10 miles on orders $150+",
                "Direct Concierge Access for Custom Butcher Requests"
            ],
            "benefits": {
                "discount_percent": 15,
                "select_steaks_discount": 0,
                "a5_wagyu_discount": 0,
                "custom_dry_aging": True,
                "dry_aging_days": 30,
                "vip_cut_eligible": True,
                "vip_cut_threshold": 150,
                "birthday_bonus": False,
                "concierge_access": True,
                "early_access": False,
                "priority_delivery": False,
                "delivery": {
                    "base_free_miles": 15,
                    "extended_free_miles": 10,
                    "order_threshold": 150,
                    "local_discount_percent": None,
                    "local_discount_max_miles": None
                }
            },
            "highlight": True,
            "best_value": False
        },
        {
            "tier_name": "The Haus Prime",
            "tier_level": 3,
            "monthly_price": 49.99,
            "yearly_price": 500.0,
            "description": "Ultimate VIP tier with exclusive access",
            "features": [
                "15% Off All Purchases + 10% Extra on A5 Wagyu",
                "Complimentary 30-Day Dry Aging",
                "Free Premium Cut on orders $150+ (8oz Filet or Baseball Steak)",
                "Free Delivery up to 40 miles",
                "Extended Delivery: +10 miles on orders $150+ (up to 50 miles total)",
                "Haus Concierge: Direct Custom Butcher Requests",
                "Early Access to New Products & Limited Runs",
                "Priority Delivery: Your Orders Process First"
            ],
            "benefits": {
                "discount_percent": 15,
                "select_steaks_discount": 0,
                "a5_wagyu_discount": 10,
                "custom_dry_aging": True,
                "dry_aging_days": 30,
                "vip_cut_eligible": True,
                "vip_cut_threshold": 150,
                "birthday_bonus": False,
                "concierge_access": True,
                "early_access": True,
                "priority_delivery": True,
                "delivery": {
                    "base_free_miles": 40,
                    "extended_free_miles": 10,
                    "order_threshold": 150,
                    "local_discount_percent": None,
                    "local_discount_max_miles": None
                }
            },
            "highlight": True,
            "best_value": False
        }
    ]
    
    # Insert all memberships
    result = await db.memberships.insert_many(memberships)
    print(f"✓ Inserted {len(result.inserted_ids)} membership tiers:")
    
    # Verify
    all_memberships = await db.memberships.find({}, {"_id": 0}).to_list(10)
    for m in all_memberships:
        print(f"  - {m['tier_name']}: ${m['monthly_price']}/mo (Tier {m['tier_level']})")
    
    client.close()
    print("\n✅ Membership seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_memberships())
