# Session state

> 🧪 **Status:** Experimental
> **Since:** v0.2.160 (steer-runtime)

Lightweight session persistence via `.kiro/session-state.md` — enables agents to resume tasks across session resets without requiring yax or external memory.

## Quick start

No setup needed. The orchestrator automatically:

1. Checks for `.kiro/session-state.md` on task start
2. Resumes from the recorded phase if found
3. Updates the file at each phase transition
4. Marks as completed when the task finishes

## File format

```markdown
# Session state

## Task
- Ticket: PROJ-1234
- Description: Add rate limiting to gateway
- Strategy: standard
- Mode: interactive
- Status: in-progress
- Started: 2026-07-15T10:00:00

## Decisions
- Gate 1: Plan approved (3 tasks)

## Progress
- [x] Analyze
- [x] Plan
- [ ] Implement (task 2/3)
- [ ] Quality
- [ ] Ship

## Context
- Branch: feature/PROJ-1234-rate-limiting
- Key files: src/middleware/rateLimit.ts, src/config/redis.ts
```

## Rules

- Never committed to git (local working state)
- Updated on phase transitions only (not every tool call)
- If file references a different ticket, agent confirms before overwriting
- Replaced by new task (not appended)

## Relationship to yax

| Aspect | Session state | Yax |
|--------|:-------------:|:---:|
| Persistence | File (current task only) | Database (all history) |
| Scope | Single task progress | Decisions, patterns, learnings |
| Dependency | None | MCP server required |
| Use case | Session resume | Long-term memory |

Use both: session-state for "where was I?" and yax for "what did we decide?"
