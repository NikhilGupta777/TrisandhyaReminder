# AWS Amplify Deployment - Issues Fixed

## Problem Identified

Your AWS Amplify deployment was failing with this error:
```
CustomerError: We failed to validate the deploy-manifest.json file found in your build output directory - 
An invalid 'deploy-manifest.json' file was provided. The entrypoint file 'index.js' cannot be found for 
the specified compute resource.
```

## Root Cause

The `bin/postbuild.sh` script was copying the server entrypoint file to the wrong location:
- **Wrong location**: `.amplify-hosting/compute/default/server/index.js`
- **Expected location**: `.amplify-hosting/compute/default/index.js`

AWS Amplify's deployment specification expects the entrypoint file to be directly in the `compute/default/` directory, not in a subdirectory.

## Fixes Applied

### 1. Fixed `bin/postbuild.sh` (Line 18)

**Before:**
```bash
mkdir -p ./.amplify-hosting/compute/default/server
cp ./dist/index.js ./.amplify-hosting/compute/default/server/
```

**After:**
```bash
cp ./dist/index.js ./.amplify-hosting/compute/default/index.js
```

### 2. Verified Configuration Files

All other configuration files are correct:

#### ✅ `deploy-manifest.json`
```json
{
  "version": 1,
  "computeResources": [
    {
      "name": "default",
      "runtime": "nodejs20.x",
      "entrypoint": "index.js"  ← Correct path
    }
  ],
  "routes": [...]
}
```

#### ✅ `amplify.yml`
- Uses Node.js 20
- Runs `npm run build` to build frontend and backend
- Executes `bin/postbuild.sh` to package for SSR deployment
- Sets artifacts base directory to `.amplify-hosting`

#### ✅ `package.json` Build Script
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```
- Builds React frontend to `dist/public/`
- Bundles Express server to `dist/index.js`

## Expected Directory Structure (After Build)

```
.amplify-hosting/
├── compute/
│   └── default/
│       ├── index.js              ← Server entrypoint (FIXED)
│       ├── shared/               ← Shared TypeScript schemas
│       ├── node_modules/         ← Production dependencies
│       ├── package.json
│       ├── package-lock.json
│       └── .env.production       ← Environment variable template
├── static/                       ← Frontend build output
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── ...
└── deploy-manifest.json          ← Routing configuration
```

## Next Steps for Deployment

### 1. Commit and Push Changes

```bash
git add .
git commit -m "Fix Amplify SSR deployment - correct entrypoint path"
git push origin main
```

### 2. AWS Amplify Will Automatically

1. Detect the push and start a new build
2. Run the build commands from `amplify.yml`
3. Execute the fixed `postbuild.sh` script
4. Validate the corrected directory structure
5. Deploy your full-stack app

### 3. Configure Environment Variables (If Not Already Done)

In AWS Amplify Console → App Settings → Environment variables, add:

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
GOOGLE_CALLBACK_URL=https://main.xxxxx.amplifyapp.com/api/auth/google/callback

# Frontend URL (update with your actual Amplify domain)
FRONTEND_URL=https://main.xxxxx.amplifyapp.com
```

**Important**: After your first successful deployment, update `GOOGLE_CALLBACK_URL` and `FRONTEND_URL` with your actual Amplify domain.

## How the Deployment Works

### Routing Logic (from `deploy-manifest.json`)

1. **API Routes** (`/api/*`) → Express compute function
2. **Auth Routes** (`/auth/*`) → Express compute function  
3. **Static Assets** (`/*.*` - CSS, JS, images) → CDN with caching
4. **SPA Routes** (`/*`) → Express serves React app

### Compute Resource

- **Runtime**: Node.js 20.x
- **Entrypoint**: `index.js` (Express server)
- **Scaling**: Automatic (AWS Lambda under the hood)
- **Sessions**: Uses MemoryStore (suitable for low-to-medium traffic)

## Troubleshooting

If the deployment still fails:

1. **Check Build Logs** in Amplify Console
   - Look for errors during `npm run build`
   - Verify `postbuild.sh` executes successfully
   - Confirm files are copied to correct locations

2. **Verify File Structure** (in build logs)
   - After build completes, logs should show:
     ```
     ✅ Created .amplify-hosting directory structure
     📋 Copying server files...
     ✅ Production dependencies installed
     ✅ Frontend files copied
     ✅ Deployment manifest copied
     ```

3. **Common Issues**
   - Missing environment variables → Add in Amplify Console
   - Build timeout → Increase timeout in build settings
   - Dependency issues → Clear cache and rebuild

## Summary

The deployment failure was caused by a simple path mismatch. The fix ensures that:
- ✅ Server entrypoint is in the correct location
- ✅ Amplify can find and execute your Express server
- ✅ Frontend and backend are deployed together as a unified full-stack app

Your next deployment should succeed! 🚀
