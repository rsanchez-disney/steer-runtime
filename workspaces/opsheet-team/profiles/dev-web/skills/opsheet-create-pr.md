---
name: opsheet-create-pr
description: Create a GitHub PR for the current branch with the OpSheet team template, auto-filling what's possible and asking the user for the rest
---

# Skill: Create PR (OpSheet Web)

Use this skill when the user says "make a PR", "create a PR", or similar. It gathers context from the branch, diff, and push results, fills in the team PR template, and creates the PR via `gh`.

## Prerequisites

- GitHub CLI (`gh`) authenticated
- On a feature/fix branch (not `main`)
- Changes committed (push will be handled as part of this workflow)

---

## Workflow

### Initial Message

When this skill is activated, immediately tell the user:

> "📋 Using **opsheet-create-pr** skill. Let me gather context and prepare your PR..."

---

### Step 0: Gather Context

1. **Get the current branch name:**

```bash
git branch --show-current
```

2. **Extract the ticket ID** from the branch name.
   Branch format: `{type}/OPS-{number}` or `{type}/OPS-{number}-{short-description}`.
   Extract `OPS-{number}` — this is the related ticket.
   If the branch doesn't match this pattern, ask the user for the ticket ID.

3. **Determine the change type** from the branch prefix:

| Branch prefix | Type of Change |
|---------------|----------------|
| `feat/` or `feature/` | Feature |
| `fix/` or `bugfix/` | Bug fix |
| `refactor/` | Other: Refactor |
| `test/` | Other: Test |
| `chore/` or `docs/` | Other: (use prefix) |

4. **Get the diff summary against main:**

```bash
git diff --stat main...HEAD
```

5. **Determine affected projects** from the changed file paths:
   - Files under `projects/opsheet-suite-web/` → `opsheet-suite-web`
   - Files under `projects/ngx-opsheet-datatable/` → `ngx-opsheet-datatable`
   - Files under `projects/ngx-opsheet-hyperion/` → `ngx-opsheet-hyperion`
   - If the path structure differs, infer from the top-level directories in the diff.

6. **If Jira MCP is available**, fetch the ticket summary for the description. If not available, ask the user for a brief description.

### Step 1: Build the PR Body

Assemble the PR body using this exact template. Fill in everything you can from the context gathered above. For fields you cannot determine, **ask the user**.

```markdown
**Before requesting a review:**  *Please confirm that you have thoroughly read the relevant ticket(s) and are strictly following all requirements and rules specified in our [guidelines](https://docs.google.com/presentation/d/1ngEwsPW5BMqYTUWfYnazjFuJNiDTFwoCANQM-Lrygkg/edit?slide=id.g35f391192_00#slide=id.g35f391192_00).*

## Description
<summary of what was done and why — derived from the diff and ticket>

## Related Tickets
- [OPS-XXXXX](https://myjira.disney.com/browse/OPS-XXXXX)

## Checklist
- [x] Reviewed requirements at [PR Guidelines](https://docs.google.com/presentation/d/1ngEwsPW5BMqYTUWfYnazjFuJNiDTFwoCANQM-Lrygkg/edit?slide=id.g32f7217ad5a_0_7#slide=id.g32f7217ad5a_0_7)
- [x] All tests passing
- [x] No unrelated code changes

## Test Results
```
<paste full push output here>
```

## Type of Change
- [ ] Bug fix
- [ ] Feature
- Other:

## Projects Affected
- [ ] opsheet-suite-web
- [ ] ngx-opsheet-datatable
- [ ] ngx-opsheet-hyperion
```

**Auto-fill rules:**

- **Description**: Summarize the changes from the diff. If the Jira ticket was fetched, incorporate the ticket summary/acceptance criteria. Keep it concise but informative — not just the title repeated.
- **Related Tickets**: Use the ticket ID extracted from the branch. Format as a Jira link: `[OPS-XXXXX](https://myjira.disney.com/browse/OPS-XXXXX)`. If there are linked tickets from Jira, include those too.
- **Checklist**: Check "All tests passing" only if the push (which triggers pre-push hooks) succeeded without test failures. Check "No unrelated code changes" only if the diff is scoped to the ticket. If unsure, leave unchecked and ask the user.
- **Test Results**: Will be filled in after the push in Step 4. Leave a placeholder during initial assembly: `<will be populated after push>`.
- **Type of Change**: Check the appropriate box based on the branch prefix mapping from Step 0. If "Other", fill in the type.
- **Projects Affected**: Check the boxes based on the affected paths detected in Step 0.

### Step 2: Generate the PR Title

Format: `{type}: OPS-{number} - {short description}`

- `{type}` = `feat`, `fix`, `refactor`, `test`, `chore`, `docs` (from branch prefix)
- `{short description}` = derived from the ticket summary or the most significant change in the diff

Examples:
- `feat: OPS-34523 - Add date range filter to schedules table`
- `fix: OPS-34100 - Handle null response in lane service`

### Step 3: Present to User for Review

