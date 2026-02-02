# MITA ICT - Product Requirements Document

## Project Overview
Full-stack consulting website for MITA ICT with AI chatbot, admin panel, and SEO optimization.

**Live URL**: https://mitaict.com  
**Admin Panel**: https://mitaict.com/admin  
**GitHub**: https://github.com/vladanmitic78/MITA-ICT

---

## What's Been Implemented ✅

### Core Website (Completed)
- [x] Dark-themed, conversion-optimized design
- [x] Home page with services overview
- [x] SaaS Store page with products
- [x] About Us page
- [x] Contact Us page with form
- [x] Cookie consent banner
- [x] Responsive design for all devices

### Admin Panel (Completed)
- [x] Secure JWT authentication
- [x] Services management (CRUD)
- [x] SaaS Products management (CRUD)
- [x] About Us content editor
- [x] Contact submissions viewer
- [x] Chat leads viewer
- [x] Meeting requests management (approve/reject)
- [x] Social media integrations settings

### AI Chatbot (Completed)
- [x] Claude Sonnet 4 integration via Emergent LLM
- [x] Lead capture (name, email, phone)
- [x] Meeting scheduling within chat
- [x] Email notifications to admin for meeting requests
- [x] Session persistence

### SEO Optimization (Completed)
- [x] Meta tags optimization
- [x] Keyword integration throughout pages
- [x] sitemap.xml
- [x] robots.txt
- [x] JSON-LD structured data

### Database (Completed)
- [x] MongoDB with indexes for performance
- [x] Pagination for admin lists
- [x] Collections: services, saas_products, about_content, contacts, chat_sessions, meeting_requests, admins, social_integrations

### Deployment (Completed)
- [x] Docker + Docker Compose configuration
- [x] SSL with Let's Encrypt
- [x] Nginx reverse proxy
- [x] Production deployment on Hetzner VPS
- [x] Easy deployment script (deploy.sh)
- [x] Database migration completed

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Shadcn UI |
| Backend | FastAPI, Python 3.11 |
| Database | MongoDB 6.0 |
| AI | Claude Sonnet 4 (via Emergent) |
| Deployment | Docker, Nginx, Let's Encrypt |
| Hosting | Hetzner VPS |

---

## Admin Credentials

- **Email**: vladanmitic@gmail.com
- **Password**: Admin123!

---

## Environment Variables

See `.env.example` for all required variables:
- SMTP settings (SiteGround)
- Emergent LLM Key (for chatbot)
- reCAPTCHA keys
- JWT secret

---

## Future Enhancements (Backlog)

### P1 - Next Priority
- [ ] AI Voice Agent for phone calls (Google AI Studio, ElevenLabs, or Bland.ai)

### P2 - Nice to Have
- [ ] Email confirmation to users when meeting is approved (with .ics calendar invite)
- [ ] Refactor AdminDashboard.jsx into smaller components
- [ ] Analytics dashboard for admin
- [ ] Multi-language support

---

## Deployment Commands

```bash
# First-time setup
./deploy.sh first-time

# Update after code changes
./deploy.sh update

# Renew SSL (every 90 days)
./deploy.sh ssl

# Backup database
./deploy.sh backup-db

# Check status
./deploy.sh status
```

---

## File Structure

```
MITA-ICT/
├── deploy.sh              # Easy deployment script
├── docker-compose.yml     # Docker configuration
├── .env.example           # Environment template
├── DEPLOYMENT.md          # Deployment guide
├── backend/
│   ├── Dockerfile
│   ├── server.py
│   ├── models.py
│   ├── auth.py
│   ├── email_service.py
│   └── routes/
│       ├── admin.py
│       ├── auth.py
│       ├── chat.py
│       ├── contacts.py
│       └── public.py
└── frontend/
    ├── Dockerfile
    ├── nginx-ssl.conf
    └── src/
        ├── App.js
        ├── api.js
        ├── components/
        │   └── Chatbot.jsx
        └── pages/
            ├── Home.jsx
            ├── SaasStore.jsx
            ├── AboutUs.jsx
            ├── ContactUs.jsx
            └── AdminDashboard.jsx
```

---

## Last Updated
February 2, 2026 - Production deployment completed
