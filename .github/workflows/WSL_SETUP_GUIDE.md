# WSL Setup Guide - Google Cloud SDK Configuration

If you're using **Windows Subsystem for Linux (WSL)**, you need to install gcloud SDK natively in WSL (not use the Windows version).

## Problem

```
ERROR: (gsutil) Unable to read file [/mnt/c/Program Files (x86)/Google/Cloud SDK...]
```

This happens because WSL can't properly access Windows programs through the mounted filesystem.

## Solution: Install gcloud in WSL

### Option 1: Quick Installation (Recommended)

```bash
# Run in WSL terminal
curl https://sdk.cloud.google.com | bash

# Reload your shell
exec -l $SHELL

# Verify installation
gcloud --version
```

### Option 2: Package Manager Installation

#### For Ubuntu/Debian WSL:

```bash
# Add repository
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Import Google's GPG key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Update and install
sudo apt-get update
sudo apt-get install google-cloud-sdk

# Verify
gcloud --version
```

### Option 3: Using Homebrew (if installed in WSL)

```bash
brew install google-cloud-sdk
gcloud --version
```

---

## Complete Setup Steps (for WSL)

### 1. Install gcloud in WSL

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Authenticate with Google Cloud

```bash
gcloud auth login
```

This will:
- Open a browser window
- Ask you to sign in to your Google account
- Grant permissions to Google Cloud SDK
- Return to terminal with authentication complete

### 3. Set Your Default Project

```bash
gcloud config set project random-fuck-work
```

**Verify:**
```bash
gcloud config get-value project
# Should output: random-fuck-work
```

### 4. Run the Automated Setup Script

```bash
# Navigate to repo
cd /path/to/randomfuckwork

# Run setup
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

### 5. Add GitHub Variables

Copy the 3 values from Step 4 output and add to GitHub:
- Settings → Secrets and variables → Actions → Variables

### 6. Push to Main

```bash
git push origin main
```

**Pipeline runs automatically!** ✅

---

## Troubleshooting WSL gcloud Issues

### Issue: "command not found: gcloud"

**Solution:**
```bash
# Reinstall gcloud
curl https://sdk.cloud.google.com | bash

# Reload shell
exec -l $SHELL

# Verify
gcloud --version
```

### Issue: "Permission denied" on gcloud installation

**Solution:**
```bash
# Make sure you have write permissions
sudo apt-get install google-cloud-sdk
```

### Issue: gcloud works but gsutil doesn't

**Solution:**
```bash
# Reinstall gcloud components
gcloud components update
gcloud components install gsutil
```

### Issue: "Unable to read file" errors

**Solution:**
- Make sure you're NOT running the script with Windows Python
- Use WSL's native Python:
  ```bash
  which python3
  # Should show: /usr/bin/python3 (not /mnt/c/...)
  ```

### Issue: Authentication keeps timing out

**Solution:**
```bash
# Logout and re-authenticate
gcloud auth application-default login

# Or relogin
gcloud auth login --no-launch-browser
# Then manually visit the URL shown
```

---

## Verify WSL Setup is Correct

Run these commands to verify:

```bash
# Check gcloud is from WSL (not Windows)
which gcloud
# Should show: /home/username/google-cloud-sdk/bin/gcloud
# NOT: /mnt/c/Program Files/...

# Check version
gcloud --version
# Should show: Google Cloud SDK version X.X.X

# Check authentication
gcloud auth list
# Should show your Google account

# Check project is set
gcloud config get-value project
# Should show: random-fuck-work

# Test gsutil works
gsutil ls
# Should list your GCS buckets (or be empty if none yet)
```

---

## Running Setup Script

Once gcloud is installed in WSL and authenticated:

```bash
# From repo root
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

**Expected output:**
- Creates Workload Identity Pool ✓
- Creates OIDC Provider ✓
- Creates Service Account ✓
- Creates Cloud Storage buckets ✓
- Outputs 3 GitHub variables ✓

---

## Environment Variables

If you want to manually use gcloud commands in WSL:

```bash
# Set environment variables (WSL-compatible)
export GCP_PROJECT_ID="random-fuck-work"
export GCP_SERVICE_ACCOUNT="github-actions-sa"

# Test
echo $GCP_PROJECT_ID
# Output: random-fuck-work
```

---

## Path Considerations

In WSL, remember:
- `/home/username/` is your WSL home
- `/mnt/c/Users/username/` is your Windows home
- `/mnt/c/...` is Windows filesystem (avoid for development)

**Best practice:** Clone your repo in WSL home, not Windows:
```bash
cd ~
git clone https://github.com/jhderojasUVa/randomfuckwork.git
cd randomfuckwork
```

---

## Still Having Issues?

### Check WSL Version

```bash
wsl --version
```

Update if needed:
```bash
wsl --update
```

### Check Distro

```bash
uname -a
# Should show: Linux (your-computer) 5.x.x-microsoft...
```

### Reinstall WSL

If all else fails:
```bash
# In PowerShell (as Admin)
wsl --unregister Ubuntu
wsl --install -d Ubuntu

# Then reinstall gcloud in new WSL
```

---

## Quick Checklist

- [ ] WSL is running (check with `uname -a`)
- [ ] gcloud is installed in WSL (`which gcloud` shows `/home/...`)
- [ ] Authenticated to Google Cloud (`gcloud auth list` shows your account)
- [ ] Project is set (`gcloud config get-value project` shows `random-fuck-work`)
- [ ] gsutil works (`gsutil ls` doesn't error)
- [ ] Ready to run setup script!

---

## Next Steps

1. ✅ Install gcloud in WSL (use Option 1)
2. ✅ Authenticate: `gcloud auth login`
3. ✅ Set project: `gcloud config set project random-fuck-work`
4. ✅ Run setup: `./.github/workflows/SETUP_SCRIPT.sh random-fuck-work`
5. ✅ Add GitHub variables (3 values from setup output)
6. ✅ Push to main: `git push origin main`

**Done!** 🎉
