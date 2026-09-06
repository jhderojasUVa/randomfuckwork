#!/bin/bash

################################################################################
# GitHub Actions to GCP Integration - Automated Setup Script
################################################################################
# This script automates the complete GCP setup for the GitHub Actions pipeline
# Usage: ./SETUP_SCRIPT.sh <gcp-project-id>
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="jhderojasUVa/randomfuckwork"
GITHUB_REPO_OWNER="jhderojasUVa"
WORKLOAD_POOL_NAME="github-pool"
WORKLOAD_PROVIDER_NAME="github-provider"
SERVICE_ACCOUNT_NAME="github-actions-sa"
TEST_RESULTS_BUCKET="randomfuckwork-test-results-dev"
COVERAGE_BUCKET="randomfuckwork-coverage-reports-dev"
REGION="us-central1"

# Usage check
if [ -z "$1" ]; then
  echo -e "${RED}Error: GCP Project ID is required${NC}"
  echo "Usage: ./SETUP_SCRIPT.sh <gcp-project-id>"
  echo "Example: ./SETUP_SCRIPT.sh my-gcp-project-123"
  exit 1
fi

GCP_PROJECT_ID="$1"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}GitHub Actions → GCP Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  GCP Project ID: $GCP_PROJECT_ID"
echo "  GitHub Repo: $GITHUB_REPO"
echo "  Workload Pool: $WORKLOAD_POOL_NAME"
echo "  Service Account: $SERVICE_ACCOUNT_NAME"
echo "  Test Results Bucket: $TEST_RESULTS_BUCKET"
echo "  Coverage Bucket: $COVERAGE_BUCKET"
echo ""

# Step 1: Verify gcloud is configured
echo -e "${BLUE}Step 1/7: Verifying gcloud configuration...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project)
if [ "$CURRENT_PROJECT" != "$GCP_PROJECT_ID" ]; then
  echo -e "${YELLOW}Setting gcloud default project to $GCP_PROJECT_ID${NC}"
  gcloud config set project "$GCP_PROJECT_ID"
fi
echo -e "${GREEN}✓ Using project: $GCP_PROJECT_ID${NC}"
echo ""

# Step 2: Create GCS Buckets
echo -e "${BLUE}Step 2/7: Creating Cloud Storage buckets...${NC}"
for BUCKET in "$TEST_RESULTS_BUCKET" "$COVERAGE_BUCKET"; do
  if gsutil ls -b "gs://${BUCKET}" >/dev/null 2>&1; then
    echo -e "${YELLOW}  ℹ Bucket gs://${BUCKET} already exists${NC}"
  else
    echo "  Creating bucket gs://${BUCKET}..."
    gsutil mb -p "$GCP_PROJECT_ID" -l "$REGION" "gs://${BUCKET}"
    echo -e "${GREEN}  ✓ Created gs://${BUCKET}${NC}"
  fi
done
echo ""

# Step 3: Create Workload Identity Pool
echo -e "${BLUE}Step 3/7: Creating Workload Identity Pool...${NC}"
POOL_EXISTS=$(gcloud iam workload-identity-pools describe "$WORKLOAD_POOL_NAME" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --format="value(name)" 2>/dev/null || echo "")

if [ -z "$POOL_EXISTS" ]; then
  echo "  Creating Workload Identity Pool '$WORKLOAD_POOL_NAME'..."
  gcloud iam workload-identity-pools create "$WORKLOAD_POOL_NAME" \
    --project="$GCP_PROJECT_ID" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --description="Workload Identity Pool for GitHub Actions"
  echo -e "${GREEN}  ✓ Created Workload Identity Pool${NC}"
else
  echo -e "${YELLOW}  ℹ Workload Identity Pool already exists${NC}"
fi

WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "$WORKLOAD_POOL_NAME" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --format="value(name)")
echo "  Pool ID: $WORKLOAD_IDENTITY_POOL_ID"
echo ""

# Step 4: Create Workload Identity Provider
echo -e "${BLUE}Step 4/7: Creating Workload Identity Provider...${NC}"
PROVIDER_EXISTS=$(gcloud iam workload-identity-pools providers describe "$WORKLOAD_PROVIDER_NAME" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="$WORKLOAD_POOL_NAME" \
  --format="value(name)" 2>/dev/null || echo "")

if [ -z "$PROVIDER_EXISTS" ]; then
  echo "  Creating OIDC provider '$WORKLOAD_PROVIDER_NAME'..."
  gcloud iam workload-identity-pools providers create-oidc "$WORKLOAD_PROVIDER_NAME" \
    --project="$GCP_PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="$WORKLOAD_POOL_NAME" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --issuer-uri="https://token.actions.githubusercontent.com"
  echo -e "${GREEN}  ✓ Created Workload Identity Provider${NC}"
