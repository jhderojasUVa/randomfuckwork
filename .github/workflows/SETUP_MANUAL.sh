#!/bin/bash

################################################################################
# Manual GCP Setup - Step by Step
# Run these commands one at a time if the automated script fails
################################################################################

PROJECT_ID="random-fuck-work"

echo "Running manual GCP setup for project: $PROJECT_ID"
echo ""

# Step 1: Verify project
echo "Step 1: Verifying project..."
gcloud config set project $PROJECT_ID
gcloud projects describe $PROJECT_ID
echo "✓ Project verified"
echo ""

# Step 2: Create buckets
echo "Step 2: Creating GCS buckets..."
gsutil mb -p $PROJECT_ID -l us-central1 gs://randomfuckwork-test-results-dev/ 2>/dev/null || echo "  (bucket already exists)"
gsutil mb -p $PROJECT_ID -l us-central1 gs://randomfuckwork-coverage-reports-dev/ 2>/dev/null || echo "  (bucket already exists)"
echo "✓ Buckets ready"
echo ""

# Step 3: Create Workload Identity Pool
echo "Step 3: Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create github-pool \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions" 2>/dev/null || echo "  (pool already exists)"
echo "✓ Pool ready"
echo ""

# Step 4: Create provider - WITH MINIMAL CONFIGURATION
echo "Step 4: Creating OIDC Provider..."
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com" 2>/dev/null || echo "  (provider already exists)"
echo "✓ Provider ready"
echo ""

# Step 5: Create service account
echo "Step 5: Creating Service Account..."
gcloud iam service-accounts create github-actions-sa \
  --project=$PROJECT_ID \
  --display-name="GitHub Actions" 2>/dev/null || echo "  (service account already exists)"
echo "✓ Service Account ready"
echo ""

# Step 6: Grant permissions
echo "Step 6: Granting storage permissions..."
gsutil iam ch serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com:objectCreator gs://randomfuckwork-test-results-dev/ 2>/dev/null || true
gsutil iam ch serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com:objectCreator gs://randomfuckwork-coverage-reports-dev/ 2>/dev/null || true
echo "✓ Permissions granted"
echo ""

# Step 7: Bind service account to GitHub
echo "Step 7: Binding GitHub to service account..."
gcloud iam service-accounts add-iam-policy-binding github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:jhderojasUVa/randomfuckwork:ref:refs/heads/main" 2>/dev/null || true
echo "✓ Binding complete"
echo ""

# Step 8: Output values
echo "================================"
echo "✓ Setup Complete!"
echo "================================"
echo ""
echo "Add these to GitHub Repository Variables:"
echo ""
echo "1. GCP_PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "2. GCP_WORKLOAD_IDENTITY_PROVIDER"
WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe github-provider \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)")
echo "   Value: $WIF_PROVIDER"
echo ""
echo "3. GCP_SERVICE_ACCOUNT_EMAIL"
echo "   Value: github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
