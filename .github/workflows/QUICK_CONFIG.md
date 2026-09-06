# Quick Configuration Reference

This file provides a quick reference for configuring the GitHub Actions workflow with GCP Workload Identity Federation.

## TL;DR - 5-Step Setup

### Step 1: Create GCS Buckets

```bash
export GCP_PROJECT_ID="your-project-id"

gsutil mb -p $GCP_PROJECT_ID -l us-central1 gs://randomfuckwork-test-results-dev/
gsutil mb -p $GCP_PROJECT_ID -l us-central1 gs://randomfuckwork-coverage-reports-dev/
```

### Step 2: Create Workload Identity Pool & Provider

```bash
# Pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get Provider ID
gcloud iam workload-identity-pools providers describe github-provider \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"
```

### Step 3: Create Service Account & Grant Permissions

```bash
# Service Account
gcloud iam service-accounts create github-actions-sa \
  --project="${GCP_PROJECT_ID}" \
  --display-name="GitHub Actions Service Account"

export GCP_SERVICE_ACCOUNT_EMAIL="github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

# Permissions to buckets
gsutil iam ch serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}:objectCreator \
  gs://randomfuckwork-test-results-dev/

gsutil iam ch serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}:objectCreator \
  gs://randomfuckwork-coverage-reports-dev/
```

### Step 4: Configure Workload Identity Binding

```bash
export GITHUB_REPO="jhderojasUVa/randomfuckwork"

# Allow GitHub repo to impersonate service account
gcloud iam service-accounts add-iam-policy-binding "${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --project="${GCP_PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:${GITHUB_REPO}:ref:refs/heads/main"
```

### Step 5: Add GitHub Repository Variables

**Path:** Repository Settings > Secrets and variables > Actions > Variables

| Variable | Value Command |
|----------|---|
| `GCP_PROJECT_ID` | `echo $GCP_PROJECT_ID` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | See Step 2 output |
| `GCP_SERVICE_ACCOUNT_EMAIL` | `echo $GCP_SERVICE_ACCOUNT_EMAIL` |

---

## Verification Checklist

- [ ] GCS buckets created and accessible
- [ ] Workload Identity Pool created
- [ ] OIDC Provider configured
- [ ] Service account created
- [ ] Service account has Storage Object Creator role
- [ ] Workload Identity binding configured for main branch
- [ ] GitHub variables set in repository
- [ ] Workflow file present in `.github/workflows/test-and-publish.yml`
- [ ] Push commit to main branch to test

---

## Commands to Get Required Values

Use these commands to retrieve values needed for GitHub variables:

```bash
# Set these first
export GCP_PROJECT_ID="your-gcp-project-id"

# Get Workload Identity Provider ID
gcloud iam workload-identity-pools providers describe github-provider \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"

# Get Service Account Email
echo "github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
```

---

## Useful One-Liner Scripts

### Setup Everything at Once

```bash
#!/bin/bash
set -e

# Configuration
export GCP_PROJECT_ID="your-gcp-project-id"
export GITHUB_REPO="jhderojasUVa/randomfuckwork"

echo "Creating buckets..."
gsutil mb -p $GCP_PROJECT_ID -l us-central1 gs://randomfuckwork-test-results-dev/ || true
gsutil mb -p $GCP_PROJECT_ID -l us-central1 gs://randomfuckwork-coverage-reports-dev/ || true

echo "Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create "github-pool" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool" 2>/dev/null || true

echo "Creating OIDC Provider..."
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com" 2>/dev/null || true

echo "Creating Service Account..."
gcloud iam service-accounts create github-actions-sa \
  --project="${GCP_PROJECT_ID}" \
  --display-name="GitHub Actions Service Account" 2>/dev/null || true

export GCP_SERVICE_ACCOUNT_EMAIL="github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

echo "Granting permissions..."
gsutil iam ch serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}:objectCreator \
  gs://randomfuckwork-test-results-dev/
gsutil iam ch serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}:objectCreator \
  gs://randomfuckwork-coverage-reports-dev/

echo "Setting up Workload Identity Binding..."
gcloud iam service-accounts add-iam-policy-binding "${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --project="${GCP_PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:${GITHUB_REPO}:ref:refs/heads/main"

echo "Getting configuration values for GitHub variables..."
export WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe github-provider \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)")

echo ""
echo "✅ Setup Complete! Use these values for GitHub repository variables:"
echo ""
echo "GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo "GCP_WORKLOAD_IDENTITY_PROVIDER: $WORKLOAD_IDENTITY_PROVIDER"
echo "GCP_SERVICE_ACCOUNT_EMAIL: $GCP_SERVICE_ACCOUNT_EMAIL"
echo ""
```

