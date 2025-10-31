# AWS Amplify Deployment Guide for Trisandhya Sadhana App

This guide provides step-by-step instructions for deploying the Trisandhya Sadhana application to AWS Amplify.

## Architecture Overview

The application consists of two main components:
1. **Frontend**: React + Vite PWA → Deploy to **AWS Amplify Hosting**
2. **Backend**: Express.js API → Deploy to **AWS App Runner** or **AWS ECS Fargate**

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- GitHub/GitLab repository with your code
- Domain name (optional, for custom domain)

## Part 1: Deploy Frontend to AWS Amplify Hosting

### Step 1: Connect Your Repository

1. Log in to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Authorize AWS Amplify to access your repository
5. Select the repository and branch (usually `main` or `master`)

### Step 2: Configure Build Settings

AWS Amplify will automatically detect the `amplify.yml` file in your repository. The configuration is already set up for:
- Installing dependencies with `npm ci --legacy-peer-deps`
- Building the frontend with `npm run build`
- Serving static files from `dist/public`

**Note**: If Amplify doesn't detect the file, manually add this configuration in the Amplify Console build settings.

### Step 3: Configure Environment Variables

In the Amplify Console, go to **Environment variables** and add:

#### Frontend Variables (prefix with VITE_)
```
VITE_API_URL=https://your-backend-api-url.com
```

#### Important Notes:
- Frontend environment variables MUST be prefixed with `VITE_` to be accessible
- The API URL should point to your backend deployment (App Runner or ECS)
- Don't add sensitive backend secrets here (they won't be used in the frontend build)

### Step 4: Deploy

1. Click **"Save and deploy"**
2. Wait for the build to complete (usually 5-10 minutes)
3. Once deployed, you'll get an Amplify URL: `https://main.xxxxxx.amplifyapp.com`

### Step 5: Configure Custom Domain (Optional)

1. In Amplify Console, go to **Domain management**
2. Click **"Add domain"**
3. Enter your domain name
4. Follow AWS instructions to update DNS records
5. Wait for SSL certificate validation (can take 15-30 minutes)

## Part 2: Deploy Backend to AWS

You have **two recommended options** for deploying the Express.js backend:

### Option A: AWS App Runner (Easiest - Recommended)

AWS App Runner is perfect for containerized applications with automatic scaling.

#### Steps:

1. **Build and Push Docker Image to ECR**:
```bash
# Create ECR repository
aws ecr create-repository --repository-name trisandhya-backend --region us-east-1

# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t trisandhya-backend .

# Tag image
docker tag trisandhya-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trisandhya-backend:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trisandhya-backend:latest
```

2. **Create App Runner Service**:
```bash
# Go to AWS App Runner Console
# Click "Create service"
# Choose "Container registry" → "Amazon ECR"
# Select your image
# Configure:
  - Port: 5000
  - Environment variables (see below)
  - CPU: 1 vCPU
  - Memory: 2 GB
  - Auto scaling: 1-5 instances
```

3. **Configure Environment Variables in App Runner**:
```
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-super-secret-key
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=your-bucket
SENDGRID_API_KEY=your-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=https://your-backend-url/api/auth/google/callback
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-amplify-domain.amplifyapp.com
```

4. **Deploy**: Click "Create & deploy" and wait for deployment

5. **Get Backend URL**: App Runner will provide a URL like `https://xxxxx.us-east-1.awsapprunner.com`

6. **Update Frontend**: Go back to Amplify Console and update `VITE_API_URL` to your App Runner URL, then redeploy

### Option B: AWS ECS Fargate (More Control)

For more advanced configuration and VPC control:

1. **Create ECS Cluster**
2. **Create Task Definition** with the Docker image from ECR
3. **Create Application Load Balancer**
4. **Create ECS Service** with the task definition
5. **Configure environment variables** in the task definition

Detailed ECS setup is beyond this guide - refer to AWS ECS documentation.

## Part 3: Database Setup

### Option 1: Use Existing Neon PostgreSQL (Simplest)

If you're already using Neon PostgreSQL:
1. Keep using it - it works great with AWS deployments
2. Add the `DATABASE_URL` to your backend environment variables
3. Ensure your Neon database allows connections from AWS IPs

### Option 2: Migrate to AWS RDS PostgreSQL

If you want to move to AWS RDS:

1. **Create RDS PostgreSQL Instance**:
   - Go to RDS Console
   - Create PostgreSQL database
   - Choose appropriate instance size (db.t3.micro for development)
   - Configure VPC and security groups
   - Note the endpoint URL

2. **Migrate Data** (if needed):
```bash
# Export from Neon
pg_dump $NEON_DATABASE_URL > backup.sql

# Import to RDS
psql $RDS_DATABASE_URL < backup.sql
```

