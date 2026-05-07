# Git Branching & Forking Workflow — L2 Studio

## Overview

L2 Studio works across GitLab and GitHub Enterprise repos with different access models. This document defines the branching and forking conventions that MUST be followed.

---

## GitLab Repos (Direct Access)

L2 developers have direct push access to GitLab repos. No forking needed.

### Workflow

1. **Pull latest from the main branch** (`main` or `master` — check which one the repo uses)
2. **Check for dependency changes** — if `package.json` or `package-lock.json` changed in the pull, run `npm install` before doing anything else. For Polymer 2 projects with Bower, also check `bower.json` and run `bower install` if changed.
3. **Create a new branch** named with the Jira ticket ID
4. **Branch name MUST be 10 characters or fewer** — the GitLab pre-build pipeline will fail if the branch name exceeds 10 characters, and you won't be able to see if the build passes
5. Push the branch directly to the repo (no fork)
6. Create a merge request from the branch

### Branch Naming

```
# CORRECT — 10 chars or fewer
COM-12345
CME-33051
GRPS-1234

# WRONG — too long, pre-build will fail
COM-168301-oneid-migration
feature/COM-168301
fix/oneid-jwt-update
```

**Rule:** Use ONLY the Jira ticket ID as the branch name. No prefixes, no descriptions, no slashes.

### Example

```bash
git checkout main
git pull origin main

# Check if dependencies changed
git diff HEAD@{1} --name-only | grep -E "package(-lock)?\.json|bower\.json"
# If any matched, install:
npm install
# For Polymer 2 projects: bower install

git checkout -b COM-168301
# ... make changes ...
git push origin COM-168301
# Create merge request in GitLab
```

---

## GitHub Enterprise Repos (Fork Required)

L2 developers do NOT have direct push access to GitHub Enterprise repos. A fork is required.

### Workflow

1. **Fork the repo** to your personal GitHub Enterprise account (if not already forked)
2. **Update the main branch** in the **main repo** (upstream), not the fork:
   ```bash
   git remote add upstream <main-repo-url>  # if not already added
   git checkout main  # or master
   git pull upstream main
   ```
3. **Check for dependency changes** — if `package.json` or `package-lock.json` changed in the pull, run `npm install`. For Polymer 2 projects with Bower, also check `bower.json` and run `bower install`.
4. **Create a new branch** named with the Jira ticket ID
5. **Push the branch to your fork** (origin), not the main repo:
   ```bash
   git push origin COM-170721
   ```
6. Create a pull request from your fork's branch to the main repo's main branch
7. (Optional but recommended) Keep your fork's main branch in sync with upstream:
   ```bash
   git push origin main
   ```

### Branch Naming

Same convention as GitLab — use the Jira ticket ID. The 10-character limit is GitLab-specific, but for consistency use the same pattern on GitHub.

```
# Branch name
COM-170721
CME-33051
```

### Example

```bash
# One-time setup: add upstream remote
git remote add upstream https://github.disney.com/commerce/wdpr-ecommerce-cme-res-spa.git

# Update main from upstream (main repo)
git checkout main
git pull upstream main

# Check if dependencies changed and install if needed
git diff HEAD@{1} --name-only | grep -E "package(-lock)?\.json|bower\.json"
# If any matched:
npm install

# Create branch and push to fork
git checkout -b COM-170721
# ... make changes ...
git push origin COM-170721

# Create PR: fork/COM-170721 → upstream/main

# Optional: keep fork's main in sync
git checkout main
git push origin main
```

---

## Summary

| | GitLab | GitHub Enterprise |
|---|--------|-------------------|
| **Access** | Direct push | Fork required |
| **Branch from** | `main`/`master` in the repo | `main`/`master` from upstream (main repo) |
| **Push to** | The repo directly | Your fork |
| **Branch name** | Jira ticket ID only (≤10 chars) | Jira ticket ID |
| **PR/MR target** | Same repo's `main`/`master` | Upstream repo's `main`/`master` |
| **10-char limit** | YES — pre-build fails otherwise | No hard limit, but use same convention |

---

## ⚠️ Common Mistakes

**Branch name too long on GitLab:**
- Pre-build pipeline will fail silently — you won't see build results
- Rename the branch: `git branch -m COM-168301-fix COM-16830` or recreate with a shorter name

**Pushing to upstream instead of fork on GitHub:**
- You don't have push access to the main repo — the push will fail
- Make sure `origin` points to your fork and `upstream` points to the main repo
- Check with: `git remote -v`

**Fork's main branch out of date:**
- Your new branch will be based on stale code
- Always `git pull upstream main` before creating a new branch

**Creating branch from wrong base:**
- Always branch from `main` or `master` (whichever the repo uses), never from another feature branch

**Skipping `npm install` after pulling:**
- If `package.json` or `package-lock.json` changed in the pull, your `node_modules` are out of date
- You'll get build errors, missing modules, or version mismatches
- Always check: `git diff HEAD@{1} --name-only | grep -E "package(-lock)?\.json"`
- If matched, run `npm install` before doing anything else
- For Polymer 2 projects: also check `bower.json` and run `bower install`
