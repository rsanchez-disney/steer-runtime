# PM Profile

**Project Manager / Scrum Master agents for sprint execution, ceremonies, risk tracking, and delivery reporting**

---

## Agents (6)

### pm_orchestrator_agent
Coordinates PM/Scrum Master workflows and delegates to specialists.

**Use when:** Complex PM tasks requiring multiple agents

### sprint_manager_agent
Manages sprint planning, capacity, backlog grooming, and sprint health.

**Use when:**
- Sprint planning
- Capacity analysis
- Backlog review
- Sprint health checks

### standup_agent
Generates daily standup summaries from Jira activity.

**Use when:**
- Standup prep
- Stale item detection
- Blocker alerts

### retro_agent
Facilitates retrospectives with data-driven insights and action item tracking.

**Use when:**
- Sprint retros
- Trend analysis
- Action item follow-up

### risk_tracker_agent
Identifies blockers, dependencies, and risks across sprints and epics.

**Use when:**
- Risk assessment
- Blocker tracking
- Dependency mapping

### delivery_reporter_agent
Generates velocity reports, burndown analysis, and release readiness assessments.

**Use when:**
- Sprint reports
- Velocity trends
- Release readiness
- Burndown analysis

---

## Capabilities

Agents have access to:
- ✅ **Jira** - Read sprints, stories, velocity, blockers
- ✅ **Confluence** - Read/write ceremony docs, reports
- ✅ **MyWiki** - Read/write internal documentation
- ✅ **File Operations** - Read/write local files

---

## Quick Start

```bash
# Install PM profile
koda install pm

# Use an agent
kiro-cli chat --agent pm_orchestrator_agent
```

---

## Example Usage

### Sprint Planning
```bash
kiro-cli chat --agent sprint_manager_agent
> "Plan sprint 24 for project DPAY — analyze capacity, suggest stories from backlog"
```

### Daily Standup
```bash
kiro-cli chat --agent standup_agent
> "Generate standup summary for today — flag stale items and blockers"
```

### Retrospective
```bash
kiro-cli chat --agent retro_agent
> "Facilitate retro for sprint 23 — pull velocity data, identify trends, track action items"
```

### Risk Assessment
```bash
kiro-cli chat --agent risk_tracker_agent
> "Identify blockers and dependencies for epic DPAY-500 across all sprints"
```

### Delivery Report
```bash
kiro-cli chat --agent delivery_reporter_agent
> "Generate velocity report for last 5 sprints with burndown and release readiness"
```

### Full PM Workflow
```bash
kiro-cli chat --agent pm_orchestrator_agent
> "Prepare for sprint 24: review sprint 23 velocity, run risk assessment, 
   plan capacity, and generate sprint planning doc"
```

---

## Structure

```
.kiro-pm/
├── agents/              # 6 agent configurations
│   ├── pm_orchestrator_agent.json
│   ├── sprint_manager_agent.json
│   ├── standup_agent.json
│   ├── retro_agent.json
│   ├── risk_tracker_agent.json
│   └── delivery_reporter_agent.json
├── prompts/             # Agent prompts
├── context/             # PM guidelines and templates
│   ├── pm_guidelines.md
│   └── ceremony_templates.md
└── README.md            # This file
```

---

## Documentation

📖 **PM_PROMPT_GUIDE.md** - Workflow examples with prompts
📖 **PM_WORKSPACES_GUIDE.md** - Team workspace configuration

---

## See Also

- Main README: `../README.md`
- Setup guide: `koda install`
- Full documentation: `../docs/`

---

**Profile Version:** 1.0  
**Agents:** 6  
**Last Updated:** April 2, 2026
