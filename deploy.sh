#!/bin/bash

echo "🚀 Starting Lectio Divina deployment..."

# Configuration
PROJECT_DIR="/www/wwwroot/lectiodivina.org"
APP_NAME="lectio"
DOMAIN="lectiodivina.sk"  # ✅ OPRAVENÉ: .sk namiesto .org

# Farby pre výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

error() { echo -e "${RED}❌ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Funkcia na kontrolu príkazov
check_command() {
    if [ $? -eq 0 ]; then
        success "$1 successful"
    else
        error "$1 failed!"
        exit 1
    fi
}

# Kontrola či existuje projektový adresár
if [ ! -d "$PROJECT_DIR" ]; then
    error "Project directory $PROJECT_DIR does not exist!"
    exit 1
fi

# Navigate to project directory
info "📁 Navigating to project directory: $PROJECT_DIR"
cd $PROJECT_DIR

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    warning "Not a git repository. Skipping git pull..."
else
    # Pull latest changes
    info "📥 Pulling latest code from git..."
    git pull origin main
    check_command "Git pull"
fi

# Backup current PM2 process state
info "💾 Creating backup of current state..."
pm2 dump > /tmp/pm2-backup-$(date +%Y%m%d_%H%M%S).json 2>/dev/null || true

# Install dependencies
info "📦 Installing dependencies..."
npm ci --only=production
check_command "Dependencies installation"

# Build project
info "🔨 Building project..."
npm run build
check_command "Project build"

# Verify build output
if [ ! -d ".next" ]; then
    error "Build output (.next directory) not found!"
    exit 1
fi

# Stop current PM2 process gracefully
info "⏹️  Stopping current PM2 process..."
if pm2 list | grep -q "$APP_NAME"; then
    pm2 stop $APP_NAME
    success "PM2 process stopped"
    
    # Wait a moment for graceful shutdown
    sleep 3
    
    # Remove old process
    pm2 delete $APP_NAME || true
    success "Old PM2 process removed"
else
    info "No existing PM2 process found"
fi

# Start with ecosystem config
info "▶️  Starting new PM2 process..."
pm2 start ecosystem.config.js
check_command "PM2 start"

# Save PM2 configuration
info "💾 Saving PM2 configuration..."
pm2 save
check_command "PM2 save"

# Setup PM2 startup script (if not already done)
info "🔧 Setting up PM2 startup script..."
pm2 startup | grep -E '^sudo' | bash || true

# Show PM2 status
info "📊 Current PM2 Status:"
pm2 status

# Check Apache status
info "🔍 Checking Apache status..."
if systemctl is-active --quiet apache2; then
    success "Apache is running"
    
    # Reload Apache configuration
    info "🔄 Reloading Apache configuration..."
    sudo systemctl reload apache2
    check_command "Apache reload"
    
    # Test Apache configuration
    if sudo apache2ctl configtest &>/dev/null; then
        success "Apache configuration is valid"
    else
        warning "Apache configuration has issues"
        sudo apache2ctl configtest
    fi
else
    error "Apache is not running!"
    info "Starting Apache..."
    sudo systemctl start apache2
    check_command "Apache start"
fi

# Wait for application to start
info "⏳ Waiting for application to start..."
sleep 10

# Test if Next.js app is responding on port 3000
info "🧪 Testing Next.js server (port 3000)..."
NEXTJS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$NEXTJS_RESPONSE" = "200" ] || [ "$NEXTJS_RESPONSE" = "404" ]; then
    success "Next.js server is responding (HTTP $NEXTJS_RESPONSE)"
else
    warning "Next.js server response: HTTP $NEXTJS_RESPONSE"
    error "Next.js server might not be responding correctly"
    info "Checking PM2 logs..."
    pm2 logs $APP_NAME --lines 10 --nostream
fi

# Test if Apache proxy is working
info "🧪 Testing Apache proxy..."
PROXY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")
if [ "$PROXY_RESPONSE" = "200" ] || [ "$PROXY_RESPONSE" = "404" ]; then
    success "Apache proxy is working (HTTP $PROXY_RESPONSE)"
else
    warning "Apache proxy response: HTTP $PROXY_RESPONSE"
    error "Apache proxy might not be working correctly"
    info "Check Apache error logs:"
    echo "  sudo tail -n 20 /var/log/apache2/lectiodivina_error.log"
fi

# Test external domain (if DNS is configured)
info "🌐 Testing external domain access..."
if nslookup $DOMAIN >/dev/null 2>&1; then
    DOMAIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN || echo "000")
    if [ "$DOMAIN_RESPONSE" = "200" ] || [ "$DOMAIN_RESPONSE" = "404" ]; then
        success "Domain $DOMAIN is accessible (HTTP $DOMAIN_RESPONSE)"
    else
        warning "Domain $DOMAIN response: HTTP $DOMAIN_RESPONSE"
    fi
else
    info "Domain $DOMAIN is not configured in local DNS"
fi

# Show useful information
echo
info "📋 Deployment Summary:"
echo "  📁 Project directory: $PROJECT_DIR"
echo "  🚀 PM2 process: $APP_NAME"
echo "  🌐 Domain: $DOMAIN"
echo "  🔗 Local access: http://localhost"
echo "  🔗 Domain access: http://$DOMAIN"
echo
info "📜 Useful commands:"
echo "  📊 PM2 status: pm2 status"
echo "  📝 PM2 logs: pm2 logs $APP_NAME"
echo "  🔄 Restart app: pm2 restart $APP_NAME"
echo "  🛠️  Apache status: sudo systemctl status apache2"
echo "  📋 Apache logs: sudo tail -f /var/log/apache2/lectiodivina_error.log"
echo
info "🔧 Troubleshooting:"
echo "  🔍 Check app health: curl -I http://localhost:3000"
echo "  🔍 Check proxy health: curl -I http://localhost"
echo "  🔍 Check process: ps aux | grep node"
echo "  🔍 Check ports: netstat -tlnp | grep -E ':(80|3000|443)'"

# Final status check
echo
if [ "$NEXTJS_RESPONSE" = "200" ] && [ "$PROXY_RESPONSE" = "200" ]; then
    success "🎉 Deployment completed successfully!"
    success "🌟 Application is fully operational!"
    echo
    info "🔗 Access your application:"
    echo "  📱 Local: http://localhost"
    echo "  🌍 Public: http://$DOMAIN"
else
    warning "⚠️  Deployment completed with warnings!"
    warning "🔧 Some components may need attention"
    echo
    info "🛠️  Next steps:"
    echo "  1. Check PM2 logs: pm2 logs $APP_NAME"
    echo "  2. Check Apache logs: sudo tail -f /var/log/apache2/lectiodivina_error.log"
    echo "  3. Verify configuration: sudo apache2ctl configtest"
    echo "  4. Test manually: curl -v http://localhost:3000"
fi

# Optional: Send deployment notification (uncomment if needed)
# echo "📧 Sending deployment notification..."
# echo "Lectio Divina deployment completed at $(date)" | mail -s "Deployment Success" admin@$DOMAIN 2>/dev/null || true

echo
info "✨ Deployment script finished at $(date)"