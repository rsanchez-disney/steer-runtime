---
name: opsheet-create-pr
description: Create a GitHub PR for the current branch with the OpSheet team template, auto-filling what's possible and asking the user for the rest
---

# Skill: Create PR (OpSheet Web)

Use this skill when the user says "make a PR", "create a PR", or similar. It gathers context from the branch, diff, and tests, fills in the team PR template, and creates the PR via `gh`.

## Prerequisites

- GitHub CLI (`gh`) authenticated
- On a feature/fix branch (not `main`)
- Changes committed and pushed (or ready to push)

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

6. **Run pre-push and capture output:**

```bash
npm run pre-push
```

   Capture the full pre-push output (lint, build, test results). This output will be pasted directly into the PR body. If pre-push fails, warn the user and ask whether to proceed.

7. **If Jira MCP is available**, fetch the ticket summary for the description. If not available, ask the user for a brief description.

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
<paste full pre-push output here>
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
- **Checklist**: Check "All tests passing" only if tests actually passed in Step 0. Check "No unrelated code changes" only if the diff is scoped to the ticket. If unsure, leave unchecked and ask the user.
- **Test Results**: Paste the full pre-push output from Step 0 inside a code block. Include everything — lint, build, and test results as-is.
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
2. **PR Body** (fully rendered)
3. **Base branch**: `main`
4. **Head branch**: current branch

Ask: _"Here's the PR I'll create. Want me to change anything before submitting?"_

**⏸ CHECKPOINT — User approves or edits the PR content**

### Step 4: Ensure Branch is Pushed

Check if the branch has been pushed:

```bash
git log origin/<branch>..HEAD --oneline 2>/dev/null
```

If there are unpushed commits, push first:

```bash
git push -u origin <branch>
```

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
| Test Results | ✅ | Full pre-push output pasted in code block |
| PR Title | ✅ | Branch prefix + ticket summary |
| Additional related tickets | ❌ | Ask user if there are linked tickets not in Jira |
| Checklist confirmations | ❌ | Ask user to verify if unsure |
| Slack notification fields | ❌ | See `steering/ui-pr-slack-notification.md` for details |

---

## Important Rules

- **Never create a PR on `main`** — verify you're on a feature/fix branch.
- **Always pause for user approval** before creating the PR (Step 3 checkpoint).
- **Do not skip the Slack notification** — always execute Step 6 after PR creation.
- **Title must follow conventional format**: `{type}: OPS-{number} - {description}`.
- **Description must be meaningful** — not just the ticket title repeated.
- **Test results are required** — run `npm run pre-push` and paste the full output into the PR body. If pre-push can't run, note it explicitly.
- **One PR per ticket** — if the branch covers multiple tickets, list all in Related Tickets.
- **Check all boxes honestly** — don't auto-check "All tests passing" if tests failed.
- **Slack notification rules** — see `steering/ui-pr-slack-notification.md` for all webhook rules (non-blocking, resolve names, confirm payload, etc.).
