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
cp ./package.json ./.amplify-hosting/compute/default/
cp ./package-lock.json ./.amplify-hosting/compute/default/

# Install production dependencies only
echo "📦 Installing production dependencies..."
cd ./.amplify-hosting/compute/default
npm ci --production --ignore-scripts
cd ../../..

echo "✅ Production dependencies installed"

# Copy frontend build
echo "🎨 Copying frontend static files..."
cp -r ./dist/public/* ./.amplify-hosting/static/

echo "✅ Frontend files copied"

# Copy deployment manifest
cp deploy-manifest.json ./.amplify-hosting/deploy-manifest.json

echo "✅ Deployment manifest copied"

# --- Add computeResources to deploy-manifest.json ---
#
# THIS BLOCK HAS BEEN INTENTIONALLY REMOVED
# AS IT WAS CAUSING THE DEPLOYMENT ERROR.
# THE CONFIGURATION IS NOW CORRECTLY PLACED
# IN THE `deploy-manifest.json` FILE.
#
# ----------------------------------------------------

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