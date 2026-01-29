"""
MITA ICT Backend Server
Main application file - uses modular routers for endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import routers
from routes import (
    public_router,
    contacts_router,
    auth_router,
    admin_router,
    chat_router
)
from auth import init_admin_user

# Initialize FastAPI app
app = FastAPI(
    title="MITA ICT API",
    description="Backend API for MITA ICT Consulting Website",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'mita_ict')

client = None
db = None


@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and seed data on startup"""
    global client, db
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Initialize admin user if not exists
        await init_admin_user(db)
        
        # Seed default data if collections are empty
        await seed_default_data()
        
        logger.info("✅ Database initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Database connection failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    global client
    if client:
        client.close()
        logger.info("✅ Database connection closed")


async def seed_default_data():
    """Seed default services and products if database is empty"""
    global db
    
    # Seed services if empty
    services_count = await db.services.count_documents({})
    if services_count == 0:
        default_services = [
            {
                "id": "service-1",
                "title": "IT and Telecommunication Consulting",
                "description": "Comprehensive IT and telecom consulting services including infrastructure, network optimization, and advanced solutions.",
                "icon": "network",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "service-2",
                "title": "Company Registration in Sweden",
                "description": "Complete support for company registration and business setup in Sweden.",
                "icon": "building",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "service-3",
                "title": "Leading Teams",
                "description": "Expert leadership consulting for sales and engineering teams.",
                "icon": "users",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await db.services.insert_many(default_services)
        logger.info("✅ Default services seeded")
    
    # Seed SaaS products if empty
    products_count = await db.saas_products.count_documents({})
    if products_count == 0:
        default_products = [
            {
                "id": "product-1",
                "name": "MITACRM",
                "description": "Powerful CRM solution for modern businesses",
                "url": "https://mitacrm.com",
                "features": ["Contact Management", "Sales Pipeline", "Reporting"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "product-2",
                "name": "Routing System",
                "description": "Advanced routing for telecommunications",
                "url": "https://routing.mitaict.com",
                "features": ["Smart Routing", "Load Balancing", "Analytics"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "product-3",
                "name": "White Label Software",
                "description": "Customizable solutions for your brand",
                "url": "https://whitelabel.mitaict.com",
                "features": ["Full Customization", "API Access", "Support"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await db.saas_products.insert_many(default_products)
        logger.info("✅ Default SaaS products seeded")
    
    # Seed about content if empty
    about_count = await db.about_content.count_documents({})
    if about_count == 0:
        default_about = {
            "id": "about-1",
            "story": "MITA ICT has been at the forefront of IT and telecommunications consulting for over 20 years, helping businesses transform their digital infrastructure.",
            "expertise": [
                {
                    "title": "Network Infrastructure",
                    "description": "Design and implementation of robust network solutions"
                },
                {
                    "title": "Cloud Solutions",
                    "description": "Migration and management of cloud-based systems"
                },
                {
                    "title": "Telecom Integration",
                    "description": "Seamless integration of voice and data communications"
                }
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.about_content.insert_one(default_about)
        logger.info("✅ Default about content seeded")


# Include all routers
app.include_router(public_router)
app.include_router(contacts_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(chat_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
