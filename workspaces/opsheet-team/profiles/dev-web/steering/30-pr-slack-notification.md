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

## Team Slack ID Lookup

When the user provides reviewer names, the agent **MUST resolve them to Slack user IDs** using this table.
Match by any of the aliases (full name, short name, username). Matching is **case-insensitive**.

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

---

## Required User Input

Before sending the webhook, the agent **MUST ask the user** for the following data that cannot be derived automatically:

1. **Urgency** — ask: "What is the CR urgency?"
   - Options: `Not Urgent`, `Timely, but Not Urgent`, `Urgent`, `Blocker`
   - Default: `Not Urgent`

2. **Pod** — ask: "Which Pod does this belong to?"
   - Options: `Pod 1`, `Pod 2`, `Pod 3`, `Pod 4`, `Pod 5`

3. **Pod Reviewers** — ask: "Who are the Pod reviewers? (provide names, I'll resolve the Slack IDs)"
   - Example: `Victor Rodriguez, Nacho Smirlian`
   - **Required** — do not send without at least one reviewer
   - **Maximum 2 reviewers** — the workflow supports up to 2 individual reviewer slots
   - Resolve each name to a Slack user ID using the lookup table

4. **Code Champs** (optional) — ask: "Is a Code Champs review required? If yes, defaults are Victor Rodriguez, Joseth Guerrero, and Patty Horna"
   - If the user says yes without specifying names, use the defaults:
     - `champ_1`: `U76RE3DEG` (Victor Rodriguez)
     - `champ_2`: `U02P1N7KAQH` (Joseth Guerrero)
     - `champ_3`: `U02J4T55YTF` (Patty Horna)
   - **Maximum 3 champs** — the workflow supports up to 3 individual champ slots
   - If they say no or don't respond, send `U123456789` for all three champ fields

The following fields are derived automatically:
- **Greeting**: a greeting in Spanish, e.g.: `"Hola equipo, por favor revisen cuando puedan. ¡Gracias!"`
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
| `pod` | Asked from user | `"Pod 3"` |
| `greeting` | Auto-generated in Spanish | `"Hola equipo, por favor revisen cuando puedan. ¡Gracias!"` |
| `url` | URL of the newly created PR | `"https://github.disney.com/repo/pull/43"` |
| `jira_ticket` | Jira ticket URL for the story/bug | `"https://myjira.disney.com/browse/OPS-12345"` |
| `type` | Derived from change type | `"Feature"`, `"Fix"`, `"BugFix"`, `"Refactor"`, `"Docs"`, `"Style"`, `"Performance"`, `"Test"`, `"Build"` |
| `goal` | Summary of the PR objective | `"Adds date range validation to the schedules table"` |
| `reviewer_1` | 1st Pod Reviewer Slack ID | `"U76RE3DEG"` |
| `reviewer_2` | 2nd Pod Reviewer Slack ID (or `""`) | `"U0396SQ3XGE"` |
| `champ_1` | 1st Code Champ Slack ID (or `"U123456789"`) | `"U76RE3DEG"` |
| `champ_2` | 2nd Code Champ Slack ID (or `"U123456789"`) | `"U02P1N7KAQH"` |
| `champ_3` | 3rd Code Champ Slack ID (or `"U123456789"`) | `"U02J4T55YTF"` |

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

1. **Always ask** for Pod, Pod Reviewers, and Urgency from the user before sending — do not assume values.
2. **Resolve names to Slack IDs** — always look up the Slack user ID from the team table. Send raw IDs (e.g., `U76RE3DEG`), not `<@ID>` format.
3. **One ID per field** — each `reviewer_*` and `champ_*` field takes exactly one Slack user ID. Never comma-separate multiple IDs in one field.
4. **Empty unused slots** — if fewer than 2 reviewers, send `""` for unused reviewer fields. For unused champ fields, send `"U123456789"` instead of empty string.
5. **Greeting in Spanish** — generate a short, friendly greeting in Spanish.
6. **Non-blocking** — if the webhook fails, report the error but do NOT fail the PR workflow.
7. **Escape JSON** — ensure special characters in goal and greeting are properly escaped.
8. **Code Champs fallback** — if the user doesn't need Code Champs, send `"U123456789"` for all three champ fields (not empty string).
9. **Confirm before sending** — show the user a summary of the payload before firing the webhook so they can correct any data.
10. **Always send** the notification after a successful PR — do not skip this step.
11. **Warn on unresolved names** — if a name can't be matched to a Slack ID, warn the user and ask them to provide the Slack ID manually.
