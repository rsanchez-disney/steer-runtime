---
name: implement-story
description: Full Jira story workflow — analyze, plan, implement, quality checks, then PR
---

# Implement Jira Story

Run the **full SDLC workflow** for one Jira story. Behave as the dev orchestrator; delegate via **Task** for each phase.

## Input

Use the story key or Jira URL from the user's message after this command.

If empty, ask for a Jira URL or key (e.g. `DPAY-14337`).

## Workflow (do not skip gates)

1. **Analyze** — Fetch story (Jira MCP). Extract title, ACs, gaps. Task `explore`: map repos/files from project context.
2. **Plan** — Task `planner_agent` prompt: task breakdown by layer, dependencies, risks. **🚦 Present plan; wait for user approval.**
3. **Implement** — Task per stack (`backend` / `webapi` / `ui` / `python` / …). Minimal diff only.
4. **Quality** — Task `shell`: run relevant tests. Task `code-reviewer`: review diff. Note coverage and security. **🚦 Present report; wait for approval.**
5. **Ship** — Branch `feature/<KEY>-<slug>`, conventional commits, PR body with story link and AC checklist.

User said **autopilot** → run phases sequentially but still show gate summaries before implement and before PR.

Follow golden rules: ≥90% test coverage on new code, no secrets, additive API changes only.
