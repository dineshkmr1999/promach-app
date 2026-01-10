#!/bin/bash

# Diagnose and Fix SSL Setup Issues
# This script stops conflicting services and retries SSL setup

set -e

echo "🔍 Diagnosing SSL setup issues..."
echo ""

# Check what's listening on port 80 and 443
echo "📊 Checking what's listening on ports 80 and 443..."
sudo netstat -tulpn | grep -E ':(80|443) ' || echo "No services found on port 80/443"
echo ""

# Check nginx status
echo "📊 Checking nginx status..."
sudo systemctl status nginx --no-pager || true
echo ""

# Check if Docker containers are running
echo "📊 Checking Docker containers..."
docker ps || true
echo ""

# Step 1: Stop Docker containers if running (they might be binding to port 80)
echo "🛑 Stopping Docker containers..."
docker-compose -f ~/promach-app/docker-compose.yml down || echo "No docker-compose found or already stopped"
docker stop $(docker ps -aq) 2>/dev/null || echo "No running containers"
echo ""

# Step 2: Remove ALL existing nginx configs
echo "🗑️  Removing all existing nginx configurations..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/promach*
echo ""

# Step 3: Create fresh HTTP-only nginx config
echo "📝 Creating fresh HTTP-only nginx configuration..."
sudo tee /etc/nginx/sites-available/promach-http > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name promachpl.com www.promachpl.com;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Application (temporary until SSL is set up)
    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
EOF

# Step 4: Create certbot directory
sudo mkdir -p /var/www/certbot
sudo chmod 755 /var/www/certbot

# Step 5: Enable HTTP-only config
echo "✅ Enabling HTTP-only configuration..."
sudo ln -sf /etc/nginx/sites-available/promach-http /etc/nginx/sites-enabled/promach-http

# Step 6: Test and reload nginx
echo "🧪 Testing nginx configuration..."
sudo nginx -t

echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

# Step 7: Test port 80 accessibility
echo ""
echo "🧪 Testing port 80 accessibility..."
curl -I http://localhost || echo "Local test failed"
echo ""

# Step 8: Obtain SSL certificate
echo "🔒 Attempting to obtain SSL certificate..."
sudo certbot certonly --webroot -w /var/www/certbot \
  -d promachpl.com -d www.promachpl.com \
  --non-interactive --agree-tos --email admin@promachpl.com \
  --verbose

# Step 9: Check if successful
if [ -f /etc/letsencrypt/live/promachpl.com/fullchain.pem ]; then
    echo ""
    echo "✅ SSL certificate obtained successfully!"
    sudo certbot certificates
else
    echo ""
    echo "❌ SSL certificate generation failed!"
    echo "Showing detailed logs..."
    sudo tail -n 50 /var/log/letsencrypt/letsencrypt.log
    exit 1
fi
