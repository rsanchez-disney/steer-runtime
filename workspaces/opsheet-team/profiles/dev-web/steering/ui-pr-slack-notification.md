---
inclusion: auto
---

# Slack CR (Code Review) Notification — OpSheet+ VAS

## Purpose

After successfully creating a PR, send a Code Review request to the team's Slack channel via webhook.
This applies to all agents that create PRs (pr_creator_agent, orchestrator, or any manual PR flow).

---

## When to Trigger

Immediately after a PR is successfully created **and** the PR URL is available.
This is the **last step** before returning the final result to the user.

---

## Slack Lookup

The agent **MUST resolve users to Slack user IDs** using this table.
Match by any of the aliases (full name, short name, username). Matching is **case-insensitive**.

| Full Name | Aliases | Slack ID | Pod | Champ |
|-----------|---------|----------|-----|-------|
| Alan Valdez | | U023HDUSW8J | Disney | No |
| Alvaro Joel Paz Monsalve | alvaro.pazmonsalve | UTM7GK9R8 | Pod 2 | No |
| Brenda Sabrina Schenkel | brenda.schenkel | U01A00B2JJJ | Pod 1 | No |
| Cintia Tahirih Jaliri Pancca | Cintia Tahirih | U02490VGT3Q | Pod 4 | No |
| Fabio Catriel Cruz Gonella | Fabio Cruz | U03J8DUPXUG | Pod 1 | No |
| Joseth Guerrero Escobar | Joseth David, Joseth Guerrero | U02P1N7KAQH | Pod 3 | Yes |
| Juan David Porras Palencia | Juan David Porras | U02653L79GE | Pod 5 | No |
| Juan David Uribe Cardenas | Juanda Uribe | UCJNXGE6T | Pod 5 | No |
| Julian Murillo | | U06PBCEU45S | Pod 5 | No |
| Luis Gutierrez | Luis | UU02LDF88 | Pod 5 | Yes |
| Cristian Martin Chavez Gutoff | Martín Chavez, Martin Chavez | U09102DCHV5 | Pod 1 | No |
| Ignacio Smirlian | Nacho Smirlian, nacho | U0396SQ3XGE | Pod 3 | Yes |
| Nelson Andres Sora Mora | Nelson Sora | U01JGKQ62KB | Pod 3 | No |
| Nilda De Marco | | U05RF4FHBE2 | Pod 4 | No |
| Oscar Mauricio Larrotta Bernal | oscar.larrotta | U09LJATJEAJ | Pod 5 | No |
| Patricia Horna | Patty Horna | U02J4T55YTF | Pod 2 | No |
| Ricardo Martinez | | UKF19US83 | Pod 4 | No |
| Victor Rodriguez Muñoz | Victor Rodriguez | U76RE3DEG | Pod 2 | Yes |

---

## Urgency Lookup

| id | Urgency |
|----|---------|
| 0 | Not Urgent |
| 1 | Timely, but Not Urgent |
| 2 | Urgent |
| 3 | Blocker |

---

## User Input Format

Ask the user to provide only:

```
User: Victor Rodriguez
Urgency: 0
```

---

## Resolution Logic

With the user's name, the agent **MUST**:

1. **Look up the user** in the Slack Lookup table (case-insensitive match on Full Name or Aliases).
2. **Identify the user's Pod** from the matched row.
3. **Assign reviewers**: all other members of the same Pod (excluding the requesting user). Fill `reviewer_1`, `reviewer_2` in order. Leave unused slots as `"U123456789"`.
4. **Assign champs**: the member(s) in the same Pod where `Champ = Yes` (excluding the requesting user). Fill `champ_1`, `champ_2`, `champ_3` in order. If fewer than 3 champs exist, fill unused slots with `"U123456789"`.

### Example

