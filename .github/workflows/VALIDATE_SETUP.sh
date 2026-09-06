#!/bin/bash

################################################################################
# Setup Completion Validator
# Verifies that the GCP setup and GitHub configuration are correct
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Setup Completion Validator${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check 1: GitHub Variables are set
echo -e "${BLUE}Check 1/5: GitHub Repository Variables${NC}"
if command -v gh &> /dev/null; then
    VARS=$(gh variable list -R jhderojasUVa/randomfuckwork 2>/dev/null || echo "")
    if echo "$VARS" | grep -q "GCP_PROJECT_ID"; then
        echo -e "${GREEN}✓ GCP_PROJECT_ID is set${NC}"
    else
        echo -e "${RED}✗ GCP_PROJECT_ID not found in GitHub variables${NC}"
        echo "  Add it at: Settings → Secrets and variables → Actions → Variables"
    fi
    
    if echo "$VARS" | grep -q "GCP_WORKLOAD_IDENTITY_PROVIDER"; then
        echo -e "${GREEN}✓ GCP_WORKLOAD_IDENTITY_PROVIDER is set${NC}"
    else
        echo -e "${RED}✗ GCP_WORKLOAD_IDENTITY_PROVIDER not found${NC}"
    fi
    
    if echo "$VARS" | grep -q "GCP_SERVICE_ACCOUNT_EMAIL"; then
        echo -e "${GREEN}✓ GCP_SERVICE_ACCOUNT_EMAIL is set${NC}"
    else
        echo -e "${RED}✗ GCP_SERVICE_ACCOUNT_EMAIL not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ GitHub CLI not installed - skipping GitHub variable check${NC}"
    echo "  Install with: brew install gh  or  sudo apt-get install gh"
fi
echo ""

# Check 2: GCP resources exist
echo -e "${BLUE}Check 2/5: GCP Workload Identity${NC}"
if command -v gcloud &> /dev/null; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}✗ No GCP project set${NC}"
        echo "  Run: gcloud config set project random-fuck-work"
    else
        echo -e "${GREEN}✓ GCP project: $PROJECT_ID${NC}"
        
        # Check pool exists
        if gcloud iam workload-identity-pools describe github-pool \
            --project="$PROJECT_ID" \
            --location=global &>/dev/null; then
            echo -e "${GREEN}✓ Workload Identity Pool exists${NC}"
        else
            echo -e "${RED}✗ Workload Identity Pool not found${NC}"
        fi
        
        # Check provider exists
        if gcloud iam workload-identity-pools providers describe github-provider \
            --project="$PROJECT_ID" \
            --location=global \
            --workload-identity-pool=github-pool &>/dev/null; then
            echo -e "${GREEN}✓ Workload Identity Provider exists${NC}"
        else
            echo -e "${RED}✗ Workload Identity Provider not found${NC}"
        fi
        
        # Check service account exists
        if gcloud iam service-accounts describe github-actions-sa@${PROJECT_ID}.iam.gserviceaccount.com \
            --project="$PROJECT_ID" &>/dev/null; then
            echo -e "${GREEN}✓ Service Account exists${NC}"
        else
            echo -e "${RED}✗ Service Account not found${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ gcloud CLI not found - skipping GCP checks${NC}"
    echo "  Install in WSL: curl https://sdk.cloud.google.com | bash"
fi
echo ""

# Check 3: GCS buckets exist
echo -e "${BLUE}Check 3/5: Cloud Storage Buckets${NC}"
if command -v gsutil &> /dev/null; then
    if gsutil ls gs://randomfuckwork-test-results-dev/ &>/dev/null; then
        echo -e "${GREEN}✓ Test results bucket exists${NC}"
    else
        echo -e "${RED}✗ Test results bucket not found${NC}"
    fi
    
    if gsutil ls gs://randomfuckwork-coverage-reports-dev/ &>/dev/null; then
        echo -e "${GREEN}✓ Coverage reports bucket exists${NC}"
    else
        echo -e "${RED}✗ Coverage reports bucket not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ gsutil not found - skipping bucket checks${NC}"
fi
echo ""

# Check 4: Workflow file exists
echo -e "${BLUE}Check 4/5: Workflow File${NC}"
if [ -f ".github/workflows/test-and-publish.yml" ]; then
    echo -e "${GREEN}✓ test-and-publish.yml exists${NC}"
    
    if grep -q "name: Test & Publish to GCP" .github/workflows/test-and-publish.yml; then
        echo -e "${GREEN}✓ Workflow is properly configured${NC}"
    else
        echo -e "${RED}✗ Workflow configuration issue${NC}"
    fi
else
    echo -e "${RED}✗ test-and-publish.yml not found${NC}"
fi
echo ""

# Check 5: Git repository
echo -e "${BLUE}Check 5/5: Git Repository${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Git repository found${NC}"
    
    if git show-ref --quiet refs/heads/main; then
        echo -e "${GREEN}✓ main branch exists${NC}"
    else
        echo -e "${YELLOW}⚠ main branch not found (will be created on first push)${NC}"
    fi
else
    echo -e "${RED}✗ Not a git repository${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Next Steps${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "1. If all checks passed:"
echo "   git push origin main"
echo "   (Watch the pipeline in Actions tab)"
echo ""
echo "2. If any checks failed:"
echo "   - Re-run: ./.github/workflows/SETUP_SCRIPT.sh random-fuck-work"
echo "   - Add GitHub variables manually"
echo "   - Verify GCP resources exist"
echo ""
