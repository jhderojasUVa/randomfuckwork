#!/bin/bash

# FINAL FIX: Delete and Recreate WIF Pool
# Copy and paste these commands one at a time into your terminal

echo "Step 1: Delete the existing pool"
gcloud iam workload-identity-pools delete github-pool \
  --project=random-fuck-work \
  --location=global \
  --quiet

echo ""
echo "Step 2: Wait 10 seconds for cleanup"
sleep 10

echo ""
echo "Step 3: Create fresh pool"
gcloud iam workload-identity-pools create github-pool \
  --project=random-fuck-work \
  --location=global \
  --display-name="GitHub Actions Pool"

echo ""
echo "Step 4: Create OIDC provider"
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"

echo ""
echo "Step 5: Create service account"
gcloud iam service-accounts create github-actions-sa \
  --project=random-fuck-work \
  --display-name="GitHub Actions" 2>/dev/null || echo "Service account already exists (ok)"

echo ""
echo "Step 6: Bind GitHub repo to service account"
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-sa@random-fuck-work.iam.gserviceaccount.com \
  --project=random-fuck-work \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:jhderojasUVa/randomfuckwork:ref:refs/heads/main" \
  --quiet

echo ""
echo "Step 7: Grant permissions for test results bucket"
gsutil iam ch \
  serviceAccount:github-actions-sa@random-fuck-work.iam.gserviceaccount.com:objectCreator \
  gs://randomfuckwork-test-results-dev/

echo ""
echo "Step 8: Grant permissions for coverage reports bucket"
gsutil iam ch \
  serviceAccount:github-actions-sa@random-fuck-work.iam.gserviceaccount.com:objectCreator \
  gs://randomfuckwork-coverage-reports-dev/

echo ""
echo "Step 9: Get the provider resource name (needed for GitHub)"
echo ""
gcloud iam workload-identity-pools providers describe github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)"

echo ""
echo "=============================================="
echo "✅ SUCCESS! Copy the value above"
echo "=============================================="
echo ""
echo "You now have all 3 values:"
echo ""
echo "1. GCP_PROJECT_ID = random-fuck-work"
echo ""
echo "2. GCP_WORKLOAD_IDENTITY_PROVIDER = (the value above)"
echo ""
echo "3. GCP_SERVICE_ACCOUNT_EMAIL = github-actions-sa@random-fuck-work.iam.gserviceaccount.com"
echo ""
echo "Next: Add these to GitHub Variables at:"
echo "https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions"
echo ""
