---
name: spec-driven-implementation
description: Generate a structured spec (requirements, design, tasks) before writing any code — ensures alignment between user and agent
inclusion: manual
---

# Spec-Driven Implementation

Generate a structured specification from a Jira ticket before writing any code.
The spec serves as the contract between user and agent — no implementation begins until the spec is reviewed and approved.

## Output Location

Spec artifacts are persisted in the user's home directory (NOT in the project repo):

```
~/.kiro/.specs/<TICKET_ID>/
├── requirements.md
├── design.md
└── tasks.md
```

## Workflow

### Step 1: Gather Context

1. Ask the user for the ticket ID (if not provided)
2. Fetch ticket details from Jira via MCP (summary, description, acceptance criteria, linked issues)
3. Identify the target repository and its active profile/steering files
4. Note the project's architecture, conventions, and testing patterns from steering context

### Step 2: Explore Codebase

1. Identify files and modules relevant to the ticket
2. Map affected architectural layers (routes, controllers, services, models, etc.)
3. Check for existing patterns that the implementation should follow
4. Identify integration points with external services
5. Note any existing tests in the affected area

### Step 3: Generate Spec

Read template files from `~/.kiro/templates/` if available:
- `sdd-requirements.md.template` → generates `requirements.md`
- `sdd-design.md.template` → generates `design.md`
- `sdd-tasks.md.template` → generates `tasks.md`

If templates are not found, use the inline structures below.

#### requirements.md

```markdown
# Requirements: <TICKET_ID> — <Title>

## Summary
<!-- One paragraph: what this ticket delivers and why -->

## Functional Requirements
- [ ] FR-1: ...
- [ ] FR-2: ...

## Non-Functional Requirements
- [ ] NFR-1: ...

## Acceptance Criteria
1. ...

## Out of Scope
- ...

## Dependencies
- ...
```

#### design.md

```markdown
# Design: <TICKET_ID> — <Title>

## Context
<!-- Current state, constraints, relevant background -->

## Approach
<!-- High-level solution description -->

## Files to Create/Modify

| File | Layer | Action | Purpose |
|------|-------|--------|---------|
| `path/to/file` | ... | Create | ... |

## Interfaces and Contracts
<!-- New or modified APIs, request/response shapes -->

## Test Scenarios

| Scenario | Type | Expected Outcome |
|----------|------|------------------|
| Happy path | Unit | ... |
| Error case | Unit | ... |

## Risks and Mitigations
- **Risk:** ... → **Mitigation:** ...

## Open Questions
- [ ] ...
```

#### tasks.md

```markdown
# Tasks: <TICKET_ID> — <Title>

## Prerequisites
- [ ] Branch created: `<branch_name>`
- [ ] Spec reviewed and approved

## Implementation

### 1. Core Changes
- [ ] 1.1 ...
- [ ] 1.2 ...

### 2. Tests
- [ ] 2.1 ...

### 3. Verification
- [ ] 3.1 Run lint
- [ ] 3.2 Run tests
- [ ] 3.3 Run build

## Completion Checklist
- [ ] All tasks done
- [ ] No unrelated changes in diff
- [ ] Steering conventions followed
- [ ] Ready for PR
```

### Step 4: Save Spec

1. Create `~/.kiro/.specs/<TICKET_ID>/`
2. Write all three files (overwrite if exists)
3. Verify files were created

### Step 5: Checkpoint — HARD STOP

**⏸ MANDATORY STOP. DO NOT CONTINUE.**

Present to the user:
- Summary of what was specified
- Number of files to create/modify
- Key design decisions
- Open questions needing resolution
- Ask: "Do you approve this spec? Reply 'approved' to proceed, or tell me what to change."

**Rules:**
- Do NOT proceed until user explicitly approves
- Do NOT interpret silence as approval
- If user requests changes, update spec files and wait again

### Step 6: Implement (ONLY after approval)

1. Create feature branch
2. Execute tasks from `tasks.md` in order
3. Follow all steering conventions
4. Verify build passes after each logical group

### Step 7: Verify

1. Run full verification (lint + test + build)
2. Review diff against design.md
3. Verify all acceptance criteria met
4. Confirm no unrelated changes

### Step 8: Ship

1. Commit with conventional message including ticket ID
2. Push branch
3. Create PR (what, how, what was tested)

## Rules

- **Never skip the checkpoint** — spec must be approved before code
- **Always write files** — generate and persist the three spec files every time
- **Consult steering** — architecture and conventions are authoritative
- **Minimal diff** — implement only what the spec describes
- **Spec is living** — update spec if implementation reveals design was wrong
- **Idempotent** — re-running for same ticket overwrites previous spec
