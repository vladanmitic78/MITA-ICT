from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
import logging

from models import AdminLogin, Token, ChangePassword
from auth import verify_password, get_password_hash, create_access_token, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])


def get_db():
    """Dependency to get database - will be set by main app"""
    from server import db
    return db


@router.post("/login", response_model=Token)
async def admin_login(credentials: AdminLogin):
    """Admin login with username/password"""
    db = get_db()
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


@router.post("/google-login", response_model=Token)
async def admin_google_login():
    """Admin login with Google OAuth (mock for now)"""
    access_token = create_access_token(data={"sub": "google_admin"})
    logger.info(f"✅ Admin logged in via Google")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def admin_logout(current_user: dict = Depends(get_current_user)):
    """Admin logout"""
    logger.info(f"✅ Admin logged out: {current_user['username']}")
    return {"message": "Successfully logged out"}


@router.post("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: dict = Depends(get_current_user)
):
    """Change admin password"""
    db = get_db()
    username = current_user['username']
    admin = await db.admins.find_one({"username": username})
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found"
        )
    
    if not verify_password(password_data.current_password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    new_password_hash = get_password_hash(password_data.new_password)
    await db.admins.update_one(
        {"username": username},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    logger.info(f"✅ Password changed for admin: {username}")
    return {"message": "Password updated successfully"}
