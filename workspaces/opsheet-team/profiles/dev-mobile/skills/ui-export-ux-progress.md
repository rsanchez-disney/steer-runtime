# Skill: Export/long-running UX progress

Use this when improving progress indicators and messaging for long-running operations.

## Decision tree
- If server provides progress metrics: display them and map to meaningful stages.
- If not: implement staged UX with time-based escalation + "still running" reassurance.
- Do not fake precise percent unless based on real telemetry.

## Implementation notes
- Model progress as a Riverpod `@riverpod` controller with `AsyncValue` states.
- Define an enum for stages: `idle`, `started`, `inProgress`, `finalizing`, `done`, `error`.
- Keep the user-facing message derived from a single formatter function.
- Use `ref.invalidate` or `ref.refresh` to reset state on retry.
