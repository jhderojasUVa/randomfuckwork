# 🎯 ACTION REQUIRED - Complete Your Pipeline Setup

## ⚡ Quick Path: Run the Master Setup Script

Everything is automated now! Just run this one command:

```bash
bash ./.github/workflows/MASTER_SETUP.sh
```

This script will:
1. ✅ Verify WSL gcloud is installed (install if needed)
2. ✅ Create Workload Identity Pool and OIDC Provider
3. ✅ Create Service Account
4. ✅ Set GitHub Variables automatically (if `gh` CLI is installed)
5. ✅ Grant all necessary permissions
6. ✅ Show you exactly what to do next

**Expected output:** All green checkmarks with final next steps displayed.

---

## Prerequisites: Install WSL-Native Google Cloud SDK

The Windows gcloud doesn't work in WSL. You MUST install the WSL version first.

Run these commands in your WSL terminal:

```bash
# Step 1: Add Google Cloud SDK repository
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Step 2: Add GPG key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Step 3: Install
sudo apt-get update
sudo apt-get install -y google-cloud-sdk

# Step 4: Initialize
gcloud init
```

When `gcloud init` runs:
1. It will ask you to log in - choose your GCP account
2. Select project: **random-fuck-work**
3. Skip region/zone questions (press Enter)

**Verify it worked:**
```bash
gcloud --version
# Should show: Google Cloud SDK X.X.X
# NOT an error about permissions
```

---

## Then Run One of These Setup Scripts

Once gcloud is installed, choose one:

### Option A: Master Setup Script (Recommended)
```bash
bash ./.github/workflows/MASTER_SETUP.sh
```

### Option B: If You Get "INVALID_ARGUMENT" Error
If you get an error about "attribute condition must reference provider's claims", the WIF pool is corrupted. Run the recovery script:

```bash
bash ./.github/workflows/RECOVER_WIF_PROVIDER.sh
```

This script:
1. Deletes the corrupted provider and pool
2. Creates a fresh pool from scratch
3. Creates the provider with correct configuration
4. Grants all permissions
5. Shows you the values to add to GitHub

The recovery script is more aggressive but guarantees a clean state.

---

## After Running the Script

You'll see output with 3 values to add to GitHub Variables:
- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`

Add them at:
https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions

Then trigger the pipeline:
```bash
git push origin main
```

---

## Expected Timeline

- Install gcloud: **5 minutes**
- Complete setup guide: **10 minutes**
- First pipeline run: **10 minutes**

**Total: 25 minutes to fully working pipeline**

---

## Files You Have

All documentation is in: `.github/workflows/`

| File | Purpose |
|------|---------|
| **SETUP_SUMMARY.md** | Overview (read this first!) |
| **COMPLETE_SETUP_GUIDE.md** | Detailed step-by-step (read this second!) |
| **QUICK_START.txt** | Quick reference card |
| **test-and-publish.yml** | Your GitHub Actions workflow |
| **GCP_SETUP_GUIDE.md** | Reference for GCP commands |
| **WSL_SETUP_GUIDE.md** | WSL gcloud installation details |

---

## Current Status

✅ **DONE:**
- GitHub Actions workflow created
- GCP project configured
- Service account created
- GCS buckets created
- Workload Identity Pool created
- All documentation written

⏳ **PENDING (YOUR ACTION):**
1. Install WSL gcloud
2. Create OIDC provider
3. Add GitHub Variables
4. Grant permissions
5. Push to trigger pipeline

---

## Start Here

```bash
# 1. Install gcloud (follow commands above)
gcloud init

# 2. Read the setup guide
cat .github/workflows/COMPLETE_SETUP_GUIDE.md

# 3. Follow each step in that guide

# 4. When done, trigger the pipeline:
git push origin main
```

---

## Questions?

- **"How do I install gcloud?"** → See section above
- **"What steps do I follow?"** → Read COMPLETE_SETUP_GUIDE.md  
- **"What do I do if I get an error?"** → See Troubleshooting in COMPLETE_SETUP_GUIDE.md
- **"How does the pipeline work?"** → Read SETUP_SUMMARY.md

---

**Everything is ready. Just install gcloud and follow the guide!** 🚀
