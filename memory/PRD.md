# MITA ICT Consulting Website - Product Requirements Document

## Original Problem Statement
Build a full-stack consulting website for "MITA ICT" with a dark-themed, conversion-optimized design featuring:
- 4 primary pages: Home, SaaS Store, About Us, Contact Us
- Secure admin panel for full content management
- reCAPTCHA on the contact form with email notifications
- CRUD operations for services and SaaS products
- GDPR-compliant cookie consent banner (Swedish law)
- Social media marketing integrations
- AI-powered chatbot for sales and lead generation

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python (modular router architecture)
- **Database**: MongoDB
- **AI Integration**: Claude Sonnet 4 via Emergent Universal Key (emergentintegrations library)

## Backend Architecture (Refactored)
```
/app/backend/
├── server.py          # Main app entry point
├── routes/
│   ├── __init__.py    # Router exports
│   ├── public.py      # Public API (services, products, about)
│   ├── contacts.py    # Contact form submission
│   ├── auth.py        # Admin authentication
│   ├── admin.py       # Admin CRUD operations
│   └── chat.py        # Chatbot & meeting requests
├── models.py          # Pydantic models
├── auth.py            # JWT authentication
└── email_service.py   # Email notifications
```

## Implemented Features

### Core Pages
- [x] Home page with hero section, services overview, and CTAs
- [x] SaaS Store page listing products with descriptions
- [x] About Us page with company story and expertise sections
- [x] Contact Us page with reCAPTCHA-protected form

### Admin Dashboard (/admin/dashboard)
- [x] Admin login with JWT authentication
- [x] Services management (CRUD)
- [x] SaaS products management (CRUD)
- [x] About content editing with expertise sections
- [x] Contact submissions management with search, edit, delete
- [x] PDF and Excel export for contacts
- [x] Social media integrations management
- [x] **Chat Leads tab** - View chatbot conversations and captured leads

### AI Chatbot
- [x] Chat bubble appears after cookie consent
- [x] Multi-turn conversations with context
- [x] Lead capture (email, phone, name extraction)
- [x] Claude Sonnet 4 integration for intelligent responses
- [x] Admin panel view of all conversations
- [x] View full conversation details
- [x] Delete chat sessions
- [x] **Meeting scheduling** - Collects user's preferred time, sends email to admin for approval
- [x] **Meeting Requests tab** in admin panel with approve/reject/email actions

### Security & Compliance
- [x] GDPR-compliant cookie consent banner
- [x] reCAPTCHA verification on contact form
- [x] JWT-based admin authentication
- [x] Password hashing with bcrypt

### SEO & Performance
- [x] Code splitting and lazy loading
- [x] Meta tags optimization
- [x] robots.txt and sitemap.xml
- [x] Accessibility improvements (skip links, ARIA labels)

## Admin Credentials
- **Username**: vladanmitic@gmail.com
- **Password**: Admin123!

## Key API Endpoints
- `POST /api/chat/message` - Chatbot message handling
- `GET /api/admin/chat-sessions` - List all chat sessions
- `GET /api/admin/chat-sessions/{id}` - Get session details
- `DELETE /api/admin/chat-sessions/{id}` - Delete session
- `POST /api/auth/login` - Admin login
- `GET/POST/PUT/DELETE /api/admin/*` - Admin CRUD operations

## Database Collections
- `services` - Consulting services
- `saas_products` - SaaS product listings
- `about_content` - About page content
- `contacts` - Contact form submissions
- `admins` - Admin user accounts
- `chat_sessions` - Chatbot conversations and leads
- `social_integrations` - Social media API keys

## Upcoming/Future Tasks (Backlog)
1. **P2**: Database pagination for large datasets
2. **P3**: Add database indexes and query projections for performance

## Notes
- Chatbot uses Emergent Universal Key (no user-provided API key needed)
- Cookie consent required before chatbot appears (GDPR compliance)
- Lead extraction is automated from conversation content