Show the user:
1. **PR Title**
2. **PR Body** (fully rendered, with test results placeholder noted)
3. **Base branch**: `main`
4. **Head branch**: current branch

Ask: _"Here's the PR I'll create. Want me to change anything before submitting? I'll push the branch next — the pre-push hook will run lint/build/tests and I'll include the output in the PR."_

**⏸ CHECKPOINT — User approves or edits the PR content**

### Step 4: Push the Branch and Capture Pre-Push Output

Push the branch to origin. The git pre-push hook will automatically execute `npm run pre-push` (lint, build, tests). Capture the **full output** of the push command:

```bash
git push -u origin <branch> 2>&1
```

**⚠️ Important: This command may take several minutes** because the pre-push hook runs lint, build, and tests before the push completes. This is expected behavior.

- **If the command appears to hang or times out**: Ask the user _"The push is still running (the pre-push hook runs lint/build/tests which can take a few minutes). Is it still in progress?"_ — **never** suggest `--no-verify` or any way to skip the pre-push hook. Wait for the process to finish.
- **If push succeeds**: Extract the pre-push output (lint, build, test results) from the captured output. This will be pasted into the Test Results section of the PR body.
- **If push fails** (pre-push hook failure — lint errors, build errors, or test failures): Show the full output to the user, explain what failed, and **stop the workflow**. The user must fix the issues and retry. Do NOT create the PR with failing checks.
- **If the failure is memory-related** (e.g., `JavaScript heap out of memory`, `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed`, or similar OOM errors): Suggest the user increase Node's memory limit before retrying. Offer the command appropriate for their OS:
  - **Linux/macOS (bash/zsh):** `export NODE_OPTIONS=--max-old-space-size=4096`
  - **Windows (CMD):** `set NODE_OPTIONS=--max-old-space-size=4096`
  - **Windows (PowerShell):** `$env:NODE_OPTIONS="--max-old-space-size=4096"`
  
  Then ask the user to retry the push.

After a successful push, update the PR body:
1. Replace the Test Results placeholder with the full captured push output.
2. Check the "All tests passing" checkbox in the Checklist (since pre-push passed).

### Step 5: Create the PR

```bash
gh pr create --base main --head <branch> --title "<title>" --body "<body>"
```

Capture and display the PR URL to the user.

### Step 6: Slack CR Notification

After the PR is created successfully, follow the **Slack CR Notification workflow** defined in `steering/ui-pr-slack-notification.md`.

That steering file is the single source of truth for:
- Team Slack ID lookup table
- Required user inputs (urgency, pod, reviewers, code champs)
- Webhook URL, payload structure, and field mapping
- Platform-specific send commands (bash, PowerShell, CMD)
- All notification rules

**Summary of what to do here:**
1. Ask the user for: urgency, pod, pod reviewers, and (optionally) code champs.
2. Auto-derive: greeting (Spanish), PR URL, Jira ticket URL, type (from branch prefix), goal (from PR description).
3. Resolve reviewer/champ names to Slack IDs using the lookup table in the steering file.
4. Show the user a summary of the payload for confirmation.
5. Send the webhook using the appropriate OS method.
6. If the webhook fails, report the error but do NOT fail the PR workflow — the PR is already created.

---

## What to Ask the User

Only ask for information you cannot derive automatically:

| Field | Auto-derived? | Source |
|-------|:---:|--------|
| Ticket ID | ✅ | Branch name |
| Description | ✅ (partial) | Diff + Jira ticket |
| Type of Change | ✅ | Branch prefix |
| Projects Affected | ✅ | Changed file paths |
| Test Results | ✅ | Captured from `git push` output (pre-push hook runs lint/build/tests) |
| PR Title | ✅ | Branch prefix + ticket summary |
| Additional related tickets | ❌ | Ask user if there are linked tickets not in Jira |
| Checklist confirmations | ❌ | Ask user to verify if unsure |
| Slack notification fields | ❌ | See `steering/ui-pr-slack-notification.md` for details |

---

## Important Rules

- **Never create a PR on `main`** — verify you're on a feature/fix branch.
- **Always pause for user approval** before pushing and creating the PR (Step 3 checkpoint).
- **Do not skip the Slack notification** — always execute Step 6 after PR creation.
- **Title must follow conventional format**: `{type}: OPS-{number} - {description}`.
- **Description must be meaningful** — not just the ticket title repeated.
- **Test results come from the push** — the git pre-push hook runs `npm run pre-push` automatically. Capture the full push output and paste it into the PR body. Do NOT run `npm run pre-push` manually.
- **Never suggest `--no-verify`** — if the push takes a long time, ask the user if the process is still running. The pre-push hook is mandatory and must not be skipped under any circumstance.
- **If push fails, stop** — do not create the PR. Show the error output and let the user fix the issue.
- **One PR per ticket** — if the branch covers multiple tickets, list all in Related Tickets.
- **Check all boxes honestly** — only check "All tests passing" if the push (and its pre-push hook) succeeded.
- **Slack notification rules** — see `steering/ui-pr-slack-notification.md` for all webhook rules (non-blocking, resolve names, confirm payload, etc.).
