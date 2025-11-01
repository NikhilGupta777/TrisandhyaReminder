# Complete AWS Amplify Environment Variables Guide

Based on comprehensive codebase analysis, here are **ALL** environment variables you need to configure in AWS Amplify Console → **App Settings** → **Environment variables**.

---

## 🔴 CRITICAL - Required for Basic Functionality

### 1. Database Connection (REQUIRED)
```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```
**What it does:** Connects to your Neon PostgreSQL database  
**Where to get it:** Your Neon dashboard → Connection String  
**Impact if missing:** App will crash - all features depend on database  
**Example:** `postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/trisandhya?sslmode=require`

---

### 2. Session Security (CRITICAL)
```bash
SESSION_SECRET=your-super-secret-random-string-here
```
**What it does:** Secures user sessions and authentication cookies  
**How to generate:**
```bash
openssl rand -base64 32
```
**Impact if missing:** Sessions reset on every server restart, users get logged out  
**Security:** NEVER share this value, NEVER commit to git

---

### 3. Application URL (REQUIRED)
```bash
FRONTEND_URL=https://main.d2nshwfv6xcw10.amplifyapp.com
```
**What it does:** Used for OAuth callbacks, email links, CORS configuration  
**Replace with:** Your actual Amplify app URL  
**Impact if missing:** Google OAuth won't work, email verification links will break

---

## 🟡 HIGHLY RECOMMENDED - Most Features Need These

