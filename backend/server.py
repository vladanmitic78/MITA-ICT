from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from datetime import datetime
from typing import List
import httpx

from models import (
    Service, ServiceCreate, ServiceUpdate,
    SaasProduct, SaasProductCreate, SaasProductUpdate,
    Contact, ContactCreate,
    AboutContent, AboutContentUpdate,
    AdminLogin, Token, Admin, ChangePassword
)
from auth import (
    verify_password, get_password_hash, create_access_token, 
    get_current_user, init_admin_user
)
from email_service import send_contact_email, send_auto_response_email

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== STARTUP & INITIALIZATION ====================

@app.on_event("startup")
async def startup_db_client():
    """Initialize database with default data"""
    logger.info("🚀 Starting MITA ICT Backend...")
    
    # Initialize admin user
    await init_admin_user(db)
    
    # Initialize default services if none exist
    services_count = await db.services.count_documents({})
    if services_count == 0:
        default_services = [
            {
                "id": "1",
                "title": "IT and Telecommunication",
                "description": "Comprehensive IT and telecom consulting services with 20+ years of industry experience. From infrastructure to advanced solutions.",
                "icon": "Network",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "2",
                "title": "Company Registration in Sweden",
                "description": "Complete support for company registration and business setup in Sweden. Navigate Swedish regulations with ease.",
                "icon": "Building2",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "3",
                "title": "Leading Teams",
                "description": "Expert leadership consulting for sales and engineering teams. Build high-performing organizations.",
                "icon": "Users",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await db.services.insert_many(default_services)
        logger.info("✅ Default services initialized")
    
    # Initialize default SaaS products if none exist
    saas_count = await db.saas_products.count_documents({})
    if saas_count == 0:
        default_products = [
            {
                "id": "1",
                "title": "MITACRM",
                "description": "Powerful CRM solution designed for modern businesses. Streamline your customer relationships.",
                "link": "https://mitacrm.com/",
                "features": ["Contact Management", "Sales Pipeline", "Analytics Dashboard", "Integration Ready"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "2",
                "title": "Routing System",
                "description": "Advanced routing system for telecommunications and network management.",
                "link": "https://trustcode.dev/",
                "features": ["Smart Routing", "Real-time Monitoring", "Scalable Architecture", "API Access"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": "3",
                "title": "White Label Software",
                "description": "Customizable white label solutions for your business needs.",
                "link": "#",
                "features": ["Full Customization", "Your Branding", "Quick Deployment", "Ongoing Support"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        await db.saas_products.insert_many(default_products)
        logger.info("✅ Default SaaS products initialized")
    
    # Initialize default About content if none exists
    about_count = await db.about_content.count_documents({})
    if about_count == 0:
        default_about = {
            "id": "1",
            "title": "About MITA ICT",
            "content": "We bring over 20 years of distinguished experience in the IT and telecommunications industry. Our journey has been marked by successfully leading sales and engineering teams, implementing cutting-edge solutions, and driving organizational excellence.\n\nOur expertise spans across multiple domains including IT infrastructure, telecommunications networks, and enterprise software solutions. We have a proven track record in selling and implementing sophisticated software systems such as OSS (Operations Support Systems), OBS (Order and Billing Systems), and comprehensive cybersecurity solutions including EDR (Endpoint Detection and Response), MDR (Managed Detection and Response), and XDR (Extended Detection and Response).\n\nAt MITA ICT, client satisfaction is not just a goal—it's our foundation. We pride ourselves on understanding our clients' unique challenges and delivering tailored solutions that drive real business value. Our approach combines technical excellence with strategic thinking, ensuring that technology serves your business objectives.\n\nWhether you're looking to optimize your IT infrastructure, implement new telecommunications systems, or build high-performing teams, we bring the experience, expertise, and dedication to help you succeed.",
            "updated_at": datetime.utcnow()
        }
        await db.about_content.insert_one(default_about)
        logger.info("✅ Default About content initialized")
    
    logger.info("✅ Database initialized successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("🔴 Database connection closed")

# ==================== PUBLIC ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "MITA ICT API - Where Technology Meets Strategy"}

@api_router.get("/services", response_model=List[Service])
async def get_services():
    """Get all consulting services"""
    services = await db.services.find().to_list(1000)
    return [Service(**service) for service in services]

@api_router.get("/saas-products", response_model=List[SaasProduct])
async def get_saas_products():
    """Get all SaaS products"""
    products = await db.saas_products.find().to_list(1000)
    return [SaasProduct(**product) for product in products]

@api_router.get("/about", response_model=AboutContent)
async def get_about_content():
    """Get About page content"""
    about = await db.about_content.find_one()
    if not about:
        raise HTTPException(status_code=404, detail="About content not found")
    return AboutContent(**about)

@api_router.post("/contact", response_model=dict)
async def submit_contact(contact: ContactCreate):
    """Submit contact form"""
    try:
        # Verify reCAPTCHA token
        recaptcha_secret = os.environ.get('RECAPTCHA_SECRET_KEY', '')
        if recaptcha_secret and recaptcha_secret != 'YOUR_RECAPTCHA_SECRET_KEY':
            async with httpx.AsyncClient() as client_http:
                recaptcha_response = await client_http.post(
                    'https://www.google.com/recaptcha/api/siteverify',
                    data={
                        'secret': recaptcha_secret,
                        'response': contact.recaptcha_token
                    }
                )
                recaptcha_result = recaptcha_response.json()
                
                if not recaptcha_result.get('success'):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="reCAPTCHA verification failed"
                    )
        
        # Save to database
        contact_data = Contact(
            name=contact.name,
            email=contact.email,
            phone=contact.phone,
            service=contact.service,
            comment=contact.comment
        )
        await db.contacts.insert_one(contact_data.dict())
        
        # Send email notifications
        try:
            # Send notification to admin
            await send_contact_email(
                name=contact.name,
                email=contact.email,
                phone=contact.phone,
                service=contact.service,
                comment=contact.comment
            )
            logger.info(f"✅ Admin notification email sent for: {contact.email}")
            
            # Send auto-response to user
            await send_auto_response_email(
                name=contact.name,
                email=contact.email,
                phone=contact.phone,
                service=contact.service
            )
            logger.info(f"✅ Auto-response email sent to: {contact.email}")
            
        except Exception as e:
            logger.error(f"❌ Email sending failed: {str(e)}")
            # Still save to database even if email fails
        
        return {
            "success": True,
            "message": "Thank you for contacting us. We will get back to you soon!"
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"❌ Contact form submission failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit contact form"
        )

# ==================== ADMIN AUTHENTICATION ====================

@api_router.post("/admin/login", response_model=Token)
async def admin_login(credentials: AdminLogin):
    """Admin login with username/password"""
    admin = await db.admins.find_one({"username": credentials.username})
    
    if not admin or not verify_password(credentials.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": admin["username"]})
    logger.info(f"✅ Admin logged in: {credentials.username}")
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/admin/google-login", response_model=Token)
async def admin_google_login():
    """Admin login with Google OAuth (mock for now)"""
    # For MVP, we'll create a token for Google login
    # In production, this would verify Google OAuth token
    access_token = create_access_token(data={"sub": "google_admin"})
    logger.info(f"✅ Admin logged in via Google")
    
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/admin/logout")
async def admin_logout(current_user: dict = Depends(get_current_user)):
    """Admin logout"""
    logger.info(f"✅ Admin logged out: {current_user['username']}")
    return {"message": "Successfully logged out"}

@api_router.post("/admin/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: dict = Depends(get_current_user)
):
    """Change admin password"""
    username = current_user['username']
    admin = await db.admins.find_one({"username": username})
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    # Verify current password
    if not verify_password(password_data.current_password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    new_password_hash = get_password_hash(password_data.new_password)
    await db.admins.update_one(
        {"username": username},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    logger.info(f"✅ Password changed for admin: {username}")
    return {"message": "Password updated successfully"}

# ==================== PROTECTED ADMIN ENDPOINTS ====================

@api_router.get("/admin/contacts", response_model=List[Contact])
async def get_contacts(current_user: dict = Depends(get_current_user)):
    """Get all contact submissions (admin only)"""
    contacts = await db.contacts.find().sort("created_at", -1).to_list(1000)
    return [Contact(**contact) for contact in contacts]

# Service Management
@api_router.post("/admin/services", response_model=Service)
async def create_service(
    service: ServiceCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new service (admin only)"""
    service_data = Service(**service.dict())
    await db.services.insert_one(service_data.dict())
    logger.info(f"✅ Service created: {service_data.title}")
    return service_data

@api_router.put("/admin/services/{service_id}", response_model=Service)
async def update_service(
    service_id: str,
    service: ServiceUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update service (admin only)"""
    existing_service = await db.services.find_one({"id": service_id})
    if not existing_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await db.services.update_one(
        {"id": service_id},
        {"$set": update_data}
    )
    
    updated_service = await db.services.find_one({"id": service_id})
    logger.info(f"✅ Service updated: {service_id}")
    return Service(**updated_service)

@api_router.delete("/admin/services/{service_id}")
async def delete_service(
    service_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete service (admin only)"""
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    logger.info(f"✅ Service deleted: {service_id}")
    return {"message": "Service deleted successfully"}

# SaaS Product Management
@api_router.post("/admin/saas-products", response_model=SaasProduct)
async def create_saas_product(
    product: SaasProductCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create new SaaS product (admin only)"""
    product_data = SaasProduct(**product.dict())
    await db.saas_products.insert_one(product_data.dict())
    logger.info(f"✅ SaaS product created: {product_data.title}")
    return product_data

@api_router.put("/admin/saas-products/{product_id}", response_model=SaasProduct)
async def update_saas_product(
    product_id: str,
    product: SaasProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update SaaS product (admin only)"""
    existing_product = await db.saas_products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await db.saas_products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    updated_product = await db.saas_products.find_one({"id": product_id})
    logger.info(f"✅ SaaS product updated: {product_id}")
    return SaasProduct(**updated_product)

@api_router.delete("/admin/saas-products/{product_id}")
async def delete_saas_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete SaaS product (admin only)"""
    result = await db.saas_products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    logger.info(f"✅ SaaS product deleted: {product_id}")
    return {"message": "Product deleted successfully"}

# About Content Management
@api_router.put("/admin/about", response_model=AboutContent)
async def update_about_content(
    about: AboutContentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update About page content (admin only)"""
    existing_about = await db.about_content.find_one()
    
    if not existing_about:
        # Create new about content if none exists
        about_data = AboutContent(
            title=about.title,
            content=about.content
        )
        await db.about_content.insert_one(about_data.dict())
        logger.info(f"✅ About content created")
        return about_data
    
    # Update existing content
    update_data = about.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await db.about_content.update_one(
        {"id": existing_about["id"]},
        {"$set": update_data}
    )
    
    updated_about = await db.about_content.find_one({"id": existing_about["id"]})
    logger.info(f"✅ About content updated")
    return AboutContent(**updated_about)

# Include the router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
