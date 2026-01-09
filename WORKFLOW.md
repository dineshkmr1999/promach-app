## 🚀 Deployment Workflow Guide

This workflow guides you through deploying your application to AWS EC2 with automated CI/CD.

---

## 📝 Step 1: Commit New Files to GitHub

All deployment files have been created. Commit them to your repository:

```bash
# Check what's been created
git status

# Add all new deployment files
git add .
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

# Commit
git commit -m "Add EC2 deployment pipeline with Docker and GitHub Actions"

# Push to GitHub
git push origin main
```

---

## 🖥️ Step 2: Launch EC2 Instance

### Via AWS Console:

1. **Go to EC2 Dashboard** → Click "Launch Instance"

2. **Configure:**
   - **Name:** `promach-app-server`
   - **AMI:** Ubuntu Server 22.04 LTS
   - **Instance Type:** `t2.small` (recommended) or `t2.micro` (testing)
   - **Key Pair:** Create new or select existing
   - **Storage:** 20-30 GB gp3 SSD

3. **Security Group:** Create new with these rules:
   ```
   SSH  (22)   - Your IP
   HTTP (80)   - 0.0.0.0/0
   HTTPS (443) - 0.0.0.0/0
   Custom (5000) - 0.0.0.0/0 (for backend API)
   ```

4. **Launch** and download the `.pem` key file

5. **Elastic IP (Recommended):**
   - Go to EC2 → Elastic IPs
   - Allocate new Elastic IP
   - Associate with your instance

---

## 🐳 Step 3: Install Docker on EC2

```bash
# 1. Connect to EC2
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Logout and login again
exit
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>

# 6. Verify installations
docker --version
docker-compose --version
```

---

## 📦 Step 4: Deploy Application

```bash
# 1. Install Git
sudo apt install git -y

# 2. Clone repository (HTTPS method)
cd ~
git clone https://github.com/YOUR-USERNAME/promach-app.git
cd promach-app

# OR use SSH (if you have SSH keys set up):
# ssh-keygen -t ed25519 -C "your-email@example.com"
# cat ~/.ssh/id_ed25519.pub  # Add to GitHub SSH keys
# git clone git@github.com:YOUR-USERNAME/promach-app.git

# 3. Create environment file
cp .env.example .env

# 4. Edit environment variables
nano .env
```

### Configure .env file:

```bash
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/promach?retryWrites=true&w=majority
JWT_SECRET=<GENERATE_STRONG_SECRET>
JWT_EXPIRATION=24h

# Frontend
VITE_API_URL=http://<YOUR-EC2-IP>:5000
```

**Generate JWT Secret:**
```bash
openssl rand -base64 64
```

**Save and exit:** Ctrl+X, then Y, then Enter

```bash
# 5. Make deploy script executable
chmod +x deploy.sh

# 6. Run deployment
./deploy.sh
```

**Expected Output:**
```
🚀 Starting Promach App Deployment
======================================
📥 Pulling latest changes from GitHub...
🛑 Stopping existing containers...
🧹 Cleaning up old Docker images...
🏗️  Building and starting containers...
⏳ Waiting for services to start...
🔍 Checking backend health...
✅ Backend is healthy!
🔍 Checking frontend...
✅ Frontend is healthy!
✅ Deployment completed successfully!
```

### Verify Deployment:

```bash
# Check containers
docker-compose ps

# Test backend
curl http://localhost:5000/health

# Test frontend
curl http://localhost:80

# View logs
docker-compose logs -f
```

**Access Application:**
- Frontend: `http://<YOUR-EC2-IP>`
- Backend API: `http://<YOUR-EC2-IP>:5000`

---

## 🔐 Step 5: Configure GitHub Secrets (For Auto-Deployment)

### Go to GitHub Repository Settings:
1. Navigate to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Add These 6 Secrets:

#### 1. EC2_SSH_PRIVATE_KEY
```bash
# On your local machine, get the .pem key content
cat your-key.pem
# Copy ENTIRE output including:
# -----BEGIN RSA PRIVATE KEY-----
# ...
# -----END RSA PRIVATE KEY-----
```
Paste this as the secret value.

#### 2. EC2_HOST
```
<YOUR-EC2-IP>  # e.g., 54.123.45.67
```

#### 3. EC2_USER
```
ubuntu
```

#### 4. MONGODB_URI
```
mongodb+srv://user:password@cluster.mongodb.net/promach?retryWrites=true&w=majority
```

#### 5. JWT_SECRET
```bash
# Generate on your local machine:
openssl rand -base64 64
# Copy the output
```

#### 6. JWT_EXPIRATION (Optional)
```
24h
```

### Test Auto-Deployment:

```bash
# Make a small change
echo "# Test auto-deploy" >> README.md

# Commit and push
git add README.md
git commit -m "Test automated deployment"
git push origin main
```

**Monitor deployment:**
- Go to GitHub → **Actions** tab
- Watch the workflow execution
- Should deploy automatically in ~2-3 minutes

