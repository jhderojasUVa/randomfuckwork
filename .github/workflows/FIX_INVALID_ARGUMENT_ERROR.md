# Fix: INVALID_ARGUMENT Error When Creating OIDC Provider

## Error Message
```
ERROR: (gcloud.iam.workload-identity-pools.providers.create-oidc) INVALID_ARGUMENT: 
The attribute condition must reference one of the provider's claims.
```

## Root Cause
The Workload Identity Pool is in a corrupted or inconsistent state. This happens when:
- Provider creation fails partway through
- Previous setup attempts left bad configuration
- GCP API validation state got stuck

The error message is misleading - it's not about your attribute-mapping (which is correct). The pool itself is corrupted.

## Solution: Run the Recovery Script

The recovery script **automatically** fixes this:

```bash
bash ./.github/workflows/RECOVER_WIF_PROVIDER.sh
```

### What This Script Does

1. **Detects** if the provider exists and is corrupted
2. **Deletes** the corrupted provider and pool
3. **Waits** 10 seconds for GCP to clean up
4. **Creates** a brand new Workload Identity Pool
5. **Creates** the OIDC provider with minimal configuration
6. **Verifies** the provider was created correctly
7. **Creates** service account and grants permissions
8. **Outputs** the 3 values needed for GitHub Variables

### Expected Output

You should see:
```
✅ Provider creation successful!

GCP_WORKLOAD_IDENTITY_PROVIDER:
projects/605371248588/locations/global/workloadIdentityPools/github-pool/providers/github-provider

✅ All Setup Complete!
```

## Manual Fix (If Script Doesn't Work)

If the script fails, follow these exact steps in order:

```bash
# 1. Delete the corrupted provider
gcloud iam workload-identity-pools providers delete github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool \
  --quiet

# 2. Delete the pool (cascades any remaining provider references)
gcloud iam workload-identity-pools delete github-pool \
  --project=random-fuck-work \
  --location=global \
  --quiet

# 3. Wait for cleanup
sleep 10

# 4. Create fresh pool
gcloud iam workload-identity-pools create github-pool \
  --project=random-fuck-work \
  --location=global \
  --display-name="GitHub Actions Pool"

# 5. Create provider
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 6. Verify
gcloud iam workload-identity-pools providers describe github-provider \
  --project=random-fuck-work \
  --location=global \
  --workload-identity-pool=github-pool
```

## Why This Works

- **Fresh pool**: Eliminates any cached bad state in GCP
- **Minimal attribute-mapping**: Uses only `google.subject=assertion.sub` (the minimum required)
- **10-second wait**: Allows GCP API to fully propagate deletion
- **Direct provider deletion**: Doesn't rely on pool cascade in case of partial state

## Key Insight

The error message talks about "attribute condition" but the real issue is the **pool state**, not your attribute-mapping. This is why recreating the pool fresh always works.

## Still Getting the Error?

1. Verify gcloud is **WSL-native**: `which gcloud` should NOT contain `/mnt/c/`
2. Verify you're logged in: `gcloud auth list`
3. Verify project is set: `gcloud config list | grep project`
4. Try the manual fix above with explicit error output:
   ```bash
   gcloud iam workload-identity-pools create github-pool \
     --project=random-fuck-work \
     --location=global \
     --display-name="GitHub Actions Pool" -v
   ```

## Next Steps After Fix

Once the provider is created successfully:

1. Get the provider resource name:
   ```bash
   gcloud iam workload-identity-pools providers describe github-provider \
     --project=random-fuck-work \
     --location=global \
     --workload-identity-pool=github-pool \
     --format="value(name)"
   ```

2. Add the 3 GitHub Variables:
   - `GCP_PROJECT_ID` = `random-fuck-work`
   - `GCP_WORKLOAD_IDENTITY_PROVIDER` = (value from above)
   - `GCP_SERVICE_ACCOUNT_EMAIL` = `github-actions-sa@random-fuck-work.iam.gserviceaccount.com`

3. Push to main:
   ```bash
   git push origin main
   ```
