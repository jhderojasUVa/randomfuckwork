# GitHub Actions CI/CD Pipeline - File Index

This directory contains a complete, production-ready CI/CD pipeline for the randomfuckwork project.

## 📁 Files Overview

### 🔧 Workflow Files

| File | Purpose | Size |
|------|---------|------|
| **test-and-publish.yml** | Main GitHub Actions workflow | 19 KB |
| **upload_to_googlecontainer.yml** | Legacy container upload (existing) | 1.2 KB |

### 📚 Documentation

| File | Purpose | When to Read |
|------|---------|--------------|
| **GETTING_STARTED.md** | Quick setup guide (3 steps) | **START HERE** |
| **README.md** | Pipeline overview & features | After getting started |
| **GCP_SETUP_GUIDE.md** | Detailed GCP configuration | If you need help with GCP |
| **JEST_CONFIGURATION.md** | Test optimization guide | For improving test reports |
| **QUICK_CONFIG.md** | Quick reference sheet | While setting up |
| **WSL_QUICK_START.md** | For Windows Subsystem for Linux users | **If using WSL** |
| **WSL_SETUP_GUIDE.md** | Detailed WSL gcloud installation | If WSL setup issues |

### 🚀 Setup Scripts

| File | Purpose | Usage |
|------|---------|-------|
| **SETUP_SCRIPT.sh** | Automated GCP resource creation | `./SETUP_SCRIPT.sh <gcp-project-id>` |
| **setup_github_vars.py** | Add values to GitHub Variables | `./setup_github_vars.py ...` |

---

## 🎯 Quick Start (3 Steps - 8 Minutes)

### 1️⃣ Run Automated Setup
```bash
./.github/workflows/SETUP_SCRIPT.sh my-gcp-project-123
```
This creates all GCP resources and outputs 3 values you need.

### 2️⃣ Add GitHub Variables
Set these 3 values in GitHub:
- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`

Go to: **Settings** → **Secrets and variables** → **Actions** → **Variables**

### 3️⃣ Trigger Pipeline
Push to main branch:
```bash
git push origin main
```

**Pipeline runs automatically!** ✅

---

## 🔄 Pipeline Architecture

```
GitHub Actions Workflow (test-and-publish.yml)
│
├─ Job 1: test
│  ├─ Checkout code
│  ├─ Setup Node.js
│  ├─ Install dependencies (cached)
│  ├─ Run Jest tests with coverage
│  ├─ Generate 4 report formats:
│  │  ├─ JSON (test results)
│  │  ├─ JUnit XML (for CI integration)
│  │  ├─ HTML (browser view)
│  │  └─ LCOV (coverage metrics)
│  └─ Upload to GitHub Artifacts
│
└─ Job 2: publish-to-gcp (main branch only)
   ├─ Download artifacts
   ├─ Authenticate via Workload Identity Federation
   ├─ Upload test results to GCS bucket
   └─ Upload coverage reports to GCS bucket
```

### Triggers
- ✅ Push to `main` branch (runs test + publish)
- ✅ Pull requests to `main` (runs test only)

### Timing
- **Test Job**: 5-10 minutes
- **Publish Job**: 2-3 minutes (only on main)
- **Total**: ~7-13 minutes

---

## 🔐 Security Features

- ✅ **Workload Identity Federation (OIDC)** - No secrets needed
- ✅ **Short-lived tokens** (1-hour expiry)
- ✅ **Branch-specific access** (only main branch publishes)
- ✅ **Least-privilege IAM** (only storage.objectCreator)
- ✅ **Private bucket storage** (no public access)
- ✅ **Audit trail** (all actions logged in GCP)

---

## 📊 What Gets Published to GCP

### Test Results Bucket
```
gs://randomfuckwork-test-results-dev/
└── main/
    └── 20240906_130000_a1b2c3d4/
        └── test-results/
            ├── test-results.json
            ├── junit.xml
            └── index.html
```

### Coverage Reports Bucket
```
gs://randomfuckwork-coverage-reports-dev/
└── main/
    └── 20240906_130000_a1b2c3d4/
        └── coverage/
            ├── index.html
            ├── lcov.info
            └── ...
```

**Access Reports:**
- GitHub: Actions → Workflow run → **Artifacts**
- GCP Console: Cloud Storage → Browse buckets

---

## 📖 Documentation Map

### I want to...

**Get started quickly**
→ Read: `GETTING_STARTED.md`

**Understand what the pipeline does**
→ Read: `README.md`

**Configure GCP resources manually**
→ Read: `GCP_SETUP_GUIDE.md` (also has troubleshooting)

**Optimize my test reports**
→ Read: `JEST_CONFIGURATION.md`

**Quick reference while setting up**
→ Read: `QUICK_CONFIG.md`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] GCP resources created
  ```bash
  gcloud iam service-accounts describe github-actions-sa@$PROJECT_ID.iam.gserviceaccount.com
  ```

- [ ] GitHub variables set
  ```bash
  gh variable list
  ```

- [ ] Workflow file exists
  ```bash
  git show HEAD:.github/workflows/test-and-publish.yml
  ```

- [ ] First pipeline run completed
  → Go to Actions tab and watch the workflow

- [ ] Artifacts in GitHub
  → Actions → Latest run → Artifacts

- [ ] Artifacts in GCP (if on main)
  → Cloud Storage → Buckets → Browse

---

## 🐛 Troubleshooting

**Quick help**: See `GCP_SETUP_GUIDE.md` → **Troubleshooting** section

**Common issues**:
1. **Script fails** → Ensure `gcloud auth login` completed
2. **Variables not set** → Use GitHub web UI or `gh` CLI
3. **Workflow fails** → Check Actions tab logs
4. **Permission denied** → Verify service account IAM roles

---

## 📞 Support Resources

- **Workflow logs**: GitHub Actions tab
- **GCP issues**: GCP_SETUP_GUIDE.md troubleshooting
- **Jest questions**: JEST_CONFIGURATION.md
- **GitHub CLI**: `gh --help` or https://cli.github.com/

---

## 🎉 Next Steps After Setup

1. ✅ Commit these files (already done!)
2. ✅ Run SETUP_SCRIPT.sh
3. ✅ Add GitHub Variables
4. ✅ Push to main
5. ✅ Watch pipeline in Actions tab
6. ✅ View test results in artifacts
7. ✅ View coverage reports in GCP buckets

**You're all set!** 🚀

---

Last updated: 2026-09-06
