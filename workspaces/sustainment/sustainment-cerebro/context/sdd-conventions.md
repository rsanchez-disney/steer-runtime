# SDD conventions for Cerebro repos

> Spec-Driven Development conventions for all Cerebro repositories.
> **Last verified: 2026-07-23**

## Where specs live

Specs live in each repo at `.kiro/specs/` — one file per feature, lean format.

```text
<repo>/
└── .kiro/
    ├── steering/       # Structure, tech, and patterns (always loaded)
    └── specs/          # Feature specs (read on demand per feature)
        ├── friend-search.md
        ├── party-management.md
        └── ...
```

Specs do NOT live in steer-runtime. They live with the code so:

- 1 PR = code + spec update (atomic)
- Code reviewers validate that doc reflects the change
- `git pull` gives everyone the latest version

## Spec format (lean)

Each `.kiro/specs/<feature>.md` contains ~2-5KB with:

| Section        | Answers | Content                                           |
|----------------|---------|---------------------------------------------------|
| Purpose        | WHAT    | One-line description                              |
| Flows          | WHAT    | Bullet list of user journeys                      |
| Key behaviors  | WHAT    | Non-obvious behaviors (not derivable from code)   |
| File manifest  | WHERE   | Table of primary files per unit                   |
| Decisions      | WHY     | Bullet list of architectural choices              |

### What to include

- Business flows (user journeys)
- Behaviors that are NOT obvious from reading the code
- Architectural decisions and their rationale (WHY)
- File manifest (saves the agent from exploring 30+ files)
- Edge cases and cross-cutting contracts between features

### What NOT to include

- Business rules already expressed as constants in code
- Edge cases already handled by clear conditionals
- Full public contract (decorators and types show it)
- Implementation details derivable from the source
- Verbose prose describing what the code already says

## Authority order

code > spec > steering

When sources conflict, the code is truth. The spec describes intent. Never contradict running code based on what a spec says — update the spec instead.

## Agent exploration rules

1. Read `.kiro/specs/<feature>.md` before exploring source code for that feature
2. Use the file manifest to navigate — do not expand exploration without justification
3. Do not re-read unchanged specs from a prior turn in the same session
4. Use offset/limit for files over 200 lines
5. If the spec seems outdated vs the code, trust the code and flag the discrepancy

## Documentation principles

- Do not refactor code unless explicitly requested
- Document current behavior, not idealized behavior
- Generate specs per business feature/domain (aligned to custom elements or delivery boundaries)
- Keep documentation concise and practical for AI agents (~2-5KB per spec)
- All documentation and code artifacts must be in English

## When to update a spec

| Trigger                              | Action                                      |
|--------------------------------------|---------------------------------------------|
| Feature behavior changed             | Update `.kiro/specs/<feature>.md`            |
| New feature developed                | Create new `.kiro/specs/<feature>.md`        |
| Architectural decision made          | Add to Decisions section of the spec         |
| File moved/renamed                   | Update file manifest                        |
| Routine bug fix (same behavior)      | Do NOT update                               |
| Refactor (same external behavior)    | Do NOT update                               |
| Dependency version bump              | Do NOT update (unless API changed)          |

Updates go in the **same PR as the code change**.

## Creating specs for a new repo

When adding a new Cerebro repo to the workspace:

### Step 1: Create `.kiro/steering/`

```text
.kiro/steering/
├── 01-structure.md    # Directory tree and path aliases
├── 02-tech.md         # Stack, versions, build commands, platform libraries
└── 03-patterns.md     # Anti-alucinación rules: test, logging, security, DI, error handling
```

- `01-structure.md` — How the repo is organized, path aliases, entry points
- `02-tech.md` — Versions, test runner, linter, commands (facts only, no conventions)
- `03-patterns.md` — What NOT to do: repo-specific guardrails that prevent wrong code generation

### Step 2: Identify features

A feature is:

- A business domain (authentication, search, party management)
- Something a user interacts with as a flow
- A custom element or major component with its own lifecycle
- A deployment boundary (independently buildable/testable unit)

A feature is NOT:

- A UI wrapper or launcher
- A helper component
- A shared service (unless it owns a user-facing flow)
- Infrastructure (interceptors, guards)

### Step 3: Generate lean specs

For each feature, analyze the code and produce:

```markdown
# Feature name

## Purpose
One line.

## Flows
- Flow 1
- Flow 2

## Key behaviors
- Non-obvious behavior 1
- Non-obvious behavior 2

## File manifest
| Unit | Primary file |
|------|--------------|
| ...  | ...          |

## Decisions
- Decision 1 and why
- Decision 2 and why
```

Target ~2-5KB per spec. If it exceeds 6KB, you are including too much detail that the code already expresses.

### Step 4: Register in workspace

Add the repo to `cerebro-team/workspace.json` projects array with `stack` field.
