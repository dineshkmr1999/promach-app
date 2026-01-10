#!/bin/bash
set -e

# 1. System Update & Dependencies
echo "🔄 Updating system..."
sudo apt-get update && sudo apt-get install -y docker.io docker-compose

# 2. Setup 2GB Swap (CRITICAL for builds)
echo "💾 Setting up 2GB Swap Memory..."
if ! swapon --show | grep -q "/swapfile"; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap created."
else
    echo "✓ Swap already exists."
fi

# 3. Add user to docker group
sudo usermod -aG docker ubuntu

# 4. Create Directory Structure
mkdir -p ~/promach-app/nginx ~/promach-app/front-end ~/promach-app/back-end/uploads

echo "✅ Server prepared! You can now upload the code and run docker-compose up."
