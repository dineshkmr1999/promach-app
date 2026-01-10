# 🚀 EC2 Deployment Guide for Promach App

This guide provides step-by-step instructions for deploying your full-stack application to AWS EC2 with automated CI/CD using GitHub Actions.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [EC2 Instance Setup](#ec2-instance-setup)
- [Install Docker on EC2](#install-docker-on-ec2)
- [Configure Application on EC2](#configure-application-on-ec2)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [Domain Mapping and SSL](#domain-mapping-and-ssl)
- [Deploy Your Application](#deploy-your-application)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ AWS Account with EC2 access
- ✅ Domain name (for production deployment)
- ✅ GitHub repository with your code
- ✅ MongoDB database (local, MongoDB Atlas, or self-hosted)
- ✅ SSH key pair for EC2 access

---

## EC2 Instance Setup

### Step 1: Launch EC2 Instance

1. **Log in to AWS Console** → Navigate to EC2 Dashboard

2. **Click "Launch Instance"**

3. **Configure Instance:**
   ```
   Name: promach-app-server
   AMI: Ubuntu Server 22.04 LTS (Free Tier eligible)
   Instance Type: t2.small or t2.medium (recommended)
                  t2.micro (for testing only - may have performance issues)
   Key Pair: Create new or use existing
   ```

4. **Network Settings:**
   - Create a new security group or use existing
   - Allow SSH (Port 22) from your IP
   - Allow HTTP (Port 80) from anywhere (0.0.0.0/0)
   - Allow HTTPS (Port 443) from anywhere (0.0.0.0/0)
   - Allow Custom TCP (Port 5000) from anywhere (for backend API)

5. **Storage:** 
   - Minimum 20 GB SSD (gp3)
   - Recommended 30 GB for production

6. **Launch Instance** and download the `.pem` key file

### Step 2: Configure Security Group

After launching, ensure your security group has these inbound rules:

| Type  | Protocol | Port Range | Source    | Description          |
|-------|----------|------------|-----------|----------------------|
| SSH   | TCP      | 22         | Your IP   | SSH access           |
| HTTP  | TCP      | 80         | 0.0.0.0/0 | HTTP traffic         |
| HTTPS | TCP      | 443        | 0.0.0.0/0 | HTTPS traffic        |
| Custom| TCP      | 5000       | 0.0.0.0/0 | Backend API (optional)|

### Step 3: Allocate Elastic IP (Recommended)

1. Go to **EC2 → Elastic IPs** → **Allocate Elastic IP**
2. Associate it with your EC2 instance
3. This gives you a permanent IP address

---

## Install Docker on EC2

### Connect to EC2

```bash
# Set correct permissions for your key
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

### Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (no need for sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
exit
```

Reconnect to EC2 and verify:

```bash
ssh -i your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
docker --version
docker-compose --version
```

---

## Configure Application on EC2

### Step 1: Install Git

```bash
sudo apt install git -y
git --version
```

### Step 2: Clone Your Repository

```bash
# Generate SSH key for GitHub (if not already done)
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy the output and add to GitHub → Settings → SSH Keys

# Clone repository
cd ~
git clone git@github.com:your-username/promach-app.git

# OR using HTTPS:
# git clone https://github.com/your-username/promach-app.git

cd promach-app
```

### Step 3: Configure Environment Variables

```bash
# Create .env file from example
cp .env.example .env

# Edit with your actual values
nano .env
```

Update the `.env` file with your production values:

```bash
# ================================
# Backend Environment Variables
# ================================
NODE_ENV=production
PORT=5000

# MongoDB (Use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/promach?retryWrites=true&w=majority

# JWT (Generate a strong secret!)
JWT_SECRET=your-super-strong-secret-key-here
JWT_EXPIRATION=24h

# ================================
# Frontend Environment Variables
# ================================
VITE_API_URL=https://your-domain.com/api
# For testing without domain: http://<YOUR-EC2-IP>:5000
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 4: Initial Deployment

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

This will:
- Build Docker images
- Start containers
- Perform health checks

---

## GitHub Secrets Configuration

For automated deployments, configure these secrets in GitHub:

### Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Required Secrets

| Secret Name            | Description                              | Example Value                           |
|------------------------|------------------------------------------|-----------------------------------------|
| `EC2_SSH_PRIVATE_KEY`  | Your EC2 private key (.pem file content) | Contents of your `.pem` file            |
| `EC2_HOST`             | EC2 public IP or domain                  | `54.123.45.67` or `app.example.com`     |
| `EC2_USER`             | EC2 username                             | `ubuntu` (for Ubuntu EC2 instances)     |
| `MONGODB_URI`          | MongoDB connection string                | `mongodb+srv://...`                     |
| `JWT_SECRET`           | JWT secret key                           | Strong random string                    |
| `JWT_EXPIRATION`       | JWT token expiration                     | `24h` (optional, defaults to 24h)       |

### How to Add SSH Private Key

```bash
# On your local machine, copy the content of your .pem file
cat your-key.pem

# Copy ALL content including:
# -----BEGIN RSA PRIVATE KEY-----
# ... key content ...
# -----END RSA PRIVATE KEY-----

# Paste this entire content as EC2_SSH_PRIVATE_KEY secret
```

---

## Domain Mapping and SSL

### Step 1: Point Domain to EC2

In your domain registrar (GoDaddy, Namecheap, etc.):

1. Go to DNS Management
2. Add/Edit **A Record:**
   ```
   Type: A
   Name: @ (for root domain) or www
   Value: <YOUR-EC2-ELASTIC-IP>
   TTL: 3600
   ```

3. Wait 5-60 minutes for DNS propagation
4. Verify: `ping your-domain.com`

### Step 2: Install Nginx on EC2

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>

# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 3: Configure Nginx

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Copy production config
sudo cp ~/promach-app/nginx/production.conf /etc/nginx/sites-available/promach

# Edit the config to add your domain
sudo nano /etc/nginx/sites-available/promach

# Update these lines:
# server_name your-domain.com www.your-domain.com;
# ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

### Step 4: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (BEFORE enabling the nginx config)
sudo certbot certonly --nginx -d promachpl.com -d www.promachpl.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to share email

# Certificates will be saved to:
# /etc/letsencrypt/live/your-domain.com/
```

### Step 5: Enable Nginx Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/promach /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### Step 6: Auto-Renew SSL Certificate

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up auto-renewal
# Verify cron job:
sudo systemctl status certbot.timer
```

---

## Deploy Your Application

### Automatic Deployment (via GitHub)

Once GitHub secrets are configured:

```bash
# Simply push to main branch
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Connect to your EC2 instance
2. Pull latest code
3. Build Docker images
4. Deploy containers
5. Run health checks

### Manual Deployment

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>

# Navigate to app directory
cd ~/promach-app

# Run deployment script
./deploy.sh
```

---

## Monitoring and Logs

### View Container Status

```bash
docker-compose ps
```

### View Logs

```bash
# All containers
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Check Application Health

```bash
# Backend health check
curl http://localhost:5000/health

# Frontend check
curl http://localhost:80

# With domain:
curl https://your-domain.com
```

### Monitor Resources

```bash
# Docker stats
docker stats

# System resources
htop  # Install: sudo apt install htop
```

---

## Troubleshooting

### Issue: Containers not starting

```bash
# Check logs
docker-compose logs

# Check if ports are already in use
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80

# Restart containers
docker-compose down
docker-compose up -d
```

### Issue: Database connection failed

```bash
# Check environment variables
cat .env

# Test MongoDB connection
# If using MongoDB Atlas, ensure:
# 1. IP whitelist includes EC2 IP (or 0.0.0.0/0)
# 2. Database user credentials are correct
```

### Issue: Nginx not serving application

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Issue: SSL certificate errors

```bash
# Check certificate validity
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Reload Nginx after renewal
sudo systemctl reload nginx
```

### Issue: GitHub Actions deployment fails

1. **Check GitHub Actions logs** in your repository
2. **Verify GitHub Secrets** are correctly set
3. **Ensure EC2 security group** allows SSH from GitHub IPs
4. **Check SSH key format:**
   ```bash
   # The key should include headers:
   -----BEGIN RSA PRIVATE KEY-----
   ...
   -----END RSA PRIVATE KEY-----
   ```

### Issue: Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker images
docker system prune -a

# Remove old logs
sudo journalctl --vacuum-time=7d
```

---

## 🎉 Success Checklist

- [ ] EC2 instance running
- [ ] Docker and Docker Compose installed
- [ ] Application code cloned
- [ ] Environment variables configured
- [ ] Containers running successfully
- [ ] Backend health check passing
- [ ] Frontend accessible
- [ ] Domain pointing to EC2
- [ ] SSL certificate installed
- [ ] Nginx configured and running
- [ ] GitHub Actions secrets configured
- [ ] Automatic deployment working

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `cat .env`
3. Check container status: `docker-compose ps`
4. Review GitHub Actions logs in your repository
5. Ensure all ports are accessible in EC2 security group

---

**Congratulations! Your application is now deployed on EC2 with automated CI/CD!** 🎊
