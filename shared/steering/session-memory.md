---
inclusion: always
description: Session continuity — load and maintain a living project context file so structural knowledge persists across chat sessions
---

# Project Memory (Session Continuity)

Cursor does not persist conversation context across sessions. This rule maintains a **living project context file** that describes the current state of the project — not a changelog.

## Memory file location

- **Path**: `docs/PROJECT_MEMORY.md` (in the repo you are working in).
- When this rule is synced to another project, the file lives in that project's `docs/` — it is **not** stored in the rules repo.

## Key principle: living document, not a log

This file describes **what the project IS today** — not what happened in the past. When something changes:
- **Update** the relevant section with the new state
- **Remove** outdated information that no longer applies
- **Never append** dated entries — keep it concise and current

The file should remain **short** (~50-100 lines max). If it grows beyond that, trim obsolete details.

## Your responsibilities

### 1. At the start of work

- **If `docs/PROJECT_MEMORY.md` exists**: Read it to understand the project's architecture, conventions, and known constraints before doing substantive work.
- **If it does not exist**: Create it with the structure described below. Use available sources to populate it (see "Initialization from existing docs" below).

### Initialization from existing docs

When creating or refreshing `PROJECT_MEMORY.md`, extract relevant facts from these sources (if they exist):

| Source | What to extract | When to use |
|--------|----------------|-------------|
| `README.md` | Architecture style, tech stack, integrations, deployment notes | Only if it contains substantive sections (Architecture, Tech Stack, API overview, etc.) — skip if it's just a title or boilerplate with no real content |
| `docs/TECHNICAL_SPECS.md` | Architecture decisions, data model structure, API design patterns, infrastructure choices | If it exists |
| `docs/FUNCTIONAL_SPECS.md` | Key business rules, domain constraints, validation logic, actor roles | If it exists |
| `pom.xml` / `build.gradle` | Foundation modules in use, Java version, parent POM | Always |
| `docs/ADR/` or `docs/adr/` | Active architecture decision records (skip superseded ones) | If they exist |

**Do not duplicate** these documents — extract only the concise facts that the agent needs for day-to-day review and development. PROJECT_MEMORY is a ~50-100 line summary, not a copy.

**Keep it in sync**: When you update TECHNICAL_SPECS or FUNCTIONAL_SPECS (via `/generate-specs`, `/generate-tech-specs`), also refresh the corresponding PROJECT_MEMORY sections to stay consistent.

### 2. When to update

Update (not append) the memory file when any of the following change:

- **Architecture style** changes (e.g., migrated from layered to hexagonal)
- **Key conventions** are agreed with the user (e.g., "all new APIs under `/api/v2`")
- **Business rules** are clarified or changed (e.g., "max 3 active bookings per guest")
- **Foundation modules** are added or removed
- **Known constraints or exceptions** to DLP rules (e.g., "intentionally no authz — internal-only service")
- **Integration patterns** change (new external dependency, changed messaging topology)

Do **not** record:
- Bug fixes (they're in git history)
- Routine code changes
- Temporary debugging notes
- Secrets, sensitive data, or PII

### 3. File structure

```markdown
# Project Memory

Living context for AI sessions. Describes current project state. Keep concise and up to date.

## Architecture

- Style: Hexagonal / Layered / DDD (whichever applies)
- Package root: `com.disney.dlp.{service-name}`
- Key layers/modules: (brief description of structure)

## Foundation Modules

- foundation-rest-client (outbound HTTP)
- foundation-rabbit (messaging)
- foundation-caching / Redis (distributed cache)
- (list what's actually used)

## Conventions

- (project-specific naming, patterns, or approaches agreed with the team)
- Example: "DTOs use record classes", "No Lombok", "Feature branches from develop"

## Business Rules & Functional Decisions

- (key domain rules that drive validation, logic, or data model choices)
- Example: "Booking can only be modified up to 24h before arrival date"
- Example: "One guest can hold max 3 active reservations"
- Example: "Price calculation always uses tax-inclusive amounts (EUR)"

## Integrations

- (external services called, message queues consumed/produced, databases)
- Example: "Calls Payment Gateway via REST (circuit breaker + retry)"

## Constraints & Exceptions

- (intentional deviations from DLP rules with rationale)
- Example: "No wdpr-authz — service is internal-only, behind API Gateway"
```

Sections without content should be omitted. Add sections only when relevant.

## How the agent uses this file

- **Detection (Step 0)**: Load before analysis to inform architecture detection and rule loading.
- **Review**: Documented exceptions reduce false positives. Business rules inform whether validation logic is correct or missing.
- **Development**: Conventions guide code style. Business rules guide validation logic, edge cases, and domain model design.
- **Safety**: If memory contradicts a security rule (secrets exposed, auth disabled in prod), still flag it — safety rules override documented exceptions.

## Summary

- **Load** `docs/PROJECT_MEMORY.md` at session start.
- **Create** it after initial project analysis if it doesn't exist.
- **Update in place** — replace outdated sections, don't append.
- **Keep it short** — current state only, ~50-100 lines max.
