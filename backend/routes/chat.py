from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from typing import List
import logging
import os
import re
import uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage

from models import (
    ChatMessage, ChatSession, ChatRequest, ChatResponse,
    MeetingRequest, MeetingRequestCreate
)
from auth import get_current_user
from email_service import send_meeting_request_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chatbot"])


def get_db():
    """Dependency to get database - will be set by main app"""
    from server import db
    return db


async def get_dynamic_system_prompt(db) -> str:
    """
    Build system prompt dynamically from database content.
    This ensures the chatbot always has the latest information.
    """
    
    # Fetch services from database
    services_list = await db.services.find().to_list(100)
    services_text = ""
    if services_list:
        services_text = "Our Services:\n"
        for i, service in enumerate(services_list, 1):
            title = service.get('title', 'Service')
            description = service.get('description', '')
            services_text += f"{i}. {title} - {description}\n"
    else:
        services_text = """Our Services:
1. IT and Telecommunication Consulting - Infrastructure, network optimization, and advanced solutions.
2. Company Registration in Sweden - Complete support for business setup in Sweden.
3. Leading Teams - Expert leadership consulting for sales and engineering teams.
"""

    # Fetch SaaS products from database
    products_list = await db.saas_products.find().to_list(100)
    products_text = ""
    if products_list:
        products_text = "Our SaaS Products:\n"
        for i, product in enumerate(products_list, 1):
            name = product.get('name', 'Product')
            description = product.get('description', '')
            price = product.get('price', '')
            products_text += f"{i}. {name} - {description}"
            if price:
                products_text += f" (Starting at {price})"
            products_text += "\n"
    else:
        products_text = """Our SaaS Products:
1. MITACRM - CRM solution for modern businesses
2. Routing System - Advanced routing for telecommunications
3. White Label Software - Customizable solutions
"""

    # Fetch about content from database
    about_content = await db.about_content.find_one()
    about_text = ""
    if about_content:
        company_name = about_content.get('company_name', 'MITA ICT')
        company_description = about_content.get('description', '')
        years_experience = about_content.get('years_experience', '20+')
        about_text = f"""About Us:
- Company: {company_name}
- Experience: {years_experience} years in IT and telecommunications
- {company_description}
"""
    else:
        about_text = "About Us: MITA ICT is a consulting company with 20+ years of experience in IT and telecommunications."

    # Build the complete system prompt
    system_prompt = f"""You are a friendly and professional sales assistant for MITA ICT. Your goal is to help visitors understand our services and guide them toward scheduling a meeting.

{about_text}

{services_text}
{products_text}

MEETING SCHEDULING - IMPORTANT:
When a user wants to schedule a meeting or consultation:
1. Ask for their name if you don't have it
2. Ask for their email address
3. Ask for their preferred date and time (be flexible, suggest "this week" or "next week" options)
4. Optionally ask what they'd like to discuss

Once you have name, email, and preferred time, respond with EXACTLY this format (the system will detect it):
"MEETING_REQUEST: [name] | [email] | [preferred_datetime] | [topic]"

Then immediately follow with a friendly confirmation like:
"Perfect! I've submitted your meeting request. Our team at info@mitaict.com will review it and confirm the time slot with you shortly. Is there anything else I can help you with?"

Guidelines:
- Be warm, helpful, and conversational
- Answer questions about services and products based on the information above
- After 2-3 exchanges, suggest scheduling a free consultation call
- If they share contact info, acknowledge warmly
- Keep responses concise unless they ask for details
- For pricing questions, mention the prices above if available, or suggest a call to discuss their specific needs
- If asked about something not listed above, say you'd be happy to connect them with the team for more details

Example meeting scheduling flow:
User: "I'd like to schedule a meeting"
You: "I'd be happy to help you schedule a consultation! Could I get your name and email address?"
User: "John Smith, john@example.com"
You: "Thanks John! When would work best for you? We have availability this week and next."
User: "How about Thursday at 2pm?"
You: "MEETING_REQUEST: John Smith | john@example.com | Thursday at 2pm | General consultation"
"Great choice! I've submitted your meeting request for Thursday at 2pm. Our team will confirm this time slot with you via email shortly. Is there anything specific you'd like to discuss in the meeting?"
"""
    
    return system_prompt


