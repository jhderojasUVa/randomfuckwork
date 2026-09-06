# GitHub Actions CI/CD Pipeline

Complete CI/CD pipeline for the randomfuckwork project with automated testing and GCP publishing.

## 📋 Overview

This directory contains the GitHub Actions workflow that:

1. **Runs Tests** - Execute Jest tests with coverage on every push/PR
2. **Generates Reports** - Create test results and coverage reports in multiple formats
3. **Publishes to GCP** - Upload artifacts to Cloud Storage buckets (main branch only)
4. **Uses Workload Identity** - Secure, keyless authentication to GCP

## 📁 Files

| File | Purpose |
|------|---------|
| `test-and-publish.yml` | Main workflow file with test and GCP publishing jobs |
| `README.md` | This file - overview and quick reference |
| `QUICK_CONFIG.md` | 5-step configuration guide and commands |
| `GCP_SETUP_GUIDE.md` | Detailed GCP setup with Workload Identity Federation |
| `JEST_CONFIGURATION.md` | Jest configuration for optimal test reporting |

## 🚀 Quick Start

### 1. Set Up GCP (5 minutes)

Follow **QUICK_CONFIG.md** to:
- Create GCS buckets
- Set up Workload Identity Federation
- Create service account
- Configure IAM bindings

**Or use the one-liner setup script in QUICK_CONFIG.md**

### 2. Configure GitHub Variables

Add these to your repository settings:
- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`

**Path:** Settings > Secrets and variables > Actions > Variables

### 3. Push to Main Branch

```bash
git add .github/workflows/
git commit -m "chore: add test and GCP publish workflow"
git push origin main
```

The workflow will automatically:
- Run tests
- Generate reports
- Publish to GCP (main branch only)

## 📊 Workflow Behavior

### On Push to `main`

```
[Push to main] 
    ↓
[Job 1: Test] → Generate reports → Upload to GitHub Artifacts
    ↓
[Job 2: Publish] → Download artifacts → Authenticate to GCP → Upload to GCS
    ↓
[Artifacts in GCS] gs://randomfuckwork-test-results-dev/
                  gs://randomfuckwork-coverage-reports-dev/
```

### On Pull Request to `main`

```
[PR to main]
    ↓
[Job 1: Test] → Generate reports → Upload to GitHub Artifacts
    ↓
[Done] (No GCP publishing)
```

## 📦 Artifacts Generated

### Test Results
- `test-results.json` - Machine-readable test output
- `junit.xml` - JUnit XML format for CI integrations
- `index.html` - HTML index file with links

### Coverage Reports
- `index.html` - Interactive coverage report
- `lcov.info` - LCOV format for coverage tools
- `coverage.json` - JSON coverage data
- Other source files with coverage highlighting

## 🔍 Accessing Reports

### From GitHub Actions

1. Go to **Actions** tab
2. Click on latest workflow run
3. Scroll to **Artifacts** section
4. Download `test-results` or `coverage-reports`

### From GCP Console

1. Go to **Cloud Storage** > **Buckets**
2. Click bucket name
3. Navigate to branch/timestamp folder
4. Click `index.html` for quick access

### Direct Links

```
Test Results: https://storage.googleapis.com/randomfuckwork-test-results-dev/main/{timestamp}_{sha}/test-results/index.html
Coverage:     https://storage.googleapis.com/randomfuckwork-coverage-reports-dev/main/{timestamp}_{sha}/coverage/index.html
```

## 🔐 Security Features

✅ **Workload Identity Federation** - No stored credentials
✅ **OIDC Tokens** - Short-lived tokens (1 hour expiry)
✅ **Branch-Specific** - Only main branch can publish
✅ **Least Privilege** - Service account has minimal permissions
✅ **Audit Trail** - All actions logged in GCP
✅ **Private Buckets** - Artifacts kept private by default

## ⚙️ Configuration

### Environment Variables

Edit `test-and-publish.yml` to change:

```yaml
env:
  NODE_VERSION: 18  # Change Node version
  GCP_TEST_RESULTS_BUCKET: gs://custom-bucket  # Custom bucket name
  GCP_COVERAGE_REPORTS_BUCKET: gs://custom-bucket  # Custom bucket name
```

### Triggers

The workflow triggers on:
- Push to `main` branch
- Pull requests to `main` branch

To add other triggers:

```yaml
on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2am UTC
```

### Concurrency

The workflow uses concurrency settings to cancel in-progress runs:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## 🐛 Troubleshooting

### Workflow Not Running

1. Check `.github/workflows/test-and-publish.yml` exists
2. Verify repository has Actions enabled
3. Check commit is on `main` branch or in a PR

### Test Failures

1. Download artifacts from workflow run
2. View `test-results.json` for details
3. Check locally: `CI=true yarn test --coverage`

### GCP Publishing Failures

See **GCP_SETUP_GUIDE.md** troubleshooting section for:
- Workload Identity Federation errors
- GCS permission denied errors
- Timeout issues

### Coverage Report Not Generated

1. Check that tests passed
2. Verify Jest generated coverage: `yarn test --coverage`
3. Check coverage directory exists locally

## 📈 Monitoring

### GitHub Actions Insights

- Go to **Actions** tab
- View workflow run history
- Check job duration and success rate

### GCP Monitoring

Monitor your GCP setup:

```bash
# Check bucket size
gsutil du -s gs://randomfuckwork-test-results-dev/

