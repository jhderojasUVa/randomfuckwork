#!/bin/bash

# Automatic GitHub Variables Setup Script
# This script sets the 3 required variables in your GitHub repository

set -e

PROJECT_ID="random-fuck-work"
PROJECT_NUMBER="605371248588"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
SERVICE_ACCOUNT_EMAIL="github-actions-sa@random-fuck-work.iam.gserviceaccount.com"
REPO="jhderojasUVa/randomfuckwork"

# Construct the full Workload Identity Provider resource name
WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

echo "=========================================="
echo "GitHub Variables Auto-Setup"
echo "=========================================="
echo ""
echo "Repository: $REPO"
echo ""
echo "Variables to be set:"
echo "  1. GCP_PROJECT_ID = $PROJECT_ID"
echo "  2. GCP_WORKLOAD_IDENTITY_PROVIDER = $WIF_PROVIDER"
echo "  3. GCP_SERVICE_ACCOUNT_EMAIL = $SERVICE_ACCOUNT_EMAIL"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found!"
    echo ""
    echo "Install it with:"
    echo "  curl -fsSL https://cli.github.com/install.sh | bash"
    echo ""
    echo "Or manually set variables at:"
    echo "  https://github.com/$REPO/settings/variables/actions"
    echo ""
    exit 1
fi

# Check if authenticated with gh
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI!"
    echo ""
    echo "Authenticate with:"
    echo "  gh auth login"
    echo ""
    exit 1
fi

# Set the variables
echo "Setting GitHub Variables..."
echo ""

# Variable 1
echo "Setting GCP_PROJECT_ID..."
gh variable set GCP_PROJECT_ID -b "$PROJECT_ID" -R "$REPO" || {
    echo "Failed to set GCP_PROJECT_ID. Try setting manually at:"
    echo "https://github.com/$REPO/settings/variables/actions"
    exit 1
}
echo "  ✓ GCP_PROJECT_ID set"

# Variable 2
echo "Setting GCP_WORKLOAD_IDENTITY_PROVIDER..."
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER -b "$WIF_PROVIDER" -R "$REPO" || {
    echo "Failed to set GCP_WORKLOAD_IDENTITY_PROVIDER. Try setting manually at:"
    echo "https://github.com/$REPO/settings/variables/actions"
    exit 1
}
echo "  ✓ GCP_WORKLOAD_IDENTITY_PROVIDER set"

# Variable 3
echo "Setting GCP_SERVICE_ACCOUNT_EMAIL..."
gh variable set GCP_SERVICE_ACCOUNT_EMAIL -b "$SERVICE_ACCOUNT_EMAIL" -R "$REPO" || {
    echo "Failed to set GCP_SERVICE_ACCOUNT_EMAIL. Try setting manually at:"
    echo "https://github.com/$REPO/settings/variables/actions"
    exit 1
}
echo "  ✓ GCP_SERVICE_ACCOUNT_EMAIL set"

echo ""
echo "=========================================="
echo "✅ All GitHub Variables Set!"
echo "=========================================="
echo ""
echo "Next step: Grant service account permissions"
echo ""
echo "Run these commands:"
echo ""
echo "gcloud iam service-accounts add-iam-policy-binding \\"
echo "  github-actions-sa@random-fuck-work.iam.gserviceaccount.com \\"
echo "  --project=random-fuck-work \\"
echo "  --role=\"roles/iam.workloadIdentityUser\" \\"
echo "  --subject=\"repo:jhderojasUVa/randomfuckwork:ref:refs/heads/main\""
echo ""
echo "gsutil iam ch \\"
echo "  serviceAccount:github-actions-sa@random-fuck-work.iam.gserviceaccount.com:objectCreator \\"
echo "  gs://randomfuckwork-test-results-dev/"
echo ""
echo "gsutil iam ch \\"
echo "  serviceAccount:github-actions-sa@random-fuck-work.iam.gserviceaccount.com:objectCreator \\"
echo "  gs://randomfuckwork-coverage-reports-dev/"
echo ""
echo "Then push to trigger the pipeline:"
echo "  git push origin main"
echo ""