@router.post("/chat/message", response_model=ChatResponse)
async def chat_message(request: ChatRequest):
    """Handle chatbot messages"""
    db = get_db()
    try:
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Chatbot is not configured"
            )
        
        # Get or create session
        session_id = request.session_id
        session = None
        
        if session_id:
            session_doc = await db.chat_sessions.find_one({"id": session_id})
            if session_doc:
                session = ChatSession(**session_doc)
        
        if not session:
            session = ChatSession()
            session_id = session.id
        
        # Get dynamic system prompt with latest content from database
        system_prompt = await get_dynamic_system_prompt(db)
        
        # Create chat instance with Claude model
        chat = LlmChat(
            api_key=emergent_key,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("anthropic", "claude-sonnet-4-20250514")
        
        # Add previous messages to conversation for context
        for msg in session.messages:
            chat.messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Create user message and get AI response
        user_msg = UserMessage(text=request.message)
        ai_response = await chat.send_message(user_msg)
        
        # Add messages to session
        user_message = ChatMessage(role="user", content=request.message)
        assistant_message = ChatMessage(role="assistant", content=ai_response)
        session.messages.append(user_message)
        session.messages.append(assistant_message)
        session.updated_at = datetime.utcnow()
        
        # Check for lead capture patterns in user message
        user_text_lower = request.message.lower()
        
        # Simple lead extraction
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
        
        emails = re.findall(email_pattern, request.message)
        phones = re.findall(phone_pattern, request.message)
        
        if emails:
            session.lead_email = emails[0]
            session.lead_captured = True
        if phones:
            session.lead_phone = phones[0]
            session.lead_captured = True
        
        # Check if name-like pattern (simple heuristic)
        if any(phrase in user_text_lower for phrase in ['my name is', "i'm ", "i am ", "call me "]):
            for phrase in ['my name is ', "i'm ", "i am ", "call me "]:
                if phrase in user_text_lower:
                    idx = user_text_lower.find(phrase) + len(phrase)
                    potential_name = request.message[idx:].split()[0:2]
                    if potential_name:
                        session.lead_name = ' '.join(potential_name).strip('.,!?')
                        break
        
        # Check for meeting request in AI response
        meeting_request_pattern = r'MEETING_REQUEST:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^\n"]+)'
        meeting_match = re.search(meeting_request_pattern, ai_response)
        
        if meeting_match:
            meeting_name = meeting_match.group(1).strip()
            meeting_email = meeting_match.group(2).strip()
            meeting_datetime = meeting_match.group(3).strip()
            meeting_topic = meeting_match.group(4).strip()
            
            # Save meeting request to database
            meeting_request_data = {
                "id": str(uuid.uuid4()),
                "session_id": session_id,
                "name": meeting_name,
                "email": meeting_email,
                "phone": session.lead_phone,
                "preferred_datetime": meeting_datetime,
                "topic": meeting_topic,
                "status": "pending",
                "created_at": datetime.utcnow()
            }
            await db.meeting_requests.insert_one(meeting_request_data)
            
            # Update session with lead info
            session.lead_name = meeting_name
            session.lead_email = meeting_email
            session.lead_captured = True
            
            # Send email to admin
            try:
                await send_meeting_request_email(
                    name=meeting_name,
                    email=meeting_email,
                    phone=session.lead_phone or "",
                    preferred_datetime=meeting_datetime,
                    topic=meeting_topic
                )
                logger.info(f"✅ Meeting request email sent for: {meeting_email}")
            except Exception as email_error:
                logger.error(f"❌ Failed to send meeting request email: {str(email_error)}")
            
            # Clean up the AI response by removing the MEETING_REQUEST line
            ai_response = re.sub(meeting_request_pattern, '', ai_response).strip()
            ai_response = re.sub(r'^\s*\n', '', ai_response)
            assistant_message = ChatMessage(role="assistant", content=ai_response)
            session.messages[-1] = assistant_message
        
        # Save session to database
        session_dict = session.dict()
        session_dict['messages'] = [m.dict() for m in session.messages]
        
        await db.chat_sessions.update_one(
            {"id": session_id},
            {"$set": session_dict},
            upsert=True
        )
        
        logger.info(f"✅ Chat message processed for session: {session_id}")
        
        return ChatResponse(
            session_id=session_id,
            message=ai_response,
            lead_captured=session.lead_captured
        )
        
    except Exception as e:
        logger.error(f"❌ Chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat service error: {str(e)}"
        )


@router.get("/admin/chat-sessions")
async def get_chat_sessions(current_user: dict = Depends(get_current_user)):
    """Get all chat sessions with leads (admin only)"""
    db = get_db()
    sessions = await db.chat_sessions.find().sort("updated_at", -1).to_list(1000)
    
    result = []
    for session in sessions:
        session_data = {
            "id": session.get("id"),
            "lead_captured": session.get("lead_captured", False),
            "lead_name": session.get("lead_name"),
            "lead_email": session.get("lead_email"),
            "lead_phone": session.get("lead_phone"),
            "lead_interest": session.get("lead_interest"),
            "message_count": len(session.get("messages", [])),
            "created_at": session.get("created_at"),
            "updated_at": session.get("updated_at")
        }
        result.append(session_data)
    
    return result


@router.get("/admin/chat-sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific chat session with full conversation (admin only)"""
    db = get_db()
    session = await db.chat_sessions.find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = {k: v for k, v in session.items() if k != '_id'}
    return session_data


@router.delete("/admin/chat-sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a chat session (admin only)"""
    db = get_db()
    result = await db.chat_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    logger.info(f"✅ Chat session deleted: {session_id}")
    return {"message": "Chat session deleted successfully"}


# ==================== MEETING REQUEST ENDPOINTS ====================

@router.get("/admin/meeting-requests")
async def get_meeting_requests(current_user: dict = Depends(get_current_user)):
    """Get all meeting requests (admin only)"""
    db = get_db()
    requests = await db.meeting_requests.find().sort("created_at", -1).to_list(1000)
    
    result = []
    for req in requests:
        request_data = {
            "id": req.get("id"),
            "session_id": req.get("session_id"),
            "name": req.get("name"),
            "email": req.get("email"),
            "phone": req.get("phone"),
            "preferred_datetime": req.get("preferred_datetime"),
            "topic": req.get("topic"),
            "status": req.get("status", "pending"),
            "created_at": req.get("created_at"),
            "admin_notes": req.get("admin_notes")
        }
        result.append(request_data)
    
    return result


@router.put("/admin/meeting-requests/{request_id}/status")
async def update_meeting_request_status(
    request_id: str,
    status_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update meeting request status (admin only)"""
    db = get_db()
    new_status = status_update.get("status")
    admin_notes = status_update.get("admin_notes", "")
    
    if new_status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.meeting_requests.update_one(
        {"id": request_id},
        {"$set": {"status": new_status, "admin_notes": admin_notes}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Meeting request not found")
    
    logger.info(f"✅ Meeting request {request_id} updated to {new_status}")
    return {"message": f"Meeting request {new_status} successfully"}


@router.delete("/admin/meeting-requests/{request_id}")
async def delete_meeting_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a meeting request (admin only)"""
    db = get_db()
    result = await db.meeting_requests.delete_one({"id": request_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meeting request not found")
    
    logger.info(f"✅ Meeting request deleted: {request_id}")
    return {"message": "Meeting request deleted successfully"}
