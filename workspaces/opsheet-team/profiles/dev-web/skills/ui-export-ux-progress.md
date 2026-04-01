# Skill: Export UX progress (UI)

Use this when improving export progress indicators and messaging.

## Decision tree
- If server provides progress metrics: display them and map to meaningful stages.
- If not: implement staged UX with time-based escalation + “still running” reassurance.
- Do not fake precise percent unless based on real telemetry.

## Implementation notes
- Use RxJS-friendly state machine: IDLE → STARTED → IN_PROGRESS → FINALIZING → DONE/ERROR
- Keep bubble message derived from a single formatter function.
