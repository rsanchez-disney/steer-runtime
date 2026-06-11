---
name: spec-driven-implementation
description: Generate a structured spec (requirements, design, tasks) before writing any code. Use when implementing a Jira ticket, feature, or complex change that needs alignment before coding.
activation: manual
---

# Skill: Spec-Driven Implementation

Generate a structured specification from a ticket before writing any code. The spec is the contract between user and agent — no implementation begins until approved.

## Output Location

```
~/.kiro/.specs/<TICKET_ID>/
├── requirements.md
├── design.md
└── tasks.md
```

---

## Workflow

### Step 1: Gather Context

1. Get the ticket ID (ask if not provided)
2. Fetch ticket details from Jira (summary, description, acceptance criteria)
3. Identify the target repository and its conventions from workspace context

### Step 2: Explore Codebase

1. Identify files and modules relevant to the ticket
2. Map affected architectural layers
3. Check for existing patterns the implementation should follow
4. Identify integration points and existing tests

### Step 3: Generate Spec

#### requirements.md

```markdown
# Requirements: <TICKET_ID> — <Title>

## Summary
{What this ticket delivers and why}

## Functional Requirements
- [ ] FR-1: ...

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
{Current state and constraints}

## Approach
{High-level solution}

## Files to Create/Modify

| File | Layer | Action | Purpose |
|------|-------|--------|---------|
| ... | ... | Create/Modify | ... |

## Test Scenarios

| Scenario | Type | Expected Outcome |
|----------|------|-----------------|
| ... | Unit | ... |

## Risks and Mitigations
- **Risk:** ... → **Mitigation:** ...
```

#### tasks.md

```markdown
# Tasks: <TICKET_ID> — <Title>

## Prerequisites
- [ ] Branch created: `<branch_name>`
- [ ] Spec reviewed and approved

## Implementation
- [ ] 1. ...
- [ ] 2. ...

## Tests
- [ ] 1. ...

## Verification
- [ ] Lint passes
- [ ] Tests pass
- [ ] Build passes
```

### Step 4: Save Spec

1. Create `~/.kiro/.specs/<TICKET_ID>/`
2. Write all three files
3. Present summary to the user

### Step 5: Checkpoint — HARD STOP

**⏸ MANDATORY STOP. DO NOT CONTINUE.**

Present:
- Summary of what was specified
- Number of files to create/modify
- Key design decisions
- Open questions
- Ask: "Do you approve this spec? Reply 'approved' to proceed, or tell me what to change."

**Rules:**
- Do NOT proceed until user explicitly approves
- Do NOT interpret silence as approval
- If user requests changes, update spec and wait again

### Step 6: Implement (after approval only)

1. Create feature branch (following workspace git conventions)
2. Execute tasks from `tasks.md` in order
3. Follow all workspace steering conventions
4. Verify build passes after each logical group

### Step 7: Verify

1. Run full verification (lint + test + build)
2. Review diff against design.md
3. Verify all acceptance criteria are met
4. Confirm no unrelated changes

### Step 8: Ship

1. Commit with conventional message including ticket ID
2. Push branch
3. Create PR summarizing what/how/tested

---

## Rules

- **Never skip the checkpoint** — spec must be approved before any code
- **Always write files** — generate all three spec files to disk every time
- **Minimal diff** — implement only what the spec describes
- **Spec is living** — if implementation reveals the design was wrong, update spec before continuing
- **Idempotent** — running twice for the same ticket produces the same result
