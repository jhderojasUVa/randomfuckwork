#!/bin/bash

################################################################################
# GCP Setup - Comprehensive Troubleshooting & Testing
# This script tests each command individually and shows exactly what's happening
################################################################################

set -e

PROJECT_ID="random-fuck-work"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}GCP Setup Troubleshooter${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Test 1: Verify gcloud version and setup
echo -e "${BLUE}Test 1: Checking gcloud version...${NC}"
GCLOUD_VERSION=$(gcloud --version | head -1)
echo "$GCLOUD_VERSION"
if [[ $GCLOUD_VERSION == *"Google Cloud SDK"* ]]; then
    echo -e "${GREEN}✓ gcloud is properly installed${NC}"
else
    echo -e "${RED}✗ gcloud issue detected${NC}"
fi
echo ""

# Test 2: Verify project access
echo -e "${BLUE}Test 2: Checking GCP project access...${NC}"
if gcloud projects describe $PROJECT_ID &>/dev/null; then
    echo -e "${GREEN}✓ Can access project: $PROJECT_ID${NC}"
else
    echo -e "${RED}✗ Cannot access project${NC}"
    exit 1
fi
echo ""

# Test 3: Check if pool exists
echo -e "${BLUE}Test 3: Checking Workload Identity Pool...${NC}"
if gcloud iam workload-identity-pools describe github-pool \
    --project=$PROJECT_ID \
    --location=global &>/dev/null; then
    echo -e "${GREEN}✓ Pool exists${NC}"
    POOL_EXISTS=true
else
    echo -e "${YELLOW}⚠ Pool doesn't exist - will create${NC}"
    POOL_EXISTS=false
fi
echo ""

# Test 4: Check if provider exists
echo -e "${BLUE}Test 4: Checking Workload Identity Provider...${NC}"
if gcloud iam workload-identity-pools providers describe github-provider \
    --project=$PROJECT_ID \
    --location=global \
    --workload-identity-pool=github-pool &>/dev/null; then
    echo -e "${GREEN}✓ Provider exists${NC}"
    echo "Getting current configuration..."
    gcloud iam workload-identity-pools providers describe github-provider \
      --project=$PROJECT_ID \
      --location=global \
      --workload-identity-pool=github-pool \
      --format="yaml(name, attributeMapping, issuerUri)"
    PROVIDER_EXISTS=true
else
    echo -e "${YELLOW}⚠ Provider doesn't exist - will create${NC}"
    PROVIDER_EXISTS=false
fi
echo ""

# Test 5: If provider exists, check if it's valid
if [ "$PROVIDER_EXISTS" = true ]; then
    echo -e "${BLUE}Test 5: Validating existing provider...${NC}"
    ATTR_MAP=$(gcloud iam workload-identity-pools providers describe github-provider \
      --project=$PROJECT_ID \
      --location=global \
      --workload-identity-pool=github-pool \
      --format="value(attributeMapping)")
    
    echo "Current attribute mapping: $ATTR_MAP"
    
    if echo "$ATTR_MAP" | grep -q "assertion.sub"; then
        echo -e "${GREEN}✓ Provider has valid configuration${NC}"
    else
        echo -e "${RED}✗ Provider needs to be reconfigured${NC}"
        echo "Attempting to delete and recreate..."
        gcloud iam workload-identity-pools providers delete github-provider \
          --project=$PROJECT_ID \
          --location=global \
          --workload-identity-pool=github-pool \
          --quiet
        PROVIDER_EXISTS=false
    fi
    echo ""
fi

# Test 6: Try creating provider if needed
if [ "$PROVIDER_EXISTS" = false ]; then
    echo -e "${BLUE}Test 6: Creating Workload Identity Provider...${NC}"
    echo "Running command:"
    echo "gcloud iam workload-identity-pools providers create-oidc github-provider \\"
    echo "  --project=$PROJECT_ID \\"
    echo "  --location=global \\"
    echo "  --workload-identity-pool=github-pool \\"
    echo "  --display-name='GitHub' \\"
    echo "  --attribute-mapping='google.subject=assertion.sub' \\"
    echo "  --issuer-uri='https://token.actions.githubusercontent.com'"
    echo ""
    
    if gcloud iam workload-identity-pools providers create-oidc github-provider \
      --project=$PROJECT_ID \
      --location=global \
      --workload-identity-pool=github-pool \
      --display-name="GitHub" \
      --attribute-mapping="google.subject=assertion.sub" \
      --issuer-uri="https://token.actions.githubusercontent.com"; then
        echo -e "${GREEN}✓ Provider created successfully${NC}"
    else
        echo -e "${RED}✗ Provider creation failed${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "1. Check that gcloud has 'iam' component installed:"
        echo "   gcloud components install gke-gcloud-auth-plugin"
        echo ""
        echo "2. Try updating gcloud:"
        echo "   gcloud components update"
        echo ""
        echo "3. Try using alternate syntax (no quotes):"
        echo "   gcloud iam workload-identity-pools providers create-oidc github-provider \\"
        echo "     --project=$PROJECT_ID \\"
        echo "     --location=global \\"
        echo "     --workload-identity-pool=github-pool \\"
        echo "     --attribute-mapping=google.subject=assertion.sub \\"
        echo "     --issuer-uri=https://token.actions.githubusercontent.com"
        exit 1
    fi
fi
echo ""

# Test 7: Get the provider resource name
echo -e "${BLUE}Test 7: Getting provider resource name...${NC}"
WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe github-provider \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)")
echo "Provider: $WIF_PROVIDER"
echo ""

# Test 8: Service account
echo -e "${BLUE}Test 8: Checking Service Account...${NC}"
if gcloud iam service-accounts describe github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
    --project=$PROJECT_ID &>/dev/null; then
    echo -e "${GREEN}✓ Service account exists${NC}"
else
    echo -e "${YELLOW}⚠ Creating service account...${NC}"
    gcloud iam service-accounts create github-actions-sa \
      --project=$PROJECT_ID \
      --display-name="GitHub Actions"
    echo -e "${GREEN}✓ Service account created${NC}"
fi
echo ""

# Final output
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Add these to GitHub Repository Variables:"
echo ""
echo -e "${YELLOW}1. GCP_PROJECT_ID${NC}"
echo "   $PROJECT_ID"
echo ""
echo -e "${YELLOW}2. GCP_WORKLOAD_IDENTITY_PROVIDER${NC}"
echo "   $WIF_PROVIDER"
echo ""
echo -e "${YELLOW}3. GCP_SERVICE_ACCOUNT_EMAIL${NC}"
echo "   github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
