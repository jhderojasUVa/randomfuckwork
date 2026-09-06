#!/bin/bash

# Simple script to set GitHub Variables using gh CLI
# Usage: bash set-github-vars.sh

PROJECT_ID="random-fuck-work"
PROVIDER="projects/605371248588/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
SERVICE_ACCOUNT="github-actions-sa@random-fuck-work.iam.gserviceaccount.com"

echo "Setting GitHub Variables..."

gh variable set GCP_PROJECT_ID --body "$PROJECT_ID"
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --body "$PROVIDER"
gh variable set GCP_SERVICE_ACCOUNT_EMAIL --body "$SERVICE_ACCOUNT"

echo "✅ Variables set!"
echo ""
echo "Verify at: https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions"
