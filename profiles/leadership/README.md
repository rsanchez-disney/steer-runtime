# Leadership Profile

**Cross-team analytics, quarterly reporting, and executive briefings for Tech Directors and Delivery Managers**

---

## Agents (5)

### leadership_orchestrator_agent
Routes queries to specialists, coordinates multi-team reports.

### portfolio_analyst_agent
Cross-team Jira analytics — velocity, delivery accuracy, carry-over rates, cycle time.

### quarterly_reporter_agent
Generates 10-section quarterly business reports for Disney directors.

### cross_team_coordinator_agent
Tracks cross-team dependencies, shared blockers, integration risks.

### executive_briefing_agent
Produces audience-tailored summaries — directors, colleagues, partners.

---

## Capabilities

- ✅ **Jira** — cross-project queries across all teams in the vertical
- ✅ **Confluence / MyWiki** — publish reports
- ✅ **Thinking** — complex analysis and reasoning

---

## Quick Start

```bash
koda install leadership
koda workspace apply payments-vertical

kiro-cli chat --agent leadership_orchestrator_agent
> "Show me delivery health across all teams for the last 3 sprints"
```

---

## Structure

```
profiles/leadership/
├── agents/
│   ├── leadership_orchestrator_agent.json
│   ├── portfolio_analyst_agent.json
│   ├── quarterly_reporter_agent.json
│   ├── cross_team_coordinator_agent.json
│   └── executive_briefing_agent.json
├── prompts/
│   └── (5 prompt files)
├── context/
│   ├── leadership_guidelines.md
│   ├── portfolio_projects.md
│   ├── quarterly_template.md
│   └── executive_communication.md
└── README.md
```

---

**Profile Version:** 1.0
**Agents:** 5
**Last Updated:** April 18, 2026
