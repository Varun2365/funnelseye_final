#!/bin/bash

# Admin Panel Deployment Script
# This script deploys the React admin panel to your VPS

echo "🚀 Starting Admin Panel Deployment..."

# Configuration
VPS_HOST="69.62.77.6"
VPS_USER="root"
VPS_PATH="/root/admin_frontend"
LOCAL_BUILD_PATH="./public/dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "  VPS Host: ${VPS_HOST}"
echo -e "  VPS User: ${VPS_USER}"
echo -e "  VPS Path: ${VPS_PATH}"
echo -e "  Local Build: ${LOCAL_BUILD_PATH}"
echo ""

# Check if build files exist
if [ ! -d "$LOCAL_BUILD_PATH" ]; then
    echo -e "${RED}❌ Build files not found at $LOCAL_BUILD_PATH${NC}"
    echo -e "${YELLOW}💡 Please run 'npm run build' in the public directory first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build files found${NC}"

# Create remote directory if it doesn't exist
echo -e "${BLUE}📁 Creating remote directory...${NC}"
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_PATH}"

# Upload build files
echo -e "${BLUE}📤 Uploading build files...${NC}"
rsync -avz --delete ${LOCAL_BUILD_PATH}/ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# Set proper permissions
echo -e "${BLUE}🔐 Setting permissions...${NC}"
ssh ${VPS_USER}@${VPS_HOST} "chmod -R 755 ${VPS_PATH}"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Configure Nginx for admin.funnelseye.com"
echo -e "  2. Test the deployment"
echo -e "  3. Set up SSL certificate if needed"
echo ""
echo -e "${BLUE}🌐 Your admin panel will be available at: https://admin.funnelseye.com${NC}"
