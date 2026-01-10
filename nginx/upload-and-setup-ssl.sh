#!/bin/bash

# Upload nginx configs and setup SSL certificates
# Run this script from your LOCAL machine (Mac)

set -e

# Configuration
SERVER="ubuntu@15.206.164.115"
KEY="promach.pem"
REMOTE_DIR="~/promach-app/nginx"

echo "🚀 Starting SSL certificate setup for promachpl.com..."
echo ""

# Step 1: Create nginx directory on server
echo "📁 Creating nginx directory on server..."
ssh -i "$KEY" "$SERVER" "mkdir -p $REMOTE_DIR"

# Step 2: Upload nginx configuration files
echo "📤 Uploading nginx configuration files..."
scp -i "$KEY" nginx/production.conf "$SERVER:$REMOTE_DIR/"
scp -i "$KEY" nginx/ssl-setup.sh "$SERVER:$REMOTE_DIR/"
scp -i "$KEY" nginx/apply-production-config.sh "$SERVER:$REMOTE_DIR/"

# Step 3: Make scripts executable
echo "🔑 Making scripts executable..."
ssh -i "$KEY" "$SERVER" "chmod +x $REMOTE_DIR/*.sh"

# Step 4: Run SSL setup script
echo ""
echo "🔒 Running SSL certificate setup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ssh -i "$KEY" "$SERVER" "bash $REMOTE_DIR/ssl-setup.sh"

# Step 5: Apply production config
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Applying production nginx configuration..."
ssh -i "$KEY" "$SERVER" "bash $REMOTE_DIR/apply-production-config.sh"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SSL certificate setup complete!"
echo ""
echo "🌐 Your site is now live with HTTPS at:"
echo "   - https://promachpl.com"
echo "   - https://www.promachpl.com"
echo ""
echo "🔐 SSL certificate will auto-renew via certbot."
