---
name: ship-it
description: Commit, push, create PR, and optionally merge — with user checkpoints at each step
---

# Ship It

Multi-step workflow to ship changes: commit → push → PR → merge.

## Prerequisites

- Project manifest (`project.yaml`) or memory bank with baseBranch and integrations config
- Changes on a feature branch (not main/master)
- GitHub CLI (`gh`) authenticated

## Workflow

### Step 1: Pre-flight

1. Read `project.yaml` for baseBranch and Jira/GitHub config
2. Run `git status` — verify there are changes to ship
3. Verify you're on a feature branch (not main/master)
4. Run lint and test commands to confirm green state

### Step 2: Stage and Commit

1. Review changes with `git diff` and `git diff --cached`
2. Generate a conventional commit message based on the changes:
   - `feat:` for new features, `fix:` for bug fixes, `docs:` for documentation
   - Include Jira ticket ID if available (e.g., `feat(DPAY-1234): add export endpoint`)
3. Present the commit message to the user

**⏸ CHECKPOINT — User approves or edits the commit message**

4. Commit with the approved message

### Step 3: Push

```bash
git push -u origin <current-branch>
```

### Step 4: Create PR

1. Generate PR title from the commit message
2. Generate PR body: summary, acceptance criteria mapping, testing notes
3. Create PR via `gh pr create`

**⏸ CHECKPOINT — User reviews PR before optional merge**

### Step 5: Merge (Optional)

If user approves:
```bash
gh pr merge <number> --merge --delete-branch
```

### Step 6: Update Ticket

If Jira integration is configured, transition ticket and add PR link.

## Important Rules

- **Never commit directly to main/master**
- **Always pause for user approval** before commit and before merge
- **One PR per ticket** — keep changes focused
