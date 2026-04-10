---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.test.*", "package.json", "tsconfig*.json"]
description: Git workflow, branch naming, and commit conventions
---

# Git Workflow & Commit Conventions

## Branch Naming

```
{type}/{ticket_number}[_{other_ticket}]
```

- `{type}` is a conventional commit type (feat, fix, refactor, etc.)
- `{ticket_number}` starts with "OPS-" followed by the number
- Multiple tickets separated by `_`

Example: `feat/OPS-12345_OPS-67890`

## Commit Message Format

Validated by husky pre-commit hook (`scripts/validate-commit.js`).

```
<type>[(<optional scope>)]: <description>
<type>[(<optional scope>)]: OPS-<number> [OPS-<number> ...] - <description>
```

Valid types: `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `perf`, `chore`, `build`, `ci`, `revert`

Examples:

```
feat: OPS-12345 OPS-34567 - a great commit
refactor(sched service): OPS-12345 - refactor something
fix: bug fix without ticket
```

Rules:

- OPS tickets are optional, can be multiple separated by space
- If tickets are present, description must be preceded by `-`
- Subject line max 72 characters (recommended 50)
- Body lines wrap at 72 characters

## Git Hooks (Husky)

### pre-commit

1. `npm run clean` — removes dist/
2. `npx tsc --noEmit` — type checking
3. `npx lint-staged` — runs prettier + eslint on staged .ts files

### commit-msg

- Validates commit message format via `scripts/validate-commit.js`

### pre-push

1. `npm run build` — esbuild bundle
2. `npm run test:parallel` — all unit tests
3. `npm run bump-cov` — auto-bumps coverage thresholds

## Post-Commit Notes

- If coverage thresholds changed after commit hooks, add and commit those changes
- If linter/prettier made changes, discard them (they were already applied to staged files)

## Pre-push Recommendation

Verify remote hasn't modified your files since branch diverged:

```bash
git diff $(git merge-base HEAD origin/main)..origin/main -- <files>
```
