# Spec-Driven Development (SDD) — Tutorial

How to use the spec-driven implementation workflow with your AI agent.

---

## Prerequisites

- Workspace `dse-dcl-web-team` selected in Kiro
- Jira MCP configured (PAT token set)
- Working in a repo covered by the workspace (Angular SPAs, NestJS BFFs, Java backends)

---

## Quick Start

Open a chat session and tell the agent:

```
Use the spec-driven-implementation skill for DCLCOMSUST-12345
```

That's it. The agent handles the rest.

---

## Step-by-Step Walkthrough

### 1. Start a session

```bash
kiro chat --agent dev-dcl-web
kiro chat --agent dev-dcl-node-nest
kiro chat --agent dev-dcl-java-agent
```

### 2. Invoke the skill

Tell the agent to use the SDD workflow. Examples:

```
Use spec-driven-implementation for DCLCOMSUST-12345
```

```
Generate a spec for DCLCOMSUST-12345 before implementing
```

```
I want to implement DCLCOMSUST-12345 with a spec first
```

### 3. Agent explores and generates the spec

The agent will:

1. Fetch the ticket from Jira (summary, description, ACs)
2. Explore the codebase to identify affected files and layers
3. Generate three files in `~/.kiro/.specs/DCLCOMSUST-12345/`:

```
~/.kiro/.specs/DCLCOMSUST-12345/
├── requirements.md   — What to build (functional + non-functional)
├── design.md         — How to build it (files, contracts, test scenarios)
└── tasks.md          — Implementation checklist
```

### 4. Review the spec

The agent will pause and present a summary:

```
Spec generated for DCLCOMSUST-12345:
- 4 files to create, 2 to modify
- New FilterStateService + filter-panel component
- 3 test scenarios planned
- No open questions

Review the spec at ~/.kiro/.specs/DCLCOMSUST-12345/
Approve to proceed, or request changes.
```

**This is your checkpoint.** You can:

- **Approve** → "Looks good, proceed"
- **Request changes** → "Add a test for dark mode" or "Use signals instead of BehaviorSubject"
- **Ask questions** → "Why did you choose a new service instead of extending the existing one?"

### 5. Implementation begins

Once you approve, the agent:

1. Creates the feature branch
2. Implements each task from `tasks.md` in order
3. Follows your project's steering files (architecture, patterns, testing)
4. Runs verification (lint + test + build)

### 6. Ship

The agent commits, pushes, and creates the PR with a description derived from the spec.

---

## Reviewing Specs Later

All specs persist locally. To review past specs:

```bash
ls ~/.kiro/.specs/
# DCLCOMSUST-12345/  DCLCOMSUST-12400/

cat ~/.kiro/.specs/DCLCOMSUST-12345/design.md
```

You can also ask the agent:

```
Show me the spec for DCLCOMSUST-12345
```

---

## Tips

### When to use SDD

- New components or features (multiple files across layers)
- Complex refactors touching many modules
- Tickets with ambiguous acceptance criteria
- Cross-repo changes (library + consumer app)

### When NOT to use SDD

- One-line bug fixes
- Typo corrections
- Dependency bumps
- Changes where the path is obvious

### Modifying the spec mid-implementation

If the agent discovers the design was wrong during implementation:

```
The API returns a different shape than expected.
Update the design.md and adjust the remaining tasks.
```

The agent will update `~/.kiro/.specs/DCLCOMSUST-12345/design.md` and continue.

### Using with different profiles

The skill is stack-agnostic. The steering files injected by your active profile provide architecture awareness:

| Profile          | Architecture context injected                              |
|------------------|------------------------------------------------------------|
| dev-dcl-web      | Angular 18, standalone components, signals, OnPush, SCSS   |
| dev-dcl-node-nest| NestJS BFF, guards, connectors, endpoints                  |
| dev-dcl-java     | Spring Boot, reactive services, DAOs, endpoints            |

You don't need to tell the agent about your architecture — it already knows from the steering files.

---

## Example Session

```
You: Use spec-driven-implementation for DCLCOMSUST-54321

Agent: Fetching DCLCOMSUST-54321 from Jira...
       "Add sort functionality to cruise results"

       Exploring codebase...
       - Affected layers: Component, Service, Store
       - Related: src/app/features/search/sort-panel/
       - Pattern: follows existing filter components

       Generating spec...
       ✓ requirements.md — 3 functional requirements, 2 NFRs
       ✓ design.md — 4 files (2 create, 2 modify), 3 test scenarios
       ✓ tasks.md — 10 tasks in 4 phases

       Spec saved to ~/.kiro/.specs/DCLCOMSUST-54321/

       Summary:
       - New SortPanelComponent with signal-based state
       - FilterStateService extended with sort signal
       - @ngrx/signals store updated with sort feature
       - OnPush + standalone + dark mode support

       ⏸ Review and approve to proceed.

You: Add a test for the case when sort option is invalid.

Agent: Updated design.md:
       - Added test scenario: "Invalid sort value → fallback to default"
       - Added task 3.3: "Test invalid sort value guard"

       ⏸ Review updated spec and approve.

You: Approved, proceed.

Agent: Creating branch feat/DCLCOMSUST-54321...
       Implementing task 1.1: Create SortOption interface...
       [...]
```
