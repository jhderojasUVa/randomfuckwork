# For WSL Users - Complete Setup Guide

If you're using **Windows Subsystem for Linux (WSL)**, follow this guide instead of the main GETTING_STARTED.md.

## ⚠️ Important: WSL vs Windows gcloud

The error you got:
```
ERROR: (gsutil) Unable to read file [/mnt/c/Program Files (x86)/Google/Cloud SDK...]
```

This is because:
- ❌ You have gcloud installed on Windows
- ✅ You need gcloud installed in WSL itself

**WSL and Windows are separate environments.** They cannot share gcloud installations.

---

## 🚀 Quick Start (WSL Users Only)

### Step 1: Install gcloud in WSL (3 minutes)

Open your WSL terminal and run:

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Verify it worked:**
```bash
gcloud --version
# Should show: Google Cloud SDK X.X.X
```

### Step 2: Authenticate (2 minutes)

```bash
gcloud auth login
```

This will:
1. Open your browser
2. Ask you to sign in to Google
3. Grant permissions
4. Automatically return to terminal

### Step 3: Set Your Project (1 minute)

```bash
gcloud config set project random-fuck-work
```

**Verify:**
```bash
gcloud config get-value project
# Output: random-fuck-work
```

### Step 4: Pre-flight Check (1 minute)

Run the check script:

```bash
./.github/workflows/SETUP_SCRIPT_WSL_CHECK.sh random-fuck-work
```

This verifies:
- ✓ gcloud is WSL-native (not Windows)
- ✓ You're authenticated
- ✓ Project is set
- ✓ You have access

### Step 5: Run Full Setup (5 minutes)

```bash
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

This creates:
- ✓ Workload Identity Pool
- ✓ OIDC Provider
- ✓ Service Account
- ✓ Cloud Storage buckets
- ✓ IAM bindings

**Output shows 3 values to copy**

### Step 6: Add GitHub Variables (2 minutes)

Go to: **Settings** → **Secrets and variables** → **Actions** → **Variables**

Add these 3 variables:
1. `GCP_PROJECT_ID`
2. `GCP_WORKLOAD_IDENTITY_PROVIDER`
3. `GCP_SERVICE_ACCOUNT_EMAIL`

### Step 7: Trigger Pipeline (1 minute)

```bash
git push origin main
```

**Done!** ✅ Pipeline runs automatically.

---

## 📋 Pre-flight Checklist

Before running the setup script, verify everything:

```bash
# 1. Check gcloud is WSL-native
which gcloud
# Should show: /home/username/google-cloud-sdk/bin/gcloud
# NOT: /mnt/c/Program Files/...

# 2. Check version
gcloud --version

# 3. Check authenticated
gcloud auth list
# Should show your Google account with "ACTIVE"

# 4. Check project is set
gcloud config get-value project
# Should show: random-fuck-work

# 5. Test gsutil (file upload tool)
gsutil --version
```

All passing? Good to go! Run the setup script.

---

## Detailed Installation Options

### Option 1: Quick Install (Recommended)

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Option 2: Ubuntu/Debian Package Manager

```bash
# Add Google Cloud repository
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import GPG key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Install
sudo apt-get update
sudo apt-get install google-cloud-sdk
```

### Option 3: Homebrew (if installed)

```bash
brew install google-cloud-sdk
```

---

## Troubleshooting

### "command not found: gcloud"

**Fix:**
```bash
# Reinstall
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Verify
gcloud --version
```

### "Permission denied" during installation

**Fix:**
```bash
# Use apt-get (doesn't require /root permissions)
sudo apt-get install google-cloud-sdk
```

### "gcloud found but it's the Windows version"

**Fix:**
```bash
# Uninstall Windows gcloud (in PowerShell as Admin)
# Then reinstall in WSL:
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Authentication keeps timing out

**Fix:**
```bash
# Use non-browser auth
gcloud auth application-default login

# Or manual browser
gcloud auth login --no-launch-browser
# Copy-paste the URL into your browser
```

### "gsutil: Permission denied"

**Fix:**
```bash
# Reinstall gcloud components
gcloud components update
gcloud components install gsutil
```

### "Cannot access project random-fuck-work"

**Fix:**
```bash
# Verify project exists in GCP Console
# Verify you have access (should have Editor role)
# Check billing is enabled

# Then verify with gcloud
gcloud projects list
# Should show your project
```

---

## File Paths in WSL

⚠️ **Important for WSL users:**

```
WSL Home:       /home/username/     ✓ Use this
Windows Home:   /mnt/c/Users/...    ✗ Avoid this
Windows Path:   /mnt/c/...          ✗ Avoid this
```

**Best practice:** Clone repo in WSL home:

```bash
cd ~
git clone https://github.com/jhderojasUVa/randomfuckwork.git
cd randomfuckwork
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

---

## Running the Setup Script

Once gcloud is installed and authenticated:

```bash
# From repo root
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

**What it does:**

1. **Verify gcloud** is installed
2. **Create Workload Identity Pool** for GitHub authentication
3. **Create OIDC Provider** (GitHub tokens)
4. **Create Service Account** (github-actions-sa)
5. **Create Cloud Storage buckets** (test results & coverage)
6. **Grant IAM permissions** (service account can upload)
7. **Configure bindings** (GitHub repo can use service account)

**Output:**
```
Add these values to GitHub Repository Variables:

1. GCP_PROJECT_ID
   Value: random-fuck-work

2. GCP_WORKLOAD_IDENTITY_PROVIDER
   Value: projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider

3. GCP_SERVICE_ACCOUNT_EMAIL
   Value: github-actions-sa@random-fuck-work.iam.gserviceaccount.com
```

Copy all 3 values to GitHub Variables.

---

## After Setup

### 1. Add GitHub Variables

Go to: **https://github.com/jhderojasUVa/randomfuckwork/settings/variables/actions**

Click **New repository variable** for each:
- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`

### 2. Push to Main

```bash
git add .
git commit -m "chore: gcp setup complete"
git push origin main
```

### 3. Watch Pipeline

Go to: **Actions** tab → **Test & Publish to GCP** → Latest run

**What happens:**
- Job 1 (test): Runs Jest, generates reports (~5-10 min)
- Job 2 (publish): Uploads to GCP buckets (~2-3 min, main only)

### 4. View Results

**GitHub:**
- Actions → Latest run → Artifacts

**GCP:**
- Cloud Storage → Buckets → Browse

---

## Complete Command Sequence

Copy-paste this entire sequence:

```bash
# Install gcloud
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate
gcloud auth login

# Set project
gcloud config set project random-fuck-work

# Verify everything
./.github/workflows/SETUP_SCRIPT_WSL_CHECK.sh random-fuck-work

# Run full setup
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work

# Push to trigger pipeline
git push origin main
```

**Then add the 3 values to GitHub Variables in the web UI.**

---

## Still Stuck?

1. **Check WSL version:**
   ```bash
   usl --version
   ```

2. **Update WSL if old:**
   ```bash
   # In PowerShell as Admin
   wsl --update
   ```

3. **Check distro:**
   ```bash
   lsb_release -a
   # Should be Ubuntu 20.04 or newer
   ```

4. **Full details:**
   - See WSL_SETUP_GUIDE.md for comprehensive guide
   - See GCP_SETUP_GUIDE.md for GCP troubleshooting

---

**Ready?** Start here: Run the install command above! 🚀
