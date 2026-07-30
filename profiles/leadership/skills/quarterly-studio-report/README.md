# Quarterly studio report — quick start

## What this does

Generates a per-studio quarterly performance report with Jira metrics, business impact narrative, roadmap, and director-level metrics. Publishes to Confluence Cloud in a consistent format.

## Which agent to use

```
quarterly_reporter_agent
```

Available in the `leadership` profile. Start a session with:

```bash
koda chat --agent quarterly_reporter_agent
```

Or from the orchestrator, just ask — it routes automatically.

## Prompt examples

### Single studio report

```
Create the Q3 FY2026 report for Studio Bang in Lodging
```

```
Help me with the Q4 report for Nebula
```

```
Generate quarterly report for Terror, Q3 FY2026
```

### With specific guidance

```
Q3 report for Studio Rocket. Highlight the PCI compliance migration as the top deliverable.
```

```
Create Q4 FY2026 report for Yondu. Note that velocity dropped due to 2 engineers on leave.
```

### Updating an existing report

```
Update the Q3 report for Gamora — add the payment toggle-on that went live June 15
```

### Multiple studios (uses general quarterly-report skill)

```
Generate the full Q3 FY2026 Lodging vertical report with all studios
```

## What happens

1. Agent confirms scope (quarter, studio, vertical)
2. Queries Jira Cloud for resolved/created issues using the studio's configured method
3. Calculates metrics (velocity, backlog, issue mix)
4. Identifies key deliverables from epics and high-priority stories
5. Asks you to validate deliverables before writing
6. Drafts the report following the fixed output template
7. Asks you to approve content before publishing
8. Publishes to Confluence Cloud as a child page under the vertical report

## Three checkpoints (the agent will pause)

| Gate | What it asks | Why |
|------|-------------|-----|
| Scope | "I'll generate Q3 for Bang in Lodging. Correct?" | Prevents wasted queries |
| Deliverables | "Here are the top items. Anything missing?" | You know context the agent can't see |
| Final | "Does this look right? Ready to publish?" | Last chance before Confluence write |

## Prerequisites

- `leadership` profile installed (`koda install leadership`)
- Jira Cloud access configured (`@jira-cloud/*` or `@atlassian/*`)
- Confluence Cloud access configured
- Vertical config exists at `~/.kiro/context/vertical-config.json` (installed with the profile)

## Studio configuration

The skill reads studio metadata from `vertical-config.json`. Each studio has:

- `project` — Jira project key (ROS, TEP3, GRPS, CCS)
- `query_method` — how to filter: `studio_field`, `sprint_based`, or `combined`
- `board_ids` — for sprint velocity queries
- `sub_tasks` — include or exclude from counts
- `impact_classification` — for director metrics

If your studio isn't in the config, the agent will ask you for the metadata interactively.

## Output format

Every report follows the same structure (defined in `OUTPUT_TEMPLATE.md`):

1. Metrics table
2. Data source and methodology
3. Business impact (2-3 paragraphs)
4. Key deliverables (bulleted)
5. Roadmap table (with status lozenges)
6. Risks and notes
7. Director metrics table

Sections are never omitted or reordered.
