# ✅ FINAL SETUP - Complete Step-by-Step Guide

This is the definitive guide to get your pipeline working end-to-end.

---

## 🎯 Overview: 4 Main Steps

1. **Install gcloud in WSL** (if needed)
2. **Run setup script** to create GCP resources
3. **Add GitHub variables** with the values from step 2
4. **Push to main** to trigger the pipeline

**Estimated time: 15 minutes**

---

## Step 1: Install gcloud in WSL ⚙️

**Run in WSL terminal:**

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Verify installation:**

```bash
gcloud --version
# Should output: Google Cloud SDK X.X.X
```

**Authenticate:**

```bash
gcloud auth login
# This opens your browser - sign in and grant permissions
```

**Set project:**

```bash
gcloud config set project random-fuck-work
```

**Verify gcloud is ready:**

```bash
./.github/workflows/SETUP_SCRIPT_WSL_CHECK.sh random-fuck-work
# Should pass all checks
```

---

## Step 2: Run Setup Script 🚀

**From your repo root in WSL:**

```bash
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

**What this does:**
- Creates Workload Identity Pool ✓
- Creates OIDC Provider ✓
- Creates Service Account ✓
- Creates Cloud Storage buckets ✓
- Sets up IAM permissions ✓
- **Outputs 3 values you need to copy**

**Expected output (at the end):**

```
Add these values to GitHub Repository Variables:

1. GCP_PROJECT_ID
   Value: random-fuck-work

2. GCP_WORKLOAD_IDENTITY_PROVIDER
   Value: projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider

3. GCP_SERVICE_ACCOUNT_EMAIL
   Value: github-actions-sa@random-fuck-work.iam.gserviceaccount.com
```

**Copy these 3 values** - you'll need them in Step 3.

---

## Step 3: Add GitHub Variables 📝

### Option A: Using GitHub CLI (Recommended - 1 minute)

```bash
gh variable set GCP_PROJECT_ID -b "random-fuck-work"

gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER -b "projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider"

gh variable set GCP_SERVICE_ACCOUNT_EMAIL -b "github-actions-sa@random-fuck-work.iam.gserviceaccount.com"
```

**Verify:**

```bash
gh variable list
```

### Option B: Using GitHub Web UI (2 minutes)

1. Go to: **https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions**
2. Click **New repository variable**
3. Add these 3 variables (copy the values from Step 2):

   | Variable Name | Value |
   |---|---|
   | `GCP_PROJECT_ID` | `random-fuck-work` |
   | `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/.../github-pool/providers/github-provider` |
   | `GCP_SERVICE_ACCOUNT_EMAIL` | `github-actions-sa@random-fuck-work.iam.gserviceaccount.com` |

---

## Step 4: Trigger the Pipeline 🎬

### Verify everything is set up:

```bash
./.github/workflows/VALIDATE_SETUP.sh
```

If all checks pass ✓, proceed to push.

### Push to main:

```bash
git add .
git commit -m "chore: pipeline setup complete"
git push origin main
```

**The pipeline runs automatically!**

---

## 🔍 Monitor the Pipeline

### Watch it run:

1. Go to: **https://github.com/jhderojasUVa/randomfuckwork/actions**
2. Click the latest workflow run
3. Watch both jobs execute:
   - **Job 1 (test):** Runs Jest tests (~5-10 min)
   - **Job 2 (publish-to-gcp):** Uploads to GCP (~2-3 min, only on main)

### Check results:

**GitHub Artifacts:**
- Actions tab → Latest run → **Artifacts** section
- Test results and coverage reports available to download

**GCP Cloud Storage:**
- Go to: **https://console.cloud.google.com**
- Cloud Storage → Buckets
- Browse: `randomfuckwork-test-results-dev/` and `randomfuckwork-coverage-reports-dev/`

---

## ✅ Verification Checklist

After everything is set up:

- [ ] gcloud is installed in WSL (`which gcloud` shows `/home/...`)
- [ ] You're authenticated (`gcloud auth list` shows your account)
- [ ] Project is set (`gcloud config get-value project` shows `random-fuck-work`)
- [ ] Setup script ran successfully
- [ ] GitHub variables are set (3 values)
- [ ] Pushed to main
- [ ] Workflow appears in Actions tab
- [ ] Test job completed
- [ ] Publish job completed
- [ ] Artifacts in GitHub
- [ ] Files in GCP buckets

---

## 🐛 Troubleshooting

### "gcloud not found" in WSL

**Fix:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### "INVALID_ARGUMENT: The attribute condition..." error

**Fix:** This is already fixed in the latest version. Run:
```bash
git pull origin main
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

### GitHub variables not appearing

**Fix:**
```bash
# Using CLI
gh variable list

# Or add manually via web UI:
# Settings → Secrets and variables → Actions → Variables
```

### Workflow doesn't run

**Possible causes:**
1. GitHub variables not set → Add them
2. Committed to wrong branch → Push to `main`, not `master`
3. Workflow file syntax error → Check `.github/workflows/test-and-publish.yml`

### Test job fails

**Check logs:**
1. Actions tab → Click workflow run
2. Expand "Run tests with coverage" step
3. Look for error messages
4. Common issues:
   - Dependencies not installed → Try: `yarn install`
   - Tests failing → Run locally: `yarn test`
   - Coverage not generated → Check Jest config

### Publish job fails

**Check logs:**
1. Actions tab → Click workflow run
2. Expand "Authenticate to Google Cloud" step
3. Common issues:
   - Variables not set → Set them in GitHub
   - Service account doesn't have permissions → Rerun setup script
   - Bucket doesn't exist → Rerun setup script

---

## 📚 Documentation Reference

- **INDEX.md** - File overview
- **WSL_QUICK_START.md** - WSL-specific setup
- **GCP_SETUP_GUIDE.md** - GCP detailed guide + troubleshooting
- **README.md** - Pipeline overview

---

## ⏱️ Timeline

```
Minute 0-2:    Install gcloud (if needed)
Minute 2-3:    Authenticate to Google
Minute 3-5:    Run setup script
Minute 5-6:    Copy 3 values
Minute 6-8:    Add GitHub variables
Minute 8-9:    Commit and push
Minute 9-20:   Watch pipeline run
Minute 20+:    Done! ✅
```

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ GitHub workflow appears in Actions tab
2. ✅ Test job runs and completes
3. ✅ Publish job runs (only on main push)
4. ✅ Test artifacts appear in GitHub (30-day retention)
5. ✅ Test results appear in GCP bucket
6. ✅ Coverage reports appear in GCP bucket

---

## Next: Auto-run on Every Push

Once setup is complete, the pipeline automatically:
- Runs tests on every push to main
- Runs tests on every pull request
- Publishes results to GCP (main branch only)
- Keeps artifacts for 30 days

**No more manual steps needed!** 🚀

---

## Still Need Help?

**For WSL issues:**
- See: WSL_QUICK_START.md

**For GCP issues:**
- See: GCP_SETUP_GUIDE.md → Troubleshooting

**For GitHub Actions issues:**
- See: Actions tab → Workflow logs

---

**Ready to start? Go to Step 1 above!** ⬆️
