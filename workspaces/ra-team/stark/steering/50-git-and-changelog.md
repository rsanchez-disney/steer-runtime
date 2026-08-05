---
inclusion: always
description: Changelog conventions for Stark team workspaces
---

# Changelog Rules

## Target file

`/CHANGELOG.md` (repo root)

## When to update

After any code, skill, steering, or configuration change on the current branch — update the changelog entry before finishing.

## Format

Entries go under `## [Unreleased]`, grouped by change type:

```markdown
## [Unreleased]

### Added
- **category** — short description of what was added

### Changed
- **category** — short description of what changed

### Fixed
- **category** — short description of what was fixed
```

## Rules

1. **One entry per branch** — before adding a new entry, check if one already exists for the current branch. Update the existing entry instead of creating a duplicate.
2. **Use today's date as reference** — do not backdate. The version header with date will be added at release time; your entries go under `[Unreleased]`.
3. **Jira ticket** — if the work has a ticket, append it: `- **category** — description (GEW-1234)`. If there is no ticket, omit it.
4. **Be general and direct** — describe the overall work, not individual file changes. One line per logical unit of work.
5. **Category in bold** — use a short domain word that matches the project domain (see categories below).
6. **Do not over-detail** — avoid listing every file or sub-change. Summarize the intent.

## Categories

Pick the category that best represents the domain of the change:

| Category | Use for |
|---|---|
| `api` | REST endpoints, controllers, routes, request/response contracts |
| `auth` | Authentication, authorization, tokens, guards |
| `build` | Build pipeline, CI/CD, Dockerfile, deploy scripts |
| `config` | Environment variables, app settings, feature flags |
| `db` | Database migrations, schema changes, queries |
| `deps` | Dependency updates, package upgrades |
| `docs` | Documentation, READMEs, guides |
| `infra` | Infrastructure, Terraform, CloudFormation, AWS resources |
| `logging` | Logging, observability, metrics, tracing |
| `perf` | Performance optimizations |
| `security` | Security patches, vulnerability fixes, audit findings |
| `skills` | AI agent skills, workflows |
| `steering` | AI agent steering rules, prompts |
| `tests` | Test suites, coverage improvements, test utilities |
| `ui` | Frontend components, styles, layouts, UX |
| `workspace` | Workspace config, agent setup, MCP config |

If none fits, use a short project-specific noun.

## Examples

### Features (Added)

```markdown
### Added
- **api** — Add export progress endpoint with real-time status updates (GEW-4521)
- **ui** — Add payment method selection component with accessibility support (GEW-3892)
- **auth** — Add OAuth 2.0 PKCE flow for cast member login
- **skills** — Add RA generator workflow skills for NestJS, Angular SPA, and Astro
- **infra** — Add ECS task definition for export worker service (GEW-5010)
- **db** — Add migration for user preferences table
- **logging** — Add structured logging with correlation ID propagation
```

### Bug fixes (Fixed)

```markdown
### Fixed
- **api** — Fix timeout on large export requests exceeding 30s (GEW-4102)
- **ui** — Fix button alignment on mobile breakpoints (GEW-3750)
- **auth** — Fix token refresh loop when session expires during navigation
- **db** — Fix N+1 query on transaction history endpoint (GEW-4890)
- **build** — Fix Docker build failing on Node 22 due to deprecated OpenSSL flag
- **config** — Fix environment variable not loading in staging deployments
```

### Changes and refactors (Changed)

```markdown
### Changed
- **api** — Migrate export endpoint from streaming to chunked responses (GEW-4600)
- **deps** — Upgrade Angular from 19 to 20 with standalone migration
- **ui** — Replace legacy NgModule components with standalone architecture
- **infra** — Move Lambda functions to ARM64 for cost reduction
- **config** — Consolidate environment configs into single app.config.ts
- **steering** — Simplify changelog rules to focus on format and conventions
- **tests** — Migrate test suite from Karma to Jest
```

### Mixed changes (multiple types in one branch)

```markdown
## [Unreleased]

### Added
- **api** — Add batch processing endpoint for bulk exports (GEW-5100)
- **ui** — Add progress bar component for long-running operations (GEW-5100)

### Changed
- **config** — Increase default timeout to 60s for export operations (GEW-5100)

### Fixed
- **api** — Fix memory leak on concurrent export streams (GEW-5100)
```

## Anti-patterns

- ❌ Creating a new entry when one already exists for the branch
- ❌ Listing individual files changed
- ❌ Adding a version number (that's done at release time)
- ❌ Omitting the changelog update entirely
- ❌ Writing multi-line descriptions for a single entry
- ❌ Using vague descriptions like "fix bug" or "update code"
- ❌ Mixing implementation details with the user-facing description
