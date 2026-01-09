# GitHub Secrets Configuration Guide

This document explains how to set up GitHub Secrets for automated deployment via GitHub Actions.

## 📍 Where to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu bar)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button

## 🔑 Required Secrets

### 1. EC2_SSH_PRIVATE_KEY

**Description:** The private SSH key used to connect to your EC2 instance

**How to get it:**
```bash
# On your local machine, display your .pem file content
cat /path/to/your-key.pem
```

**Value to paste:** Copy the ENTIRE output, including the header and footer:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
... (all the key content) ...
... (multiple lines) ...
-----END RSA PRIVATE KEY-----
```

⚠️ **Important:**
- Include the BEGIN and END lines
- Don't add any extra spaces or newlines
- Keep this secret secure - never share it

---

### 2. EC2_HOST

**Description:** The public IP address or domain name of your EC2 instance

**How to get it:**
- Go to AWS EC2 Console
- Select your instance
- Copy the **Public IPv4 address** or **Elastic IP**

**Example values:**
```
54.123.45.67
```
OR (if you have a domain):
```
app.yourdomain.com
```

---

### 3. EC2_USER

**Description:** The username for SSH access to your EC2 instance

**Value depends on your EC2 AMI:**
- Ubuntu: `ubuntu`
- Amazon Linux: `ec2-user`
- Debian: `admin`
- CentOS: `centos`

**For Ubuntu (recommended):** 
```
ubuntu
```

---

### 4. MONGODB_URI

**Description:** Your MongoDB connection string

**Example values:**

**For MongoDB Atlas:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promach?retryWrites=true&w=majority
```

**For local MongoDB on EC2:**
```
mongodb://localhost:27017/promach
```

**For self-hosted MongoDB:**
```
mongodb://username:password@mongodb-host:27017/promach
```

⚠️ **Security Note:** 
- If using MongoDB Atlas, ensure your EC2 IP is whitelisted in Atlas Network Access
- Or use `0.0.0.0/0` to allow all IPs (less secure but simpler)

---

### 5. JWT_SECRET

**Description:** Secret key used to sign JWT tokens for authentication

**How to generate a strong secret:**

**Option 1: Using Node.js (on your local machine)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -base64 64
```

**Option 3: Using online generator**
- Visit: https://www.uuidgenerator.net/
- Click "Generate" multiple times and combine results

**Example value:**
```
9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08abc123def456
```

⚠️ **Important:**
- Use a unique, random string (minimum 32 characters)
- Never use example values in production
- Keep this secret safe

---

### 6. JWT_EXPIRATION (Optional)

**Description:** How long JWT tokens remain valid

**Default value:** `24h` (if not set)

**Example values:**
```
24h          # 24 hours
7d           # 7 days
30m          # 30 minutes
2h           # 2 hours
```

**Recommendation:** `24h` for production

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] `EC2_SSH_PRIVATE_KEY` - Entire .pem file content with headers
- [ ] `EC2_HOST` - Valid EC2 public IP or domain
- [ ] `EC2_USER` - Correct username (usually `ubuntu`)
- [ ] `MONGODB_URI` - Valid MongoDB connection string
- [ ] `JWT_SECRET` - Strong random string (32+ characters)
- [ ] `JWT_EXPIRATION` - Valid duration (e.g., `24h`)

## 🧪 Testing Secrets

After adding secrets, test the deployment:

1. **Make a small change** to your repository
2. **Commit and push** to the `main` branch:
   ```bash
   git add .
   git commit -m "Test automated deployment"
   git push origin main
   ```
3. **Go to GitHub** → **Actions** tab
4. **Monitor the workflow** execution

If the workflow fails:
- Click on the failed workflow run
- Review the logs for error messages
- Common issues:
  - SSH key format incorrect
  - EC2 host unreachable (check security group)
  - MongoDB connection failed (check URI and IP whitelist)

## 🔒 Security Best Practices

1. **Never commit secrets** to your repository
2. **Rotate secrets regularly** (every 90 days recommended)
3. **Use different secrets** for development and production
4. **Limit access** to repository settings to trusted team members
5. **Enable 2FA** on your GitHub account
6. **Monitor access logs** in GitHub repository insights

## 📝 Example: Adding a Secret

1. Navigate to: `Your Repository → Settings → Secrets and variables → Actions`
2. Click **New repository secret**
3. Enter:
   - **Name:** `MONGODB_URI`
   - **Secret:** `mongodb+srv://user:pass@cluster.mongodb.net/db`
4. Click **Add secret**

The secret is now encrypted and available to GitHub Actions workflows!

---

## 🆘 Troubleshooting

### Secret not found in workflow
- Check spelling of secret name (case-sensitive)
- Ensure secret is added to repository (not organization/environment)
- Refresh the Actions page

### SSH connection fails
- Verify `EC2_SSH_PRIVATE_KEY` includes header/footer
- Check `EC2_HOST` is reachable: `ping <EC2_HOST>`
- Ensure EC2 security group allows SSH (port 22)

### MongoDB connection fails
- Test connection string locally first
- Check MongoDB Atlas IP whitelist
- Verify username/password are URL-encoded

---

**Need more help?** Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide or GitHub Actions logs for detailed error messages.
