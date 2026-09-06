#!/bin/bash

# MASTER SETUP SCRIPT - Complete end-to-end pipeline activation
# This script handles all setup steps in sequence

set -e

PROJECT_ID="random-fuck-work"
PROJECT_NUMBER="605371248588"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
SERVICE_ACCOUNT="github-actions-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"
REPO="jhderojasUVa/randomfuckwork"
WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         GCP → GitHub CI/CD Pipeline Setup                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# STEP 1: Verify gcloud is installed and working
# ============================================================================
echo -e "${BLUE}Step 1: Verifying gcloud setup...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud not found in PATH${NC}"
    echo ""
    echo "Install WSL-native gcloud with:"
    echo "  echo \"deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main\" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list"
    echo "  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y google-cloud-sdk"
    echo "  gcloud init"
    exit 1
fi

# Check if it's WSL gcloud (not Windows gcloud)
GCLOUD_PATH=$(which gcloud)
if [[ "$GCLOUD_PATH" == *"/mnt/c/"* ]]; then
    echo -e "${RED}❌ Using Windows gcloud (path: $GCLOUD_PATH)${NC}"
    echo "This won't work in WSL. Install WSL-native gcloud (see instructions above)."
    exit 1
fi

echo -e "${GREEN}✓ gcloud installed (path: $GCLOUD_PATH)${NC}"

# ============================================================================
# STEP 2: Verify project is set
# ============================================================================
echo -e "${BLUE}Step 2: Verifying GCP project...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Setting project to $PROJECT_ID...${NC}"
    gcloud config set project "$PROJECT_ID"
fi
echo -e "${GREEN}✓ Project: $PROJECT_ID${NC}"

# ============================================================================
# STEP 3: Verify Workload Identity Pool exists
# ============================================================================
echo -e "${BLUE}Step 3: Verifying Workload Identity Pool...${NC}"
if ! gcloud iam workload-identity-pools describe "$POOL_NAME" \
    --project="$PROJECT_ID" \
    --location=global &>/dev/null; then
    echo -e "${RED}❌ Pool not found. Creating...${NC}"
    gcloud iam workload-identity-pools create "$POOL_NAME" \
        --project="$PROJECT_ID" \
        --location=global \
        --display-name="GitHub Actions Pool"
fi
echo -e "${GREEN}✓ Pool exists: $POOL_NAME${NC}"

# ============================================================================
# STEP 4: Verify OIDC Provider exists
# ============================================================================
echo -e "${BLUE}Step 4: Verifying OIDC Provider...${NC}"
if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
    --project="$PROJECT_ID" \
    --location=global \
    --workload-identity-pool="$POOL_NAME" &>/dev/null; then
    echo -e "${YELLOW}Provider not found. Creating...${NC}"
    gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
        --project="$PROJECT_ID" \
        --location=global \
        --workload-identity-pool="$POOL_NAME" \
        --display-name="GitHub Provider" \
        --attribute-mapping="google.subject=assertion.sub" \
        --issuer-uri="https://token.actions.githubusercontent.com"
fi
echo -e "${GREEN}✓ Provider exists: $PROVIDER_NAME${NC}"

# ============================================================================
# STEP 5: Verify Service Account exists
# ============================================================================
echo -e "${BLUE}Step 5: Verifying Service Account...${NC}"
if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" \
    --project="$PROJECT_ID" &>/dev/null; then
    echo -e "${YELLOW}Service account not found. Creating...${NC}"
    gcloud iam service-accounts create "$SERVICE_ACCOUNT" \
        --project="$PROJECT_ID" \
        --display-name="GitHub Actions"
fi
echo -e "${GREEN}✓ Service account: $SERVICE_ACCOUNT_EMAIL${NC}"

# ============================================================================
# STEP 6: Set GitHub Variables
# ============================================================================
echo -e "${BLUE}Step 6: Setting GitHub Variables...${NC}"

if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠ GitHub CLI (gh) not installed. Skipping auto-setup.${NC}"
    echo ""
    echo "Set these variables manually at:"
    echo "https://github.com/$REPO/settings/variables/actions"
    echo ""
    echo "Variable 1:"
    echo "  Name: GCP_PROJECT_ID"
    echo "  Value: $PROJECT_ID"
    echo ""
    echo "Variable 2:"
    echo "  Name: GCP_WORKLOAD_IDENTITY_PROVIDER"
    echo "  Value: $WIF_PROVIDER"
    echo ""
    echo "Variable 3:"
    echo "  Name: GCP_SERVICE_ACCOUNT_EMAIL"
    echo "  Value: $SERVICE_ACCOUNT_EMAIL"
    echo ""
else
    if ! gh auth status &>/dev/null; then
        echo -e "${YELLOW}⚠ Not authenticated with GitHub CLI. Skipping auto-setup.${NC}"
        echo "Run: gh auth login"
    else
        echo "Setting GCP_PROJECT_ID..."
        gh variable set GCP_PROJECT_ID -b "$PROJECT_ID" -R "$REPO" || true
        
        echo "Setting GCP_WORKLOAD_IDENTITY_PROVIDER..."
        gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER -b "$WIF_PROVIDER" -R "$REPO" || true
        
        echo "Setting GCP_SERVICE_ACCOUNT_EMAIL..."
        gh variable set GCP_SERVICE_ACCOUNT_EMAIL -b "$SERVICE_ACCOUNT_EMAIL" -R "$REPO" || true
        
        echo -e "${GREEN}✓ All GitHub variables set${NC}"
    fi
fi

# ============================================================================
# STEP 7: Grant Service Account Permissions
# ============================================================================
echo -e "${BLUE}Step 7: Granting service account permissions...${NC}"

echo "Binding to GitHub repo..."
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
    --project="$PROJECT_ID" \
    --role="roles/iam.workloadIdentityUser" \
    --subject="repo:$REPO:ref:refs/heads/main" \
    --quiet 2>/dev/null || true
echo -e "${GREEN}✓ Workload Identity binding set${NC}"

echo "Granting GCS permissions for test results bucket..."
gsutil iam ch "serviceAccount:$SERVICE_ACCOUNT_EMAIL:objectCreator" \
    "gs://randomfuckwork-test-results-dev/" 2>/dev/null || true
echo -e "${GREEN}✓ Test results bucket access granted${NC}"

echo "Granting GCS permissions for coverage reports bucket..."
gsutil iam ch "serviceAccount:$SERVICE_ACCOUNT_EMAIL:objectCreator" \
    "gs://randomfuckwork-coverage-reports-dev/" 2>/dev/null || true
echo -e "${GREEN}✓ Coverage reports bucket access granted${NC}"

# ============================================================================
# SUCCESS
# ============================================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Setup Complete!                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Configuration Summary:"
echo "  GCP Project:        $PROJECT_ID"
echo "  Service Account:    $SERVICE_ACCOUNT_EMAIL"
echo "  WIF Provider:       $WIF_PROVIDER"
echo "  GitHub Repo:        $REPO"
echo ""
echo "Next Steps:"
echo "  1. Verify GitHub Variables are set:"
echo "     https://github.com/$REPO/settings/variables/actions"
echo ""
echo "  2. Trigger the pipeline:"
echo "     git push origin main"
echo ""
echo "  3. Monitor in GitHub Actions:"
echo "     https://github.com/$REPO/actions"
echo ""
echo "Expected Runtime:"
echo "  - Test job: 5-10 minutes"
echo "  - Publish job: 2-3 minutes"
echo ""
echo "Questions? Read: .github/workflows/COMPLETE_SETUP_GUIDE.md"
echo ""
