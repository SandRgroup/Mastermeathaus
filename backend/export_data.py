#!/usr/bin/env python3
"""
MasterMeatBox - Data Export/Import Script
Export all CMS data to JSON files for migration to another Emergent account
"""

import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "mastermeatbox")

async def export_data():
    """Export all collections to JSON files"""
    print("🔄 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    collections = [
        "products",
        "steak_boxes",
        "memberships",
        "discount_codes",
        "menu_items",
        "admins"  # Be careful with this - contains hashed passwords
    ]
    
    export_dir = "/app/data-export"
    os.makedirs(export_dir, exist_ok=True)
    
    for collection_name in collections:
        print(f"📦 Exporting {collection_name}...")
        collection = db[collection_name]
        
        # Get all documents
        cursor = collection.find({})
        documents = await cursor.to_list(length=None)
        
        # Convert ObjectId to string
        for doc in documents:
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
        
        # Write to JSON file
        output_file = f"{export_dir}/{collection_name}.json"
        with open(output_file, 'w') as f:
            json.dump(documents, f, indent=2, default=str)
        
        print(f"✅ Exported {len(documents)} documents to {output_file}")
    
    # Create metadata file
    metadata = {
        "export_date": datetime.now().isoformat(),
        "database": DB_NAME,
        "collections": collections,
        "total_documents": sum([len(json.load(open(f"{export_dir}/{c}.json"))) for c in collections if os.path.exists(f"{export_dir}/{c}.json")])
    }
    
    with open(f"{export_dir}/metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n✅ Export complete! Files saved to: {export_dir}")
    print(f"📊 Total documents exported: {metadata['total_documents']}")
    
    client.close()

async def import_data():
    """Import JSON files back to MongoDB"""
    print("🔄 Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    export_dir = "/app/data-export"
    
    if not os.path.exists(export_dir):
        print(f"❌ Export directory not found: {export_dir}")
        return
    
    # Read metadata
    with open(f"{export_dir}/metadata.json", 'r') as f:
        metadata = json.load(f)
    
    print(f"📋 Importing data from: {metadata['export_date']}")
    
    for collection_name in metadata['collections']:
        file_path = f"{export_dir}/{collection_name}.json"
        
        if not os.path.exists(file_path):
            print(f"⚠️  Skipping {collection_name} - file not found")
            continue
        
        print(f"📦 Importing {collection_name}...")
        
        with open(file_path, 'r') as f:
            documents = json.load(f)
        
        if not documents:
            print(f"⚠️  No documents to import for {collection_name}")
            continue
        
        collection = db[collection_name]
        
        # Clear existing data (optional - comment out to preserve existing data)
        # await collection.delete_many({})
        
        # Insert documents
        if documents:
            await collection.insert_many(documents)
        
        print(f"✅ Imported {len(documents)} documents to {collection_name}")
    
    print(f"\n✅ Import complete!")
    
    client.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "import":
        asyncio.run(import_data())
    else:
        asyncio.run(export_data())
