#!/bin/bash
set -e

PROJECT="random-fuck-work"
POOL="github-pool"
PROVIDER="github-provider"
SERVICE_ACCOUNT="github-actions-sa"
REPO="jhderojasUVa/randomfuckwork"

echo "🔧 Setting up GCP Workload Identity..."

# Delete old pool (ignore errors)
gcloud iam workload-identity-pools delete $POOL \
  --project=$PROJECT \
  --location=global \
  --quiet 2>/dev/null || true

sleep 3

# Create pool
gcloud iam workload-identity-pools create $POOL \
  --project=$PROJECT \
  --location=global \
  --display-name="GitHub Pool"

# Create provider
gcloud iam workload-identity-pools providers create-oidc $PROVIDER \
  --project=$PROJECT \
  --location=global \
  --workload-identity-pool=$POOL \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT \
  --project=$PROJECT \
  --display-name="GitHub Actions" 2>/dev/null || true

# Bind service account
PRINCIPAL="principalSet://iam.googleapis.com/projects/$(gcloud config get-value project --quiet | xargs gcloud projects describe --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL/attribute.repository/$REPO"

gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT@$PROJECT.iam.gserviceaccount.com \
  --project=$PROJECT \
  --role=roles/iam.workloadIdentityUser \
  --principal="$PRINCIPAL"

# Create buckets
gcloud storage buckets create gs://randomfuckwork-test-results-dev --project=$PROJECT 2>/dev/null || true
gcloud storage buckets create gs://randomfuckwork-coverage-reports-dev --project=$PROJECT 2>/dev/null || true

# Grant permissions
gcloud storage buckets add-iam-policy-binding gs://randomfuckwork-test-results-dev \
  --member=serviceAccount:$SERVICE_ACCOUNT@$PROJECT.iam.gserviceaccount.com \
  --role=roles/storage.objectCreator

gcloud storage buckets add-iam-policy-binding gs://randomfuckwork-coverage-reports-dev \
  --member=serviceAccount:$SERVICE_ACCOUNT@$PROJECT.iam.gserviceaccount.com \
  --role=roles/storage.objectCreator

# Get provider resource name
PROVIDER_NAME=$(gcloud iam workload-identity-pools providers describe $PROVIDER \
  --project=$PROJECT \
  --location=global \
  --workload-identity-pool=$POOL \
  --format='value(name)')

echo ""
echo "✅ DONE! Copy these 3 values to GitHub:"
echo ""
echo "GCP_PROJECT_ID:"
echo "$PROJECT"
echo ""
echo "GCP_WORKLOAD_IDENTITY_PROVIDER:"
echo "$PROVIDER_NAME"
echo ""
echo "GCP_SERVICE_ACCOUNT_EMAIL:"
echo "$SERVICE_ACCOUNT@$PROJECT.iam.gserviceaccount.com"
echo ""
