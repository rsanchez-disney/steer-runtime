---
name: generating-spec-and-design-pipeline
description: Full interactive pipeline from Jira ticket analysis to implementation with task progress tracking. Generates requirements, design, tasks, handoff, then executes.
---

# Generating Spec And Design Pipeline

## When to use
- Use when the user asks to "analyze COM-XXXXX or UCM-XXXX", "spec flow", "build the spec for", or wants the full analysis-to-implementation pipeline.
- PRIORITY: This skill takes precedence over spec-drive-implementation.md one.

## Overview
Interactive pipeline: Analysis → Requirements → Design → Tasks → Export (Handoff) → Execution.

Each artifact is Jira-anchored and tasks carry checkbox status (`[ ]` / `[x]`) so progress is always visible and resumable from files — not just from memory.

## Workflow

### Step 1 — Requirements

1. Fetch the ticket from Jira: summary, description, **acceptance criteria (ACs)**, parent epic, linked tickets, current status

2. **Assess ticket completeness** before proceeding:

   - **Well-defined** (has explicit ACs) → proceed normally
   - **Thin** (has description/comments but no formal ACs) → infer requirements from available context, mark each inferred REQ with `_(inferred)_`, and present them to the user for confirmation before generating the file. Give the option to the user to confirm the inferred REQ and also proceed to ask questions to have a overview of what needs to be done before proceeding with the plan (Use **Emtpy/stub** completeness option for the questions)
   - **Empty/stub** (title only or no actionable detail) → stop and ask:
     > "This ticket doesn't have enough detail to generate requirements. Could you provide: (1) what the expected behavior should be, and (2) any acceptance criteria or definition of done?"
     Then wait for input before continuing. Do not generate placeholder requirements.

   When operating in **thin** mode, also fetch: parent epic description, linked tickets, and any Jira comments — they often contain the missing context.

3. Gather information from related context defined in **domain_context**, **aplication_context** and **ucm1_context** (if it was not previously loaded).
4. Explore impacted repos to understand current behavior for each AC (or inferred requirement)
5. Generate `.kiro/specs/<ticket-id>/requirements.md` using this structure:

```markdown
# Requirements — <TICKET-ID>: <Summary>

**Jira:** [<TICKET-ID>](https://disneyexperiences.atlassian.net/browse/<TICKET-ID>)
**Status:** <Jira status at analysis time>
**Epic:** <parent epic key and summary>
**AC Source:** <Explicit | Inferred from description | Inferred from epic or comments>

## Context
<1–2 sentences describing the business problem>

## Acceptance Criteria (from Jira)
<!-- If inferred, mark each item with "(inferred)" and note the source -->
- AC1: <exact AC text from ticket, or inferred — note source>
- AC2: ...

## Functional Requirements
<!-- Each requirement traces to one or more ACs -->
- REQ-1 [AC1]: <what the system must do>
- REQ-2 [AC2]: <...>

## Open Questions
<!-- Populated when ticket is thin or ambiguous — cleared once user confirms -->
- <anything that needs stakeholder clarification>

## Out of Scope
- <anything explicitly excluded>

## Impacted Repos
- `<repo-name>` — <reason>
```

4. Ask: "Do you want to open it?" → if yes, run `code .kiro/specs/<ticket-id>/requirements.md`
5. Wait for user to confirm or provide adjustments before proceeding

---

### Step 2 — Design

1. Read the (possibly adjusted) `requirements.md`
3. Gather information from related context defined in **domain_context**, **aplication_context** and **ucm1_context** (if it was not previously loaded).
3. For each impacted repo, explore the current implementation of the relevant code paths
4. Design the solution — what to change, where, and how — respecting cross-repo dependency order: **components → UC API → SPA** (or **cart API → cart UI**)
5. Generate `.kiro/specs/<ticket-id>/design.md` using this structure:

```markdown
# Design — <TICKET-ID>: <Summary>

**Jira:** [<TICKET-ID>](https://disneyexperiences.atlassian.net/browse/<TICKET-ID>)

## Approach
<High-level solution description>

## Repo Changes

### `<repo-name>`
- **Files to modify:** `path/to/file.ts`, ...
- **What changes:** <description>
- **Why:** traces to REQ-X

### `<repo-name>` (if cross-repo)
- ...

## Contracts & Interfaces
<!-- API shapes, custom events, property bindings between repos -->

## Testing Strategy
- Unit: <what to cover>
- Integration: <if applicable>
- Target: ≥80% coverage on new code

## Risks / Assumptions
- <any ambiguity or dependency risk>
```

5. Ask: "Do you want to open it?"
6. Wait for user confirmation before proceeding

---

### Step 3 — Tasks

