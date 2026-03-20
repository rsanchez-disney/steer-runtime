# Skill: UI bugfix triage

Use this skill when a UI bug is reported.

## Steps
1) Reproduce: identify route, filters, steps, expected vs actual.
2) Locate boundary: UI-only vs API response vs backend.
3) Add targeted logging (temporary, removable) or use existing instrumentation.
4) Fix with minimal changes; add regression tests.
5) Ensure error handling stays user-friendly.
