# Skill: UI contract compatibility check

Use this when the UI consumes or changes API models.

## Checklist
- Treat missing fields as valid (default values).
- Avoid renaming fields without compatibility layer.
- If contract must change: coordinate with WebAPI and prefer additive changes.
