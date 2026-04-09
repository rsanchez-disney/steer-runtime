# Skill: API contract compatibility check

Use this when the app consumes or changes API models from VAS backend.

## Checklist
- Treat missing JSON fields as valid — use nullable types or default values in `@JsonSerializable` models.
- Avoid renaming fields without a `@JsonKey(name: 'old_name')` compatibility layer.
- If contract must change: coordinate with VAS backend team and prefer additive changes.
- After model changes, run `fvm dart run build_runner build --delete-conflicting-outputs` to regenerate `.g.dart` files.
- Update repository tests to cover both old and new response shapes.
