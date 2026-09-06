#!/bin/bash

################################################################################
# WSL-Optimized Setup Script
# This version is optimized for Windows Subsystem for Linux environments
# It ensures gcloud is native to WSL, not Windows version
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}WSL Setup - Pre-flight Checks${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if running in WSL
if ! grep -qi microsoft /proc/version; then
    echo -e "${YELLOW}⚠️  This doesn't appear to be WSL${NC}"
    echo "But continuing anyway..."
    echo ""
fi

# Check gcloud is installed in WSL (not Windows)
echo -e "${BLUE}Checking gcloud installation...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud not found in WSL${NC}"
    echo ""
    echo "Install gcloud in WSL:"
    echo "  curl https://sdk.cloud.google.com | bash"
    echo "  exec -l \$SHELL"
    echo ""
    exit 1
fi

GCLOUD_PATH=$(which gcloud)
if [[ "$GCLOUD_PATH" == /mnt/c/* ]]; then
    echo -e "${RED}❌ gcloud is Windows version (${GCLOUD_PATH})${NC}"
    echo ""
    echo "You need WSL-native gcloud. Install it:"
    echo "  curl https://sdk.cloud.google.com | bash"
    echo "  exec -l \$SHELL"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ WSL-native gcloud found: $GCLOUD_PATH${NC}"
echo ""

# Check authentication
echo -e "${BLUE}Checking authentication...${NC}"
if ! gcloud auth list 2>/dev/null | grep -q "ACTIVE"; then
    echo -e "${RED}❌ Not authenticated to Google Cloud${NC}"
    echo ""
    echo "Authenticate:"
    echo "  gcloud auth login"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Check project is set
echo -e "${BLUE}Checking project...${NC}"
if [ -z "$1" ]; then
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -z "$CURRENT_PROJECT" ]; then
        echo -e "${RED}❌ No project set${NC}"
        echo ""
        echo "Usage: $0 <gcp-project-id>"
        echo "Example: $0 random-fuck-work"
        echo ""
        exit 1
    fi
    GCP_PROJECT_ID="$CURRENT_PROJECT"
    echo -e "${GREEN}✓ Using current project: $GCP_PROJECT_ID${NC}"
else
    GCP_PROJECT_ID="$1"
    gcloud config set project "$GCP_PROJECT_ID"
    echo -e "${GREEN}✓ Set project: $GCP_PROJECT_ID${NC}"
fi
echo ""

# Verify gcloud can reach GCP
echo -e "${BLUE}Verifying GCP access...${NC}"
if ! gcloud projects describe "$GCP_PROJECT_ID" &>/dev/null; then
    echo -e "${RED}❌ Cannot access project $GCP_PROJECT_ID${NC}"
    echo ""
    echo "Check:"
    echo "  1. Project exists"
    echo "  2. You have permissions"
    echo "  3. Project has billing enabled"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Can access project: $GCP_PROJECT_ID${NC}"
echo ""

# All checks passed
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Pre-flight checks passed!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Next step:${NC}"
echo "  Run the full setup:"
echo "  ./.github/workflows/SETUP_SCRIPT.sh $GCP_PROJECT_ID"
echo ""
