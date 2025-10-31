# AWS Amplify Deployment - Quick Start Summary

## ✅ What's Been Configured

Your Trisandhya Sadhana app is now ready for AWS Amplify deployment! Here's what has been set up:

### 1. Build Configuration
- **amplify.yml** - AWS Amplify build configuration (Node 20, optimized caching)
- **Dockerfile** - Production-ready container for backend deployment
- **.dockerignore** - Excludes unnecessary files from Docker builds
- **.env.example** - Template for all required environment variables

### 2. Documentation
- **AWS_AMPLIFY_DEPLOYMENT.md** - Complete step-by-step deployment guide

### 3. Build Output
- Frontend: `dist/public/` (static files for Amplify Hosting)
- Backend: `dist/index.js` (Express server bundle for App Runner/ECS)

## 🚀 Quick Deployment Steps

### Step 1: Deploy Frontend to AWS Amplify Hosting
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your Git repository (GitHub/GitLab)
4. AWS will auto-detect `amplify.yml` configuration
5. Add environment variable: `VITE_API_URL=https://your-backend-url`
6. Click "Save and deploy"

### Step 2: Deploy Backend to AWS App Runner
1. Build and push Docker image to ECR:
   ```bash
   aws ecr create-repository --repository-name trisandhya-backend
   aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
   docker build -t trisandhya-backend .
   docker tag trisandhya-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/trisandhya-backend:latest
   docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/trisandhya-backend:latest
   ```

2. Create App Runner service:
   - Go to AWS App Runner Console
   - Create service from ECR
   - Port: 5000
   - Add all environment variables from `.env.example`

3. Get the App Runner URL and update Amplify's `VITE_API_URL`

### Step 3: Configure External Services
- **Database**: Use existing Neon PostgreSQL or create RDS instance
- **S3**: Configure bucket CORS (see `S3_CORS_CONFIG.md`)
- **Google OAuth**: Add Amplify and backend URLs to Google Console
- **SendGrid**: Ensure API key is configured in backend env vars

## 📋 Environment Variables Needed

### Frontend (Amplify Console)
```
VITE_API_URL=https://your-backend-url.awsapprunner.com
```

### Backend (App Runner)
```
DATABASE_URL=postgresql://...
SESSION_SECRET=random-secure-string
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-backend-url/api/auth/google/callback
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://main.xxxxx.amplifyapp.com
```

## 🔍 Testing Checklist

After deployment:
- [ ] Frontend loads on Amplify URL
- [ ] API endpoints respond (test `/api/health`)
- [ ] Google OAuth login works
- [ ] Media uploads work (S3)
- [ ] Database connections work
- [ ] Email notifications work (SendGrid)
- [ ] PWA installable on mobile

## 📚 Full Documentation

See **AWS_AMPLIFY_DEPLOYMENT.md** for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Security best practices
- Cost estimates
- Alternative deployment options

## 💰 Estimated Monthly Cost

- AWS Amplify Hosting: $10-30
- AWS App Runner: $15-25
- S3 Storage: $1-5
- Database (Neon/RDS): $0-20
- **Total: ~$40-80/month**

## 🆘 Need Help?

1. Check `AWS_AMPLIFY_DEPLOYMENT.md` troubleshooting section
2. Review AWS service logs (Amplify Console, App Runner Console)
3. Verify all environment variables are set correctly
4. Test Docker container locally first: `docker build -t test . && docker run -p 5000:5000 test`

---

**Ready to deploy!** Follow the steps above or refer to the detailed guide in `AWS_AMPLIFY_DEPLOYMENT.md`.