# List recent uploads
gsutil ls -l -r gs://randomfuckwork-test-results-dev/ | head -20

# Check service account activity
gcloud logging read "resource.type=service_account AND protoPayload.authenticationInfo.principalEmail=github-actions-sa@{PROJECT}.iam.gserviceaccount.com" --limit=50
```

## 💰 Cost Optimization

The workflow is optimized for low cost:

- Small artifacts (~2-5 MB per run)
- 30-day retention on GitHub
- Can be archived in GCP after 90 days
- Estimated monthly cost: < $1

See **GCP_SETUP_GUIDE.md** for cost reduction strategies.

## 🔄 Workflow Stages

### Job 1: Test Execution

**Duration:** ~5-10 minutes

1. Checkout code
2. Setup Node.js
3. Install dependencies (cached)
4. Run tests with coverage
5. Generate reports
6. Upload artifacts to GitHub

**Outputs:** Test reports and coverage data

### Job 2: Publish to GCP

**Duration:** ~2-3 minutes
**Condition:** Only runs on main branch push

1. Checkout code
2. Download artifacts from Job 1
3. Authenticate to GCP (OIDC)
4. Set up Cloud SDK
5. Prepare GCS paths (organized by branch/timestamp)
6. Upload test results to GCP
7. Upload coverage reports to GCP
8. Create index file for easy browsing
9. Verify uploads

**Outputs:** Artifacts in GCS buckets

## 📚 Documentation

- **QUICK_CONFIG.md** - TL;DR setup guide with commands
- **GCP_SETUP_GUIDE.md** - Detailed GCP configuration
- **JEST_CONFIGURATION.md** - Jest testing setup and optimization
- **README.md** - This file

## 🔗 Related Files

Project structure:

```
randomfuckwork/
├── .github/
│   └── workflows/
│       ├── test-and-publish.yml          ← Main workflow
│       ├── README.md                     ← This file
│       ├── QUICK_CONFIG.md               ← 5-step setup
│       ├── GCP_SETUP_GUIDE.md            ← Detailed setup
│       └── JEST_CONFIGURATION.md         ← Test config
├── package.json                          ← Test scripts
├── jest.config.js                        ← Jest config (optional)
├── src/
│   └── **/*.test.ts                      ← Test files
└── coverage/                              ← Generated coverage (local)
```

## 🚢 Next Steps

### Phase 1: Initial Setup
- [ ] Follow QUICK_CONFIG.md setup steps
- [ ] Add GitHub variables
- [ ] Push workflow file to main
- [ ] Verify first workflow run

### Phase 2: Validation
- [ ] Download test artifacts
- [ ] Review coverage reports
- [ ] Verify GCP uploads
- [ ] Test report access

### Phase 3: Integration
- [ ] Set coverage thresholds in Jest
- [ ] Add branch protection rules
- [ ] Configure code owners
- [ ] Set up notifications

### Phase 4: Optimization
- [ ] Analyze workflow duration
- [ ] Optimize test performance
- [ ] Configure auto-archive to reduce costs
- [ ] Add dashboard for reports

## ❓ FAQ

**Q: Can I use this for other branches?**
A: Yes, modify the workflow triggers and Workload Identity binding to include other branches.

**Q: How long are artifacts retained?**
A: GitHub: 30 days. GCP: Configurable (default: 90 days with lifecycle policy).

**Q: Can I make reports publicly accessible?**
A: Yes, change `predefinedAcl: 'private'` to `'publicRead'` in the workflow, but ensure they don't contain sensitive data.

**Q: What if tests fail?**
A: Workflow will fail and report status to GitHub. Check artifacts and logs for details.

**Q: Can I disable GCP publishing?**
A: Remove or comment out the `publish-to-gcp` job from the workflow.

**Q: What are the Node version requirements?**
A: Project requires Node >=18.13.0. Workflow uses Node 18 by default.

## 📞 Support

For issues or questions:

1. Check **Troubleshooting** section in relevant guide
2. Review workflow logs in GitHub Actions
3. Test locally with same commands
4. Check GCP IAM and bucket permissions

## 📝 License

This workflow is part of the randomfuckwork project. Modify as needed for your use case.

---

**Last Updated:** 2024
**Status:** Production Ready
**Maintained By:** jhderojasUVa
