# PM / Scrum Master Prompt Guide

Workflow examples for the PM profile agents.

---

## Sprint Management

### Sprint Health Check
```bash
kiro-cli chat --agent sprint_manager_agent
> "Analyze current sprint health for DPAY board"
```

### Sprint Planning Prep
```bash
kiro-cli chat --agent sprint_manager_agent
> "Prepare sprint 25 planning — show capacity, candidate stories, and dependencies"
```

### Backlog Grooming
```bash
kiro-cli chat --agent sprint_manager_agent
> "Review backlog for DPAY — flag stories missing estimates or acceptance criteria"
```

---

## Daily Standups

### Generate Standup Summary
```bash
kiro-cli chat --agent standup_agent
> "Generate standup summary for DPAY team"
```

### Check for Stale Items
```bash
kiro-cli chat --agent standup_agent
> "Which stories have been In Progress for more than 3 days?"
```

---

## Retrospectives

### Prepare Retro
```bash
kiro-cli chat --agent retro_agent
> "Prepare retro for sprint 23 — pull metrics and previous action items"
```

### Trend Analysis
```bash
kiro-cli chat --agent retro_agent
> "What patterns do you see across the last 3 sprints?"
```

---

## Risk Tracking

### Current Blockers
```bash
kiro-cli chat --agent risk_tracker_agent
> "What are the current blockers for the DPAY team?"
```

### Epic Risk Assessment
```bash
kiro-cli chat --agent risk_tracker_agent
> "Assess risks and dependencies for epic DPAY-500"
```

---

## Delivery Reporting

### Sprint Report
```bash
kiro-cli chat --agent delivery_reporter_agent
> "Generate sprint 23 report with velocity trends"
```

### Release Readiness
```bash
kiro-cli chat --agent delivery_reporter_agent
> "Generate release readiness report for v2.5"
```

---

## Orchestrated Workflows

### Full Sprint Status
```bash
kiro-cli chat --agent pm_orchestrator_agent
> "Give me a complete sprint 24 status — health, blockers, and velocity"
```

### End-of-Sprint Package
```bash
kiro-cli chat --agent pm_orchestrator_agent
> "Prepare end-of-sprint package: review summary, retro data, and next sprint candidates"
```

---

## Quick Reference

```bash
kiro-cli chat --agent pm_orchestrator_agent    # PM orchestrator
kiro-cli chat --agent sprint_manager_agent     # Sprint planning & health
kiro-cli chat --agent standup_agent            # Daily standup summaries
kiro-cli chat --agent retro_agent              # Retrospective facilitation
kiro-cli chat --agent risk_tracker_agent       # Blockers & dependencies
kiro-cli chat --agent delivery_reporter_agent  # Velocity & release reports
```
