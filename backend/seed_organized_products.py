"""
Seed products with organized categories and grades
"""
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from uuid import uuid4

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_organized_products():
    """Seed products organized by categories"""
    
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Clear existing products
    await db.products.delete_many({})
    print("✓ Cleared existing products")
    
    # Product categories with their specific attributes
    categories = {
        "Certified Angus": {
            "grade": "Certified Angus Beef",
            "badgeColor": "blue",
            "base_price_range": (28, 48),
            "cuts": ["Ribeye", "NY Strip", "Filet Mignon", "T-Bone", "Porterhouse", "Sirloin", "Flank", "Skirt"]
        },
        "USDA Prime": {
            "grade": "USDA Prime",
            "badgeColor": "gold",
            "base_price_range": (35, 58),
            "cuts": ["Ribeye", "NY Strip", "Filet Mignon", "T-Bone", "Porterhouse", "Tomahawk", "Cowboy Cut", "Short Ribs"]
        },
        "Grass Fed": {
            "grade": "Grass Fed",
            "badgeColor": "green",
            "base_price_range": (32, 52),
            "grassFedUpcharge": 8.0,
            "cuts": ["Ribeye", "NY Strip", "Filet Mignon", "Sirloin", "Flank", "Skirt", "Hanger", "Brisket"]
        },
        "American Wagyu": {
            "grade": "American Wagyu",
            "badgeColor": "purple",
            "base_price_range": (65, 120),
            "wagyuUpcharge": 25.0,
            "cuts": ["Ribeye", "NY Strip", "Filet Mignon", "Tomahawk", "Picanha", "Tri-Tip", "Denver", "Flat Iron"]
        },
        "A5 Wagyu": {
            "grade": "A5 Japanese Wagyu",
            "badgeColor": "platinum",
            "base_price_range": (150, 280),
            "wagyuUpcharge": 50.0,
            "cuts": ["Ribeye", "Strip Loin", "Filet", "Sirloin", "Tenderloin", "Brisket", "Short Rib", "Chuck"]
        },
        "Sale": {
            "grade": "USDA Choice",
            "badgeColor": "red",
            "badgeText": "SALE",
            "base_price_range": (18, 35),
            "originalPrice": True,
            "cuts": ["Ribeye", "NY Strip", "Sirloin", "T-Bone", "Chuck", "Round", "Flank", "Skirt"]
        }
    }
    
    weights = [8, 10, 12, 14, 16, 18, 20, 24, 32]
    descriptions = [
        "Premium cut with exceptional marbling",
        "Rich flavor and tender texture",
        "Hand-selected for quality",
        "Perfect for grilling or pan-searing",
        "Aged to perfection",
        "Restaurant-quality beef",
        "Chef's favorite cut",
        "Incredible marbling and flavor"
    ]
    
    products = []
    
    for category, attrs in categories.items():
        cuts = attrs["cuts"]
        base_min, base_max = attrs["base_price_range"]
        
        # Create 25 items per category (3 variations of each cut + extras)
        for i in range(25):
            cut_index = i % len(cuts)
            cut_name = cuts[cut_index]
            weight_index = i % len(weights)
            weight = weights[weight_index]
            desc_index = i % len(descriptions)
            
            # Calculate price
            base_price = base_min + (base_max - base_min) * (i / 25)
            price = f"${base_price:.2f}"
            
            # Handle sale items
            original_price = None
            if attrs.get("originalPrice"):
                original_price = f"${(base_price * 1.4):.2f}"
            
            product = {
                "id": f"prod_{uuid4().hex[:8]}",
                "name": f"{cut_name} Steak" if "Steak" not in cut_name else cut_name,
                "grade": attrs["grade"],
                "description": descriptions[desc_index],
                "price": price,
                "originalPrice": original_price,
                "weight": f"{weight} oz",
                "image": "/api/placeholder/400/300",
                "category": category.lower().replace(" ", "_"),
                "featured": i < 3,  # First 3 in each category are featured
                "inStock": True,
                "badgeText": attrs.get("badgeText", attrs["grade"]),
                "badgeColor": attrs["badgeColor"],
                "isBBQProduct": False,
                "wagyuUpcharge": attrs.get("wagyuUpcharge"),
                "grassFedUpcharge": attrs.get("grassFedUpcharge"),
                "meatType": "beef",
                "cookingTemp": "Medium-rare to medium"
            }
            
            products.append(product)
    
    # Insert all products
    result = await db.products.insert_many(products)
    print(f"✓ Inserted {len(result.inserted_ids)} products")
    
    # Count by category
    for category in categories.keys():
        count = await db.products.count_documents({"category": category.lower().replace(" ", "_")})
        print(f"  - {category}: {count} items")
    
    client.close()
    print("\n✅ Product seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_organized_products())
