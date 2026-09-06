# GitHub Actions to GCP Integration Setup Guide

This guide explains how to configure the `test-and-publish.yml` workflow for your project. The workflow uses **Workload Identity Federation (WIF)** for secure, keyless authentication to GCP.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GCP Setup](#gcp-setup)
4. [GitHub Configuration](#github-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Cost Optimization](#cost-optimization)

---

## Overview

The workflow performs the following:

1. **Test Execution**: Runs Jest tests with coverage reporting
2. **Report Generation**: Creates JSON, JUnit XML, LCOV, and HTML reports
3. **GCP Publishing**: Uploads artifacts to Cloud Storage buckets using Workload Identity Federation
4. **Artifact Organization**: Organizes reports by branch, timestamp, and commit SHA

### Key Benefits

- ✅ **No Secrets Required**: Uses OpenID Connect (OIDC) tokens instead of service account keys
- ✅ **Short-Lived Tokens**: Access tokens expire in 1 hour (configurable)
- ✅ **Audit Trail**: All actions are logged in GCP audit logs
- ✅ **Automatic Rotation**: No manual key rotation needed
- ✅ **Best Practice**: Recommended by Google and GitHub

---

## Prerequisites

Before setting up, ensure you have:

1. **GitHub Repository Access**: Admin access to `jhderojasUVa/randomfuckwork`
2. **GCP Project**: An active GCP project with billing enabled
3. **GCP Permissions**: Editor or higher role to configure:
   - Identity and Access Management (IAM)
   - Cloud Storage buckets
   - Workload Identity Pool and Provider
4. **gcloud CLI**: Installed and authenticated locally (for setup)

---

## GCP Setup

### Step 1: Create GCS Buckets

First, create the Cloud Storage buckets where artifacts will be uploaded:

```bash
# Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"

# Create test results bucket
gsutil mb -p $GCP_PROJECT_ID \
  -l us-central1 \
  gs://randomfuckwork-test-results-dev/

# Create coverage reports bucket
gsutil mb -p $GCP_PROJECT_ID \
  -l us-central1 \
  gs://randomfuckwork-coverage-reports-dev/

# Verify buckets were created
gsutil ls
```

**Bucket Configuration Options:**

```bash
# Set lifecycle policy to delete objects after 90 days (optional)
cat > lifecycle.json << 'EOF'
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://randomfuckwork-test-results-dev/
gsutil lifecycle set lifecycle.json gs://randomfuckwork-coverage-reports-dev/

# Enable versioning (optional, for backup/recovery)
gsutil versioning set on gs://randomfuckwork-test-results-dev/
gsutil versioning set on gs://randomfuckwork-coverage-reports-dev/
```

### Step 2: Create Workload Identity Pool

The Workload Identity Pool allows GitHub to authenticate without sharing credentials.

```bash
# Create Workload Identity Pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --description="Workload Identity Pool for GitHub Actions"

# Get the pool resource name
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe \
  "github-pool" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --format="value(name)")

echo "Workload Identity Pool ID: $WORKLOAD_IDENTITY_POOL_ID"
```

### Step 3: Create Workload Identity Provider

The provider configures the GitHub OIDC token issuer.

```bash
# Create the OIDC provider for GitHub
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get the provider resource name
export WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe \
  "github-provider" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)")

echo "Workload Identity Provider: $WORKLOAD_IDENTITY_PROVIDER"
```

### Step 4: Create Service Account

The service account is what GitHub Actions will impersonate.

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions-sa \
  --project="${GCP_PROJECT_ID}" \
  --display-name="GitHub Actions Service Account" \
  --description="Service account for GitHub Actions CI/CD"

# Get the service account email
export GCP_SERVICE_ACCOUNT_EMAIL="github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

echo "Service Account Email: $GCP_SERVICE_ACCOUNT_EMAIL"
```

### Step 5: Grant Cloud Storage Permissions

Grant the service account permissions to upload to the buckets:

```bash
# Grant Storage Object Creator role to the service account
gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
  --member="serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/storage.objectCreator" \
  --condition=None

# Alternatively, use a more restrictive custom role (recommended for production)
# This allows uploading to specific buckets only

# Grant permissions per bucket (more restrictive)
gsutil iam ch serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}:objectCreator \
  gs://randomfuckwork-test-results-dev/

gsutil iam ch serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}:objectCreator \
  gs://randomfuckwork-coverage-reports-dev/
```

### Step 6: Configure Workload Identity Federation Binding

Allow the GitHub Actions workflow to impersonate the service account:

```bash
# Get your GitHub repository details
export GITHUB_REPO="jhderojasUVa/randomfuckwork"
export GITHUB_REPO_OWNER="jhderojasUVa"

