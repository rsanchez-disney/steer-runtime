---
name: implement-story
description: Full Jira story workflow — analyze, plan, implement, quality checks, then PR
---

# Implement Jira Story

Run the full SDLC workflow. Delegate each phase via **Task**.

1. **Analyze** — Jira MCP + Task `explore` for affected files
2. **Plan** — Task with planner prompt; **wait for approval**
3. **Implement** — Task per stack (backend/webapi/ui/…)
4. **Quality** — Task `shell` (tests) + `code-reviewer`; **wait for approval**
5. **Ship** — branch `feature/<KEY>-<slug>`, PR with AC checklist

Use the Jira key or URL from the user's message.
