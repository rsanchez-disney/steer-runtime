# PM Workspaces Guide

Quick guide for Project Managers using steer-runtime workspaces.

---

## What are workspaces?

A workspace pre-loads your team's context — Jira projects, boards, team rosters, and assignees — so you don't have to paste it every time you talk to an agent. Apply a workspace once and every PM agent already knows your team.

---

## Setup (one time)

```bash
# 1. See available team workspaces
koda workspace list

# 2. Apply your project's workspace
koda workspace apply dta-team          # Digital Travel Trade
koda workspace apply uad-sustainment   # Resort Sales (UAD sustainment)
koda workspace apply uad-ongoing       # Cast Sales Experience (UAD ongoing)

# 3. Configure your Jira token (if not done already)
koda mcp-install
```

That's it. Your PM agents now have your project's Jira board and roster pre-loaded.

---

## Using PM agents

Once your workspace is applied, just start chatting — the agents already know your team context:

```bash
# General PM orchestrator (routes to the right specialist)
kiro-cli chat --agent pm_orchestrator_agent

# Or go directly to a specialist
kiro-cli chat --agent standup_agent             # Daily standup summary
kiro-cli chat --agent sprint_manager_agent      # Sprint planning & health
kiro-cli chat --agent risk_tracker_agent        # Blockers & risks
kiro-cli chat --agent delivery_reporter_agent   # Velocity & burndown
kiro-cli chat --agent retro_agent               # Sprint retrospectives
```

### Example prompts

You no longer need to specify the project, board, or team — the workspace handles that:

- "Generate today's standup summary"
- "Show me the current sprint health"
- "What are the open blockers for this sprint?"
- "Create a velocity report for the last 3 sprints"
- "Prepare retro data for the sprint that just ended"

---

## Switching projects

If you manage multiple projects, just re-apply:

```bash
koda workspace apply dta-team          # Switch to Digital Travel Trade
koda workspace apply uad-sustainment   # Switch to Resort Sales
koda workspace apply uad-ongoing       # Switch to Cast Sales Experience
```

---

## Available workspaces

| Workspace | Project | Board |
|-----------|---------|-------|
| `dta-team` | Digital Travel Trade | Digital Travel Trade Projects |
| `uad-sustainment` | Resort Sales | DLR UAD - Development |
| `uad-ongoing` | Cast Sales Experience | Unified Agent Desktop |

---

## Need a new workspace?

Ask your team lead to scaffold one:

```bash
koda workspace create my-new-team
```

This creates the directory structure. Then fill in `workspace.json` and `context/team_context.md` with your Jira project, board, and team roster. See existing workspaces in `workspaces/` for examples.
