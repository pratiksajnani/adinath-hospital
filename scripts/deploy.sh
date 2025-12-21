#!/bin/bash

# ============================================
# ADINATH HOSPITAL - AWS Amplify Deployment
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏥 Adinath Hospital - Deployment Script${NC}"
echo "=========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Installing...${NC}"
    echo ""
    echo "Run: brew install awscli"
    echo "Then: aws configure"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo ""
    echo "Run: aws configure"
    echo "Enter your AWS Access Key ID and Secret Access Key"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI configured${NC}"

# Get app ID from config or environment
APP_ID="${AMPLIFY_APP_ID:-}"
BRANCH="${1:-main}"

if [ -z "$APP_ID" ]; then
    echo -e "${YELLOW}⚠️  No AMPLIFY_APP_ID found${NC}"
    echo ""
    echo "First time setup? Run:"
    echo "  ./scripts/setup-amplify.sh"
    echo ""
    echo "Or set the app ID:"
    echo "  export AMPLIFY_APP_ID=your-app-id"
    exit 1
fi

echo ""
echo -e "📦 Deploying to branch: ${YELLOW}$BRANCH${NC}"
echo ""

# Create a zip of the site
echo "Creating deployment package..."
cd "$(dirname "$0")/.."
zip -r /tmp/adinath-deploy.zip . \
    -x "*.git*" \
    -x "scripts/*" \
    -x "*.DS_Store" \
    -x "node_modules/*" \
    -x "*.md"

echo -e "${GREEN}✓ Package created${NC}"

# Start deployment
echo ""
echo "🚀 Starting deployment..."

JOB_ID=$(aws amplify start-deployment \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH" \
    --source-url "file:///tmp/adinath-deploy.zip" \
    --query 'jobSummary.jobId' \
    --output text 2>/dev/null || echo "")

if [ -z "$JOB_ID" ]; then
    echo -e "${YELLOW}Note: Manual zip deployment not available for this app.${NC}"
    echo "Using git-based deployment instead..."
    
    # Git-based deployment
    git add -A
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" --allow-empty
    git push origin "$BRANCH"
    
    echo ""
    echo -e "${GREEN}✓ Code pushed to $BRANCH${NC}"
    echo "Amplify will automatically build and deploy."
else
    echo -e "${GREEN}✓ Deployment started: Job ID $JOB_ID${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment initiated!${NC}"
echo ""
echo "View status:"
echo "  https://console.aws.amazon.com/amplify/"
echo ""

# Cleanup
rm -f /tmp/adinath-deploy.zip