1. Read `requirements.md` + `design.md`
2. Break down into ordered, actionable tasks — each with: repo, file path, and the REQ it satisfies
3. Use **Kiro checkbox format** so progress is tracked in the file itself
4. Separate optional tasks into a distinct section
5. Generate `.kiro/specs/<ticket-id>/tasks.md` using this structure:

```markdown
# Tasks — <TICKET-ID>: <Summary>

**Jira:** [<TICKET-ID>](https://disneyexperiences.atlassian.net/browse/<TICKET-ID>)

## Implementation Tasks

- [ ] **T1** [`<repo>`] `path/to/file` — <what to do> _(REQ-1)_
- [ ] **T2** [`<repo>`] `path/to/file` — <what to do> _(REQ-2)_
- [ ] **T3** [`<repo>`] `path/to/file` — <what to do> _(REQ-2, REQ-3)_

## Test Tasks

- [ ] **T4** [`<repo>`] `path/to/spec` — <what to test> _(REQ-1)_

## Optional Tasks

- [ ] **T5** [`<repo>`] `path/to/file` — <nice-to-have> _(optional)_

## Progress
<!-- Updated automatically during execution -->
Completed: 0 / <total>
```

6. Ask: "Do you want to open it?"
7. Wait for user confirmation before proceeding

---

### Step 4 — Export (Handoff)

1. Ask: "Consolidated or per-repo?"
   - **Consolidated**: single `handoff.md` covering all repos
   - **Per-repo**: one `handoff-<repo-name>.md` per impacted repo
2. Generate handoff(s) from requirements + design + tasks:
   - Jira ticket link and summary at the top
   - Executive summary (1–2 sentences)
   - Files to modify per repo with exact paths
   - Code snippets (before/after or new additions)
   - Implementation order (respecting cross-repo dependency chain)
   - Contracts between repos (API shapes, events, properties)
   - Tests required (mapped to task IDs)
3. Ask: "Do you want to open it?"
4. Wait for user confirmation or adjustments

---

### Step 5 — Execution

#### Pre-execution setup
Before writing any code:
1. Ask: "Should I update the Jira ticket status to **In Progress**?" — only update if confirmed
2. Remind the branching convention when the user is ready to push:
   - Branch name must follow: `UCM-XXXXX` or `COM-XXXXX`
   - Push to personal fork only — never directly to `origin`
   - The user may work locally on any branch during development and create the feature branch before pushing — do not block execution waiting for branch setup

#### Task execution loop
1. Ask: "What should I execute?"
   - `all` → all tasks sequentially
   - `1, 2, 4` → specific tasks by ID
   - `all + optional` → include optional tasks
   - `resume` → continue from the first unchecked `[ ]` in `tasks.md`

2. For each task:
   - Read the target file
   - Apply the change per the handoff spec
   - Mark the task as complete in `tasks.md`: change `[ ]` → `[x]` and update the Progress counter
   - Run tests if available (see testing commands in `cart-checkout-conventions.md`) or ask the user to confirm commands if there is uncertainty

3. After all tasks in a repo are complete, suggest (but do not execute automatically):
   - Create a PR from `fork/<TICKET>` → `origin/develop` (or `master` for components/lambda) using Github MCP
   - PR should include: title, description, related PRs, test results, evidence (before/after)
   - Ask: "Should I add the PR link to Jira `Evidence of Completion`?" — only update if confirmed
   - Ask: "Should I set the `Fix Version` on the ticket?" — only update if confirmed

4. After all repos done, produce a cross-repo summary if multi-repo (listing all PRs and their dependency merge order), then ask:
   - "Should I update the Jira ticket status to **In Review**?" — only update if confirmed

---

### Standalone Operations

These steps can be invoked independently at any time:

- **"resume UCM-XXXXX"** → reads `tasks.md`, finds first `[ ]`, continues from there
- **"export the spec for UCM-XXXXX"** → reads existing artifacts and generates handoff without re-running steps 1–3
- **"what's left on UCM-XXXXX"** → reads `tasks.md` and reports unchecked tasks with their repo and file
- **"status of UCM-XXXXX"** → fetches current Jira status + reads `tasks.md` Progress line
- **"refine requirements for UCM-XXXXX"** → re-opens `requirements.md`, re-fetches ticket (picks up any newly added ACs), merges updates, clears resolved Open Questions

---

### Persistence & Traceability

| What | Where |
|------|-------|
| All spec artifacts | `.kiro/specs/<ticket-id>/` |
| Task progress | Checkbox state in `tasks.md` (source of truth for resumption) |
| Jira traceability | Ticket link in every artifact header; REQ tags in tasks |
| Cross-session memory | yax entry linked to the ticket ID |
| Resumable | `resume UCM-XXXXX` → reads `[ ]` state; no need to re-analyze |

> **Convention:** `<ticket-id>` is always lowercase with hyphen, e.g. `ucm-1234` or `com-5678`.
