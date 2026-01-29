# MITA ICT Website - Hetzner VPS Deployment Guide

## Prerequisites

- Hetzner VPS with Ubuntu 22.04 LTS
- Domain name pointed to your VPS IP (mitaict.com)
- SSH access to the server

## 1. Server Setup

### Connect to your VPS
```bash
ssh root@your-server-ip
```

### Update system and install Docker
```bash
apt update && apt upgrade -y
apt install -y curl git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start Docker service
systemctl enable docker
systemctl start docker
```

## 2. Clone Repository

```bash
cd /opt
git clone https://github.com/your-repo/mita-ict.git
cd mita-ict
```

## 3. Configure Environment Variables

### Create production .env file
```bash
cp .env.example .env
nano .env
```

### Required environment variables:
```env
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your-secure-password-here

# Application
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
EMERGENT_LLM_KEY=your-emergent-key

# Email (SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=465
SMTP_USERNAME=your-email@domain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@mitaict.com
SMTP_TO_EMAIL=info@mitaict.com

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your-recaptcha-secret
REACT_APP_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Frontend URL
REACT_APP_BACKEND_URL=https://mitaict.com
```

## 4. SSL Certificate Setup (Let's Encrypt)

### Initial certificate request
```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Get initial certificate (run without nginx first)
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d mitaict.com -d www.mitaict.com \
  --email your-email@domain.com \
  --agree-tos --no-eff-email
```

## 5. Deploy Application

### Build and start services
```bash
docker-compose up -d --build
```

### Check service status
```bash
docker-compose ps
docker-compose logs -f
```

### Verify health
```bash
curl https://mitaict.com/api/health
```

## 6. Firewall Configuration

```bash
# Install UFW
apt install ufw -y

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

## 7. Monitoring & Maintenance

### View logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Restart services
```bash
docker-compose restart
```

### Update application
```bash
git pull
docker-compose up -d --build
```

### Backup MongoDB
```bash
docker exec mita-mongodb mongodump --out /backup
docker cp mita-mongodb:/backup ./backup-$(date +%Y%m%d)
```

## 8. Performance Optimization Checklist

- [x] Gzip compression enabled (nginx)
- [x] Static file caching (1 year)
- [x] HTTP/2 enabled
- [x] Database indexes created
- [x] Connection pooling
- [x] Rate limiting for API endpoints
- [x] HSTS headers
- [x] Security headers

## 9. SEO Verification

After deployment, verify:
1. `https://mitaict.com/robots.txt` is accessible
2. `https://mitaict.com/sitemap.xml` is accessible
3. Submit sitemap to Google Search Console
4. Submit sitemap to Bing Webmaster Tools

## 10. Troubleshooting

### Check container logs
```bash
docker logs mita-backend
docker logs mita-frontend
docker logs mita-nginx
```

### Restart specific service
```bash
docker-compose restart backend
```

### Rebuild without cache
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Check database connection
```bash
docker exec -it mita-mongodb mongosh
```

## Support

For issues or questions:
- Email: info@mitaict.com
- Website: https://mitaict.com/contact
