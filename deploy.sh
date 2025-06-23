#!/bin/bash

echo "🚀 Starting Lectio Divina deployment..."

# Configuration
PROJECT_DIR="/www/wwwroot/lectiodivina.org"
APP_NAME="lectio-divina"

# Navigate to project directory
cd $PROJECT_DIR

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

# Build project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Stop current PM2 process
echo "⏹️ Stopping current process..."
pm2 stop $APP_NAME || true

# Start with ecosystem config
echo "▶️ Starting new process..."
pm2 start ecosystem.config.js
if [ $? -ne 0 ]; then
    echo "❌ PM2 start failed!"
    exit 1
fi

# Save PM2 configuration
echo "💾 Saving PM2 config..."
pm2 save

# Show status
echo "📊 PM2 Status:"
pm2 status

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

# Test if app is responding
echo "🧪 Testing application..."
sleep 5
curl -f http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Application is responding!"
else
    echo "⚠️ Application might not be responding correctly"
fi

echo "✅ Deployment completed successfully!"
echo "📍 Check your app at: http://lectiodivina.org"