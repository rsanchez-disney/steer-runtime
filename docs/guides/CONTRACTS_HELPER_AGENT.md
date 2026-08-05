# Contracts Helper Agent — Quick Start Guide

Validates Jira tickets and organizes them into quarterly contract milestone deliverables for technical estimation spreadsheets (RITM/MOSAiC).

## When to use

- Preparing a new RITM or contract estimation document
- Validating which Jira tickets are eligible for a contract
- Grouping tickets into monthly milestones with MOSAiC-compliant descriptions
- Generating spreadsheet-ready deliverable output

## Prerequisites

- Workspace with `pm` profile active
- Jira Cloud MCP configured (`@jira-cloud/*` or `@atlassian/*` tools)
- Know your Jira tickets or epic key
- Know the contract months and total hours

## How to start

```bash
kiro-cli chat --agent contracts_helper_agent
```

Or via the orchestrator:

```
"Validate tickets in epic GCX-800 and organize into Q4 milestones"
```

## Example interaction

```
You: Validate tickets in DPAY-500 epic for a Dev contract, months October/November/December, 2400 total hours

Agent:
  Step 0: Contract type confirmed — Dev Contract
  Step 1: Gathering tickets from epic DPAY-500...
  Step 2: Validation Results:
    ✅ ELIGIBLE (GREEN)
    - DPAY-501: Payment retry mechanism — Open, Unassigned, AC: Yes
    - DPAY-502: Circuit breaker pattern — Not Started, Unassigned, AC: Yes
    ...
    ❌ INELIGIBLE (RED)
    - DPAY-510: Sustainment monitoring — prohibited word "Sustainment"
    - DPAY-511: Auth token refresh — Status "In Progress"

  Step 3: How would you like to group? 1 per ticket or by feature area?

You: Group by feature area

Agent:
  Milestone 1 - October
    D1: Deliver the payment retry mechanism... | https://disneyexperiences.atlassian.net/browse/DPAY-501 | 400 hours
    D2: Deliver the circuit breaker pattern... | https://disneyexperiences.atlassian.net/browse/DPAY-502 | 400 hours
  ...
```

## Validation rules

The agent checks every ticket against these criteria:

### Status traffic light

| Color | Eligible? | Statuses |
|-------|:---------:|----------|
| GREEN | ✅ | Not Started, Open, To Do |
| YELLOW | ⚠️ (with warning) | In Analysis, In Creative |
| RED | ❌ | In Progress, Done, Closed, Blocked, Ready for Test |

### Additional checks

- **Acceptance Criteria**: mandatory — tickets without AC are automatically RED
- **Prohibited words**: "Sustainment", "ADM", "Support", "resources" in summary
- **Contract type alignment**: Dev contracts reject QA/documentation tickets, QA contracts reject pure dev tickets
- **Assignee**: preferably unassigned (assigned = yellow warning, not a disqualifier)

## MOSAiC description rules

The agent generates descriptions that pass MOSAiC review:

- Start with "Deliver" or "Delivery of"
- Minimum 3 lines of technical detail
- No "Acceptance criteria:" label — write as prose
- Verbs in infinitive (never gerund or past tense)
- Each description is unique (no copy-paste with minimal changes)
- Content derived from the actual ticket (no generic boilerplate)
- Jira links as full URLs

## Tips

- Start with an epic key — the agent fetches all child tickets automatically
- If you have a previous spreadsheet, share it so the agent matches the style
- The agent asks for grouping preference AFTER validation (so you know how many eligible tickets exist)
- Hours are divided equally by default — you can customize after seeing the grouping
- You can override RED tickets if you have a reason (the agent will include them with a note)

## Common commands

```
"Validate tickets DPAY-501, DPAY-502, DPAY-503 for a Dev contract"
"Organize these into 3 milestones for July/August/September, 3600 hours total"
"Change D2 to use the description from DPAY-502's acceptance criteria"
"Group D3 and D4 together into a single deliverable"
"Switch to QA contract format"
```

## Output format

The final output is copy-paste ready for your estimation spreadsheet:

```
Milestone 1 - October
  D1: [Description] | [JIRA-URL] | [hours] hours
  D2: [Description] | [JIRA-URL] | [hours] hours

Milestone 2 - November
  D3: [Description] | [JIRA-URL] | [hours] hours
  D4: [Description] | [JIRA-URL] | [hours] hours
```
