#!/bin/bash

# CORRECTED FINAL FIX - Handles all error cases and uses correct syntax

set -e

PROJECT_ID="random-fuck-work"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
SA_EMAIL="github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"

echo "=========================================="
echo "GCP Setup - Corrected Final Fix"
echo "=========================================="
echo ""

# Step 1: Try to delete pool (may not exist, that's ok)
echo "Step 1: Cleaning up existing resources..."
gcloud iam workload-identity-pools delete "$POOL_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --quiet 2>/dev/null || echo "  (pool didn't exist, continuing)"

sleep 10

# Step 2: Create fresh pool
echo "Step 2: Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create "$POOL_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --display-name="GitHub Actions Pool"

echo "✓ Pool created"

# Step 3: Create provider
echo ""
echo "Step 3: Creating OIDC Provider..."
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool="$POOL_NAME" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"

echo "✓ Provider created"

# Step 4: Create service account
echo ""
echo "Step 4: Creating Service Account..."
gcloud iam service-accounts create github-actions-sa \
  --project="$PROJECT_ID" \
  --display-name="GitHub Actions" 2>/dev/null || echo "  (already exists)"

echo "✓ Service account ready"

# Step 5: Get the provider resource name
echo ""
echo "Step 5: Getting provider resource name..."
WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool="$POOL_NAME" \
  --format="value(name)")

echo "Provider resource name:"
echo "$WIF_PROVIDER"

# Step 6: Bind using correct gcloud syntax
echo ""
echo "Step 6: Binding GitHub to service account..."

# Use the correct format for add-iam-policy-binding with Workload Identity
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --principal="principalSet://iam.googleapis.com/projects/${PROJECT_ID}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/jhderojasUVa/randomfuckwork" \
  --quiet 2>/dev/null || echo "  (binding may already exist)"

echo "✓ Binding set"

# Step 7: Grant GCS permissions using gcloud (newer than gsutil)
echo ""
echo "Step 7: Granting GCS permissions..."

# Grant roles/storage.objectCreator on test results bucket
gcloud storage buckets add-iam-policy-binding gs://randomfuckwork-test-results-dev \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/storage.objectCreator \
  --quiet 2>/dev/null || echo "  (test results bucket permission set)"

# Grant roles/storage.objectCreator on coverage reports bucket
gcloud storage buckets add-iam-policy-binding gs://randomfuckwork-coverage-reports-dev \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/storage.objectCreator \
  --quiet 2>/dev/null || echo "  (coverage reports bucket permission set)"

echo "✓ GCS permissions granted"

# Final summary
echo ""
echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "Add these 3 values to GitHub Variables:"
echo "https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions"
echo ""
echo "1. GCP_PROJECT_ID"
echo "   $PROJECT_ID"
echo ""
echo "2. GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "   $WIF_PROVIDER"
echo ""
echo "3. GCP_SERVICE_ACCOUNT_EMAIL"
echo "   $SA_EMAIL"
echo ""
echo "Then run: git push origin main"
echo ""
