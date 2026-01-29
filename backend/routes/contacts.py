from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from typing import List
import logging
import os
import httpx

from models import Contact, ContactCreate
from auth import get_current_user
from email_service import send_contact_email, send_auto_response_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Contacts"])


def get_db():
    """Dependency to get database - will be set by main app"""
    from server import db
    return db


@router.post("/contact", response_model=dict)
async def submit_contact(contact: ContactCreate):
    """Submit contact form"""
    db = get_db()
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
            await send_contact_email(
                name=contact.name,
                email=contact.email,
                phone=contact.phone,
                service=contact.service,
                comment=contact.comment
            )
            logger.info(f"✅ Admin notification email sent for: {contact.email}")
            
            await send_auto_response_email(
                name=contact.name,
                email=contact.email,
                phone=contact.phone,
                service=contact.service
            )
            logger.info(f"✅ Auto-response email sent to: {contact.email}")
            
        except Exception as e:
            logger.error(f"❌ Email sending failed: {str(e)}")
        
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
