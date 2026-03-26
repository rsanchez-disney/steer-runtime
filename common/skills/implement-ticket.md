---
name: implement-ticket
description: Full development workflow — Jira story to pull request with quality checks and user checkpoints
---

# Implement Ticket

End-to-end development workflow from Jira ticket to pull request.

## Prerequisites

- Project manifest (`project.yaml`) or memory bank with stack, branch, and Jira config
- Jira MCP configured (`./setup.sh mcp-install`)
- Git repository with clean working tree

## Workflow

### Step 0: Gather Context

1. Read `project.yaml` (or memory bank) for: stack, baseBranch, build/test/lint commands, Jira prefix
2. Ask user for the ticket ID if not provided
3. Fetch ticket details from Jira via MCP (summary, description, acceptance criteria)
4. Transition ticket to "In Progress" if Jira statuses are configured

### Step 1: Explore Codebase

1. Identify which files/modules are relevant to the ticket
2. Review existing patterns in the codebase for consistency
3. Note any related tests, configs, or documentation

### Step 2: Generate Plan

1. Break the ticket into small, testable implementation steps
2. Each step should be independently verifiable
3. Present the plan to the user

**⏸ CHECKPOINT — User reviews and approves the plan before proceeding**

### Step 3: Create Branch

```bash
git checkout <baseBranch>
git pull
git checkout -b feat/<JIRA-KEY>-<short-description>
```

### Step 4: Implement

For each step in the plan:
1. Make the code changes
2. Follow project coding standards and patterns
3. Keep changes minimal and focused (golden rule: minimal diff)

**⏸ CHECKPOINT — User reviews implementation before testing**

### Step 5: Test

1. Run the project's test command
2. Verify all existing tests still pass
3. Add new tests for the changes (target ≥90% coverage on new code)
4. Run lint/format checks

```bash
# Commands from project.yaml
<test_command>
<lint_command>
```

### Step 6: Fix Issues

If tests fail or lint errors exist:
1. Diagnose the root cause
2. Fix the issue (prefer fixing source code over modifying tests)
3. Re-run tests until green

### Step 7: Review

1. Run `git diff <baseBranch>...HEAD` to review all changes
2. Verify changes map to acceptance criteria
3. Check for: no secrets, no unrelated changes, proper error handling, structured logging

**⏸ CHECKPOINT — User reviews final changes before shipping**

### Step 8: Ship

1. Stage and commit with conventional commit message
2. Push branch
3. Create PR with description mapping changes to acceptance criteria
4. Update Jira ticket status if configured

## Important Rules

- **Never proceed past a checkpoint without explicit user approval**
- **Read project config at point of use** — don't cache across steps
- **Minimal diff** — change only what the ticket requires
- **No secrets in code** — use environment variables
- **Backward compatibility** — API changes must be additive
