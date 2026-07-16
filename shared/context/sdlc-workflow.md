# SDLC workflow

Multi-phase workflow for Jira story implementation. Used by dev-core, steer-master, and qa orchestrators.

## Strategy selection

The orchestrator selects a strategy based on task complexity:

| Strategy      | When to use                                                        | Flow                                                            |
|---------------|--------------------------------------------------------------------|-----------------------------------------------------------------|
| **standard**  | Clear requirements, single approach obvious, low-risk changes      | Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship |
| **propose-judge** | Multiple viable approaches, irreversible decisions, new patterns, high complexity | Analyze → Propose → 🚦 Gate 0 → Plan → 🚦 Gate 1 → Implement → Judge → 🚦 Gate 2 → Ship |

### Auto-detection rules

Use **propose-judge** when ANY of these apply:

- Task introduces a new dependency or library
- Multiple architectural approaches are viable
- Change crosses 3+ layers (UI + API + backend + DB)
- User explicitly asks for options or alternatives
- Story has ambiguous acceptance criteria (more than one valid interpretation)
- Task involves a technology the team hasn't used before

Use **standard** when:

- Single obvious implementation path
- Bug fix with clear root cause
- Routine CRUD, config change, or small feature
- User says "just do it" or "skip proposal"

---

## Standard strategy

```text
Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship
```

| Phase     | Agents                                                    | Output                    |
|-----------|-----------------------------------------------------------|---------------------------|
| Analyze   | story_analyzer → codebase_explorer → architecture (if complex) | Story context, code map   |
| Plan      | planner_agent                                             | Implementation plan       |
| Implement | Route each task to specialist (backend/ui/webapi/etc.)    | Code changes              |
| Quality   | test_runner → code_review → security_scanner              | Test results, review      |
| Ship      | pr_creator_agent                                          | Pull request              |

---

## Propose-judge strategy

```text
Analyze → Propose → 🚦 Gate 0 → Plan → 🚦 Gate 1 → Implement → Judge → 🚦 Gate 2 → Ship
```

| Phase     | Agents                                                    | Output                                  |
|-----------|-----------------------------------------------------------|-----------------------------------------|
| Analyze   | story_analyzer → codebase_explorer                        | Story context, code map, constraints    |
| Propose   | propose_agent                                             | 2-4 alternatives with scores + recommendation |
| Plan      | planner_agent (uses approved proposal as input)           | Implementation plan based on chosen approach |
| Implement | Route each task to specialist                             | Code changes                            |
| Judge     | judge_agent → code_review (if CONDITIONAL) → security_scanner | Score card + verdict                    |
| Ship      | pr_creator_agent                                          | Pull request                            |

### Gates in propose-judge

- **Gate 0** (after Propose): Present alternatives to user. User selects an approach (or asks for more options). Proceed only after explicit selection.
- **Gate 1** (after Plan): Present plan based on chosen approach. User approves.
- **Gate 2** (after Judge): Present judge verdict. If PASS → proceed to Ship. If CONDITIONAL → run code_review for targeted fixes, re-judge. If FAIL → loop back to Implement with judge feedback.

### Judge-driven quality loop

```text
Implement → Judge
              ├── PASS (≥80, no structural failures) → Gate 2 → Ship
              ├── CONDITIONAL (65-79 or one dimension 50-59) → fix issues → re-Judge (max 2 retries)
              └── FAIL (<65 or structural failure) → re-Implement with feedback (max 1 retry)
```

Maximum retries: 2 judge loops. If still CONDITIONAL after 2 retries, proceed to Gate 2 with the judge report for user decision.

### Propose-to-Plan handoff

The propose_agent output becomes input context for planner_agent:

```
planner_agent receives:
  - Original story/requirements
  - Chosen proposal (Option X) with its code sketch and rationale
  - Constraints identified during proposal scoring
```

This ensures the plan is grounded in the evaluated approach, not invented fresh.

---

## Gates

- Gates are mandatory — never skip them
- If user says "autopilot" or "run all", execute phases sequentially but still pause at gates
- If user says "skip proposal" or "just implement", fall back to standard strategy

---

## Resource-aware strategy

Adapt delegation based on system tier (injected by agent-registry hook):

| Tier     | RAM    | Max concurrent | Strategy                                    |
|----------|--------|:--------------:|---------------------------------------------|
| light    | ≤16GB  |       2        | Sequential only — one agent at a time       |
| standard | ≤32GB  |       4        | Parallel OK for 2-3 agents, sequential 4+   |
| power    | >32GB  |       6        | Full parallel delegation                    |

---

## Implementation routing

Route implementation tasks by tech stack:

| Stack indicator                        | Agent    |
|----------------------------------------|----------|
| Angular, TypeScript UI, component      | `ui`     |
| Node, Restify, Express, gateway, BFF   | `webapi` |
| Java, Spring, DynamoDB, service        | `backend`|
| Flutter, Dart, mobile                  | `flutter`|
| Terraform, infrastructure, IaC         | `terraform` |
| Astro, SSR, React pages                | `astro`  |
| Python, Django, FastAPI                 | `python` |

---

## Depth calibration

Adjust output depth based on task complexity. Assess BEFORE planning:

| Level         | Trigger                                               | Plan detail                          | Gate behavior            |
|---------------|-------------------------------------------------------|--------------------------------------|--------------------------|
| Minimal       | Single file, <10 lines, no tests, config/typo/bump    | 1-2 sentences, skip plan gate        | Quality gate only        |
| Standard      | 2-5 files, clear approach, tests needed               | 3-5 bullet plan                      | Normal gates             |
| Detailed      | 5+ files, new patterns, cross-layer changes           | Full plan with file list + test strategy | Normal gates          |
| Comprehensive | Architecture, new service, migration, 3+ layers       | Auto-selects propose-judge strategy  | All gates + Gate 0       |

### Rules

- Announce depth: "Depth: standard (3 files, clear approach)"
- User can override: "keep it short" → minimal, "be thorough" → detailed
- Minimal depth does NOT skip quality checks — only skips the plan presentation gate
- If uncertain, default to standard
