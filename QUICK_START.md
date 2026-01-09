# Quick Start Guide - EC2 Deployment

Get your app deployed to AWS EC2 in under 30 minutes!

## 🚀 Quick Steps

### 1️⃣ Set Up EC2 Instance (10 minutes)

```bash
# 1. Launch Ubuntu 22.04 EC2 instance (t2.small recommended)
# 2. Configure security group: Allow ports 22, 80, 443, 5000
# 3. Download .pem key file
# 4. Connect to EC2:

chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>
```

### 2️⃣ Install Docker (5 minutes)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>
```

### 3️⃣ Clone and Configure App (5 minutes)

```bash
# Install Git
sudo apt update && sudo apt install git -y

# Clone your repository (use HTTPS for quick start)
cd ~
git clone https://github.com/your-username/promach-app.git
cd promach-app

# Create environment file
cp .env.example .env
nano .env  # Update MONGODB_URI, JWT_SECRET, etc.
```

### 4️⃣ Deploy Application (3 minutes)

```bash
# Run deployment
chmod +x deploy.sh
./deploy.sh

# Verify deployment
docker-compose ps
curl http://localhost:5000/health
```

✅ **Your app is now running!**
- Backend: `http://<YOUR-EC2-IP>:5000`
- Frontend: `http://<YOUR-EC2-IP>`

---

## 🔧 Configure GitHub Auto-Deploy (5 minutes)

### Add GitHub Secrets

Go to: `Your Repository → Settings → Secrets and variables → Actions`

Add these secrets:

| Secret Name           | Value                                    |
|-----------------------|------------------------------------------|
| EC2_SSH_PRIVATE_KEY   | Content of your .pem file                |
| EC2_HOST              | Your EC2 public IP                       |
| EC2_USER              | `ubuntu`                                 |
| MONGODB_URI           | Your MongoDB connection string           |
| JWT_SECRET            | Generate with: `openssl rand -base64 64` |

### Test Auto-Deployment

```bash
# Make a change, commit, and push
git add .
git commit -m "Test auto-deploy"
git push origin main

# GitHub Actions will automatically deploy!
# Check: Repository → Actions tab
```

---

## 🌐 Add Domain + SSL (Optional - 10 minutes)

### Point Domain to EC2

In your domain DNS settings:
```
Type: A
Name: @
Value: <YOUR-EC2-IP>
```

### Install Nginx + SSL

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@<YOUR-EC2-IP>

# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Configure Nginx
sudo cp ~/promach-app/nginx/production.conf /etc/nginx/sites-available/promach

# Edit to add your domain
sudo nano /etc/nginx/sites-available/promach
# Update: server_name yourdomain.com www.yourdomain.com;

# Enable and restart
sudo ln -s /etc/nginx/sites-available/promach /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

✅ **Your app is now live with HTTPS!**
- Visit: `https://yourdomain.com`

---

## 📊 Monitoring Commands

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# Restart containers
docker-compose restart

# Update app (manual)
cd ~/promach-app
git pull origin main
./deploy.sh
```

---

## 🆘 Troubleshooting

### Containers won't start?
```bash
docker-compose logs
```

### Can't connect to MongoDB?
```bash
# Check .env file
cat .env
# Ensure MongoDB Atlas allows your EC2 IP
```

### Port already in use?
```bash
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80
```

### GitHub Actions fails?
1. Check Actions logs in GitHub
2. Verify all secrets are correct
3. Ensure EC2 security group allows SSH

---

## 📚 Next Steps

- ✅ Set up monitoring (PM2, CloudWatch)
- ✅ Configure backups for database
- ✅ Set up staging environment
- ✅ Add custom error pages
- ✅ Configure CDN (CloudFront)

For detailed documentation, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

**🎉 Congratulations! You're deployed!**
