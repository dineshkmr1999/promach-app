# 🚀 Quick Reference Card - EC2 Deployment

## 📦 What You Have Now

**17 Production-Ready Files:**
- ✅ Docker configuration (backend + frontend)
- ✅ GitHub Actions CI/CD workflow
- ✅ Nginx reverse proxy with SSL
- ✅ Deployment automation scripts
- ✅ Comprehensive documentation (50+ KB)

---

## ⚡ 3-Step Quick Deploy

### Step 1: Push to GitHub (5 minutes)
```bash
# If not yet initialized
git init
git add .
git commit -m "Add EC2 deployment pipeline"
git remote add origin https://github.com/YOUR-USERNAME/promach-app.git
git push -u origin main
```

### Step 2: Launch EC2 & Install Docker (10 minutes)
```bash
# Launch Ubuntu 22.04 EC2 (t2.small)
# Open ports: 22, 80, 443, 5000

# SSH to EC2
ssh -i key.pem ubuntu@<EC2-IP>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout & login
exit
ssh -i key.pem ubuntu@<EC2-IP>
```

### Step 3: Clone & Deploy (5 minutes)
```bash
# Clone repo
git clone https://github.com/YOUR-USERNAME/promach-app.git
cd promach-app

# Configure environment
cp .env.example .env
nano .env  # Update MONGODB_URI, JWT_SECRET

# Deploy!
chmod +x deploy.sh
./deploy.sh
```

**✅ Done! Access:** `http://<EC2-IP>`

---

## 🔧 Essential Commands

### Daily Operations
```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart services
docker-compose restart

# Update app
git pull && ./deploy.sh
```

### Troubleshooting
```bash
# Container issues
docker-compose down && docker-compose up -d

# View error logs
docker-compose logs backend
docker-compose logs frontend

# Check health
curl http://localhost:5000/health
```

---

## 🔐 GitHub Secrets (For Auto-Deploy)

Add these 6 secrets in **GitHub → Settings → Secrets**:

1. **EC2_SSH_PRIVATE_KEY** - Your `.pem` file content
2. **EC2_HOST** - EC2 public IP
3. **EC2_USER** - `ubuntu`
4. **MONGODB_URI** - MongoDB connection string
5. **JWT_SECRET** - Generate: `openssl rand -base64 64`
6. **JWT_EXPIRATION** - `24h`

After adding secrets, every `git push` auto-deploys! 🎉

---

## 🌐 Add Domain + SSL (Optional)

```bash
# 1. Point domain A record to EC2 IP

# 2. SSH to EC2
ssh -i key.pem ubuntu@<EC2-IP>

# 3. Install Nginx & Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# 4. Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# 5. Configure Nginx
sudo cp ~/promach-app/nginx/production.conf /etc/nginx/sites-available/promach
sudo nano /etc/nginx/sites-available/promach  # Update domain
sudo ln -s /etc/nginx/sites-available/promach /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**✅ Done! Access:** `https://yourdomain.com`

---

## 📚 Documentation Map

| Document | Use Case | Time |
|----------|----------|------|
| **FILES_SUMMARY.md** | Overview of all files | 2 min |
| **QUICK_START.md** | Fast deployment | 30 min |
| **WORKFLOW.md** | Step-by-step guide | 45 min |
| **DEPLOYMENT.md** | Complete reference | 60+ min |
| **GITHUB_SECRETS.md** | CI/CD setup | 15 min |
| **README.md** | Project overview | 5 min |

---

## ✅ Success Checklist

- [ ] Files pushed to GitHub
- [ ] EC2 instance running
- [ ] Docker installed on EC2
- [ ] App deployed via `./deploy.sh`
- [ ] Backend health check passes
- [ ] Frontend accessible
- [ ] GitHub Secrets configured
- [ ] Auto-deploy working
- [ ] Domain configured (optional)
- [ ] SSL certificate active (optional)

---

## 🆘 Quick Help

| Issue | Solution |
|-------|----------|
| Containers won't start | `docker-compose logs` |
| MongoDB connection fails | Check `.env` MONGODB_URI |
| GitHub Actions fails | Verify secrets format |
| Port conflicts | `docker-compose down` |
| Nginx errors | `sudo nginx -t` |

**Full troubleshooting:** See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

---

## 🎯 Production Readiness

Your pipeline includes:
- ✅ Multi-stage Docker builds
- ✅ Health monitoring
- ✅ Auto-restart containers
- ✅ Non-root security
- ✅ SSL/HTTPS ready
- ✅ Zero-downtime deploys
- ✅ Automated CI/CD
- ✅ Comprehensive logging

**You're production-ready!** 🚀

---

**Keep this card handy for quick reference!**