3. **Update DATABASE_URL** in your backend environment variables

## Part 4: AWS S3 Setup

Your app uses S3 for media storage. Ensure:

1. **S3 Bucket exists** with the name in `S3_BUCKET_NAME`
2. **CORS is configured** (see `S3_CORS_CONFIG.md` in your project)
3. **IAM User has permissions**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```

## Part 5: Configure Google OAuth

Update your Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add Authorized JavaScript origins:
   - `https://your-amplify-domain.amplifyapp.com`
   - `https://your-custom-domain.com` (if using custom domain)
5. Add Authorized redirect URIs:
   - `https://your-backend-url/api/auth/google/callback`

## Part 6: Testing Your Deployment

### Test Frontend:
1. Visit your Amplify URL
2. Check browser console for errors
3. Verify assets load correctly
4. Test PWA installation

### Test Backend:
1. Visit `https://your-backend-url/api/health` (create a health endpoint)
2. Test API endpoints with Postman or curl
3. Verify database connections
4. Test authentication flow

### Test Integration:
1. Try signing in with Google OAuth
2. Upload media content (tests S3)
3. Create and track spiritual progress
4. Test alarm settings

## Part 7: Continuous Deployment

Once set up, deployments are automatic:

**Frontend (Amplify):**
- Push to your main branch
- Amplify automatically builds and deploys
- View build logs in Amplify Console

**Backend (App Runner):**
- Build and push new Docker image to ECR
- App Runner can be configured for automatic deployment
- Or manually trigger deployment in App Runner Console

## Environment Variables Checklist

### Frontend (.env for Amplify)
- [ ] `VITE_API_URL` - Backend API URL

### Backend (.env for App Runner/ECS)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Random secure string
- [ ] `S3_REGION` - S3 region (e.g., us-east-1)
- [ ] `S3_ACCESS_KEY_ID` - S3 access key
- [ ] `S3_SECRET_ACCESS_KEY` - S3 secret key
- [ ] `S3_BUCKET_NAME` - S3 bucket name
- [ ] `SENDGRID_API_KEY` - SendGrid API key
- [ ] `SENDGRID_FROM_EMAIL` - From email address
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `GOOGLE_CALLBACK_URL` - OAuth callback URL
- [ ] `NODE_ENV` - Set to "production"
- [ ] `PORT` - Set to 5000
- [ ] `FRONTEND_URL` - Your Amplify frontend URL

## Cost Estimates (Monthly)

### AWS Amplify Hosting
- Free tier: First 1000 build minutes, 15 GB served
- Paid: ~$0.01 per build minute, $0.15 per GB served
- Estimate: $10-30/month for moderate traffic

### AWS App Runner
- 1 vCPU, 2 GB RAM, always running: ~$15-25/month
- Auto-scaling adds cost per additional instance

### RDS PostgreSQL (if not using Neon)
- db.t3.micro: ~$15-20/month
- Or continue using Neon (free tier available)

### S3 Storage
- First 50 TB: $0.023 per GB
- Estimate: $1-5/month for media storage

**Total Estimate: $40-80/month** (can be lower with free tiers)

## Troubleshooting

### Build Fails in Amplify
- Check build logs in Amplify Console
- Verify `amplify.yml` is in repository root
- Ensure all dependencies are in `package.json`
- Try `npm ci --legacy-peer-deps` locally to replicate

### Backend Won't Start
- Check App Runner logs
- Verify all environment variables are set
- Test Docker container locally first
- Ensure PORT is set to 5000

### Database Connection Fails
- Verify DATABASE_URL format
- Check security groups allow connections
- Test connection from local machine first
- For RDS: Ensure publicly accessible (or configure VPC)

### OAuth Fails
- Verify callback URL in Google Console matches exactly
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure FRONTEND_URL is correct

### CORS Errors
- Verify S3 CORS configuration
- Check backend CORS middleware settings
- Ensure FRONTEND_URL is whitelisted

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** (automatic with Amplify and App Runner)
4. **Rotate credentials** regularly
5. **Use least-privilege IAM policies**
6. **Enable RDS encryption** at rest
7. **Use VPC** for production databases
8. **Set up CloudWatch alarms** for monitoring
9. **Enable AWS WAF** for Amplify (optional)
10. **Regular security audits**

## Support and Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Neon PostgreSQL Docs](https://neon.tech/docs/)

## Next Steps After Deployment

1. **Set up monitoring**: CloudWatch, error tracking
2. **Configure backups**: RDS automated backups, S3 versioning
3. **Performance optimization**: CDN (CloudFront), caching
4. **Mobile app deployment**: Separate guide for React Native app
5. **CI/CD improvements**: GitHub Actions, automated testing

---

**Questions or Issues?**  
Check the troubleshooting section above or review AWS documentation for specific services.
