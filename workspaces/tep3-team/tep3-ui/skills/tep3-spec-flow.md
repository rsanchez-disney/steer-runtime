---
name: tep3-spec-flow
description: Full interactive pipeline from Jira ticket analysis to implementation. Generates requirements, design, tasks, handoff, then executes. Use when the user asks to "analyze TEP3-XXXXX", "spec flow", "build the spec for", or wants the full analysis-to-implementation pipeline.
---

# TEP3 Spec Flow

Interactive pipeline: Analysis → Requirements → Design → Tasks → Export (Handoff) → Execution.

---

## Step 1 — Requirements

1. Fetch ticket from Jira (summary, ACs, parent, linked tickets)
2. Explore impacted repos to understand current behavior
3. Generate `.kiro/specs/tep3-xxxxx/requirements.md`
4. Ask: "Do you want to open it?" → if yes, run `code .kiro/specs/tep3-xxxxx/requirements.md`
5. Wait for user to confirm or provide adjustments

---

## Step 2 — Design

1. Read the (possibly adjusted) `requirements.md`
2. Explore codebase for current implementation of each requirement
3. Design the solution: what to change, where, how
4. Generate `.kiro/specs/tep3-xxxxx/design.md`
5. Ask: "Do you want to open it?"
6. Wait for user confirmation

---

## Step 3 — Tasks

1. Read requirements + design
2. Break down into ordered, actionable tasks with file paths
3. Mark optional tasks separately
4. Generate `.kiro/specs/tep3-xxxxx/tasks.md`
5. Ask: "Do you want to open it?"
6. Wait for user confirmation

---

## Step 4 — Export (Handoff)

1. Ask: "Consolidated or per-repo?"
   - **Consolidated**: single `handoff.md` with all repos
   - **Per-repo**: one `handoff-<repo-name>.md` per impacted repo
2. Generate the handoff(s) from requirements + design + tasks:
   - Executive summary (1-2 sentences)
   - Files to modify per repo with exact paths
   - Code snippets (before/after or new code)
   - Implementation order
   - Contracts between repos (if cross-repo)
   - Tests required
3. Ask: "Do you want to open it?"
4. Wait for user confirmation or adjustments

---

## Step 5 — Execution

1. Ask: "What should I execute?"
   - "all" → all tasks sequentially
   - "1, 2, 4" → specific tasks
   - "all + optional" → include optional tasks
2. Use the handoff(s) as source of truth
3. Implement each task:
   - Read the target file
   - Apply the change from the handoff
   - Run tests if available
4. After completion, produce cross-repo handoff summary (if multi-repo)

---

## Standalone Export

The export step can be invoked independently:
- "export the spec for TEP3-XXXXX" → reads existing `.kiro/specs/tep3-xxxxx/` artifacts and generates handoff without re-running steps 1-3

---

## Persistence

- All artifacts saved to `.kiro/specs/tep3-xxxxx/`
- Analysis saved to yax memory linked to the ticket
- Resumable: "continue with TEP3-XXXXX" → recovers state from files + yax
