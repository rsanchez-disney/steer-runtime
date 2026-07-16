# Design review hook

> 🧪 **Status:** Experimental
> **Since:** v0.2.160 (steer-runtime)

Pre-push git hook that compares committed changes against the approved plan — catches scope creep and incomplete implementations before code reaches the remote.

## Quick start

Install the hook:

```bash
cp ~/.kiro/hooks/design-review-pre-push.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

Or symlink from `.githooks/`:

```bash
git config core.hooksPath .githooks
ln -s ~/.kiro/hooks/design-review-pre-push.sh .githooks/pre-push
```

## What it checks

| Check | Warning message |
|-------|----------------|
| Files changed but not in plan | "⚠️ Files not in plan: src/unrelated.ts" |
| Planned files not modified | "⚠️ Planned files not modified: src/tests/rate-limit.test.ts" |

## How it works

1. Reads `.kiro/session-state.md` for planned key files
2. Compares against `git diff --name-only` (committed, not yet pushed)
3. Prints warnings for mismatches
4. **Never blocks the push** — informational only

```text
$ git push origin feature/rate-limiting
🔍 Design review: checking plan alignment...
⚠️  Files not in plan:
   src/config/database.ts
⚠️  Planned files not modified:
   src/tests/rateLimit.test.ts

💡 This is informational — push continues. Review if drift is intentional.
```

## Requirements

- `.kiro/session-state.md` must exist with `Status: in-progress`
- The `## Context` section must list key files
- If no session state → hook silently passes

## Relationship to other features

| Feature | Relationship |
|---------|-------------|
| Session state | Required — reads plan from session-state.md |
| Code review agent | Complementary — this runs pre-push (local), code review runs post-PR (remote) |
| Quality gate | Different scope — quality gate checks tests/lint, this checks plan alignment |
