# Promach App - Full Stack CMS & Analytics Platform

A modern full-stack application built with React (Vite) frontend and Node.js/Express backend, featuring content management and analytics capabilities.

## 🚀 Quick Links

- **[Quick Start Guide](QUICK_START.md)** - Get deployed in 30 minutes
- **[Full Deployment Guide](DEPLOYMENT.md)** - Comprehensive EC2 deployment instructions
- **[GitHub Secrets Setup](GITHUB_SECRETS.md)** - Configure automated deployments

## 📋 Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** Radix UI + Tailwind CSS
- **Routing:** React Router v6
- **State Management:** TanStack Query

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **File Upload:** Multer

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Web Server:** Nginx
- **SSL:** Let's Encrypt (Certbot)
- **Hosting:** AWS EC2

## 🏗️ Project Structure

```
promach-app/
├── back-end/               # Node.js/Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB models
│   │   ├── controllers/   # Route controllers
│   │   └── index.js       # App entry point
│   ├── Dockerfile         # Backend Docker config
│   └── package.json
│
├── front-end/             # React/Vite application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # App entry point
│   ├── Dockerfile         # Frontend Docker config
│   ├── nginx.conf         # Nginx config for frontend container
│   └── package.json
│
├── nginx/                 # Production Nginx config
│   └── production.conf    # SSL + reverse proxy config
│
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions CI/CD
│
├── docker-compose.yml     # Multi-container orchestration
├── deploy.sh              # Manual deployment script
├── .env.example           # Environment variables template
│
└── Documentation:
    ├── DEPLOYMENT.md      # Full deployment guide
    ├── QUICK_START.md     # Quick deployment guide
    └── GITHUB_SECRETS.md  # GitHub secrets configuration
```

## 🚀 Getting Started

### Local Development

#### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Git

#### Backend Setup

```bash
cd back-end
npm install
cp ../.env.example .env  # Update with your values
npm run dev
```

Backend will run on `http://localhost:5000`

#### Frontend Setup

```bash
cd front-end
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

### Docker Development

```bash
# Create .env file
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Production Deployment

### Option 1: Quick Deploy (EC2)

Follow the [Quick Start Guide](QUICK_START.md) for step-by-step instructions.

**Summary:**
1. Launch Ubuntu EC2 instance
2. Install Docker + Docker Compose
3. Clone repository and configure `.env`
4. Run `./deploy.sh`
5. Configure domain + SSL (optional)

### Option 2: Automated Deploy (GitHub Actions)

1. Set up EC2 instance
2. Configure [GitHub Secrets](GITHUB_SECRETS.md)
3. Push to `main` branch - auto-deploys! 🎉

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete instructions.

## 📝 Environment Variables

Create a `.env` file in the root directory:

```bash
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/promach
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=24h

# Frontend
VITE_API_URL=https://yourdomain.com/api
```

See [.env.example](.env.example) for all available options.

## 🔧 Available Scripts

### Backend
```bash
npm run dev      # Start with nodemon (development)
npm start        # Start production server
npm run seed     # Seed database with initial data
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
docker-compose ps                 # Check container status
docker-compose restart            # Restart services
```

### Deployment
```bash
./deploy.sh                       # Manual deployment on EC2
git push origin main              # Trigger auto-deployment (if configured)
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ HTTPS/SSL encryption (Let's Encrypt)
- ✅ CORS configuration
- ✅ Security headers (Nginx)
- ✅ Environment-based secrets
- ✅ Non-root Docker containers
- ✅ Input validation
- ✅ MongoDB connection security

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### CMS
- `GET /api/cms/*` - Content management endpoints

### Portfolio
- `GET /api/portfolio/*` - Portfolio management

### Analytics
- `GET /api/analytics/*` - Analytics data

### Health Check
- `GET /health` - Application health status

## 🧪 Testing

```bash
# Backend tests
cd back-end
npm test

# Frontend tests
cd front-end
npm test
```

## 📈 Monitoring

### Check Application Health
```bash
curl http://your-domain.com/health
```

### View Container Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Monitor Resources
```bash
docker stats
```

## 🐛 Troubleshooting

See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) for common issues and solutions.

**Common Issues:**
- **Containers won't start:** Check logs with `docker-compose logs`
- **Database connection failed:** Verify `MONGODB_URI` in `.env`
- **Port conflicts:** Ensure ports 80, 443, 5000 are available
- **GitHub Actions fails:** Check secrets configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For deployment help:
- Read [DEPLOYMENT.md](DEPLOYMENT.md)
- Check [QUICK_START.md](QUICK_START.md)
- Review GitHub Actions logs
- Check Docker logs: `docker-compose logs -f`

## 🎯 Roadmap

- [ ] Add unit tests
- [ ] Set up monitoring (CloudWatch)
- [ ] Implement database backups
- [ ] Add staging environment
- [ ] Set up CDN integration
- [ ] Add API documentation (Swagger)

---

**Built with ❤️ for modern web development**
