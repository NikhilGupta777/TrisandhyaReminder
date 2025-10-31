# AWS Amplify SSR (Full-Stack) Deployment Guide

## Overview

Your Trisandhya Sadhana Companion app can now be deployed **entirely through AWS Amplify** using their Server-Side Rendering (SSR) deployment specification. This unified deployment approach handles both frontend and backend without needing separate services like App Runner or ECS.

## ✨ What Changed

### Before
- ❌ Frontend → AWS Amplify Hosting
- ❌ Backend → AWS App Runner/ECS (separate deployment)

### After
- ✅ **Frontend + Backend → AWS Amplify Hosting** (single deployment)
- ✅ Express server runs as SSR compute function
- ✅ Static assets served from CDN
- ✅ Automatic scaling and load balancing

## 🏗️ How It Works

### 1. Deployment Manifest (`deploy-manifest.json`)

Defines routing rules for your application:

```json
{
  "routes": [
    {
      "path": "/api/*",
      "target": { "kind": "Compute", "src": "default" }  // Backend routes
    },
    {
      "path": "/*.*",
      "target": { "kind": "Static" }  // Static assets (JS, CSS, images)
    },
    {
      "path": "/*",
      "target": { "kind": "Compute", "src": "default" }  // SPA routing
    }
  ]
}
```

**Routing Logic:**
- `/api/*` → Express backend (sessions, database, auth)
- `/auth/*` → Express backend (Google OAuth)
- `/assets/*` → CDN (static files)
- `/*` → Express server (serves React app, handles client-side routing)

### 2. Post-Build Script (`bin/postbuild.sh`)

Organizes your build output into the structure Amplify expects:

```
.amplify-hosting/
├── compute/
│   └── default/
│       ├── server/           # Express server code
│       ├── shared/           # Shared types
│       ├── node_modules/     # Production dependencies only
│       └── package.json
├── static/                   # Frontend build (React app)
│   ├── index.html
│   ├── assets/
│   └── ...
└── deploy-manifest.json      # Routing configuration
```

### 3. Build Configuration (`amplify.yml`)

Updated to:
1. Build frontend and backend (TypeScript → JavaScript)
2. Run post-build script to package for SSR
3. Output `.amplify-hosting/` directory

## 📋 Deployment Steps

### Step 1: Push Code to Git

```bash
git add .
git commit -m "Enable Amplify SSR deployment"
git push origin main
```

### Step 2: Configure Amplify Console

1. **Go to AWS Amplify Console**
   - Navigate to your app

2. **Update Build Settings** (Auto-detected from `amplify.yml`)
   - Should show base directory: `.amplify-hosting`

3. **Configure Environment Variables**

Add these in **App Settings → Environment variables**:

```
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-super-secret-key-here
NODE_ENV=production
PORT=3000

# S3 Configuration
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-amplify-url.amplifyapp.com/api/auth/google/callback

# Amplify URL (set after first deployment)
FRONTEND_URL=https://main.xxxxx.amplifyapp.com
```

**Important:** After first deployment, update `GOOGLE_CALLBACK_URL` and `FRONTEND_URL` with your actual Amplify domain.

4. **Enable SSR Logging** (Optional but recommended)
   - Go to **App Settings → Advanced settings**
   - Enable "Server-side rendering app logs"
   - Create or select an IAM service role

### Step 3: Deploy

Click **Save and deploy** or push to your Git branch.

Amplify will:
1. ✅ Install dependencies
2. ✅ Build frontend (Vite)
3. ✅ Build backend (TypeScript compilation)
4. ✅ Run post-build packaging
5. ✅ Deploy to CDN + compute functions
6. ✅ Provide you with a URL

### Step 4: Update Google OAuth

1. **Go to Google Cloud Console** → APIs & Services → Credentials
2. **Update Authorized redirect URIs:**
   - Add: `https://main.xxxxx.amplifyapp.com/api/auth/google/callback`
   - Replace `xxxxx` with your actual Amplify app ID

3. **Update Authorized JavaScript origins:**
   - Add: `https://main.xxxxx.amplifyapp.com`

## 🔒 Environment Variables Reference

### Required for Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Secret key for sessions | `random-64-char-string` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Amplify uses 3000) | `3000` |

### S3 Storage

