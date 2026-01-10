#!/bin/bash
# Check if swap already exists
if swapon --show | grep -q "/swapfile"; then
    echo "Swap already exists"
else
    echo "Creating 2GB swapfile..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created successfully"
fi

free -h
