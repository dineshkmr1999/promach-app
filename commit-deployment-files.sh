#!/bin/bash

# Quick Git Commit Script for Deployment Files
# This script commits all the new deployment infrastructure files to your repository

echo "🚀 Committing Deployment Pipeline Files to Git"
echo "=============================================="

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Please run 'git init' first."
    exit 1
fi

echo ""
echo "📝 Files to be committed:"
echo ""

# Show status
git status --short

echo ""
read -p "Do you want to commit these deployment files? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "Adding files..."
    
    # Add deployment files
    git add .github/workflows/deploy.yml
    git add back-end/Dockerfile
    git add back-end/.dockerignore
    git add front-end/Dockerfile
    git add front-end/.dockerignore
    git add front-end/nginx.conf
    git add nginx/production.conf
    git add docker-compose.yml
    git add deploy.sh
    git add .env.example
    git add README.md
    git add DEPLOYMENT.md
    git add GITHUB_SECRETS.md
    git add QUICK_START.md
    git add WORKFLOW.md
    
    # Commit
    echo ""
    echo "Committing..."
    git commit -m "Add EC2 deployment pipeline with Docker and GitHub Actions

- Add Dockerfiles for backend and frontend with multi-stage builds
- Add docker-compose.yml for container orchestration
- Add GitHub Actions workflow for automated deployment
- Add Nginx configuration for reverse proxy and SSL
- Add deployment scripts with health checks
- Add comprehensive documentation (DEPLOYMENT.md, QUICK_START.md, etc.)
- Add environment variable template (.env.example)"
    
    echo ""
    echo "✅ Files committed successfully!"
    echo ""
    echo "📤 Next step: Push to GitHub"
    echo "Run: git push origin main"
    echo ""
    echo "After pushing, follow WORKFLOW.md for deployment steps."
else
    echo ""
    echo "❌ Commit cancelled."
    exit 0
fi
