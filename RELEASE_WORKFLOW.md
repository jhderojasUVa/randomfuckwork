# Release & Version Management Workflow

## Overview

This project uses **semantic-release** to automatically manage version updates and GitHub releases based on conventional commits. When you push to the `master` branch with changes that have been merged, the CI/CD pipeline automatically:

1. ✅ **Tests** your code (existing test-and-publish workflow)
2. 🚀 **Analyzes** conventional commits to determine version bump
3. 📝 **Updates** `package.json` and `package-lock.json`
4. 🏷️ **Creates** a git tag with the new version
5. 📢 **Publishes** a GitHub release with auto-generated release notes
6. 📤 **Publishes** test results and coverage to GCP

## Workflow Architecture

### 1. Test & Publish Workflow (`test-and-publish.yml`)
- **Trigger**: On push to `master` or pull request
- **Actions**:
  - Runs tests with coverage
  - Publishes test results to GCP Storage
  - Publishes coverage reports to GCP Storage
  - **Succeeds/Fails** which triggers the Release workflow

### 2. Release Workflow (`release.yml`)
- **Trigger**: When `test-and-publish.yml` completes successfully
- **Actions**:
  - Analyzes commit messages since last release
  - Determines version bump using conventional commits
  - Updates `package.json` and `package-lock.json`
  - Creates a git tag (e.g., `v1.2.3`)
  - Creates a GitHub Release with auto-generated changelog
  - Only publishes if changes warrant a release

## Conventional Commits

The release workflow recognizes conventional commit types:

### Version Bumps

| Commit Type | Version | Example |
|---|---|---|
| `feat:` | Minor (minor++) | `feat(auth): add SSO support` → `1.1.0` |
| `fix:` | Patch (patch++) | `fix(button): correct hover state` → `1.0.2` |
| `BREAKING CHANGE:` | Major (major++) | Any commit with this footer → `2.0.0` |

### Non-Releasing Commits

These commit types do **not** trigger a release:
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `test:` - Test file changes
- `ci:` - CI/CD pipeline changes
- `chore:` - Maintenance tasks

### Commit Format

```
<type>(<scope>): <description>

<optional body>

<optional footer>
```

**Examples:**

```
feat(dashboard): add dark mode support
```

```
fix(api): handle null response from endpoint
```

```
feat(auth)!: migrate to OAuth 2.0

BREAKING CHANGE: The legacy authentication method is no longer supported.
Users must update their client libraries.
```

## Release Notes Generation

Release notes are automatically generated from commit messages:

- **Features** appear under "✨ Features"
- **Bug Fixes** appear under "🐛 Bug Fixes"
- **Performance** improvements appear under "⚡ Performance"
- **Refactoring** appears under "♻️ Refactoring"
- **Documentation** appears under "📚 Documentation"

Example GitHub Release:

```
## v1.2.0 (2024-09-06)

### ✨ Features
- feat(dashboard): add dark mode support (#42)
- feat(auth): implement SSO integration (#41)

### 🐛 Bug Fixes
- fix(button): correct hover state (#39)
- fix(form): validate email correctly (#38)

### ⚡ Performance
- perf(api): cache response data (#40)

### 📚 Documentation
- docs: add API reference guide (#37)
```

## Configuration

The semantic-release configuration is defined in `.releaserc.json`:

```json
{
  "branches": ["master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### Key Configurations:
- **Branches**: Only the `master` branch triggers releases
- **commit-analyzer**: Analyzes commit types and determines version
- **release-notes-generator**: Creates human-readable changelog
- **changelog**: Updates `CHANGELOG.md` file
- **npm**: Handles `package.json` updates (publish disabled for private repo)
- **git**: Commits version updates and creates tags
- **github**: Creates GitHub releases

## Workflow Status

### Published Release ✅
When a release is published:
```
✅ Release Published!
================================
Version: 1.2.0
Tag: v1.2.0
Channel: latest

📝 Release Notes:
[Auto-generated release notes...]
```

### No Release Needed ℹ️
When no changes warrant a release:
```
ℹ️ No changes for release
No changes detected that warrant a release.
Commit types (feat, fix, BREAKING CHANGE) are required for automatic releases.
```

## GitHub Actions Permissions

The release workflow requires these GitHub permissions:

- **contents: write** - Push commits and tags, create releases
- **pull-requests: write** - Create PRs if needed (optional)
- **id-token: write** - OIDC authentication for deployments

These are configured in `.github/workflows/release.yml`.

## Environment Variables

The release workflow uses:

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (for push + release creation)
- `NPM_TOKEN` - Optional, if publishing to npm

## Viewing Releases

Released versions appear in:
1. **GitHub Releases**: https://github.com/jhderojasUVa/randomfuckwork/releases
2. **Git Tags**: `git tag` shows all version tags
3. **CHANGELOG.md**: Automatically updated with release history

## Triggering a Release

### Automatic (Recommended)
1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes with conventional commit messages
3. Create a Pull Request to `master`
4. After PR is merged:
   - Tests run automatically
   - If tests pass, release workflow runs
   - If commits warrant a release, version is automatically bumped

### Example Flow

```bash
# Create feature branch
git checkout -b feat/add-export-button

# Make changes
# ... code changes ...

# Commit with conventional format
git commit -m "feat(table): add export to CSV button"

# Push and create PR
git push origin feat/add-export-button

# After PR is merged to master:
# 1. test-and-publish workflow runs → ✅ tests pass
# 2. release workflow runs → ✅ creates v1.1.0
# 3. GitHub Release published with notes
```

## Troubleshooting

### Release not published?
Check:
1. Did the tests pass? (Release only runs on successful test workflows)
2. Are your commits conventional commit format?
3. Do they use types that trigger releases (feat, fix, BREAKING CHANGE)?
4. Check the Actions tab in GitHub for workflow logs

### Wrong version bumped?
Verify:
1. Commit messages use correct conventional commit types
2. `BREAKING CHANGE` footer is used for major version bumps
3. No `docs:`, `test:`, or `chore:` commits between releases

### Release notes missing?
Ensure:
1. Commits have descriptive messages after the type/scope
2. Multiple lines can be used: `type(scope): description\n\nbody`
3. Breaking changes use the `BREAKING CHANGE:` footer

## Security & Permissions

The release workflow:
- ✅ Uses GitHub's built-in `GITHUB_TOKEN` (no secrets needed)
- ✅ Authenticates with git config before pushing
- ✅ Creates tags signed by the runner (configurable)
- ✅ Respects branch protection rules on `master`
- ✅ Runs only after successful tests

## Next Steps

1. **Create a PR** with this branch to review the workflow
2. **Merge** when approved
3. **Create a commit** on `master` using conventional format
4. **Watch** the Actions tab as the workflow runs
5. **Verify** the release appears on GitHub Releases tab

## Support

For issues with:
- **Semantic Release**: https://github.com/semantic-release/semantic-release
- **GitHub Actions**: https://docs.github.com/en/actions
- **Conventional Commits**: https://www.conventionalcommits.org/
