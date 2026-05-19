# Spec-Driven Development (SDD) — Tutorial

How to use the spec-driven implementation workflow with your AI agent.

---

## Prerequisites

- Workspace `opsheet-team` selected in Koda (`koda` → `[w]`)
- Jira MCP configured (PAT token set)
- Working in a repo covered by the workspace (VAS, Go, Web, Mobile)

---

## Quick Start

Open a chat session and tell the agent:

```
Use the spec-driven-implementation skill for OPS-12345
```

That's it. The agent handles the rest.

---

## Step-by-Step Walkthrough

### 1. Start a session

```bash
koda chat
```

Or with a specific agent:

```bash
koda chat --agent orchestrator
koda chat --agent vasapi
```

### 2. Invoke the skill

Tell the agent to use the SDD workflow. Examples:

```
Use spec-driven-implementation for OPS-12345
```

```
Generate a spec for OPS-12345 before implementing
```

```
I want to implement OPS-12345 with a spec first
```

### 3. Agent explores and generates the spec

The agent will:

1. Fetch the ticket from Jira (summary, description, ACs)
2. Explore the codebase to identify affected files and layers
3. Generate three files in `~/.kiro/.specs/OPS-12345/`:

```
~/.kiro/.specs/OPS-12345/
├── requirements.md   — What to build (functional + non-functional)
├── design.md         — How to build it (files, contracts, test scenarios)
└── tasks.md          — Implementation checklist
```

### 4. Review the spec

The agent will pause and present a summary:

```
Spec generated for OPS-12345:
- 4 files to create, 2 to modify
- New MetricsService + MetricsController
- 3 test scenarios planned
- No open questions

Review the spec at ~/.kiro/.specs/OPS-12345/
Approve to proceed, or request changes.
```

**This is your checkpoint.** You can:

- **Approve** → "Looks good, proceed"
- **Request changes** → "Add a test for timeout scenarios" or "Use a processor instead of calling the service directly from the controller"
- **Ask questions** → "Why did you choose to create a new service instead of extending the existing one?"

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
# OPS-12345/  OPS-12400/  OPS-12567/

cat ~/.kiro/.specs/OPS-12345/design.md
```

You can also ask the agent:

```
Show me the spec for OPS-12345
```

---

## Tips

### When to use SDD

- New endpoints or features (multiple files across layers)
- Complex refactors touching many modules
- Tickets with ambiguous acceptance criteria
- Cross-service changes requiring coordination

### When NOT to use SDD

- One-line bug fixes
- Typo corrections
- Dependency bumps
- Changes where the path is obvious

### Modifying the spec mid-implementation

If the agent discovers the design was wrong during implementation:

```
The service returns a different shape than expected.
Update the design.md and adjust the remaining tasks.
```

The agent will update `~/.kiro/.specs/OPS-12345/design.md` and continue.

### Using with different stacks

The skill is stack-agnostic. The steering files injected by your active profile provide architecture awareness:

| Profile    | Architecture context injected                    |
|------------|--------------------------------------------------|
| dev-vas    | BFF layers, Koa patterns, RestAPIService, DI     |
| dev-go     | Go monorepo, service boundaries, event processors|
| dev-web    | Angular components, Vista design system          |
| dev-mobile | Flutter packages, Riverpod, platform channels    |

You don't need to tell the agent about your architecture — it already knows from the steering files.

---

## Example Session

```
You: Use spec-driven-implementation for OPS-54321

Agent: Fetching OPS-54321 from Jira...
       "Add dispatch interval endpoint for CLE entities"

       Exploring codebase...
       - Affected layers: Route, Controller, Service, Transformer
       - Related: src/controllers/cle.controller.ts, src/services/cle.service.ts
       - Pattern: follows existing CLE endpoints

       Generating spec...
       ✓ requirements.md — 4 functional requirements, 2 NFRs
       ✓ design.md — 5 files (2 create, 3 modify), 4 test scenarios
       ✓ tasks.md — 12 tasks in 4 phases

       Spec saved to ~/.kiro/.specs/OPS-54321/

       Summary:
       - New GET /cle/entities/:id/dispatch-interval endpoint
       - CleService.getDispatchInterval() calling core API
       - CleTransformer.toDispatchIntervalResponse() for response mapping
       - Auth required, module: CLE

       ⏸ Review and approve to proceed.

You: The transformer should also include the entity name from the existing
     getEntity response. Add that to the design.

Agent: Updated design.md:
       - Added parallel call to getEntity in controller
       - Updated transformer signature to accept both responses
       - Added task 2.3: "Pass entity name to transformer"

       ⏸ Review updated spec and approve.

You: Approved, proceed.

Agent: Creating branch fix/OPS-54321...
       Implementing task 1.1: Create DispatchInterval interface...
       [...]
```
