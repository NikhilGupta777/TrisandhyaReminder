# AWS Amplify Deployment Guide

## Environment Variables Configuration

Your application requires the following environment variables to be set in AWS Amplify Console. Go to **App Settings → Environment variables** and add these:

### Required Environment Variables

#### 1. Session Management (CRITICAL)
```
SESSION_SECRET=<generate-with-command-below>
```
Generate a secure secret:
```bash
openssl rand -base64 32
```
⚠️ **Critical**: Without this, sessions will use an insecure fallback.

#### 2. Database Configuration (Required for all features)
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```
Use your Neon or PostgreSQL database connection string with SSL enabled.

#### 3. Application Configuration
```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://main.d2nshwfv6xcw10.amplifyapp.com
```
Replace `FRONTEND_URL` with your actual Amplify deployment URL.

### Optional but Recommended

#### 4. Email Service (SendGrid) - For user registration
```
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```
Without these, user registration and email verification will fail.

#### 5. File Storage (AWS S3) - For media uploads
```
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<your-s3-access-key>
S3_SECRET_ACCESS_KEY=<your-s3-secret-key>
S3_BUCKET_NAME=<your-bucket-name>
```
Without these, file upload features will not work.

#### 6. Google OAuth (Optional) - For Google sign-in
```
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=https://main.d2nshwfv6xcw10.amplifyapp.com/api/auth/google/callback
```
Replace with your actual domain. Without these, Google login will be disabled.

#### 7. Admin User Setup (Optional) - Creates admin accounts on startup
```
ADMIN_EMAILS=admin@kalkiavatar.org,another@example.com
ADMIN_PASSWORD=<secure-admin-password>
```
Use comma-separated emails for multiple admins.

---

## Current Deployment Status

Based on your deployment logs, the build completed successfully but the server is returning a 500 error. This is most likely because:

1. **SESSION_SECRET is missing** - The server now has a fallback, but you should set it properly
2. **DATABASE_URL might be missing or incorrect** - Check your database connection string
3. **Other environment variables are missing** - Set at minimum: SESSION_SECRET, DATABASE_URL, PORT, NODE_ENV, FRONTEND_URL

---

## Quick Setup Checklist

- [ ] Set `SESSION_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set `DATABASE_URL` with your PostgreSQL/Neon connection string
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=3000`
- [ ] Set `FRONTEND_URL=https://main.d2nshwfv6xcw10.amplifyapp.com`
- [ ] Optional: Set SendGrid credentials for email
- [ ] Optional: Set S3 credentials for file uploads
- [ ] Optional: Set Google OAuth credentials
- [ ] Optional: Set admin user credentials

---

## After Setting Environment Variables

1. Go to **AWS Amplify Console**
2. Navigate to your app
3. Click **App Settings → Environment variables**
4. Add all required variables
5. Go to **Deployments** → Click **Redeploy this version**

The application should start successfully after redeployment with proper environment variables.

---

## Troubleshooting

### Server returns 500 error
- Check that all required environment variables are set
- View logs in Amplify Console → Monitoring → Logs
- Most common cause: Missing SESSION_SECRET or DATABASE_URL

### Database connection errors
- Verify DATABASE_URL is correct
- Ensure your database allows connections from Amplify (check firewall/security groups)
- For Neon: Make sure SSL is enabled (`?sslmode=require`)

### Email not working
- Verify SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are set correctly
- Check SendGrid dashboard for any issues

### File uploads not working
- Verify all S3 environment variables are set
- Check S3 bucket permissions
- Ensure CORS is configured on your S3 bucket

---

## Getting Help

If you continue to experience issues:
1. Check Amplify deployment logs
2. Check Amplify function logs in CloudWatch
3. Verify all environment variables are properly set
4. Ensure your database is accessible and SSL is configured
