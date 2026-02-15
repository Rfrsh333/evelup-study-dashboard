# Branch Protection Setup Guide

This guide shows how to configure branch protection rules for the `main` branch to ensure code quality and prevent broken builds from being merged.

## Why Branch Protection?

Branch protection ensures:
- ✅ All tests pass before merge
- ✅ Code is reviewed before merge
- ✅ No force pushes to main
- ✅ Clean, linear history
- ✅ Investor-grade CI/CD confidence

## Step-by-Step Setup

### 1. Navigate to Branch Settings

1. Go to your GitHub repository: `https://github.com/Rfrsh333/evelup-study-dashboard`
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Branches** (under "Code and automation")

### 2. Add Branch Protection Rule

1. Click **Add branch protection rule** (or **Add rule**)
2. In **Branch name pattern**, enter: `main`

### 3. Configure Protection Settings

Enable the following options:

#### ✅ Require a pull request before merging
- **Required approvals:** 1 (minimum)
- ☑ Dismiss stale pull request approvals when new commits are pushed
- ☑ Require review from Code Owners (if you have a CODEOWNERS file)

#### ✅ Require status checks to pass before merging
- ☑ Require branches to be up to date before merging
- **Add status checks:**
  - Search for and add: `Quality`
  - Search for and add: `Build`
  - **Optional:** Add `E2E (Shard 1/4)`, `E2E (Shard 2/4)`, `E2E (Shard 3/4)`, `E2E (Shard 4/4)` if you want E2E to be required
  - **Note:** Status check names must match exactly as they appear in `.github/workflows/ci.yml`

#### ✅ Require conversation resolution before merging
- Ensures all review comments are addressed

#### ✅ Do not allow bypassing the above settings
- Prevents admins from bypassing protection rules
- **Important for investor confidence:** Even admins should go through PR process

#### ⚠️ Optional: Require linear history
- Enforces clean commit history
- **Warning:** This prevents merge commits; use "Squash and merge" or "Rebase and merge" only

### 4. Additional Recommended Settings

#### ✅ Restrict who can push to matching branches
- Only allow through pull requests
- Prevents accidental direct pushes to main

#### ✅ Require deployments to succeed before merging
- If you have deployment previews (Vercel, Railway)
- Ensures deploy previews work before merge

### 5. Save Changes

1. Scroll to bottom
2. Click **Create** (or **Save changes**)
3. Test by creating a PR - it should show required checks

## Required Status Checks Reference

Based on your CI workflow (`.github/workflows/ci.yml`), these are the **exact job names** you should add:

| Status Check Name | Purpose | When it runs |
|------------------|---------|--------------|
| `Quality` | Lint + unit tests | Every PR and push to main |
| `Build` | TypeScript compile + Vite build | Every PR and push to main |
| `E2E (Shard 1/4)` | Cypress E2E tests (shard 1) | Only on PR and main |
| `E2E (Shard 2/4)` | Cypress E2E tests (shard 2) | Only on PR and main |
| `E2E (Shard 3/4)` | Cypress E2E tests (shard 3) | Only on PR and main |
| `E2E (Shard 4/4)` | Cypress E2E tests (shard 4) | Only on PR and main |

**Recommended minimum:** Require `Quality` and `Build` as status checks.

**For maximum confidence:** Also require all 4 E2E shards (but this adds ~10-15min to PR merge time).

## Testing Branch Protection

After setup, test by:

1. Create a new branch: `git checkout -b test/branch-protection`
2. Make a small change (add a comment)
3. Push and create a PR
4. You should see:
   - ⏳ Checks running automatically
   - 🚫 Merge button disabled until checks pass
   - ✅ Merge button enabled after all checks pass

## Troubleshooting

### "Required status check is missing"
- The status check name in branch protection settings doesn't match the job name in your workflow
- Check `.github/workflows/ci.yml` for exact job names (case-sensitive)

### "Status checks never complete"
- Your CI workflow might not be triggering on PR
- Check workflow triggers in `.github/workflows/ci.yml` (should have `pull_request:`)

### "Can't find status check to add"
- Status checks only appear after they've run at least once
- Merge a PR to main first to populate the list, then enable protection

### "E2E tests don't run on feature branch"
- This is **by design** - E2E only runs on PR and main (see workflow `if` condition)
- E2E will run automatically when you open a PR

## Best Practices

### For Solo Development
- Require at least `Quality` and `Build` checks
- Consider self-review (approve your own PRs) for speed
- Use `Squash and merge` to keep history clean

### For Team Development
- Require 1-2 approvals depending on team size
- Require all checks (including E2E)
- Enable conversation resolution
- Use `Rebase and merge` or `Squash and merge`

### For Investor Demos
- Show protected main branch with ✅ all checks required
- Show PR with passing checks before merge
- Show clean commit history
- **This demonstrates professional engineering practices**

## Related Documentation

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CI Workflow](.github/workflows/ci.yml)
- [Testing Guide](../app/README.md#running-tests-locally)

---

**Questions?** Check the [GitHub Discussions](https://github.com/Rfrsh333/evelup-study-dashboard/discussions) or open an issue.
