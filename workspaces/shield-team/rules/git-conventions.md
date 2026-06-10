# Git Conventions — Shield Team

## Commit Messages

All commits MUST follow Conventional Commits 1.0.0 format:

```
<type>[optional scope]: <description>
```

Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `perf`

Examples:
- `fix(wayfinding): correct map pin offset on HKDL`
- `feat(analytics): add debug helper for event tracking`
- `chore: update NewRelic SDK to 7.x`

## Branch Naming

Use the format:

```
<github-user>/<ticket-number>_<really-short-description>
```

Examples:
- `CAVEG002/AEXP-2020_Fix_WayFinding`
- `DETED001/IEXP-1135_Crash_MapFragment`
- `SAMBJ003/COREEXP-450_Flutter_DeepLink`

Rules:
- **GitHub username** — your enterprise GitHub username (uppercase)
- **Ticket number** — the Jira ticket key (e.g., `AEXP-2020`, `IEXP-1135`)
- **Short description** — 2–4 words with underscores, summarizing the change

## Feature Branches — NEVER

Do **NOT** create branches with `feature/` prefix (e.g., `feature/AEXP-2020_something`).

Feature branches trigger CI/CD artifact generation and have specific pipeline restrictions that are not appropriate for regular development work. Always use the `<user>/<ticket>_<desc>` format above.