If the user is **Alvaro Joel Paz Monsalve** (Pod 2):
- Pod 2 members: Alvaro Joel Paz Monsalve, Patricia Horna, Victor Rodriguez Muñoz
- Reviewers (excluding user): `U02J4T55YTF` (Patricia), `U76RE3DEG` (Victor)
- Champ (Pod 2, Champ=Yes, excluding user): `U76RE3DEG` (Victor)
- Result: `reviewer_1 = "U02J4T55YTF"`, `reviewer_2 = "U76RE3DEG"`, `champ_1 = "U76RE3DEG"`, `champ_2 = "U123456789"`, `champ_3 = "U123456789"`

---

## Auto-Derived Fields

The following fields are derived automatically (do NOT ask the user):
- **Pod**: resolved from the Slack Lookup table based on the user's name
- **Greeting**: generated from the user's full name, e.g.: `"Victor Rodriguez has created a new PR, please review"`
- **URL**: the URL of the newly created PR
- **Jira ticket**: the Jira ticket URL associated with the story/bug (format: `https://myjira.disney.com/browse/OPS-XXXXX`). If no ticket is associated, use `"N/A"`
- **Type**: derived from the change type (branch name or commit type)
- **Goal**: brief summary of the PR's objective (1-2 sentences)

---

## Webhook

**URL:** `https://hooks.slack.com/triggers/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`

**Method:** POST
**Content-Type:** application/json

---

## Payload

Each reviewer and code champ is sent as an **individual field** with a single Slack user ID (not comma-separated).
Empty strings for unused slots.

```json
{
  "urgency": "<string>",
  "pod": "<string>",
  "greeting": "<string>",
  "url": "<string>",
  "jira_ticket": "<string>",
  "type": "<string>",
  "goal": "<string>",
  "reviewer_1": "<slack_user_id or empty>",
  "reviewer_2": "<slack_user_id or empty>",
  "champ_1": "<slack_user_id or U123456789>",
  "champ_2": "<slack_user_id or U123456789>",
  "champ_3": "<slack_user_id or U123456789>"
}
```

### Field Mapping

| Field | Source | Example |
|-------|--------|---------|
| `urgency` | Asked from user | `"Not Urgent"` |
| `pod` | Resolved from Slack Lookup | `"Pod 2"` |
| `greeting` | Auto-generated from user's name | `"Victor Rodriguez has created a new PR, please review"` |
| `url` | URL of the newly created PR | `"https://github.disney.com/repo/pull/43"` |
| `jira_ticket` | Jira ticket URL for the story/bug | `"https://myjira.disney.com/browse/OPS-12345"` |
| `type` | Derived from change type | `"Feature"`, `"Fix"`, `"BugFix"`, `"Refactor"`, `"Docs"`, `"Style"`, `"Performance"`, `"Test"`, `"Build"` |
| `goal` | Summary of the PR objective | `"Adds date range validation to the schedules table"` |
| `reviewer_1` | 1st Pod member (excluding user) | `"U02J4T55YTF"` |
| `reviewer_2` | 2nd Pod member (excluding user, or `""`) | `"U76RE3DEG"` |
| `champ_1` | 1st Pod Champ (excluding user, or `"U123456789"`) | `"U76RE3DEG"` |
| `champ_2` | 2nd Pod Champ (excluding user, or `"U123456789"`) | `"U123456789"` |
| `champ_3` | 3rd Pod Champ (excluding user, or `"U123456789"`) | `"U123456789"` |

**Important:** Each `reviewer_*` and `champ_*` field must contain a **single** Slack user ID string (e.g., `"U76RE3DEG"`), NOT the `<@ID>` mention format. The Slack workflow handles the mention rendering. If a slot is unused, send an empty string `""`.

### Type Mapping

Derive `type` from the branch prefix or commit type:

| Branch/Commit prefix | Type |
|----------------------|------|
| `feat/` | `Feature` |
| `fix/` | `Fix` |
| `bugfix/` | `BugFix` |
| `refactor/` | `Refactor` |
| `docs/` | `Docs` |
| `style/` | `Style` |
| `perf/` | `Performance` |
| `test/` | `Test` |
| `build/`, `chore/` | `Build` |

### Urgency Mapping

If the user doesn't specify, suggest based on the Jira ticket priority:

