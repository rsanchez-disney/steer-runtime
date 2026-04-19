# Leadership Profile — Prompt Guide

Practical prompts for Tech Directors, Delivery Directors, and Tech Managers using the leadership profile.

---

## Setup

```bash
koda install leadership
koda workspace apply payments-vertical
kiro-cli chat --agent leadership_orchestrator_agent
```

---

## Cross-Team Analytics

### Velocity & Delivery Health

```
Show me velocity trends for all teams in the last 3 sprints
```

```
Compare delivery accuracy across all teams — who's hitting 80% and who isn't?
```

```
Which teams have the highest carry-over rates? What's causing it?
```

```
Show me cycle time distribution per team for the last month
```

### Capacity & Workload

```
What's the current capacity utilization across all teams?
```

```
Which teams have the most unestimated tickets in their current sprint?
```

```
Show me the ratio of bugs vs features across all teams this quarter
```

---

## Quarterly Reports

### Generate Full Report

```
Generate the Q2 2026 quarterly report for the Payments vertical
```

```
Create a quarterly report covering January through March for all teams. 
Include achievements, metrics, risks, and AI adoption.
```

### Specific Sections

```
What were the top 5 achievements across all teams this quarter?
```

```
Summarize AI adoption metrics across all teams for the quarterly review
```

```
What are the active PI risks across the vertical? Group by severity.
```

### Publish

```
Publish the quarterly report to MyWiki under the "Payments Reports" page
```

---

## Cross-Team Dependencies

### Active Dependencies

```
What are the active cross-team dependencies between APP and DPE?
```

```
Show me all cross-team blockers older than 1 sprint
```

```
Map the dependencies between all teams — which teams are most interconnected?
```

### Risk Assessment

```
Which cross-team dependencies are at risk of slipping?
```

```
Are there any shared services that multiple teams are waiting on?
```

---

## Executive Briefings

### For Disney Director

```
Prepare a 1-page executive briefing for the Disney director on Q1 delivery.
Focus on business impact and top risks.
```

```
The director wants to know: are we on track for the Q3 launch? 
Summarize across all teams.
```

### For Colleagues

```
Prepare a briefing for peer directors on what we learned this quarter.
Include technical decisions and patterns worth sharing.
```

```
Write a summary of our architecture changes this quarter for the 
architecture review board.
```

### For Partners

```
Prepare a partner update on API changes and integration timeline 
for the next quarter.
```

```
Write a status update for the external payment processor team on 
our integration progress.
```

---

## Sprint-Level Oversight

### Current Sprint Status

```
Show me the current sprint status for all teams — who's on track?
```

```
Which teams have blocked items right now? What's blocking them?
```

### Sprint Comparison

```
Compare this sprint's progress to the same point in the last sprint 
across all teams.
```

---

## Specific Scenarios

### Preparing for a Steering Committee

```
I have a steering committee meeting tomorrow. Prepare talking points 
covering: delivery status, top 3 risks, and the ask for next quarter.
```

### Onboarding a New Team

```
We're adding a new team to the vertical. What's the current state of 
all teams so I can brief the new team lead?
```

### Escalation Support

```
The DPE team has been declining in velocity for 3 sprints. 
Analyze what's happening and suggest interventions.
```

### Budget Planning

```
Based on this quarter's delivery metrics and AI adoption, 
estimate the team sizing needed for next quarter's roadmap.
```

---

## Tips

1. **Start broad, then drill down** — ask for the vertical overview first, then zoom into specific teams
2. **Specify the audience** — "for the director" vs "for colleagues" produces very different outputs
3. **Include time ranges** — "last 3 sprints" or "Q2 2026" helps the agent scope the data
4. **Ask for recommendations** — the agents always end with actionable items, but you can ask for specific types
5. **Combine agents** — the orchestrator will route to the right specialist, but you can also chat directly with `portfolio_analyst_agent` for pure data queries
