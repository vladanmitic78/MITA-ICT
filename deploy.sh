#!/bin/bash
# ===========================================
# MITA ICT - Easy Deployment Script
# ===========================================
# Usage: ./deploy.sh [first-time|update|ssl]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="mitaict.com"
EMAIL="info@mitaict.com"

echo "========================================"
echo "  MITA ICT - Deployment Script"
echo "========================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please copy .env.example to .env and fill in your values:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

case "$1" in
    "first-time")
        echo -e "${YELLOW}Running first-time setup...${NC}"
        
        # Step 1: Get SSL certificate
        echo -e "${YELLOW}Step 1: Getting SSL certificate...${NC}"
        docker run -it --rm -p 80:80 \
            -v /root/ssl:/etc/letsencrypt \
            certbot/certbot certonly --standalone \
            -d $DOMAIN -d www.$DOMAIN \
            --email $EMAIL --agree-tos --no-eff-email
        
        # Step 2: Build and start containers
        echo -e "${YELLOW}Step 2: Building and starting containers...${NC}"
        docker-compose up -d --build
        
        echo -e "${GREEN}✅ First-time setup complete!${NC}"
        echo "Your website is now live at: https://$DOMAIN"
        ;;
        
    "update")
        echo -e "${YELLOW}Updating application...${NC}"
        
        # Pull latest code (if using git)
        if [ -d ".git" ]; then
            git pull
        fi
        
        # Rebuild and restart containers
        docker-compose down
        docker-compose up -d --build
        
        echo -e "${GREEN}✅ Update complete!${NC}"
        ;;
        
    "ssl")
        echo -e "${YELLOW}Renewing SSL certificate...${NC}"
        
        docker-compose stop frontend
        docker run -it --rm -p 80:80 \
            -v /root/ssl:/etc/letsencrypt \
            certbot/certbot renew
        docker-compose start frontend
        
        echo -e "${GREEN}✅ SSL renewal complete!${NC}"
        ;;
        
    "logs")
        docker-compose logs -f
        ;;
        
    "status")
        docker-compose ps
        echo ""
        echo "Backend health:"
        curl -s http://localhost:8001/api/health || echo "Backend not responding"
        ;;
        
    "backup-db")
        echo -e "${YELLOW}Backing up database...${NC}"
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        docker exec mita-mongodb mongodump --db mita_ict --out /tmp/backup
        docker cp mita-mongodb:/tmp/backup ./db_backup
        tar -czvf $BACKUP_FILE db_backup/
        rm -rf db_backup/
        echo -e "${GREEN}✅ Database backed up to: $BACKUP_FILE${NC}"
        ;;
        
    "restore-db")
        if [ -z "$2" ]; then
            echo -e "${RED}Usage: ./deploy.sh restore-db <backup_file.tar.gz>${NC}"
            exit 1
        fi
        echo -e "${YELLOW}Restoring database from $2...${NC}"
        tar -xzf $2
        docker cp db_backup/mita_ict mita-mongodb:/tmp/
        docker exec mita-mongodb mongorestore --db mita_ict /tmp/mita_ict --drop
        rm -rf db_backup/
        echo -e "${GREEN}✅ Database restored!${NC}"
        ;;
        
    *)
        echo "Usage: ./deploy.sh [command]"
        echo ""
        echo "Commands:"
        echo "  first-time  - Initial setup (SSL + build + start)"
        echo "  update      - Pull latest code and rebuild"
        echo "  ssl         - Renew SSL certificate"
        echo "  logs        - View container logs"
        echo "  status      - Check service status"
        echo "  backup-db   - Backup the database"
        echo "  restore-db  - Restore database from backup"
        echo ""
        echo "Example:"
        echo "  ./deploy.sh first-time"
        ;;
esac
