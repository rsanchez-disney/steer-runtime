---
name: spec-driven-implementation
description: Generate a structured spec (requirements, design, tasks) before writing any code — ensures alignment between user and agent
activation: manual
---

# Spec-Driven Implementation

Generate a structured specification from a Jira ticket before writing any code.
The spec serves as the contract between user and agent — no implementation begins until the spec is reviewed and approved.

## Output Location

All spec artifacts are persisted in the user's home directory (NOT in the project repo):

```
$HOME/.kiro/.specs/<TICKET_ID>/
├── requirements.md
├── design.md
└── tasks.md
```

**Path resolution:** Use the absolute path `~/.kiro/.specs/` (e.g., `/Users/username/.kiro/.specs/` on macOS). Do NOT create a `.kiro/` folder inside the current project directory.

## Workflow

### Step 1: Gather Context

1. Ask the user for the ticket ID (if not provided)
2. Fetch ticket details from Jira via MCP (summary, description, acceptance criteria, linked issues)
3. Identify the target repository and its active profile/steering files
4. Note the project's architecture, conventions, and testing patterns from the injected steering context

### Step 2: Explore Codebase

1. Identify files and modules relevant to the ticket
2. Map affected architectural layers (components, services, stores, guards, pipes, directives, etc.)
3. Check for existing patterns that the implementation should follow
4. Identify integration points with external services
5. Note any existing tests in the affected area

### Step 3: Generate Spec

Read the template files and fill them with the information gathered in Steps 1-2.

**Template location:** `~/.kiro/templates/`

The templates are:
- `sdd-requirements.md.template` → generates `requirements.md`
- `sdd-design.md.template` → generates `design.md`
- `sdd-tasks.md.template` → generates `tasks.md`

**Instructions:**
1. Read each `.template` file from the paths above
2. Replace placeholders (`{{TICKET_ID}}`, `{{TITLE}}`, `{{BRANCH_NAME}}`) with actual values
3. Fill ALL sections with real content from the analysis — do not leave placeholder text like `...`
4. Every HTML comment (`<!-- ... -->`) is guidance for you — replace it with real content, do not keep the comments

If the template files are not found at either location, use the inline structures below as fallback.

<details>
<summary>Fallback: inline template structures (click to expand)</summary>

#### requirements.md

```markdown
# Requirements: <TICKET_ID> — <Title>

## Summary

<!-- One paragraph: what this ticket delivers and why it matters -->

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

## Approach

## Files to Create/Modify

| File | Layer/Type | Action | Purpose |
|------|-----------|--------|---------|
| `path/to/file` | ... | Create | ... |

## Interfaces and Contracts

## Service Dependencies

| Service | Method | Endpoint | Notes |
|---------|--------|----------|-------|
| ... | GET | `${baseUrl}/v1/...` | ... |

## Test Scenarios

| Scenario | Type | Expected Outcome |
|----------|------|-----------------|
| Happy path | Unit | ... |
| Service failure | Unit | ... |

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
- [ ] Spec reviewed and approved by user

## Implementation

### 1. Setup

- [ ] 1.1 ...

### 2. Core Changes

- [ ] 2.1 ...

### 3. Tests

- [ ] 3.1 ...

### 4. Verification

- [ ] 4.1 Run lint
- [ ] 4.2 Run tests
- [ ] 4.3 Run build

## Completion Checklist

- [ ] All tasks above are done
- [ ] No unrelated changes in diff
- [ ] Steering file conventions followed
- [ ] Ready for PR
```

</details>

### Step 4: Save Spec

1. Resolve the absolute path: `$HOME/.kiro/.specs/<TICKET_ID>/` — NOT relative to the project
2. Create the directory (if it already exists, that's fine — overwrite)
3. Write all three files (`requirements.md`, `design.md`, `tasks.md`) — **always write them, even if the directory already exists or files were previously deleted**
4. Verify the files were created by reading them back
5. Present a summary to the user

**Important:** This step must ALWAYS produce three physical files on disk at `$HOME/.kiro/.specs/`. Never write to the project directory. If the directory existed from a previous run, overwrite the contents. Never skip file creation.

### Step 5: Checkpoint — HARD STOP

**⏸ THIS IS A MANDATORY STOP. DO NOT CONTINUE PAST THIS POINT.**

**YOU MUST STOP HERE AND WAIT FOR THE USER TO RESPOND.**

Present to the user:
- Brief summary of what was specified
- Number of files to create/modify
- Key design decisions made
- Any open questions that need resolution
- Ask: "Do you approve this spec? Reply 'approved' to proceed with implementation, or tell me what to change."

**Rules for this checkpoint:**
- Do NOT proceed to Step 6 under any circumstance until the user explicitly says "approved", "proceed", "go ahead", "looks good", or similar affirmative
- Do NOT interpret silence as approval
- Do NOT auto-approve on behalf of the user
- If the user asks questions, answer them and wait again
- If the user requests changes, update the spec files, re-present the summary, and wait again
- This skill is COMPLETE at this step if the user does not approve — the implementation phase is a SEPARATE action

### Step 6: Implement (ONLY after explicit user approval)

Once the user has explicitly approved:
1. Create the feature branch (following the project's git workflow conventions)
2. Execute tasks from `tasks.md` in order, marking each complete
3. Follow all steering file conventions (architecture, patterns, testing, git workflow)
4. After each logical group of tasks, verify the build still passes

### Step 7: Verify

1. Run the project's full verification command (lint + test + build)
2. Review the diff against the design.md — ensure all planned files were touched
3. Verify all acceptance criteria from requirements.md are met
4. Confirm no unrelated changes leaked into the diff

### Step 8: Ship

1. Stage and commit with conventional commit message including ticket ID
2. Push branch
3. Create PR with description summarizing:
   - What was implemented (from requirements.md)
   - How it was implemented (key decisions from design.md)
   - What was tested
4. Update Jira ticket status if configured

## Rules

- **Never skip the checkpoint** — the spec must be approved before any code is written
- **Always write files** — even if the ticket was analyzed before, always generate and write the three spec files to disk. Never assume they exist from a previous run.
- **Consult steering files** — architecture, patterns, testing, and git conventions are authoritative
- **Minimal diff** — implement only what the spec describes, nothing more
- **Spec is living** — if implementation reveals the design was wrong, update the spec files before continuing
- **Stack-agnostic** — this skill works with any profile; the steering context provides architecture awareness
- **Idempotent** — running this skill twice for the same ticket must produce the same result. Overwrite previous spec files without asking.
