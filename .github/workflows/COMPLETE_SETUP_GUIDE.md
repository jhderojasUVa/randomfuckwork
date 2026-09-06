# Complete CI/CD Pipeline Setup Guide

This guide walks you through completing the GCP setup and activating your CI/CD pipeline.

## Prerequisites

- GitHub account with admin access to jhderojasUVa/randomfuckwork
- GCP account with Owner or Editor role in project `random-fuck-work`
- WSL2 with Linux distribution installed (you're already using this)

## Step 1: Install WSL-Native Google Cloud SDK (CRITICAL)

The Windows gcloud doesn't work in WSL. You **MUST** install the WSL-native version:

```bash
# Add Google Cloud SDK repository
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Update package list
sudo apt-get update

# Install Google Cloud SDK
sudo apt-get install -y google-cloud-sdk

# Initialize gcloud
gcloud init
```

During `gcloud init`:
1. Choose `Y` for logging in
2. Browser opens - log in with your GCP account
3. Choose project: `random-fuck-work`
4. Configure default region/zone (doesn't matter, press Enter)

Verify installation:
```bash
gcloud --version
gcloud config list
```

## Step 2: Create the OIDC Provider

Run this command in your WSL terminal:

```bash
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

**Expected output:**
```
Created provider github-provider in pool github-pool
```

If you get an error about the provider already existing, that's OK - continue to Step 3.

If you get an error about invalid attribute condition, the pool needs to be reset. Run:
```bash
# Delete old pool (will also delete provider)
gcloud iam workload-identity-pools delete github-pool \
  --project=random-fuck-work \
  --location=global \
  --quiet

# Wait for deletion
sleep 5

# Create fresh pool
gcloud iam workload-identity-pools create github-pool \
  --project=random-fuck-work \
  --location=global \
  --display-name="GitHub Actions Pool"

# Try creating provider again
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

## Step 3: Get the 3 Values You Need

Run these commands and copy the output:

```bash
# Value 1 - GCP Project ID
echo "GCP_PROJECT_ID="
echo "random-fuck-work"
echo ""

# Value 2 - Workload Identity Provider (full resource name)
echo "GCP_WORKLOAD_IDENTITY_PROVIDER="
gcloud iam workload-identity-pools providers describe github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool \
  --format="value(name)"
echo ""

# Value 3 - Service Account Email
echo "GCP_SERVICE_ACCOUNT_EMAIL="
echo "github-actions-sa@random-fuck-work.iam.gserviceaccount.com"
```

You should see output like:
```
GCP_PROJECT_ID=
random-fuck-work

GCP_WORKLOAD_IDENTITY_PROVIDER=
projects/605371248588/locations/global/workloadIdentityPools/github-pool/providers/github-provider

GCP_SERVICE_ACCOUNT_EMAIL=
github-actions-sa@random-fuck-work.iam.gserviceaccount.com
```

**Save these 3 values** - you'll need them in Step 4.

## Step 4: Set GitHub Repository Variables

1. Go to: https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions

2. Click **"New repository variable"**

3. Add the 3 variables:

   **Variable 1:**
   - Name: `GCP_PROJECT_ID`
   - Value: `random-fuck-work`

   **Variable 2:**
   - Name: `GCP_WORKLOAD_IDENTITY_PROVIDER`
   - Value: (paste the full value from Step 3)

   **Variable 3:**
   - Name: `GCP_SERVICE_ACCOUNT_EMAIL`
   - Value: `github-actions-sa@random-fuck-work.iam.gserviceaccount.com`

Verify all 3 are visible in the Actions variables list.

## Step 5: Grant Service Account Permissions

These commands bind the service account to GitHub and grant GCS permissions:

```bash
# Bind service account to GitHub repo (allows GitHub to authenticate as service account)
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-sa@random-fuck-work.iam.gserviceaccount.com \
  --project=random-fuck-work \
  --role="roles/iam.workloadIdentityUser" \
  --subject="repo:jhderojasUVa/randomfuckwork:ref:refs/heads/main"

# Grant storage object creator role on test results bucket
gsutil iam ch \
  serviceAccount:github-actions-sa@random-fuck-work.iam.gserviceaccount.com:objectCreator \
  gs://randomfuckwork-test-results-dev/

# Grant storage object creator role on coverage reports bucket  
gsutil iam ch \
  serviceAccount:github-actions-sa@random-fuck-work.iam.gserviceaccount.com:objectCreator \
  gs://randomfuckwork-coverage-reports-dev/
```

Expected output: `Updated IAM policy for...`

## Step 6: Trigger the Pipeline

Push to the main branch:

```bash
cd /Projects/randomfuckwork
git add .
git commit -m "chore: GCP setup complete" || echo "Nothing to commit"
git push origin main
```

## Step 7: Monitor the Pipeline

1. Go to: https://github.com/jhderojasUVa/randomfuckwork/actions

2. You should see a new workflow run (the push you just made)

3. Wait for the "Test & Publish to GCP" workflow:
   - **Test job**: ~5-10 minutes (runs Jest, generates reports)
   - **Publish job**: ~2-3 minutes (uploads to GCS)

4. Check for success:
   - Both jobs should show ✓ green checkmarks
   - Artifacts section should show uploaded reports
   - GCS buckets should have new files

## Verification

After the workflow completes successfully, verify everything:

### Check GitHub Actions Artifacts
1. Go to workflow run
2. Click **"Artifacts"** section
3. Should see 4 report files:
   - `test-results.json`
   - `test-results.xml`
   - `test-results.html`
   - `coverage-report.lcov`

### Check GCS Buckets
```bash
# List test results bucket
gsutil ls -r gs://randomfuckwork-test-results-dev/

# List coverage reports bucket
gsutil ls -r gs://randomfuckwork-coverage-reports-dev/
```

Both should have new files from the latest run.

## Troubleshooting

### Error: "Provider already exists"
This is OK - it means the provider was created in a previous attempt. Continue to Step 3.

### Error: "Attribute condition must reference provider's claims"
The workload identity pool is in a bad state. Run the pool reset commands from Step 2.

### Error: "PERMISSION_DENIED" when publishing to GCS
The service account permissions weren't granted properly. Re-run all commands in Step 5.

### Workflow fails at "Authenticate to Google Cloud"
- Check that all 3 GitHub variables are set correctly
- Verify the service account binding from Step 5 succeeded
- Check GCP IAM roles are properly assigned

### Still Having Issues?

If you're still stuck, try:
1. Check gcloud is WSL-native: `which gcloud` should NOT contain `/mnt/c/`
2. Verify service account exists: `gcloud iam service-accounts list --project=random-fuck-work`
3. Verify WIF provider exists: `gcloud iam workload-identity-pools providers list --project=random-fuck-work --workload-identity-pool=github-pool`
4. Check GCS buckets exist: `gsutil ls`

---

**Expected Timeline**: 10-15 minutes to complete all steps

**Questions?** Check the individual documentation files in `.github/workflows/`:
- `GCP_SETUP_GUIDE.md` - Detailed GCP configuration reference
- `WSL_SETUP_GUIDE.md` - WSL gcloud installation options
- `JEST_CONFIGURATION.md` - Test configuration details
