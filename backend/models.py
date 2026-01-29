from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Optional
from datetime import datetime
import uuid

# Service Models
class ServiceBase(BaseModel):
    title: str
    description: str
    icon: str

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    pass

class Service(ServiceBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# SaaS Product Models
class SaasProductBase(BaseModel):
    title: str
    description: str
    link: str
    features: List[str] = []

class SaasProductCreate(SaasProductBase):
    pass

class SaasProductUpdate(SaasProductBase):
    pass

class SaasProduct(SaasProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Contact Models
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: str
    comment: str = ""
    recaptcha_token: str

class ContactUpdate(BaseModel):
    name: str
    email: str
    phone: str
    service: str
    comment: str = ""

class Contact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    service: str
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# About Content Models
class AboutContentUpdate(BaseModel):
    title: str
    content: str
    expertise: Optional[List[dict]] = []

class AboutContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    expertise: Optional[List[dict]] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Admin Models
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str



# Social Media Integration Models
class FacebookIntegration(BaseModel):
    enabled: bool = False
    pixelId: str = ""
    accessToken: str = ""
    pageId: str = ""
    appId: str = ""
    appSecret: str = ""

class InstagramIntegration(BaseModel):
    enabled: bool = False
    accessToken: str = ""
    businessAccountId: str = ""

class TikTokIntegration(BaseModel):
    enabled: bool = False
    pixelId: str = ""
    accessToken: str = ""
    advertiserId: str = ""

class LinkedInIntegration(BaseModel):
    enabled: bool = False
    partnerId: str = ""
    accessToken: str = ""
    organizationId: str = ""

class YouTubeIntegration(BaseModel):
    enabled: bool = False
    apiKey: str = ""
    channelId: str = ""
    clientId: str = ""
    clientSecret: str = ""

class SocialIntegrations(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    facebook: FacebookIntegration = Field(default_factory=FacebookIntegration)
    instagram: InstagramIntegration = Field(default_factory=InstagramIntegration)
    tiktok: TikTokIntegration = Field(default_factory=TikTokIntegration)
    linkedin: LinkedInIntegration = Field(default_factory=LinkedInIntegration)
    youtube: YouTubeIntegration = Field(default_factory=YouTubeIntegration)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

class Admin(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None


# Chatbot Models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    messages: List[ChatMessage] = []
    lead_captured: bool = False
    lead_name: Optional[str] = None
    lead_email: Optional[str] = None
    lead_phone: Optional[str] = None
    lead_interest: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    session_id: str
    message: str
    lead_captured: bool = False