### 4. Email Service - SendGrid (For user registration & notifications)
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```
**What it does:** Sends registration emails, verification codes, notifications  
**Where to get it:** [SendGrid Dashboard](https://app.sendgrid.com/) → Settings → API Keys  
**Impact if missing:** 
- Users cannot register (email verification required)
- Password reset won't work
- Notification emails won't send
**Note:** Use a verified sender email in SendGrid

---

### 5. File Storage - AWS S3 (For media uploads)
```bash
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=trisandhya-media-uploads
```
**What it does:** Stores user-uploaded files (profile pictures, audio, images)  
**Where to get it:** AWS Console → IAM → Create User → Attach S3 policy  
**Impact if missing:** 
- Profile picture uploads will fail
- Media file uploads won't work
- Any file storage features disabled
**Bucket policy needed:** Public read, private write

---

### 6. Google OAuth (For "Sign in with Google")
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://main.d2nshwfv6xcw10.amplifyapp.com/api/auth/google/callback
```
**What it does:** Enables "Sign in with Google" button  
**Where to get it:** [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials  
**Impact if missing:** Google login button won't appear/work  
**Setup required:**
1. Create OAuth 2.0 Client ID in Google Console
2. Add authorized redirect URI: `https://your-amplify-domain/api/auth/google/callback`
3. Add authorized JavaScript origins: `https://your-amplify-domain`

---

## 🟢 OPTIONAL - Admin & Development Features

### 7. Admin User Auto-Creation (Optional)
```bash
ADMIN_EMAILS=admin@kalkiavatar.org,moderator@example.com
ADMIN_PASSWORD=SecureAdminPassword123!
```
**What it does:** Automatically creates admin accounts on first deployment  
**Impact if missing:** You'll need to manually promote users to admin in database  
**Security:** Use a strong password, can be changed after first login  
**Note:** Use comma-separated emails for multiple admins

---

### 8. Push Notifications - VAPID Key (Optional - Frontend)
```bash
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here
```
**What it does:** Enables browser push notifications for prayer reminders  
**Impact if missing:** Push notifications won't work, but alarms still function  
**Note:** This is a FRONTEND variable (VITE_ prefix required)

---

## ⚪ AUTO-CONFIGURED - Do NOT Set These Manually

AWS Amplify automatically provides these - **DO NOT ADD THEM:**

```bash
# ❌ DO NOT SET - Amplify provides automatically
NODE_ENV              # Auto-set by our code to "production"
PORT                  # Auto-set to 3000 by Amplify
AWS_EXECUTION_ENV     # Amplify runtime environment
AWS_LAMBDA_FUNCTION_NAME  # Lambda function identifier
AMPLIFY_BRANCH        # Branch name (e.g., "main")
```

---

## 🔧 Complete Configuration Checklist

### Minimum Viable Deployment (Basic features only):
- [x] `DATABASE_URL`
- [x] `SESSION_SECRET`
- [x] `FRONTEND_URL`

### Recommended Production Setup (All features working):
- [x] `DATABASE_URL`
- [x] `SESSION_SECRET`
- [x] `FRONTEND_URL`
- [x] `SENDGRID_API_KEY`
- [x] `SENDGRID_FROM_EMAIL`
- [x] `S3_REGION`
- [x] `S3_ACCESS_KEY_ID`
- [x] `S3_SECRET_ACCESS_KEY`
- [x] `S3_BUCKET_NAME`
- [x] `GOOGLE_CLIENT_ID`
- [x] `GOOGLE_CLIENT_SECRET`
- [x] `GOOGLE_CALLBACK_URL`

### Optional Enhancements:
- [ ] `ADMIN_EMAILS`
- [ ] `ADMIN_PASSWORD`
- [ ] `VITE_VAPID_PUBLIC_KEY`

---

## 📋 How to Add in AWS Amplify Console

1. Go to AWS Amplify Console
2. Select your app: **TrisandhyaReminder**
3. Navigate to **Hosting** → **Environment variables**
4. Click **Manage variables**
5. Add each variable:
   - **Variable name:** Exactly as shown above (case-sensitive!)
   - **Value:** Your actual secret/key
   - **Branch:** Select "All branches" or "main"
6. Click **Save**
7. Redeploy your app (or it will auto-deploy on next push)

---

## 🔒 Security Best Practices

1. **Never commit secrets to git**
   - ✅ Use `.env` files for local development (already in `.gitignore`)
   - ✅ Use Amplify Console for production
   - ❌ Never put secrets in code files

2. **Rotate secrets regularly**
   - Change `SESSION_SECRET` every 3-6 months
   - Rotate API keys if compromised
   - Use AWS Secrets Manager for extra security (optional)

3. **Use strong values**
   - `SESSION_SECRET`: Minimum 32 random characters
   - `ADMIN_PASSWORD`: Strong password with mixed case, numbers, symbols
   - Never use default/example values in production

---

## 🧪 Testing Your Configuration

After adding variables and deploying, check the **Amplify logs**:

### ✅ Success indicators:
```
🔧 Detected AWS environment - forcing NODE_ENV=production
✅ Routes and WebSocket registered
✅ Admin user created successfully: admin@kalkiavatar.org
✅ Static file serving configured
```

### ⚠️ Warning indicators (non-critical but features disabled):
```
⚠️  SendGrid not configured - email features will not work
⚠️  S3 credentials not configured - file upload features will not work
⚠️  ADMIN_PASSWORD not set - Admin users will not be created
```

### ❌ Error indicators (critical - fix immediately):
```
❌ DATABASE_URL not set - database features will be disabled
❌ CRITICAL SECURITY WARNING - SESSION_SECRET not set
Error: Cannot find module
```

---

## 🆘 Troubleshooting

### Issue: "500 Internal Server Error"
**Solution:** Check that `DATABASE_URL` is set correctly and database is accessible

### Issue: "Email verification not working"
**Solution:** Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`

### Issue: "File upload fails"
**Solution:** Configure all 4 S3 variables (`S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`)

### Issue: "Users logged out after deployment"
**Solution:** Set a permanent `SESSION_SECRET` (don't let it auto-generate)

### Issue: "Google login not appearing"
**Solution:** Set all 3 Google OAuth variables and configure callback URL in Google Console

---

## 📊 Feature Dependency Matrix

| Feature | Required Variables |
|---------|-------------------|
| User Registration | `DATABASE_URL`, `SESSION_SECRET`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` |
| Local Login | `DATABASE_URL`, `SESSION_SECRET` |
| Google Login | `DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| File Uploads | `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` |
| Admin Access | `ADMIN_EMAILS`, `ADMIN_PASSWORD` (or manual DB update) |
| Push Notifications | `VITE_VAPID_PUBLIC_KEY` |
| Prayer Reminders | `DATABASE_URL` (works without push notifications) |

---

## 🎯 Quick Start - Copy & Paste Template

Here's a template you can customize:

```bash
# === CRITICAL - REQUIRED ===
DATABASE_URL=postgresql://YOUR_NEON_CONNECTION_STRING
SESSION_SECRET=GENERATE_WITH_openssl_rand_-base64_32
FRONTEND_URL=https://main.d2nshwfv6xcw10.amplifyapp.com

# === HIGHLY RECOMMENDED ===
SENDGRID_API_KEY=YOUR_SENDGRID_KEY
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

S3_REGION=us-east-1
S3_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
S3_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
S3_BUCKET_NAME=your-bucket-name

GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://main.d2nshwfv6xcw10.amplifyapp.com/api/auth/google/callback

# === OPTIONAL ===
ADMIN_EMAILS=admin@kalkiavatar.org
ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
VITE_VAPID_PUBLIC_KEY=YOUR_VAPID_KEY
```

Replace ALL placeholder values with your actual credentials!

---

**Last Updated:** Based on codebase analysis - November 2, 2025  
**Total Variables Required:** 3 critical + 8 recommended + 3 optional = 14 total
