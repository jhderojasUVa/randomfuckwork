# ⚠️ If You're Getting the Provider Error

If you're seeing this error:
```
ERROR: (gcloud.iam.workload-identity-pools.providers.create-oidc) INVALID_ARGUMENT: 
The attribute condition must reference one of the provider's claims
```

**Good news:** The latest version of SETUP_SCRIPT.sh now **automatically fixes this!**

## What to do:

Just run the setup script again:

```bash
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

It will:
1. ✓ Detect the old/bad provider configuration
2. ✓ Delete it automatically
3. ✓ Create a new one with the correct configuration
4. ✓ Continue with the rest of the setup

**No manual deletion needed anymore!**

## What was the issue?

The old provider had an invalid claim `assertion.actor` that doesn't exist in GitHub's OIDC token. The new version uses only valid claims:
- `google.subject=assertion.sub`
- `attribute.repository=assertion.repository`
- `attribute.repository_owner=assertion.repository_owner`

## Just run it:

```bash
./.github/workflows/SETUP_SCRIPT.sh random-fuck-work
```

It will complete successfully this time! 🚀
