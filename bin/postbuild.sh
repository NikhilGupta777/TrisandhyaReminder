#!/bin/bash
set -e

echo "📦 Starting post-build process..."

# Clean up previous build
rm -rf ./.amplify-hosting
mkdir -p ./.amplify-hosting/compute/default
mkdir -p ./.amplify-hosting/static

echo "✅ Created .amplify-hosting directory structure"

# Copy server code and dependencies
echo "📋 Copying server files..."
cp ./dist/index.js ./.amplify-hosting/compute/default/index.js
cp -r ./shared ./.amplify-hosting/compute/default/ || true

# Use minimal server-only package.json
echo "📦 Setting up minimal server dependencies..."
cp ./server-package.json ./.amplify-hosting/compute/default/package.json

# Install production dependencies only (no lockfile for minimal size)
echo "📦 Installing production dependencies..."
cd ./.amplify-hosting/compute/default
npm install --omit=dev --no-package-lock --ignore-scripts --no-audit --no-fund

# Remove unnecessary files to reduce size
echo "🧹 Removing unnecessary files..."
find node_modules -name "*.md" -type f -delete 2>/dev/null || true
find node_modules -name "*.ts" -type f -delete 2>/dev/null || true
find node_modules -name "*.map" -type f -delete 2>/dev/null || true
find node_modules -name "LICENSE*" -type f -delete 2>/dev/null || true
find node_modules -name "CHANGELOG*" -type f -delete 2>/dev/null || true
find node_modules -type d -name "test" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "__tests__" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "docs" -exec rm -rf {} + 2>/dev/null || true
find node_modules -type d -name "examples" -exec rm -rf {} + 2>/dev/null || true

cd ../../..

echo "✅ Production dependencies installed and optimized"

# Copy frontend build to BOTH static (for CDN) AND compute/default/public (for SPA fallback)
echo "🎨 Copying frontend static files..."
cp -r ./dist/public/* ./.amplify-hosting/static/

# CRITICAL FIX: Also copy to compute/default/public for serveStatic() fallback
echo "📁 Copying frontend to compute/default/public for SPA fallback..."
mkdir -p ./.amplify-hosting/compute/default/public
cp -r ./dist/public/* ./.amplify-hosting/compute/default/public/

echo "✅ Frontend files copied to both static/ and compute/default/public/"

# Copy deployment manifest
cp deploy-manifest.json ./.amplify-hosting/deploy-manifest.json

echo "✅ Deployment manifest copied"

# Create environment variable template
cat > ./.amplify-hosting/compute/default/.env.production << 'EOF'
# This file is a template - actual values set in Amplify Console
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
SESSION_SECRET=${SESSION_SECRET}
S3_REGION=${S3_REGION}
S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID}
S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY}
S3_BUCKET_NAME=${S3_BUCKET_NAME}
SENDGRID_API_KEY=${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
FRONTEND_URL=${FRONTEND_URL}
EOF

echo "✅ Environment template created"
echo "🎉 Post-build process completed!"