### Test Workflow Locally

```bash
# Run tests locally (same as workflow)
CI=true yarn test --coverage --watchAll=false --json --jsonOutputFile=test-reports/test-results.json

# Check test results
cat test-reports/test-results.json | jq '.numPassedTests, .numFailedTests'
```

### Verify GCP Setup

```bash
#!/bin/bash
export GCP_PROJECT_ID="your-gcp-project-id"
export GCP_SERVICE_ACCOUNT_EMAIL="github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

echo "Checking GCS buckets..."
gsutil ls | grep randomfuckwork

echo "Checking Workload Identity Pool..."
gcloud iam workload-identity-pools list --location=global --project="${GCP_PROJECT_ID}" | grep github-pool

echo "Checking Service Account..."
gcloud iam service-accounts list --filter="email:github-actions-sa" --project="${GCP_PROJECT_ID}"

echo "Checking IAM bindings..."
gcloud iam service-accounts get-iam-policy "${GCP_SERVICE_ACCOUNT_EMAIL}" --project="${GCP_PROJECT_ID}"

echo ""
echo "✅ Verification complete!"
```

---

## Troubleshooting Commands

### Test GCS Access

```bash
# Test write access to buckets
echo "test" > test.txt
gsutil cp test.txt gs://randomfuckwork-test-results-dev/test.txt
gsutil ls gs://randomfuckwork-test-results-dev/test.txt

# Clean up
gsutil rm gs://randomfuckwork-test-results-dev/test.txt
```

### Check Service Account Permissions

```bash
export GCP_PROJECT_ID="your-gcp-project-id"
export GCP_SERVICE_ACCOUNT_EMAIL="github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

# List all roles for service account
gcloud projects get-iam-policy "${GCP_PROJECT_ID}" \
  --flatten="bindings[].members" \
  --filter="bindings.members:${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --format="table(bindings.role)"

# Check bucket-specific permissions
gsutil iam get gs://randomfuckwork-test-results-dev/
```

### View Workflow Logs

```bash
# Get latest workflow run
gh run list --repo jhderojasUVa/randomfuckwork --limit 1

# Get logs from specific run
gh run view <RUN_ID> --repo jhderojasUVa/randomfuckwork --log
```

---

## Environment Variables in Workflow

The workflow uses these environment variables (configured in repository settings):

```yaml
env:
  GCP_PROJECT_ID: ${{ vars.GCP_PROJECT_ID }}                           # Your GCP project ID
  GCP_WORKLOAD_IDENTITY_PROVIDER: ${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}  # WIF provider resource name
  GCP_SERVICE_ACCOUNT_EMAIL: ${{ vars.GCP_SERVICE_ACCOUNT_EMAIL }}   # Service account email
  GCP_TEST_RESULTS_BUCKET: gs://randomfuckwork-test-results-dev      # Can be customized
  GCP_COVERAGE_REPORTS_BUCKET: gs://randomfuckwork-coverage-reports-dev  # Can be customized
  NODE_VERSION: 18                                                     # Node version to use
```

---

## Customization Options

### Change Bucket Names

Edit `.github/workflows/test-and-publish.yml`:

```yaml
env:
  GCP_TEST_RESULTS_BUCKET: gs://my-custom-bucket-test
  GCP_COVERAGE_REPORTS_BUCKET: gs://my-custom-bucket-coverage
```

### Change Node Version

Edit `.github/workflows/test-and-publish.yml`:

```yaml
env:
  NODE_VERSION: 20  # Change to 18, 19, 20, etc.
```

### Change Artifact Retention

Edit `.github/workflows/test-and-publish.yml`:

```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 60  # Change from 30 to desired value
```

### Allow Multiple Branches

Modify the service account binding:

```bash
# Allow all branches (less secure)
gcloud iam service-accounts add-iam-policy-binding "${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --project="${GCP_PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:${GITHUB_REPO}:*"
```

---

## Related Documentation

- Full Setup Guide: `GCP_SETUP_GUIDE.md`
- Workflow File: `.github/workflows/test-and-publish.yml`
- GitHub Actions: https://docs.github.com/en/actions
- Workload Identity Federation: https://cloud.google.com/docs/authentication/workload-identity-federation
- GCS Python Client: https://cloud.google.com/python/docs/reference/storage
