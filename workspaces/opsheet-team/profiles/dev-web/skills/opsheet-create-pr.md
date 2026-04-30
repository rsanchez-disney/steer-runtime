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

After the PR is created successfully, send a Code Review request to the team's Slack channel.

#### 6a. Ask the user for:

1. **Urgency** — _"What is the CR urgency?"_
   - Options: `Not Urgent`, `Timely, but Not Urgent`, `Urgent`, `Blocker`
   - Default: `Not Urgent`
   - If Jira priority is available, suggest: P0/Blocker → `Blocker`, P1/Critical → `Urgent`, P2/High → `Timely, but Not Urgent`, P3+ → `Not Urgent`

2. **Pod** — _"Which Pod does this belong to?"_
   - Options: `Pod 1`, `Pod 2`, `Pod 3`, `Pod 4`, `Pod 5`

3. **Pod Reviewers** — _"Who are the Pod reviewers? (provide names, I'll resolve the Slack IDs)"_
   - **Required** — at least one reviewer. Maximum 2.
   - Resolve names to Slack IDs using the lookup table below.

4. **Code Champs** (optional) — _"Is a Code Champs review required? If yes, defaults are Victor Rodriguez, Joseth Guerrero, and Patty Horna"_
   - If yes without names, use defaults: `U76RE3DEG`, `U02P1N7KAQH`, `U02J4T55YTF`
   - If no, send `U123456789` for all three champ fields.

#### 6b. Team Slack ID Lookup

Resolve reviewer/champ names to Slack IDs. Match is **case-insensitive** against any alias.

| Full Name | Aliases | Slack ID |
|-----------|---------|----------|
| Andres Herrera | a.herrera | UJYJCBAHF |
| Alan Valdez | | U023HDUSW8J |
| Alvaro Joel Paz Monsalve | alvaro.pazmonsalve | UTM7GK9R8 |
| Brenda Sabrina Schenkel | brenda.schenkel | U01A00B2JJJ |
| Cintia Tahirih Jaliri Pancca | Cintia Tahirih | U02490VGT3Q |
| Cristian Tangarife | | U03N17J2MDM |
| Daniel Alejandro Esquivel Correa | Daniel Esquivel | U037BKA9WBT |
| Fabio Catriel Cruz Gonella | Fabio Cruz | U03J8DUPXUG |
| Jonathan Villaverde | | U03JCQVENBX |
| Joseth Guerrero Escobar | Joseth David, Joseth Guerrero | U02P1N7KAQH |
| Juan David Porras Palencia | Juan David Porras | U02653L79GE |
| Juan Pablo Ortiz Palacio | Juan Pablo Ortiz | UDNDQSBQU |
| Juan David Uribe Cardenas | Juanda Uribe | UCJNXGE6T |
| Julian Murillo | | U06PBCEU45S |
| Luis Gutierrez | Luis | UU02LDF88 |
| Mario Andres Ojeda | Mario Ojeda | UDNAR0Z7E |
| Cristian Martin Chavez Gutoff | Martín Chavez, Martin Chavez | U09102DCHV5 |
| Martin Perez | | U03CSE5TU48 |
| Miguel Angel Sanchez Gonzalez | Miguel Sanchez | U03KEGFQEH3 |
| Ignacio Smirlian | Nacho Smirlian, nacho | U0396SQ3XGE |
| Nelson Andres Sora Mora | Nelson Sora | U01JGKQ62KB |
| Nilda De Marco | | U05RF4FHBE2 |
| Oscar Mauricio Larrotta Bernal | oscar.larrotta | U09LJATJEA |
| Patricia Horna | Patty Horna | U02J4T55YTF |
| Ricardo Martinez | | UKF19US83 |
| Rodrigo Veloso | | U023AJ90KM4 |
| Victor Rodriguez Muñoz | Victor Rodriguez | U76RE3DEG |

If a name can't be matched, warn the user and ask for the Slack ID manually.

#### 6c. Build and send the payload

**Auto-derived fields:**
- `greeting`: a short, friendly greeting in Spanish (e.g., `"Hola equipo, por favor revisen cuando puedan. ¡Gracias!"`)
- `url`: the PR URL from Step 5
- `jira_ticket`: `https://myjira.disney.com/browse/OPS-{number}` (from the branch). If no ticket, use `"N/A"`.
- `type`: derived from branch prefix using this mapping:

| Branch prefix | Type |
|---------------|------|
| `feat/` | `Feature` |
| `fix/` | `Fix` |
| `bugfix/` | `BugFix` |
| `refactor/` | `Refactor` |
| `docs/` | `Docs` |
| `style/` | `Style` |
| `perf/` | `Performance` |
| `test/` | `Test` |
| `build/`, `chore/` | `Build` |

- `goal`: brief summary of the PR objective (1-2 sentences, from the PR description)

**Payload:**

```json
{
  "urgency": "<string>",
  "pod": "<string>",
  "greeting": "<string>",
  "url": "<pr_url>",
  "jira_ticket": "<jira_url>",
  "type": "<type>",
  "goal": "<goal>",
  "reviewer_1": "<slack_user_id or empty>",
  "reviewer_2": "<slack_user_id or empty>",
  "champ_1": "<slack_user_id or U123456789>",
  "champ_2": "<slack_user_id or U123456789>",
  "champ_3": "<slack_user_id or U123456789>"
}
```

Each `reviewer_*` and `champ_*` field takes a **single** Slack user ID (not `<@ID>` format). Unused reviewer slots → `""`. Unused champ slots → `"U123456789"`.

#### 6d. Confirm before sending

Show the user a summary of the payload. Let them correct any data before firing.

**⏸ CHECKPOINT — User approves the Slack notification payload**

#### 6e. Send the webhook

Detect the OS and use the appropriate method:

**macOS / Linux:**
```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '<json_payload>' \
  "https://hooks.slack.com/triggers/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"
```

**Windows (PowerShell — preferred):**
```powershell
$body = '<json_payload>'
Invoke-RestMethod -Uri "https://hooks.slack.com/triggers/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" -Method Post -ContentType "application/json" -Body $body
```

**Windows (CMD / Git Bash with curl):**
```cmd
curl -s -X POST -H "Content-Type: application/json" -d "<escaped_json>" "https://hooks.slack.com/triggers/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"
```

**If the webhook fails**, report the error but do NOT fail the PR workflow. The PR is already created.

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
| Urgency | ❌ | Ask user (suggest from Jira priority if available) |
| Pod | ❌ | Ask user |
| Pod Reviewers | ❌ | Ask user (resolve names to Slack IDs) |
| Code Champs | ❌ | Ask user (optional, has defaults) |

---

## Important Rules

- **Never create a PR on `main`** — verify you're on a feature/fix branch.
- **Always pause for user approval** before creating the PR (Step 3 checkpoint).
- **Do not skip the Slack notification** — always send after PR creation.
- **Title must follow conventional format**: `{type}: OPS-{number} - {description}`.
- **Description must be meaningful** — not just the ticket title repeated.
- **Test results are required** — run `npm run pre-push` and paste the full output into the PR body. If pre-push can't run, note it explicitly.
- **One PR per ticket** — if the branch covers multiple tickets, list all in Related Tickets.
- **Check all boxes honestly** — don't auto-check "All tests passing" if tests failed.
- **Slack notification is non-blocking** — if the webhook fails, the PR is still valid.
- **Resolve names to Slack IDs** — never send raw names in the webhook payload.
- **Confirm Slack payload with user** — always show the summary before sending.
