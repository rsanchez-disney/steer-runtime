# Skill: UI bugfix triage

Use this skill when a UI bug is reported in OpSheet Plus.

## Steps
1) Reproduce: identify the route (via `routes.dart`), widget tree, user steps, expected vs actual.
2) Locate boundary: widget/controller issue vs repository/API response vs VAS backend.
3) Add targeted logging via `BaseRepository.onError` or NewRelic — avoid `print()`.
4) Fix with minimal changes; add regression test using `mocktail` and `ProviderContainer` overrides.
5) Ensure `AsyncValue` error states render user-friendly messages in the widget.
6) Run `sh check.sh` before committing.
