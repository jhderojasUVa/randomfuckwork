# Getting Started - CI/CD Pipeline Setup

This guide will help you complete the setup in **3 simple steps**.

## 📋 Prerequisites

- **GCP Project** with billing enabled
- **gcloud CLI** installed and authenticated (`gcloud auth login`)
  - **⚠️ WSL Users**: See [WSL_SETUP_GUIDE.md](WSL_SETUP_GUIDE.md) - you need WSL-native gcloud, not Windows version
- **GitHub CLI** installed (`gh` - optional but recommended)
- Admin access to this GitHub repository

---

## ✅ Step 1: Run the Automated Setup Script (5 minutes)

The `SETUP_SCRIPT.sh` will create all necessary GCP resources automatically.

### Run the script:

```bash
# From your local machine with gcloud CLI configured
./.github/workflows/SETUP_SCRIPT.sh <your-gcp-project-id>

# Example:
./.github/workflows/SETUP_SCRIPT.sh my-company-project-123
```

### What it does:
- ✓ Creates Cloud Storage buckets for test results and coverage reports
- ✓ Creates Workload Identity Pool for GitHub authentication
- ✓ Creates Workload Identity Provider (OIDC)
- ✓ Creates Service Account with proper permissions
- ✓ Configures IAM bindings
- ✓ **Outputs 3 values you need for Step 2**

### After running:
You'll see output like:
```
Add these values to GitHub Repository Variables:

1. GCP_PROJECT_ID
   Value: my-company-project-123

2. GCP_WORKLOAD_IDENTITY_PROVIDER
   Value: projects/123456/locations/global/workloadIdentityPools/...

3. GCP_SERVICE_ACCOUNT_EMAIL
   Value: github-actions-sa@my-company-project-123.iam.gserviceaccount.com
```

**Copy these 3 values** - you'll need them in Step 2.

---

## ✅ Step 2: Add GitHub Repository Variables (2 minutes)

Add the 3 values from Step 1 to your GitHub repository.

### Option A: Using GitHub CLI (Recommended)

If you installed `gh` CLI:

```bash
# Use the setup script (easiest)
./.github/workflows/setup_github_vars.py \
  "my-company-project-123" \
  "projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider" \
  "github-actions-sa@my-company-project-123.iam.gserviceaccount.com"
```

Or manually with `gh`:

```bash
gh variable set GCP_PROJECT_ID -b "my-company-project-123"
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER -b "projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
gh variable set GCP_SERVICE_ACCOUNT_EMAIL -b "github-actions-sa@my-company-project-123.iam.gserviceaccount.com"
```

### Option B: Using GitHub Web UI (Manual)

1. Go to your repository: https://github.com/jhderojasUVa/randomfuckwork
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **Variables** (not Secrets!)
4. Click **New repository variable**
5. Add each variable:

   | Name | Value |
   |------|-------|
   | `GCP_PROJECT_ID` | `my-company-project-123` |
   | `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/123456/locations/...` |
   | `GCP_SERVICE_ACCOUNT_EMAIL` | `github-actions-sa@...iam.gserviceaccount.com` |

---

## ✅ Step 3: Trigger the Pipeline (1 minute)

Once variables are set, the pipeline will run automatically on the next push to main.

### Option A: Automatic (on next push)

Just commit and push to main:

```bash
git add .
git commit -m "chore: setup complete"
git push origin main
```

### Option B: Manual Trigger

Go to: **Actions** → **Test & Publish to GCP** → **Run workflow** → **Run workflow**

### Monitor the pipeline:

1. Go to **Actions** tab
2. Click the latest workflow run
3. Watch it execute:
   - Job 1 (Test): Runs Jest tests, generates reports (~5-10 min)
   - Job 2 (Publish): Uploads to GCP (~2-3 min, only on main branch)

---

## 🎉 You're Done!

The pipeline is now live. Here's what happens:

### On Every Push to Main:
1. ✓ Jest tests run with coverage
2. ✓ Test results are generated
3. ✓ Coverage reports are created
4. ✓ Everything is uploaded to GCP buckets

### On Pull Requests:
1. ✓ Jest tests run with coverage (no GCP upload)
2. ✓ Test artifacts available in GitHub for review

### Artifact Locations:

**GitHub Artifacts** (30-day retention):
- Actions → Workflow run → **Artifacts** section

**GCP Cloud Storage** (only main branch):
- `gs://randomfuckwork-test-results-dev/main/TIMESTAMP_HASH/`
- `gs://randomfuckwork-coverage-reports-dev/main/TIMESTAMP_HASH/`

---

## 🐛 Troubleshooting

### Script fails with "Permission denied"

**Solution**: Make sure you have Editor role in GCP:
```bash
gcloud projects get-iam-policy $GCP_PROJECT_ID
```

### "Workload Identity Pool already exists"

**OK!** This means it was already created. The script will reuse it.

### Workflow fails with "invalid_grant"

**Solution**: Check GitHub Variables are set correctly:
```bash
gh variable list
```

### GCS Upload Permission Denied

**Solution**: Verify the service account has the right permissions:
```bash
gcloud iam service-accounts get-iam-policy github-actions-sa@$GCP_PROJECT_ID.iam.gserviceaccount.com
```

### Can't find `gcloud` command

**Solution**: Install Google Cloud SDK:
```bash
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
curl https://sdk.cloud.google.com | bash

# Then authenticate:
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

---

## 📚 Next Steps

- Read `README.md` for pipeline overview
- Read `GCP_SETUP_GUIDE.md` for detailed configuration
- Read `JEST_CONFIGURATION.md` for test optimization
- Read `QUICK_CONFIG.md` for quick reference

---

## 💬 Questions?

- **Pipeline issues**: Check **Actions** tab → workflow logs
- **GCP issues**: See `GCP_SETUP_GUIDE.md` troubleshooting section
- **GitHub CLI help**: `gh --help` or https://cli.github.com/
