#!/bin/bash

# Deploy updated Docker configuration with SSL support
set -e

echo "🚀 Deploying updated Docker configuration with SSL..."
echo ""

# Step 1: Sync updated files to server
echo "📤 Uploading updated configuration files..."
rsync -avz --progress \
  -e "ssh -i promach.pem" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'uploads' \
  ~/Desktop/Promach/certificates/promach-app/ \
  ubuntu@15.206.164.115:~/promach-app/

# Step 2: Rebuild and restart containers
echo ""
echo "🔨 Rebuilding and restarting Docker containers..."
ssh -i promach.pem ubuntu@15.206.164.115 << 'ENDSSH'
cd ~/promach-app

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Rebuild frontend with new nginx config
echo "🔨 Rebuilding frontend container..."
docker-compose build frontend

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Show status
echo ""
echo "📊 Container status:"
docker-compose ps

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=20

ENDSSH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your site should now be accessible at:"
echo "   - http://promachpl.com (redirects to HTTPS)"
echo "   - https://promachpl.com"
echo "   - https://www.promachpl.com"
echo ""
echo "🧪 Test with: curl -I https://promachpl.com"
