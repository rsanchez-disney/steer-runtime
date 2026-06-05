---
inclusion: fileMatch
fileMatchPattern: ["**/*.go", "go.mod", ".semver.yaml", "cz.yaml", ".pre-commit-config.yaml"]
description: Git workflow, branch naming, conventional commits, and CI/CD for Go services
---

# Git Workflow & Commit Best Practices — OpSheet+ Go Services

## Branch Naming

Format: `{type}/OPS-{number}` or `{type}/OPS-{number}-{short-description}`

Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`

## Commit Message Format

```
{type}: OPS-{number} - {description}

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests only |
| `chore` | Build, CI, tooling changes |
| `docs` | Documentation only |
| `perf` | Performance improvement |

### Rules

- No brackets around ticket: `OPS-12345` not `[OPS-12345]`
- Lowercase description start
- No period at end
- Imperative mood: "add endpoint" not "added endpoint"

## Atomic Commits — The Right Balance

Each commit = one logical unit of work. NOT one line per commit, NOT the entire feature in one commit.

Ask: "If I need to revert this commit, will it undo exactly one logical change?"

### Building a Feature (layer by layer)

| Order | Commit | What it does |
|-------|--------|-------------|
| 1 | `feat: OPS-500 - add repository query for zone recommendations` | Data access layer |
| 2 | `feat: OPS-500 - implement zone recommendation business logic` | Service layer |
| 3 | `feat: OPS-500 - wire zone recommendation controller and route` | HTTP layer |
| 4 | `fix: OPS-500 - standardize error responses for zone endpoint` | Error handling polish |
| 5 | `test: OPS-500 - add unit tests for zone recommendation service` | Test coverage |

### Grouping Related Changes

Same intent → same commit:

```
# ✅ Good — one logical change
refactor: OPS-500 - improve variable naming in wait-times service

Renamed variables for clarity:
- response → entityTimezone
- cfg → configSettings
- res → summarizedResult
```

```
# ❌ Bad — 3 commits for the same thing
commit 1: rename response to entityTimezone
commit 2: rename cfg to configSettings
commit 3: rename res to summarizedResult
```

## Handling Code Review Comments

### Related Comments → Single Commit

Multiple review comments about the same concern go in one commit:

```
refactor: OPS-500 - address review feedback on readability

- Rename response → entityTimezone for clarity
- Extract validateSomeData() from main handler
- Fix formatting per linter rules
```

### Unrelated Comments → Separate Commits

Different concerns stay separate:

```
# Comment A — unhandled error
fix: OPS-500 - handle error from doSomething call

# Comment B — missing test
test: OPS-500 - add test for edge case in processor
```

## When to Use the Commit Body

Use the body when:
- The "why" is not obvious from the description alone
- There are trade-offs worth documenting
- Multiple files are affected and the grouping needs explanation

```
fix: OPS-500 - switch Global Counter lookup to use unique ID

The previous lookup by counterSourceId + counterDeviceId was ambiguous
when multiple mappings exist for the same device. Using the unique
GlobalCounterMappingId eliminates the collision.

Affects: opsheet-process-guestcount processor loop
```

## Seven Rules of a Great Commit Message

1. Separate subject from body with a blank line
2. Limit subject to ~72 characters
3. Do not end subject with a period
4. Use imperative mood in subject ("add" not "added")
5. Wrap body at 72 characters
6. Use the body to explain what and why, not how
7. Include ticket ID in subject line

## Cleaning Up Before Push

Before pushing, review your commit history:

```bash
git log main..HEAD --oneline
```

If you see noise:
- **Squash** WIP commits: `git rebase -i main`
- **Reword** unclear messages
- **Reorder** if the story doesn't flow logically

Never rewrite history that's already pushed to a shared branch.
