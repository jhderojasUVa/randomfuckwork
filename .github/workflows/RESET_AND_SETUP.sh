#!/bin/bash

PROJECT_ID="random-fuck-work"

echo "=== COMPLETE RESET & FRESH SETUP ==="
echo ""
echo "Step 1: Deleting existing pool (this will delete provider too)..."
gcloud iam workload-identity-pools delete github-pool \
  --project=$PROJECT_ID \
  --location=global \
  --quiet 2>/dev/null || echo "  (pool doesn't exist, that's ok)"

echo ""
echo "Step 2: Waiting 5 seconds for deletion to complete..."
sleep 5

echo ""
echo "Step 3: Creating fresh Workload Identity Pool..."
gcloud iam workload-identity-pools create github-pool \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions Pool"

echo ""
echo "Step 4: Creating OIDC Provider with minimal config..."
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"

echo ""
echo "Step 5: Verifying provider..."
gcloud iam workload-identity-pools providers describe github-provider \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool

echo ""
echo "✓ Provider created successfully!"
echo ""
echo "Step 6: Creating service account..."
gcloud iam service-accounts create github-actions-sa \
  --project=$PROJECT_ID \
  --display-name="GitHub Actions" 2>/dev/null || echo "  (already exists)"

echo ""
echo "Step 7: Granting permissions..."
gsutil iam ch serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com:objectCreator gs://randomfuckwork-test-results-dev/
gsutil iam ch serviceAccount:github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com:objectCreator gs://randomfuckwork-coverage-reports-dev/

echo ""
echo "Step 8: Binding to GitHub repo..."
gcloud iam service-accounts add-iam-policy-binding github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:jhderojasUVa/randomfuckwork:ref:refs/heads/main"

echo ""
echo "=== SETUP COMPLETE ==="
echo ""
WIF=$(gcloud iam workload-identity-pools providers describe github-provider \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)")

echo "Add to GitHub Variables:"
echo ""
echo "GCP_PROJECT_ID = $PROJECT_ID"
echo ""
echo "GCP_WORKLOAD_IDENTITY_PROVIDER = $WIF"
echo ""
echo "GCP_SERVICE_ACCOUNT_EMAIL = github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
