#!/bin/bash

# Apply Production Nginx Configuration
# Run this AFTER obtaining SSL certificates

set -e

echo "🔧 Applying production nginx configuration..."

# Check if SSL certificates exist
if [ ! -f /etc/letsencrypt/live/promachpl.com/fullchain.pem ]; then
    echo "❌ SSL certificates not found!"
    echo "Please run ssl-setup.sh first to obtain certificates."
    exit 1
fi

# Copy production config
echo "📝 Installing production nginx configuration..."
sudo cp ~/promach-app/nginx/production.conf /etc/nginx/sites-available/promach

# Remove temporary config
echo "🗑️  Removing temporary configuration..."
sudo rm -f /etc/nginx/sites-enabled/promach-temp

# Enable production config
echo "✅ Enabling production configuration..."
sudo ln -sf /etc/nginx/sites-available/promach /etc/nginx/sites-enabled/promach

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Production nginx configuration applied successfully!"
echo "🌐 Your site should now be accessible at:"
echo "   - https://promachpl.com"
echo "   - https://www.promachpl.com"
echo ""
echo "📋 Certificate auto-renewal is configured via certbot systemd timer."