---

## 🌐 Step 6: Add Domain + SSL (Production)

### A. Point Domain to EC2

In your domain registrar (GoDaddy, Namecheap, etc.):

**Add DNS A Record:**
```
Type: A
Name: @ (for root) or www
Value: <YOUR-EC2-ELASTIC-IP>
TTL: 3600
```

**Wait 5-60 minutes** for DNS propagation.

**Verify:**
```bash
ping yourdomain.com
```

### B. Install Nginx on EC2

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>

# Install Nginx
sudo apt install nginx -y

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### C. Get SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose whether to share email
```

### D. Configure Nginx

```bash
# Copy production config
sudo cp ~/promach-app/nginx/production.conf /etc/nginx/sites-available/promach

# Edit to add your domain
sudo nano /etc/nginx/sites-available/promach

# Update these lines:
server_name yourdomain.com www.yourdomain.com;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

**Save:** Ctrl+X, then Y, then Enter

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Enable your config
sudo ln -s /etc/nginx/sites-available/promach /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx
```

### E. Update Frontend Environment

```bash
# On EC2, update .env
cd ~/promach-app
nano .env

# Change VITE_API_URL to:
VITE_API_URL=https://yourdomain.com/api

# Rebuild frontend
docker-compose up -d --build frontend
```

**🎉 Your app is now live with HTTPS!**

Visit: `https://yourdomain.com`

---

## 📊 Daily Operations

### View Logs
```bash
cd ~/promach-app
docker-compose logs -f  # All logs
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend  # Frontend only
```

### Restart Services
```bash
docker-compose restart
docker-compose restart backend  # Backend only
```

### Manual Update
```bash
cd ~/promach-app
git pull origin main
./deploy.sh
```

### Check Health
```bash
docker-compose ps
curl http://localhost:5000/health
```

### Clean Up
```bash
# Remove old images
docker system prune -a

# Check disk usage
df -h
```

---

## ✅ Deployment Checklist

Use this checklist to track your deployment progress:

### Pre-Deployment
- [ ] All files committed to GitHub
- [ ] Repository pushed to remote
- [ ] AWS account ready
- [ ] Domain purchased (for production)
- [ ] MongoDB database ready (Atlas or self-hosted)

### EC2 Setup
- [ ] EC2 instance launched (Ubuntu 22.04)
- [ ] Security group configured (ports 22, 80, 443, 5000)
- [ ] Elastic IP allocated and associated
- [ ] SSH key downloaded and secured
- [ ] Can connect via SSH

### Server Configuration
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Git installed
- [ ] Repository cloned to EC2
- [ ] .env file created and configured
- [ ] deploy.sh is executable

### Initial Deployment
- [ ] ./deploy.sh ran successfully
- [ ] Containers are running (docker-compose ps)
- [ ] Backend health check passes
- [ ] Frontend loads in browser
- [ ] Can access app via EC2 IP

### GitHub Actions Setup
- [ ] All 6 GitHub Secrets configured
- [ ] Test push triggers workflow
- [ ] Workflow completes successfully
- [ ] Auto-deployment working

### Domain + SSL (Production)
- [ ] Domain DNS configured (A record)
- [ ] DNS propagation complete
- [ ] Nginx installed on EC2
- [ ] SSL certificate obtained
- [ ] Nginx configured with domain
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS

### Final Verification
- [ ] All API endpoints working
- [ ] Database connection successful
- [ ] File uploads working
- [ ] Frontend routing working
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] SSL certificate valid
- [ ] Monitoring set up
- [ ] Backups configured

---

## 🆘 Quick Troubleshooting

### Containers won't start
```bash
docker-compose logs  # Check for errors
docker-compose down && docker-compose up -d  # Restart
```

### Can't connect to MongoDB
```bash
cat .env  # Verify MONGODB_URI
# Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)
```

### GitHub Actions fails
- Check GitHub Actions logs
- Verify all 6 secrets are set
- Check SSH key includes header/footer
- Ensure EC2 security group allows SSH

### Port already in use
```bash
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80
docker-compose down  # Stop containers
```

### SSL certificate issues
```bash
sudo certbot certificates  # Check status
sudo certbot renew --force-renewal  # Renew
sudo systemctl reload nginx
```

---

## 📚 Reference Documentation

- **[QUICK_START.md](QUICK_START.md)** - 30-minute quick deploy
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[GITHUB_SECRETS.md](GITHUB_SECRETS.md)** - Secrets configuration
- **[README.md](README.md)** - Project overview

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Containers running and healthy  
✅ Backend API responding (http://domain.com/api)  
✅ Frontend loading (http://domain.com)  
✅ Database connected  
✅ HTTPS working with valid certificate  
✅ Auto-deployment working (push to main)  
✅ Logs accessible and clear  
✅ No errors in health checks  

**Congratulations! 🎉 You're now deployed with a production-ready CI/CD pipeline!**