# Bind the GitHub repository to the service account
gcloud iam service-accounts add-iam-policy-binding "${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --project="${GCP_PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:${GITHUB_REPO}:ref:refs/heads/main"

# Optional: Allow all branches (less secure, only recommended for dev environments)
# gcloud iam service-accounts add-iam-policy-binding "${GCP_SERVICE_ACCOUNT_EMAIL}" \
#   --project="${GCP_PROJECT_ID}" \
#   --role="roles/iam.workloadIdentityUser" \
#   --subject="repo:${GITHUB_REPO}:*"

# Verify the binding
gcloud iam service-accounts get-iam-policy "${GCP_SERVICE_ACCOUNT_EMAIL}" \
  --project="${GCP_PROJECT_ID}"
```

**Subject Syntax Reference:**

- `repo:OWNER/REPO:ref:refs/heads/BRANCH` - Specific branch
- `repo:OWNER/REPO:environment:ENVIRONMENT` - Specific environment
- `repo:OWNER/REPO:pull_request` - Pull requests only
- `repo:OWNER/REPO:ref:refs/tags/TAG` - Specific tag
- `repo:OWNER/REPO:*` - All workflows (not recommended)

---

## GitHub Configuration

### Step 1: Add Repository Variables

Go to your repository settings and add the following **Variables** (not Secrets):

**Path:** Settings > Secrets and variables > Actions > Variables

| Variable Name | Value | Example |
|---|---|---|
| `GCP_PROJECT_ID` | Your GCP project ID | `my-gcp-project-123` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Provider resource name | `projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT_EMAIL` | Service account email | `github-actions-sa@my-gcp-project-123.iam.gserviceaccount.com` |

**Note:** These are **Variables**, not Secrets, because they are non-sensitive configuration values. They don't contain any credentials or secrets.

### Step 2: Verify Workflow Configuration

The workflow file (`.github/workflows/test-and-publish.yml`) contains:

```yaml
env:
  GCP_PROJECT_ID: ${{ vars.GCP_PROJECT_ID }}
  GCP_WORKLOAD_IDENTITY_PROVIDER: ${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}
  GCP_SERVICE_ACCOUNT_EMAIL: ${{ vars.GCP_SERVICE_ACCOUNT_EMAIL }}
```

These reference the variables you just created.

### Step 3: Test the Workflow

Push a commit to the `main` branch to trigger the workflow:

```bash
git add .github/workflows/test-and-publish.yml
git commit -m "chore: add test and GCP publish workflow"
git push origin main
```

Monitor the workflow execution in: **Actions** tab of your repository

---

## Workflow Execution Details

### When the Workflow Runs

1. **On Push to main**: Runs tests and publishes artifacts
2. **On Pull Requests to main**: Runs tests only (no publishing)

### Workflow Structure

**Job 1: `test`** (Always runs)
- Installs dependencies
- Runs Jest tests with coverage
- Generates test reports in JSON, JUnit XML, and HTML formats
- Generates coverage reports in LCOV and HTML formats
- Uploads artifacts to GitHub (30-day retention)

**Job 2: `publish-to-gcp`** (Only on main branch push)
- Downloads artifacts from Job 1
- Authenticates to GCP using Workload Identity Federation
- Uploads test results to `gs://randomfuckwork-test-results-dev/`
- Uploads coverage reports to `gs://randomfuckwork-coverage-reports-dev/`
- Organizes artifacts by branch, timestamp, and commit SHA

### Artifact Organization in GCP

```
gs://randomfuckwork-test-results-dev/
├── main/
│   ├── 20231215_143022_a1b2c3d4/
│   │   ├── test-results/
│   │   │   ├── test-results.json
│   │   │   ├── junit.xml
│   │   │   └── index.html
│   │   └── coverage/
│   │       ├── index.html
│   │       ├── lcov.info
│   │       └── ...

gs://randomfuckwork-coverage-reports-dev/
├── main/
│   ├── 20231215_143022_a1b2c3d4/
│   │   └── coverage/
│   │       ├── index.html
│   │       ├── lcov.info
│   │       └── ...
```

---

## Accessing Reports

### From GitHub Actions

1. Go to **Actions** > Latest workflow run
2. Scroll to **Artifacts** section
3. Download `test-results` or `coverage-reports`

### From GCP Console

1. Go to **Cloud Storage** > Buckets
2. Click on bucket name
3. Browse folder structure by branch and timestamp
4. Click on `index.html` for quick links to reports

### Direct GCS URLs

```bash
# Test results
https://storage.googleapis.com/randomfuckwork-test-results-dev/main/20231215_143022_a1b2c3d4/test-results/index.html

# Coverage reports
https://storage.googleapis.com/randomfuckwork-coverage-reports-dev/main/20231215_143022_a1b2c3d4/coverage/index.html
```

---

## Troubleshooting

### Common Issues

#### 1. Workload Identity Federation Error

**Error:**
```
Error: invalid_grant: Invalid audience claim
```

**Solution:**
- Verify the `WORKLOAD_IDENTITY_PROVIDER` variable is set correctly
- Ensure the GitHub repository name matches the subject in the IAM binding
- Check that the repository is public or the GitHub Actions are enabled

#### 2. GCS Permission Denied

**Error:**
```
403 Forbidden: Access denied to bucket
```

**Solution:**
- Verify the service account has `roles/storage.objectCreator` role
- Check that the service account email is correct
- Ensure bucket lifecycle policies don't prevent uploads

#### 3. Workflow Not Publishing Artifacts

**Reason:** `publish-to-gcp` job only runs on main branch pushes

**Solution:**
- Make sure you're pushing to the `main` branch, not `master` or other branches
- Check that the branch protection rules allow the push
- Verify `github.event_name == 'push'` in the job condition

#### 4. Missing Coverage Report

**Error:**
```
coverage/: No such file or directory
```

**Reason:** Tests may have failed before coverage generation

**Solution:**
- Check test logs in the workflow
- Ensure all dependencies are installed correctly
- Run tests locally: `CI=true yarn test --coverage`

#### 5. Timeout During GCP Upload

**Error:**
```
Timeout waiting for GCS response
```

**Solution:**
- Check network connectivity
- Verify bucket exists and is accessible
- Try uploading smaller files first
- Increase upload timeout in workflow

### Debug Steps

1. **Check Workflow Logs:**
   - Go to Actions tab
   - Click workflow run
   - Expand each step to see detailed logs

2. **Verify GCP Resources:**
   ```bash
   # Check service account exists
   gcloud iam service-accounts describe github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com
   
   # Check IAM bindings
   gcloud iam service-accounts get-iam-policy github-actions-sa@${GCP_PROJECT_ID}.iam.gserviceaccount.com
   
   # Check bucket exists and permissions
   gsutil ls gs://randomfuckwork-test-results-dev/
   gsutil iam get gs://randomfuckwork-test-results-dev/
   ```

3. **Test Locally:**
   ```bash
   # Install gcloud CLI
   # Authenticate
   gcloud auth application-default login
   
   # Test upload
   echo "test" > test.txt
   gsutil cp test.txt gs://randomfuckwork-test-results-dev/test.txt
   
   # Verify
   gsutil ls gs://randomfuckwork-test-results-dev/
   ```

---

## Cost Optimization

### Reducing GCP Costs

1. **Set Bucket Lifecycle Policies** (Delete old artifacts):
   ```bash
   # Delete artifacts older than 90 days
   gsutil lifecycle set lifecycle.json gs://randomfuckwork-test-results-dev/
   ```

2. **Use Cloud Storage Nearline** (Cheaper for infrequent access):
   ```bash
   gsutil mb -c nearline gs://randomfuckwork-test-results-dev/
   ```

3. **Enable Autoclass** (Automatically move to cheaper storage):
   ```bash
   gsutil autoclass set on gs://randomfuckwork-test-results-dev/
   ```

4. **Archive Old Artifacts** (Use Cloud Archive):
   - Archive to Cloud Archive Storage after 30 days
   - Retrieve only when needed

### Cost Estimate

For a typical project with:
- 50 test runs/month
- ~2 MB per test results
- ~5 MB per coverage report
- 90-day retention

**Estimated monthly cost:** < $1 USD

See [GCS Pricing](https://cloud.google.com/storage/pricing) for details.

---

## Production Considerations

### Security Best Practices

1. ✅ **Use Workload Identity Federation** (No stored credentials)
2. ✅ **Restrict to Specific Branches** (Only main in our case)
3. ✅ **Use Minimal IAM Permissions** (Storage Object Creator only)
4. ✅ **Enable Bucket Versioning** (For accidental deletion recovery)
5. ✅ **Set Access Logs** (For audit trails)
6. ✅ **Make Buckets Private** (predefinedAcl: private in workflow)
7. ✅ **Use Separate Buckets** (Test results and coverage separate)

### Monitoring and Alerting

Set up GCP alerts:

```bash
# Create alert policy for failed uploads (via Cloud Monitoring console)
# Create alert policy for quota issues (via Cloud Billing console)
# Create alert policy for high storage costs (via Cost Management)
```

---

## Additional Resources

- [Workload Identity Federation Setup](https://github.com/google-github-actions/auth#workload-identity-federation)
- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Coverage Documentation](https://jestjs.io/docs/cli#--coverage)
