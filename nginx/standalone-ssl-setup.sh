#!/bin/bash

# Fix SSL Setup Using Standalone Method
# This bypasses nginx and uses certbot's built-in web server

set -e

echo "🔒 Using standalone method to obtain SSL certificates..."
echo ""

# Check if there's a DNS/CDN redirect
echo "🔍 Checking DNS configuration..."
echo "Nameservers for promachpl.com:"
dig +short NS promachpl.com || nslookup -type=NS promachpl.com
echo ""
echo "A Records:"
dig +short A promachpl.com www.promachpl.com || nslookup promachpl.com
echo ""

# Step 1: Stop nginx temporarily  
echo "🛑 Stopping nginx temporarily..."
sudo systemctl stop nginx

# Step 2: Use standalone method
echo "🔒 Obtaining SSL certificate using standalone method..."
echo "This will start a temporary web server on port 80..."
sudo certbot certonly --standalone \
  --preferred-challenges http \
  -d promachpl.com -d www.promachpl.com \
  --non-interactive --agree-tos --email admin@promachpl.com \
  --verbose

# Step 3: Check if successful
if [ -f /etc/letsencrypt/live/promachpl.com/fullchain.pem ]; then
    echo ""
    echo "✅ SSL certificate obtained successfully!"
    
    # Show certificate info
    sudo certbot certificates
    
    # Start nginx again
    echo ""
    echo "🔄 Starting nginx..."
    sudo systemctl start nginx
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SSL CERTIFICATE SETUP COMPLETE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Certificate location: /etc/letsencrypt/live/promachpl.com/"
    echo ""
    echo "📋 Next steps:"
    echo "1. Apply the production nginx configuration"
    echo "   Run: bash ~/promach-app/nginx/apply-production-config.sh"
    echo ""
else
    echo ""
    echo "❌ SSL certificate generation failed!"
    echo ""
    echo "POSSIBLE CAUSES:"
    echo "1. DNS not pointing to this server"
    echo "2. Cloudflare/CDN forcing HTTPS redirect"
    echo "3. Port 80 blocked by firewall/security group"
    echo ""
    echo "Showing detailed logs..."
    sudo tail -n 100 /var/log/letsencrypt/letsencrypt.log
    
    # Start nginx again
    sudo systemctl start nginx
    exit 1
fi