| Variable | Description |
|----------|-------------|
| `S3_REGION` | AWS region for S3 bucket |
| `S3_ACCESS_KEY_ID` | IAM user access key |
| `S3_SECRET_ACCESS_KEY` | IAM user secret key |
| `S3_BUCKET_NAME` | S3 bucket name |

### Email (SendGrid)

| Variable | Description |
|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key |
| `SENDGRID_FROM_EMAIL` | From email address |

### Authentication

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL (your Amplify domain) |
| `FRONTEND_URL` | Your Amplify app URL |

## 🚀 Benefits of SSR Deployment

### 1. **Simplified Architecture**
- Single deployment instead of frontend + backend
- One domain for entire application
- No CORS configuration needed

### 2. **Cost Optimization**
- Pay per request (no always-on backend server)
- CDN caching for static assets
- Auto-scaling included

### 3. **Better Performance**
- Static assets served from CloudFront CDN
- Dynamic routes handled by compute functions
- Automatic geographic distribution

### 4. **Easier Management**
- Single Git push deploys everything
- Environment variables in one place
- Unified logs and monitoring

## 📊 Deployment Comparison

| Aspect | SSR Deployment | Separate Deployments |
|--------|----------------|---------------------|
| **Setup** | Single Git push | Frontend + Backend |
| **Domains** | 1 domain | 2 domains needed |
| **CORS** | Not needed | Required |
| **Scaling** | Automatic | Manual configuration |
| **Cost** | Pay per request | Always-on server |
| **Deployment** | One command | Two separate deploys |

## 🔧 Troubleshooting

### Build Fails at Post-Build

**Symptom:** `./bin/postbuild.sh: Permission denied`

**Solution:**
```bash
chmod +x bin/postbuild.sh
git add bin/postbuild.sh
git commit -m "Make postbuild script executable"
git push
```

### 404 Errors on API Routes

**Symptom:** `/api/*` routes return 404

**Solution:**
- Verify `deploy-manifest.json` is in `.amplify-hosting/` directory
- Check Amplify build logs for post-build errors
- Ensure `baseDirectory: .amplify-hosting` in `amplify.yml`

### Session/Authentication Issues

**Symptom:** Login doesn't persist, sessions reset

**Solution:**
1. Verify `SESSION_SECRET` is set in Amplify environment variables
2. Check `DATABASE_URL` connection string is correct
3. Ensure cookies are configured for your domain:
   ```javascript
   // In server/index.ts
   cookie: {
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     domain: process.env.FRONTEND_URL // Your Amplify domain
   }
   ```

### Database Connection Errors

**Symptom:** `ECONNREFUSED` or `ETIMEDOUT` on database

**Solution:**
- Verify your Neon database allows connections from `0.0.0.0/0` (or specific AWS IPs)
- Check `DATABASE_URL` format matches: `postgresql://user:password@host:port/database`
- Enable SSL in connection string if required: `?sslmode=require`

### Build Timeout

**Symptom:** Build exceeds time limit

**Solution:**
- Reduce `node_modules` size:
  ```bash
  npm prune --production
  ```
- Use `.amplifyignore` to exclude unnecessary files:
  ```
  .git
  .env
  tests/
  *.md
  ```

### Environment Variables Not Loading

**Symptom:** Server crashes with "undefined is not a function" or config errors

**Solution:**
1. Verify all required variables are set in Amplify Console
2. Variables must NOT be prefixed with `VITE_` for backend
3. Check for typos in variable names
4. Redeploy after adding new variables

## 📚 Additional Resources

- **AWS Amplify SSR Documentation:** https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html
- **Deployment Manifest Spec:** https://docs.aws.amazon.com/amplify/latest/userguide/deploy-express-server.html
- **Troubleshooting SSR:** https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html

## ✅ Post-Deployment Checklist

- [ ] Application loads at Amplify URL
- [ ] Static assets (CSS, JS, images) load correctly
- [ ] API routes (`/api/*`) respond correctly
- [ ] Google OAuth login works
- [ ] Database operations function properly
- [ ] S3 file uploads work
- [ ] Sessions persist across page refreshes
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] CloudWatch logs enabled for debugging

## 🎯 Next Steps

1. **Test the full application** on your Amplify URL
2. **Configure custom domain** (optional) in Amplify Console → Domain management
3. **Monitor logs** in Amplify Console → Monitoring → Server logs
4. **Set up CI/CD** with automatic deployments on Git push

Your application is now deployed as a unified full-stack app on AWS Amplify! 🎉
