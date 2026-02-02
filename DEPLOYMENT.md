# MITA ICT - Hetzner Deployment Guide

## Quick Start (3 Steps)

### Step 1: Prepare your Hetzner VPS

SSH into your server and install Docker:

```bash
ssh root@YOUR_SERVER_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose
```

### Step 2: Clone and Configure

```bash
cd /root
git clone https://github.com/vladanmitic78/MITA-ICT.git
cd MITA-ICT

# Copy and edit environment file
cp .env.example .env
nano .env
```

Fill in your `.env` values:
- `SMTP_PASSWORD` - Your SiteGround email password
- `EMERGENT_LLM_KEY` - Your Emergent API key for chatbot
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA secret key
- `REACT_APP_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key

### Step 3: Deploy

```bash
chmod +x deploy.sh
./deploy.sh first-time
```

That's it! Your website will be live at https://mitaict.com

---

## Other Commands

### Update after code changes
```bash
cd /root/MITA-ICT
git pull
./deploy.sh update
```

### Renew SSL certificate (every 90 days)
```bash
./deploy.sh ssl
```

### View logs
```bash
./deploy.sh logs
```

### Check status
```bash
./deploy.sh status
```

### Backup database
```bash
./deploy.sh backup-db
```

### Restore database
```bash
./deploy.sh restore-db backup_20260202.tar.gz
```

---

## DNS Setup

Point your domain to your Hetzner server:

| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_SERVER_IP |
| A | www | YOUR_SERVER_IP |

Keep MX records pointing to your email provider (SiteGround).

---

## Troubleshooting

### Check container status
```bash
docker ps
docker logs mita-backend
docker logs mita-frontend
```

### Restart everything
```bash
docker-compose down
docker-compose up -d
```

### Test backend API
```bash
curl http://localhost:8001/api/health
```

---

## Admin Access

- **URL**: https://mitaict.com/admin
- **Email**: vladanmitic@gmail.com
- **Password**: Admin123!

---

## File Structure

```
MITA-ICT/
├── deploy.sh              # Easy deployment script
├── docker-compose.yml     # Docker configuration
├── .env.example           # Environment template
├── .env                   # Your secrets (not in git)
├── backend/
│   ├── Dockerfile
│   ├── server.py
│   └── routes/
└── frontend/
    ├── Dockerfile
    ├── nginx-ssl.conf
    └── src/
```
