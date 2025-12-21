#!/bin/bash

# ============================================
# ADINATH HOSPITAL - AWS Amplify Setup
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🏥 Adinath Hospital - AWS Amplify Setup${NC}"
echo "============================================"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}Installing AWS CLI...${NC}"
    brew install awscli
fi

# Check credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${YELLOW}⚠️  AWS credentials not configured${NC}"
    echo ""
    echo "Please run: aws configure"
    echo ""
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region: ap-south-1 (Mumbai)"
    echo ""
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ Logged in to AWS Account: $ACCOUNT_ID${NC}"
echo ""

# App configuration
APP_NAME="adinath-hospital"
REGION="ap-south-1"  # Mumbai region - closest to Ahmedabad
REPO_URL="https://github.com/pratiksajnani/adinath-hospital"

echo -e "${BLUE}Creating Amplify app: $APP_NAME${NC}"
echo "Region: $REGION"
echo ""

# Check if app already exists
EXISTING_APP=$(aws amplify list-apps --region "$REGION" \
    --query "apps[?name=='$APP_NAME'].appId" \
    --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_APP" ]; then
    echo -e "${YELLOW}App already exists: $EXISTING_APP${NC}"
    APP_ID="$EXISTING_APP"
else
    # Create the Amplify app
    echo "Creating new Amplify app..."
    
    APP_ID=$(aws amplify create-app \
        --name "$APP_NAME" \
        --region "$REGION" \
        --description "Adinath Hospital Management System" \
        --platform WEB \
        --query 'app.appId' \
        --output text)
    
    echo -e "${GREEN}✓ App created: $APP_ID${NC}"
fi

# Create/update branch
echo ""
echo "Setting up main branch..."

aws amplify create-branch \
    --app-id "$APP_ID" \
    --branch-name "main" \
    --region "$REGION" \
    --enable-auto-build \
    --stage PRODUCTION \
    2>/dev/null || echo "Branch may already exist, continuing..."

echo -e "${GREEN}✓ Branch configured${NC}"

# Get the app URL
APP_URL="https://main.$APP_ID.amplifyapp.com"

echo ""
echo "============================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "============================================"
echo ""
echo -e "App ID: ${YELLOW}$APP_ID${NC}"
echo -e "URL: ${BLUE}$APP_URL${NC}"
echo ""
echo "Save this for later:"
echo -e "  ${YELLOW}export AMPLIFY_APP_ID=$APP_ID${NC}"
echo ""
echo "Add to your ~/.zshrc or ~/.bashrc:"
echo "  echo 'export AMPLIFY_APP_ID=$APP_ID' >> ~/.zshrc"
echo ""
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Connect your GitHub repo in AWS Console:"
echo "   https://console.aws.amazon.com/amplify/home?region=$REGION#/$APP_ID"
echo ""
echo "2. Or deploy manually:"
echo "   ./scripts/deploy.sh"
echo ""
echo "3. Set up custom domain (optional):"
echo "   aws amplify create-domain-association --app-id $APP_ID --domain-name adinathhospital.com"
echo ""

# Save app ID to local config
echo "$APP_ID" > "$(dirname "$0")/../.amplify-app-id"
echo -e "${GREEN}✓ App ID saved to .amplify-app-id${NC}"

