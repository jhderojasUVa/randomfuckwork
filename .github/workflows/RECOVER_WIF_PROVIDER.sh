#!/bin/bash

# WIF Provider Recovery Script
# Diagnoses and fixes corrupted Workload Identity Provider state

set -e

PROJECT_ID="random-fuck-work"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"

echo "=========================================="
echo "WIF Provider Recovery Tool"
echo "=========================================="
echo ""

# ============================================================================
# STEP 1: Delete existing pool (and any provider it contains)
# ============================================================================
echo "Step 1: Cleaning up existing pool..."
echo ""

# Check if pool exists and delete it
if gcloud iam workload-identity-pools describe "$POOL_NAME" \
    --project="$PROJECT_ID" \
    --location=global &>/dev/null; then
    echo "  ⚠ Existing pool found - deleting for fresh start..."
    gcloud iam workload-identity-pools delete "$POOL_NAME" \
      --project="$PROJECT_ID" \
      --location=global \
      --quiet
    echo "  ✓ Pool deleted"
    echo ""
    echo "Step 2: Waiting for cleanup to propagate..."
    sleep 10
    echo "  ✓ Cleanup complete"
else
    echo "  ℹ No existing pool found"
fi

# ============================================================================
# STEP 2: Delete and recreate the entire pool (fresh start)
# ============================================================================
echo ""
echo "Step 3: Creating fresh Workload Identity Pool..."

gcloud iam workload-identity-pools create "$POOL_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --display-name="GitHub Actions Pool"

echo "  ✓ Pool created"

# ============================================================================
# STEP 3: Create provider with minimal configuration
# ============================================================================
echo ""
echo "Step 4: Creating OIDC Provider with minimal config..."

# The key insight: use --attribute-mapping with ONLY valid GitHub OIDC claims
# Valid claims from GitHub: sub, repository, repository_owner, ref, sha, run_id, etc.
# We use only: google.subject=assertion.sub (minimal required for WIF to work)

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool="$POOL_NAME" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"

echo "  ✓ Provider created"

# ============================================================================
# STEP 4: Verify it worked
# ============================================================================
echo ""
echo "Step 5: Verifying provider configuration..."

gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool="$POOL_NAME"

echo ""
echo "✅ Provider creation successful!"
echo ""

# ============================================================================
# STEP 5: Show the value needed for GitHub
# ============================================================================
echo "=========================================="
echo "Configuration Value for GitHub:"
echo "=========================================="
echo ""

WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --project="$PROJECT_ID" \
  --location=global \
  --workload-identity-pool="$POOL_NAME" \
  --format="value(name)")

echo "GCP_WORKLOAD_IDENTITY_PROVIDER:"
echo "$WIF_PROVIDER"
echo ""

# ============================================================================
# Continue with remaining setup
# ============================================================================
echo "=========================================="
echo "Completing Setup..."
echo "=========================================="
echo ""

echo "Step 6: Creating service account..."
gcloud iam service-accounts create github-actions-sa \
  --project="$PROJECT_ID" \
  --display-name="GitHub Actions" 2>/dev/null || echo "  (already exists)"

echo "  ✓ Service account ready"

echo ""
echo "Step 7: Binding GitHub to service account..."
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:jhderojasUVa/randomfuckwork:ref:refs/heads/main" \
  --quiet 2>/dev/null

echo "  ✓ Binding complete"

echo ""
echo "Step 8: Granting GCS permissions..."
gsutil iam ch \
  "serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com:objectCreator" \
  "gs://randomfuckwork-test-results-dev/" 2>/dev/null

gsutil iam ch \
  "serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com:objectCreator" \
  "gs://randomfuckwork-coverage-reports-dev/" 2>/dev/null

echo "  ✓ GCS permissions granted"

# ============================================================================
# Final summary
# ============================================================================
echo ""
echo "=========================================="
echo "✅ All Setup Complete!"
echo "=========================================="
echo ""
echo "Add these 3 variables to GitHub:"
echo "https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions"
echo ""
echo "1. GCP_PROJECT_ID = random-fuck-work"
echo ""
echo "2. GCP_WORKLOAD_IDENTITY_PROVIDER = $WIF_PROVIDER"
echo ""
echo "3. GCP_SERVICE_ACCOUNT_EMAIL = github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
echo "Then trigger the pipeline:"
echo "  git push origin main"
echo ""
