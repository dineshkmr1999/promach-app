#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Promach App Deployment${NC}"
echo "======================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with required environment variables"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Remove dangling images
echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker system prune -f

# Build and start containers
echo -e "${YELLOW}🏗️  Building and starting containers...${NC}"
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker compose failed${NC}"
    exit 1
fi

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Check backend health
echo -e "${YELLOW}🔍 Checking backend health...${NC}"
RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy!${NC}"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for backend... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
    
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Backend health check failed${NC}"
        docker-compose logs backend
        exit 1
    fi
done

# Check frontend
echo -e "${YELLOW}🔍 Checking frontend...${NC}"
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend check failed, but continuing...${NC}"
fi

# Show container status
echo -e "${YELLOW}📋 Container status:${NC}"
docker-compose ps

# Show recent logs
echo -e "${YELLOW}📝 Recent logs:${NC}"
docker-compose logs --tail=20

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "======================================"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:80"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
