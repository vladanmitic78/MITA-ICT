from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from typing import List
import logging

from models import (
    Service, ServiceCreate, ServiceUpdate,
    SaasProduct, SaasProductCreate, SaasProductUpdate,
    AboutContent, AboutContentUpdate
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Public"])


def get_db():
    """Dependency to get database - will be set by main app"""
    from server import db
    return db


@router.get("/")
async def root():
    return {"message": "MITA ICT API - Where Technology Meets Strategy"}


@router.get("/services", response_model=List[Service])
async def get_services():
    """Get all consulting services"""
    db = get_db()
    services = await db.services.find().to_list(1000)
    return [Service(**service) for service in services]


@router.get("/saas-products", response_model=List[SaasProduct])
async def get_saas_products():
    """Get all SaaS products"""
    db = get_db()
    products = await db.saas_products.find().to_list(1000)
    return [SaasProduct(**product) for product in products]


@router.get("/about", response_model=AboutContent)
async def get_about_content():
    """Get About page content"""
    db = get_db()
    about = await db.about_content.find_one()
    if not about:
        raise HTTPException(status_code=404, detail="About content not found")
    return AboutContent(**about)