| Jira Priority | Suggested Urgency |
|---------------|-------------------|
| P0 / Blocker | `Blocker` |
| P1 / Critical | `Urgent` |
| P2 / High | `Timely, but Not Urgent` |
| P3+ / Medium / Low | `Not Urgent` |

---

## How to Send

The agent must detect the operating system before executing the command.
Use the system environment variable or the `system_information` context to determine whether it's Windows or Unix.

### Option 1: macOS / Linux (bash)

```bash
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "urgency": "<urgency>",
    "pod": "<pod>",
    "greeting": "<greeting>",
    "url": "<pr_url>",
    "jira_ticket": "<jira_url>",
    "type": "<type>",
    "goal": "<goal>",
    "reviewer_1": "<id>",
    "reviewer_2": "<id>",
    "champ_1": "<id>",
    "champ_2": "<id>",
    "champ_3": "<id>"
  }' \
  "https://hooks.slack.com/triggers/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"
```

### Option 2: Windows (PowerShell)

Use `Invoke-RestMethod` which is native to PowerShell:

```powershell
$body = @{
    urgency     = "<urgency>"
    pod         = "<pod>"
    greeting    = "<greeting>"
    url         = "<pr_url>"
    jira_ticket = "<jira_url>"
    type        = "<type>"
    goal        = "<goal>"
    reviewer_1  = "<id>"
    reviewer_2  = "<id>"
    champ_1     = "<id>"
    champ_2     = "<id>"
    champ_3     = "<id>"
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri "https://hooks.slack.com/triggers/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" -Method Post -ContentType "application/json" -Body $body
```

### Option 3: Windows (CMD / Git Bash with curl available)

If `curl` is available on Windows (Windows 10+ includes it), use double quotes and escape the inner ones:

```cmd
curl -s -X POST -H "Content-Type: application/json" -d "{\"urgency\":\"<urgency>\",\"pod\":\"<pod>\",\"greeting\":\"<greeting>\",\"url\":\"<pr_url>\",\"jira_ticket\":\"<jira_url>\",\"type\":\"<type>\",\"goal\":\"<goal>\",\"reviewer_1\":\"<id>\",\"reviewer_2\":\"<id>\",\"champ_1\":\"<id>\",\"champ_2\":\"<id>\",\"champ_3\":\"<id>\"}" "https://hooks.slack.com/triggers/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"
```

### Automatic Detection

The agent should choose the correct option based on context:

| Indicator | Method to use |
|-----------|---------------|
| `system_information.platform = win32` and shell = `powershell` | **Option 2** (Invoke-RestMethod) |
| `system_information.platform = win32` and shell = `bash` or `cmd` | **Option 3** (curl with double quotes) |
| `system_information.platform = darwin` or `linux` | **Option 1** (curl with single quotes) |

**Windows preference:** use **Option 2 (PowerShell)** as the first choice since `Invoke-RestMethod` is native and does not depend on `curl` being installed.

---

## Rules

1. **Only ask** for User name and Urgency — derive Pod, reviewers, and champs automatically from the Slack Lookup table.
2. **Resolve names to Slack IDs** — always look up the Slack user ID from the team table. Send raw IDs (e.g., `U76RE3DEG`), not `<@ID>` format.
3. **One ID per field** — each `reviewer_*` and `champ_*` field takes exactly one Slack user ID. Never comma-separate multiple IDs in one field.
4. **Empty unused slots** — if fewer than 2 reviewers, send `""` for unused reviewer fields. For unused champ fields, send `"U123456789"` instead of empty string.
5. **Exclude the requesting user** — never include the user themselves as a reviewer or champ.
6. **Greeting** — generate using the pattern: `"<Full Name> has created a new PR, please review"`.
7. **Non-blocking** — if the webhook fails, report the error but do NOT fail the PR workflow.
8. **Escape JSON** — ensure special characters in goal and greeting are properly escaped.
9. **Confirm before sending** — show the user a summary of the payload before firing the webhook so they can correct any data.
10. **Always send** the notification after a successful PR — do not skip this step.
11. **Warn on unresolved names** — if a name can't be matched to a Slack ID, warn the user and ask them to provide the Slack ID manually.