else
  # Provider exists - check if it has the right configuration
  PROVIDER_CONFIG=$(gcloud iam workload-identity-pools providers describe "$WORKLOAD_PROVIDER_NAME" \
    --project="$GCP_PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="$WORKLOAD_POOL_NAME" \
    --format="value(attributeMapping)" 2>/dev/null || echo "")
  
  if echo "$PROVIDER_CONFIG" | grep -q "attribute.actor"; then
    # Old bad configuration detected - delete and recreate
    echo -e "${YELLOW}  Detected old configuration with invalid attribute.actor claim${NC}"
    echo "  Deleting old provider..."
    gcloud iam workload-identity-pools providers delete "$WORKLOAD_PROVIDER_NAME" \
      --project="$GCP_PROJECT_ID" \
      --location="global" \
      --workload-identity-pool="$WORKLOAD_POOL_NAME" \
      --quiet
    
    echo "  Creating corrected OIDC provider..."
    gcloud iam workload-identity-pools providers create-oidc "$WORKLOAD_PROVIDER_NAME" \
      --project="$GCP_PROJECT_ID" \
      --location="global" \
      --workload-identity-pool="$WORKLOAD_POOL_NAME" \
      --display-name="GitHub Provider" \
      --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
      --issuer-uri="https://token.actions.githubusercontent.com"
    echo -e "${GREEN}  ✓ Recreated with correct configuration${NC}"
  else
    echo -e "${YELLOW}  ℹ Workload Identity Provider already exists with correct configuration${NC}"
  fi
fi

WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe "$WORKLOAD_PROVIDER_NAME" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="$WORKLOAD_POOL_NAME" \
  --format="value(name)")
echo "  Provider: $WORKLOAD_IDENTITY_PROVIDER"
echo ""

# Step 5: Create Service Account
echo -e "${BLUE}Step 5/7: Creating Service Account...${NC}"
SERVICE_ACCOUNT_EXISTS=$(gcloud iam service-accounts describe "${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$GCP_PROJECT_ID" \
  --format="value(name)" 2>/dev/null || echo "")

if [ -z "$SERVICE_ACCOUNT_EXISTS" ]; then
  echo "  Creating service account '$SERVICE_ACCOUNT_NAME'..."
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
    --project="$GCP_PROJECT_ID" \
    --display-name="GitHub Actions Service Account" \
    --description="Service account for GitHub Actions CI/CD"
  echo -e "${GREEN}  ✓ Created Service Account${NC}"
else
  echo -e "${YELLOW}  ℹ Service Account already exists${NC}"
fi

GCP_SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
echo "  Service Account: $GCP_SERVICE_ACCOUNT_EMAIL"
echo ""

# Step 6: Grant Cloud Storage Permissions
echo -e "${BLUE}Step 6/7: Granting Cloud Storage permissions...${NC}"
for BUCKET in "$TEST_RESULTS_BUCKET" "$COVERAGE_BUCKET"; do
  echo "  Granting objectCreator role for gs://${BUCKET}..."
  gsutil iam ch "serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}:objectCreator" "gs://${BUCKET}/" || true
  echo -e "${GREEN}  ✓ Granted permissions for gs://${BUCKET}${NC}"
done
echo ""

# Step 7: Configure Workload Identity Federation Binding
echo -e "${BLUE}Step 7/7: Configuring Workload Identity Federation binding...${NC}"
echo "  Binding GitHub repo to service account..."
gcloud iam service-accounts add-iam-policy-binding "$GCP_SERVICE_ACCOUNT_EMAIL" \
  --project="$GCP_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:${GITHUB_REPO}:ref:refs/heads/main" \
  --condition=None || true
echo -e "${GREEN}  ✓ Configured Workload Identity Federation binding${NC}"
echo ""

# Output Summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ GCP Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Add these values to GitHub Repository Variables:${NC}"
echo ""
echo "Go to: Settings → Secrets and variables → Actions → Variables"
echo ""
echo -e "${BLUE}1. GCP_PROJECT_ID${NC}"
echo "   Value: $GCP_PROJECT_ID"
echo ""
echo -e "${BLUE}2. GCP_WORKLOAD_IDENTITY_PROVIDER${NC}"
echo "   Value: $WORKLOAD_IDENTITY_PROVIDER"
echo ""
echo -e "${BLUE}3. GCP_SERVICE_ACCOUNT_EMAIL${NC}"
echo "   Value: $GCP_SERVICE_ACCOUNT_EMAIL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Copy the 3 values above"
echo "  2. Add them to GitHub Repository Variables"
echo "  3. Commit and push to main branch"
echo "  4. Watch the workflow in Actions tab"
echo ""
echo -e "${YELLOW}Verify Setup:${NC}"
echo "  gcloud iam service-accounts get-iam-policy \\
    $GCP_SERVICE_ACCOUNT_EMAIL --project=$GCP_PROJECT_ID"
echo ""
