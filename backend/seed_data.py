import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Clear existing
    await db.products.delete_many({})
    await db.memberships.delete_many({})
    
    # Seed products
    products = [
        {
            "name": "Filet Mignon",
            "grade": "USDA Prime",
            "description": "Center-cut tenderness, minimal fat",
            "price": "$45.00",
            "image": "https://images.unsplash.com/photo-1666013942642-b7b54ecafd7d",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Ribeye",
            "grade": "USDA Prime",
            "description": "Rich marbling, bold beef flavor",
            "price": "$38.00",
            "image": "https://images.unsplash.com/photo-1602470521006-59ab77068b0d",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Porterhouse",
            "grade": "USDA Prime",
            "description": "Strip and tenderloin in one cut",
            "price": "$52.00",
            "image": "https://images.unsplash.com/photo-1614277786110-1a64e457c4c3",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "T-Bone",
            "grade": "USDA Prime",
            "description": "Classic steakhouse favorite",
            "price": "$42.00",
            "image": "https://images.unsplash.com/photo-1606374894242-19110fdbd56c",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Tomahawk Steak",
            "grade": "USDA Prime",
            "description": "Impressive bone-in ribeye",
            "price": "$95.00",
            "image": "https://images.unsplash.com/photo-1632154023554-c2975e9be348",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Beef Short Ribs",
            "grade": "USDA Prime",
            "description": "Perfect for braising or smoking",
            "price": "$28.00",
            "image": "https://images.unsplash.com/photo-1558030077-82dd9347c407",
            "cookingTemp": "Low & Slow (275°F, 3-4hrs)"
        },
        {
            "name": "Picanha",
            "grade": "Whole, Fat Cap On",
            "description": "Brazilian favorite, full cap",
            "price": "$48.00",
            "originalPrice": "$55.00",
            "image": "https://images.unsplash.com/photo-1579636859172-67ced5686109",
            "badge": "Sale",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Cupim",
            "grade": "Heritage Cut",
            "description": "Brazilian hump cut, rare delicacy",
            "price": "$58.00",
            "image": "https://images.unsplash.com/photo-1547050605-2f268cd5daf0",
            "cookingTemp": "Low & Slow (250°F, 4-5hrs)"
        },
        {
            "name": "Wagyu Ribeye",
            "grade": "American Wagyu",
            "description": "Exceptional marbling and flavor",
            "price": "$72.00",
            "originalPrice": "$85.00",
            "image": "https://images.unsplash.com/photo-1690983321750-ad6f6d59a84b",
            "badge": "Sale",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Wagyu NY Strip",
            "grade": "American Wagyu",
            "description": "Perfect balance of tenderness",
            "price": "$65.00",
            "originalPrice": "$75.00",
            "image": "https://images.unsplash.com/photo-1600180786732-6189f0ad253d",
            "badge": "Sale",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Dry-Aged Steak",
            "grade": "Upon Consultation",
            "description": "Custom aging, premium selection",
            "price": "Contact",
            "image": "https://images.unsplash.com/photo-1690983323238-0b91789e1b5a"
        },
        {
            "name": "Flank Steak",
            "grade": "USDA Choice",
            "description": "Lean, flavorful, great for fajitas",
            "price": "$22.00",
            "image": "https://images.unsplash.com/photo-1579636858731-24857b3f4305",
            "cookingTemp": "Medium (135-145°F)"
        },
        {
            "name": "Picanha American Wagyu",
            "grade": "American Wagyu",
            "description": "Brazilian cut meets Japanese quality",
            "price": "$68.00",
            "image": "https://images.unsplash.com/photo-1579636859172-67ced5686109",
            "cookingTemp": "Medium-Rare (130-135°F)"
        },
        {
            "name": "Flank Steak American Wagyu",
            "grade": "American Wagyu",
            "description": "Enhanced marbling, incredible flavor",
            "price": "$35.00",
            "image": "https://images.unsplash.com/photo-1614277786110-1a64e457c4c3",
            "cookingTemp": "Medium (135-145°F)"
        }
    ]
    
    await db.products.insert_many(products)
    print(f"Seeded {len(products)} products")
    
    # Seed memberships
    memberships = [
        {
            "name": "Free",
            "price": "$0",
            "period": "/month",
            "features": ["Access to all cuts", "Standard pricing"],
            "highlight": False,
            "bestValue": False
        },
        {
            "name": "Select",
            "price": "$4.99",
            "period": "/month",
            "features": ["Better pricing", "Early access to new products"],
            "highlight": False,
            "bestValue": False
        },
        {
            "name": "Prime",
            "price": "$12.99",
            "period": "/month",
            "features": ["Lower pricing", "Priority availability", "Member exclusives"],
            "highlight": False,
            "bestValue": False
        },
        {
            "name": "Premium",
            "price": "$19.99",
            "period": "/month",
            "features": ["Free delivery", "Best pricing", "Priority fulfillment", "Exclusive offers"],
            "highlight": True,
            "bestValue": True
        }
    ]
    
    await db.memberships.insert_many(memberships)
    print(f"Seeded {len(memberships)} memberships")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
