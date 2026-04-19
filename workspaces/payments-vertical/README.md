# Payments Vertical

Cross-team workspace for Tech Directors and Delivery Managers overseeing all Payments & Commerce teams.

## Teams

| Team | Workspace | Jira Project |
|------|-----------|-------------|
| APP Team | app-team | DPAY |
| DPE Team | dpe-team | PPODPE |
| TxP Team | txp-team | ROS |
| GE Team | ge-team | — |
| RA Team | ra-team | — |
| Cart & Checkout | cart-checkout-tep3 | — |

## Quick Start

```bash
koda install leadership
koda workspace apply payments-vertical
```

## Agents

| Agent | Purpose |
|-------|---------|
| leadership_orchestrator_agent | Routes queries, coordinates reports |
| portfolio_analyst_agent | Cross-team Jira analytics |
| quarterly_reporter_agent | Quarterly business reports |
| cross_team_coordinator_agent | Dependency tracking |
| executive_briefing_agent | Audience-tailored summaries |

## Example Prompts

```
> "Show me velocity trends for all teams in the last 3 sprints"
> "Generate the Q2 quarterly report for the Payments vertical"
> "What are the active cross-team dependencies between APP and DPE?"
> "Prepare an executive briefing for the Disney director on Q1 delivery"
> "Which teams have the highest carry-over rates?"
> "Summarize AI adoption metrics across all teams"
```
