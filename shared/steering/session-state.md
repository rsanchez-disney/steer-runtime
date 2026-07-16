---
inclusion: always
description: Session state persistence for task continuity across sessions
---

# Session state

Maintain a `.kiro/session-state.md` file to track current task progress. This enables session resume without external memory systems.

## On task start

When beginning a new SDLC task (implement, fix, refactor):

1. Check if `.kiro/session-state.md` exists
2. If it exists and has `status: in-progress` — **resume from the recorded phase** (do not restart)
3. If it doesn't exist or status is `completed` — create a fresh state file

## On phase transitions

After each phase completes (Analyze → Plan → Implement → etc.), update the session state:

```markdown
# Session state

## Task
- Ticket: <ID>
- Description: <short summary>
- Strategy: standard | propose-judge
- Mode: interactive | autopilot
- Status: in-progress | completed | blocked
- Started: <ISO timestamp>

## Decisions
- <Gate N>: <what was decided>

## Progress
- [x] Analyze
- [x] Plan
- [ ] Implement (task 2/5)
- [ ] Quality
- [ ] Ship

## Context
- Branch: <branch name>
- Key files: <main files being modified>
```

## On task completion

When the task finishes (PR created, user says done):

- Set `Status: completed`
- Add completion timestamp
- The file stays until the next task starts (then it's replaced)

## Rules

- Never commit session-state.md to git (it's local working state)
- Update on every phase transition (not on every tool call)
- Keep it concise — this is a progress bookmark, not a log
- If the file mentions a different ticket than the current task, confirm with user before overwriting
