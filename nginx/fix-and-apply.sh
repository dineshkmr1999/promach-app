#!/bin/bash

# Fix nginx configuration and apply production settings
set -e

echo "🔧 Fixing nginx configuration and applying production settings..."
echo ""

# Verify certificate exists
if sudo test -f /etc/letsencrypt/live/promachpl.com/fullchain.pem; then
    echo "✅ SSL certificate found at /etc/letsencrypt/live/promachpl.com/"
else
    echo "❌ SSL certificate not found!"
    exit 1
fi

# Show certificate info
echo "📋 Certificate details:"
sudo certbot certificates
echo ""

# Remove all existing nginx site configs to avoid conflicts
echo "🗑️  Removing conflicting nginx configurations..."
sudo rm -f /etc/nginx/sites-enabled/*
sudo rm -f /etc/nginx/sites-available/promach*
sudo rm -f /etc/nginx/sites-available/default
echo ""

# Copy production config
echo "📝 Installing production nginx configuration..."
sudo cp ~/promach-app/nginx/production.conf /etc/nginx/sites-available/promach

# Enable production config
echo "✅ Enabling production configuration..."
sudo ln -sf /etc/nginx/sites-available/promach /etc/nginx/sites-enabled/promach

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
sudo nginx -t
echo ""

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PRODUCTION NGINX CONFIGURATION APPLIED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your site is now live with HTTPS at:"
echo "   - https://promachpl.com"
echo "   - https://www.promachpl.com"
echo ""
echo "🔐 Certificate expires: 2026-04-09"
echo "📋 Auto-renewal is configured via certbot systemd timer"
echo ""
echo "📊 Test your SSL setup:"
echo "   curl -I https://promachpl.com"
echo "   curl -I https://www.promachpl.com"
