#!/bin/bash
# MITA ICT - Automated Deployment Script
# Run this on your Hetzner VPS

set -e

echo "========================================"
echo "  MITA ICT - Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Stop existing containers
echo -e "${YELLOW}Step 1: Stopping existing containers...${NC}"
cd /root/MITA-ICT
docker-compose -f docker-compose.simple.yml down 2>/dev/null || true

# Step 2: Build and start containers
echo -e "${YELLOW}Step 2: Building and starting containers...${NC}"
docker-compose -f docker-compose.simple.yml up -d --build

# Step 3: Wait for MongoDB to be ready
echo -e "${YELLOW}Step 3: Waiting for MongoDB to be ready...${NC}"
sleep 10

# Step 4: Import database if backup exists
if [ -f "/root/MITA-ICT/db_backup.tar.gz" ]; then
    echo -e "${YELLOW}Step 4: Importing database...${NC}"
    tar -xzf db_backup.tar.gz
    docker cp db_export_fresh/mitaict_database mita-mongodb:/tmp/
    docker exec mita-mongodb mongorestore --db mita_ict /tmp/mitaict_database --drop
    echo -e "${GREEN}Database imported successfully!${NC}"
else
    echo -e "${YELLOW}Step 4: No database backup found, skipping import${NC}"
fi

# Step 5: Check health
echo -e "${YELLOW}Step 5: Checking services...${NC}"
sleep 5

# Check backend
if curl -s http://localhost:8001/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
fi

# Check frontend
if curl -s http://localhost:80 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}Deployment complete!${NC}"
echo "========================================"
echo ""
echo "Your website should now be accessible at:"
echo "  http://49.13.203.26"
echo ""
echo "Admin login:"
echo "  http://49.13.203.26/admin"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.simple.yml logs -f"
echo ""
