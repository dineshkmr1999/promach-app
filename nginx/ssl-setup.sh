#!/bin/bash

# SSL Certificate Setup Script for promachpl.com
# This script creates a temporary nginx config and obtains SSL certificates

set -e

echo "🔧 Setting up SSL certificates for promachpl.com..."

# Step 1: Create certbot directory
echo "📁 Creating certbot directory..."
sudo mkdir -p /var/www/certbot

# Step 2: Create temporary nginx config (HTTP only for ACME challenge)
echo "📝 Creating temporary nginx configuration..."
sudo tee /etc/nginx/sites-available/promach-temp > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name promachpl.com www.promachpl.com;

    # Allow Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Temporary: Proxy to application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Step 3: Enable temporary config
echo "✅ Enabling temporary nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/promach
sudo ln -sf /etc/nginx/sites-available/promach-temp /etc/nginx/sites-enabled/promach-temp

# Step 4: Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# Step 5: Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

# Step 6: Obtain SSL certificate
echo "🔒 Obtaining SSL certificate from Let's Encrypt..."
sudo certbot certonly --webroot -w /var/www/certbot -d promachpl.com -d www.promachpl.com --non-interactive --agree-tos --email admin@promachpl.com

# Step 7: Verify certificate was created
if [ -f /etc/letsencrypt/live/promachpl.com/fullchain.pem ]; then
    echo "✅ SSL certificate obtained successfully!"
    echo "📋 Certificate location: /etc/letsencrypt/live/promachpl.com/"
    
    # Show certificate info
    sudo certbot certificates
    
    echo ""
    echo "🎉 Next steps:"
    echo "1. Upload the production nginx config from your local machine"
    echo "2. Update production.conf with domain name: promachpl.com"
    echo "3. Enable the production config"
    echo "4. Reload nginx"
else
    echo "❌ Failed to obtain SSL certificate!"
    echo "Please check the logs above for errors."
    exit 1
fi
