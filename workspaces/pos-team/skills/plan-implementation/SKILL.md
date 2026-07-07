---
name: plan-implementation
description: Task breakdown with effort estimation and dependency mapping for POS platform tickets
agents: [pos_planner_agent, pos_story_analyzer_agent, pos_codebase_explorer_agent]
---

# Plan Implementation

Breaks down a Jira ticket into an ordered implementation plan with effort estimates, dependencies, and agent assignments.

## Prerequisites

- Jira MCP configured
- Ticket ID (POS-XXXX) with defined scope
- Target repo identified (Connect, connect-frontend, Go microservice, ActivateX)

## Workflow

### Step 1: Fetch & Parse Ticket

1. Fetch ticket via Jira MCP
2. Extract:
   - Summary and description
   - Acceptance criteria (numbered)
   - Components and labels
   - Priority and story points (if estimated)
   - Linked tickets (blockers, dependencies)
   - Child issues (if epic)

**Agent:** `pos_story_analyzer_agent`

### Step 2: Identify Target Stack

Based on components, labels, and description:

| Signal | Target | Agent |
|--------|--------|-------|
| Items, Configuration, API | PHP — Connect monolith | pos_php_agent |
| Frontend, UI | React — connect-frontend | pos_react_agent |
| gRPC, Microservice | Go — specific service | pos_go_agent |
| Android, Kotlin, Mobile | Kotlin — ActivateX | android_dev_agent |
| Multiple components | Cross-stack | pos_architecture_agent routing |

### Step 3: Explore Affected Code

1. Navigate to target repo
2. Identify files/modules that need changes
3. Map existing patterns to follow
4. Note integration points (gRPC protos, shared types, DB schemas)
5. Check for related feature flags

**Agent:** `pos_codebase_explorer_agent`

### Step 4: Decompose into Tasks

Break ticket into implementation steps. Each task should be:
- **Independent** — can be verified on its own
- **Ordered** — respects dependencies
- **Sized** — has complexity estimate (see `references/estimation-guide.md`)
- **Assigned** — maps to a specialist agent

### Step 5: Map Dependencies

Identify:
- **Parallel tasks** — can execute simultaneously
- **Sequential tasks** — must wait for predecessors
- **External dependencies** — waiting on other teams/services
- **Integration points** — where cross-service testing is needed

### Step 6: Estimate Effort

For each task assign:
- **Complexity:** High / Standard
- **Effort:** XS / S / M / L / XL
- **Risk:** Low / Medium / High

### Step 7: Generate Plan

```markdown
## Implementation Plan: {TICKET_KEY} — {Summary}

### Target Stack
{PHP | Go | React | Kotlin | Cross-stack}

### Acceptance Criteria Mapping
| AC# | Description | Tasks |
|-----|-------------|-------|
| AC1 | ... | T1, T3 |

### Task Breakdown
| # | Task | Type | Agent | Complexity | Effort | Dependencies |
|---|------|------|-------|-----------|--------|--------------|
| T1 | {description} | implement | pos_go_agent | Standard | M | — |
| T2 | {description} | test | pos_test_runner | Standard | S | T1 |

### Dependency Graph
(mermaid diagram)

### Execution Order
1. Phase 1 (parallel): T1, T2
2. Phase 2 (sequential): T3 (after T1+T2)
3. Phase 3: Integration testing

### Total Estimate
- Implementation: {N}h
- Testing: {N}h
- Review + integration: {N}h
- **Total:** {N}h
```

**Agent:** `pos_planner_agent`

## Important Rules

- **Every AC must map to at least one task**
- **Tests are separate tasks** — not buried inside implementation
- **Integration testing is explicit** for cross-service changes
- **Effort includes review time**
- **Plan is a proposal** — user approves before execution
