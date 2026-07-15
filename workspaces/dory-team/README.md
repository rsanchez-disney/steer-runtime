# Dory Team — PR Review Agent Workspace

AI-powered PR review for the Dory QA Automation team, covering `standalone_tickets` (Python/Behave) and `jenkins-config` (Groovy DSL).

## What It Does

- **Reviews PRs** against Dory-specific golden rules (security, Python quality, BDD, Jenkins patterns)
- **Detects undefined steps** that would cause `UndefinedStepError` at runtime
- **Detects step collisions** that would cause `AmbiguousStep` errors
- **Flags breaking changes** across step regex, shared helpers, and Jenkins parameters
- **Runs pre-commit** (ggshield, black, isort, flake8, mypy, interrogate, docstring linter)
- **Updates Jira** with PR link, status transition, and labels after passing review

---

## Installation

```bash
# 1. Select the Dory workspace in Koda
koda
# Press [w] → select dory-team

# 2. Configure tokens (press [t] in Koda)
# Required:
#   - GitHub PAT for github.disney.com
#   - Jira PAT for disneyexperiences.atlassian.net

# 3. Verify
koda doctor
```

---

## Usage

### Start a Review

```bash
kiro-cli chat --agent dory_code_review_agent
```

Then:
- **"Review my PR"** — uses GitHub MCP to fetch PR diff
- **"Review my changes"** — uses local `git diff main...HEAD`
- **"Review branch feature/COM-63500-fix-login"** — reviews that branch
- **"Review these files: login_steps.py, checkout.feature"** — targeted review

### Example Session

```
You: review my PR for COM-63500

Agent: Getting PR diff from GitHub...
       Detected repo: standalone_tickets
       Files changed: 3 (login_steps.py, checkout.feature, guest_helper.py)
       Running checks...

       [Full review output with findings, BEFORE/AFTER blocks]

       Verdict: 🟡 APPROVED WITH WARNINGS (0 critical, 2 warnings)

       Review passed. Update Jira ticket COM-63500?
       Actions:
         1. Add comment with PR link
         2. Transition to "Review" status
         3. Add label "pr-submitted"
       Proceed? (yes/no/skip)

You: yes

Agent: ✓ Jira updated: COM-63500
         • Comment added: PR link
         • Status: → Review
         • Label: + pr-submitted
```

---

## What It Checks

### standalone_tickets (Python/Behave)

| Category | Checks | Severity |
|----------|--------|----------|
| **Step Validation** | Undefined steps, duplicate steps, removed steps | 🔴 CRITICAL |
| **Security** | Hardcoded secrets, tokens, PII | 🔴 CRITICAL |
| **Python Quality** | No `sleep()`, no generic exceptions, no WebElement in steps, method ≤20 lines | 🔴/⚠️ |
| **BDD Quality** | Scenario Outline required, business-oriented steps, proper tags | ⚠️ WARNING |
| **Docstrings** | Sphinx style, step rules (no `:return:`), POM rules (must `:return:`) | ⚠️ WARNING |
| **Breaking Changes** | Step regex modified (affected features), helper signature changed | ⚠️ WARNING |
| **Pre-commit** | black, isort, flake8, mypy, interrogate, docstring linter | ℹ️/⚠️/🔴 |

### jenkins-config (Groovy)

| Category | Checks | Severity |
|----------|--------|----------|
| **Job DSL Pattern** | Uses JobHelper, standard structure, references executor scripts | 🔴/⚠️ |
| **Parameters** | Breaking changes (remove/rename) | ⚠️ WARNING |
| **Helpers** | Changes to JobHelper/JobHelperMobile impact all jobs | 🔴 CRITICAL |

---

## Jira Integration

| Action | When | How |
|--------|------|-----|
| Add PR comment | After passing review + user confirms | `*PR:* https://github.disney.com/wdpro-automation/{repo}/pull/{number}` |
| Transition to Review | After passing review + user confirms | Moves ticket to "Review" status |
| Add label | After passing review + user confirms | Adds `pr-submitted` label |

**Trigger:** Only after verdict is ✅ APPROVED or 🟡 APPROVED WITH WARNINGS.
**Confirmation:** Always asks before making Jira changes.
**Skip:** Say "skip" or "no ticket" to proceed without Jira update.

---

## Repos Covered

| Repository | Host | Content |
|------------|------|---------|
| `wdpro-automation/standalone_tickets` | github.disney.com | Python/Behave test automation (4000+ steps, 99 step files) |
| `wdpro-automation/jenkins-config` | github.disney.com | Jenkins Job DSL (538 groovy files, 506 jobs) |

---

## Team Dory

| Name | Expertise |
|------|-----------|
| Alvarez, Jesus | MagnifAI, Identity V5, pre-commit, Xray, AI-powered QA |
| Copete, Maria | KAOS DLR, DLR Special Events, mobile devices, MARS |
| Lopez, Alejandra | CME DLR/WDW, TMS DLR, CSV-to-Examples |
| Pacheco, Alejandro | CME GSS & Cast Tools, park reservations |
| Quintero, Luis | UV migration, Xray Cloud, Identity V5, services architecture |
| Urban, Matias | Job Creator, CONTROL WDW, Jenkins organization |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "GitHub MCP unavailable" | Configure GitHub PAT in Koda (`[t]` → GitHub token for github.disney.com) |
| "Jira MCP unavailable" | Configure Jira PAT in Koda (`[t]` → Jira token for disneyexperiences.atlassian.net) |
| "Pre-commit not available" | Install in the repo: `pip install pre-commit && pre-commit install` |
| Agent uses wrong repo context | Specify in your request: "review for standalone_tickets" or "review for jenkins-config" |
| Step catalog stale | Regenerate: `cd standalone_tickets && python scripts/generate_step_catalog.py` |
| Jira transition fails | Ticket may already be in "Review" status — check manually |

---

## File Structure

```
workspaces/dory-team/
├── workspace.json                           # Workspace definition
├── README.md                                # This file
├── context/
│   ├── dory_golden_rules.md                 # Review standards (CRITICAL/WARNING/INFO)
│   ├── repo-standalone-tickets.md           # Python/Behave architecture guide
│   └── repo-jenkins-config.md               # Jenkins DSL architecture guide
├── rules/
│   ├── breaking-change-detection.md         # 3-dimension breaking change detection
│   ├── step-validation.md                   # Undefined/duplicate/removed step checks
│   ├── jira-update-on-pr.md                 # Post-review Jira workflow
│   └── pre-commit-validation.md             # Pre-commit hook integration
└── profiles/
    └── dev-core/
        ├── agents/
        │   └── dory_code_review_agent.json  # Agent definition
        └── prompts/
            └── dory_code_review_agent.md    # Agent prompt
```
