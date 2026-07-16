# SDLC process

The orchestrator's software development lifecycle (SDLC) engine drives Jira story implementation from analysis through PR creation. It operates with configurable **modes** (how autonomous the agent is) and **strategies** (what phases it executes).

## Modes

A mode defines the level of human involvement at decision gates.

| Mode        | Gates behavior                        | When to use                                         |
|-------------|---------------------------------------|-----------------------------------------------------|
| Interactive | Pause and present results to user     | Default. Complex decisions, first-time patterns     |
| Autopilot   | Auto-proceed when quality checks pass | Well-defined tickets, high test coverage, low risk  |

### Interactive mode (default)

The orchestrator pauses at every gate, presents its output, and waits for explicit user approval before proceeding.

```text
Analyze → Plan → 🛑 Gate → Implement → Quality → 🛑 Gate → Ship
```

Behavior:

- User reviews plan before implementation begins
- User reviews quality results before PR creation
- Orchestrator explains reasoning at each gate
- User can redirect, refine, or abort at any pause point

### Autopilot mode

Gates are replaced by automated quality criteria. The orchestrator proceeds when criteria are met, retries when they fail (max 3 attempts), and escalates to the user only when stuck.

```text
Analyze → Plan → [criteria met?] → Implement → Quality → [pass?] → Ship
                        │                                      │
                        └── retry with context (max 3x) ───────┘
```

Activation:

```bash
koda chat --autopilot --ws <workspace> "implement <TICKET-ID>"
```

Decision criteria:

| Phase     | Auto-proceed when                              | Retry when                 | Escalate when                    |
|-----------|------------------------------------------------|----------------------------|----------------------------------|
| Plan      | Tasks defined, routing clear, test strategy    | Plan vague or incomplete   | Cannot determine after 2 tries   |
| Implement | Builds successfully, no compilation errors     | Build fails                | 3 consecutive build failures     |
| Quality   | Tests pass, no critical security issues        | Tests fail                 | 3 fix attempts failed            |
| Ship      | PR created with proper metadata                | PR creation failed         | Cannot push or create PR         |

Guardrails:

- Never skips tests to move faster
- Never fabricates results or claims tests pass without running them
- Never commits directly to main — always uses feature branches
- Never modifies files outside the task scope
- Never opens a PR with known failing tests
- Implies `--trust-all` (tools execute without per-call prompts)

Completion report:

```text
[autopilot] ✅ Completed: DPAY-14849

  Phases: analyze → plan → implement → quality → ship
  Iterations: 2 (retries: implement)
  Result: PR #131 opened against develop
  Duration: 4m 23s
```

Escalation (when stuck):

```text
[autopilot] ⚠️ Blocked at implement after 3 attempts

  Task: fix CSP policy for identity SDK
  Last error: TypeError: Cannot read property 'policy' of undefined
  Need: Which config file does the deployed server actually read for CSP?
```

### Mode compatibility with strategies

| Mode        | Standard strategy | Propose-judge strategy |
|-------------|:-----------------:|:----------------------:|
| Interactive |        ✅         |           ✅           |
| Autopilot   |        ✅         |           ❌           |

Autopilot is incompatible with propose-judge by design — proposal selection requires human judgment.

---

## Strategies

A strategy defines which phases the orchestrator executes and in what order.

| Strategy       | When to use                                                       | Flow                                                                         |
|----------------|-------------------------------------------------------------------|------------------------------------------------------------------------------|
| Standard       | Clear requirements, single approach obvious, low-risk changes     | Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship        |
| Propose-judge  | Multiple viable approaches, irreversible decisions, high complexity | Analyze → Propose → 🚦 Gate 0 → Plan → 🚦 Gate 1 → Implement → Judge → 🚦 Gate 2 → Ship |

### Auto-detection rules

The orchestrator selects the strategy automatically based on task characteristics.

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

### Explicit override

```text
"Skip the proposal phase and just implement DPAY-16000"       → forces standard
"Propose alternatives for DPAY-16000 before implementing"     → forces propose-judge
```

---

## Standard strategy

```text
Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship
```

### Phases

| Phase     | Agents                                                    | Output                  |
|-----------|-----------------------------------------------------------|-------------------------|
| Analyze   | story_analyzer → codebase_explorer → architecture (if complex) | Story context, code map |
| Plan      | planner_agent                                             | Implementation plan     |
| Implement | Route each task to specialist (backend/ui/webapi/etc.)    | Code changes            |
| Quality   | test_runner → code_review → security_scanner              | Test results, review    |
| Ship      | pr_creator_agent                                          | Pull request            |

### Gate definitions

- **Gate 1** (after Plan): Present implementation plan. User approves or redirects.
- **Gate 2** (after Quality): Present test results and review. User approves PR creation.

---

## Propose-judge strategy

```text
Analyze → Propose → 🚦 Gate 0 → Plan → 🚦 Gate 1 → Implement → Judge → 🚦 Gate 2 → Ship
```

### Phases

| Phase     | Agents                                                    | Output                                            |
|-----------|-----------------------------------------------------------|---------------------------------------------------|
| Analyze   | story_analyzer → codebase_explorer                        | Story context, code map, constraints              |
| Propose   | propose_agent                                             | 2-4 alternatives with dimensional scores + recommendation |
| Plan      | planner_agent (uses approved proposal as input)           | Implementation plan based on chosen approach      |
| Implement | Route each task to specialist                             | Code changes                                      |
| Judge     | judge_agent → code_review (if CONDITIONAL) → security_scanner | Score card + verdict                          |
| Ship      | pr_creator_agent                                          | Pull request                                      |

### Gate definitions

- **Gate 0** (after Propose): Present alternatives to user. User selects an approach or asks for more options. Proceed only after explicit selection.
- **Gate 1** (after Plan): Present plan based on chosen approach. User approves.
- **Gate 2** (after Judge): Present judge verdict. PASS → Ship. CONDITIONAL → fix and re-judge. FAIL → re-implement with feedback.

### Propose phase

The `propose_agent` generates 2-4 concrete implementation alternatives, each scored across dimensions:

```markdown
## Alternatives

### Option A: Token Bucket (in-memory)
**Score: 8.2/10** | Effort: S
- Correctness: 9/10
- Simplicity: 9/10
- Cons: lost on restart, not shared across instances

### Option B: Redis Sliding Window
**Score: 7.8/10** | Effort: M
- Correctness: 9/10
- Alignment: 8/10 (Redis already in stack)
- Cons: adds latency per request (~2ms)

## Recommendation → Option A
```

### Propose-to-plan handoff

The plan is grounded in the chosen proposal — not invented fresh:

```text
planner_agent receives:
  - Original story/requirements
  - Chosen proposal (Option X) with its code sketch and rationale
  - Constraints identified during proposal scoring
```

### Judge phase

The `judge_agent` evaluates the implementation with dimensional scoring:

```markdown
## Verdict: ✅ PASS (87.1/100)

| Dimension       | Score  | Key finding                        |
|-----------------|:------:|-------------------------------------|
| Correctness     | 90/100 | All ACs covered                     |
| Maintainability | 85/100 | Clean structure, good naming        |
| Performance     | 82/100 | O(n) acceptable at current scale    |
| Security        | 95/100 | Input validated, auth checked       |
| Testability     | 78/100 | Missing edge case test              |
| Idiomatic       | 88/100 | Follows project conventions         |
```

### Judge-driven quality loop

```text
Implement → Judge
              ├── PASS (≥80, no structural failures) → Gate 2 → Ship
              ├── CONDITIONAL (65-79 or one dimension 50-59) → fix → re-Judge (max 2 retries)
              └── FAIL (<65 or structural failure) → re-Implement with feedback (max 1 retry)
```

Maximum retries: 2 judge loops. If still CONDITIONAL after 2 retries, proceed to Gate 2 with the judge report for user decision.

---

## Implementation routing

The orchestrator routes implementation tasks to specialist agents by tech stack:

| Stack indicator                       | Agent       |
|---------------------------------------|-------------|
| Angular, TypeScript UI, component     | `ui`        |
| Node, Restify, Express, gateway, BFF  | `webapi`    |
| Java, Spring, DynamoDB, service       | `backend`   |
| Flutter, Dart, mobile                 | `flutter`   |
| Terraform, infrastructure, IaC        | `terraform` |
| Astro, SSR, React pages               | `astro`     |
| Python, Django, FastAPI               | `python`    |

---

## Resource-aware execution

The orchestrator adapts delegation concurrency based on system tier:

| Tier     | RAM   | Max concurrent | Execution                             |
|----------|-------|:--------------:|---------------------------------------|
| light    | ≤16GB |       2        | Sequential only — one agent at a time |
| standard | ≤32GB |       4        | Parallel OK for 2-3 agents            |
| power    | >32GB |       6        | Full parallel delegation              |

---

## Full flow example (propose-judge + interactive)

```text
User: "Implement GEW-1752 — upgrade the logger block to Angular 20"

Orchestrator: [detects: new major version, crosses multiple layers → propose-judge]

─── Phase: Analyze ───
  story_analyzer_agent → fetches ticket, extracts ACs
  codebase_explorer_agent → scans logger block structure

─── Phase: Propose ───
  propose_agent → generates 3 alternatives:
    Option A: Incremental upgrade (v18→19→20) with ng update — 8.4/10
    Option B: Clean rewrite with standalone APIs + signals — 7.6/10
    Option C: Parallel implementation (keep old, build new, swap) — 6.9/10

─── 🚦 Gate 0 ───
  Orchestrator: "I recommend Option A (incremental). Approve?"
  User: "go with A"

─── Phase: Plan ───
  planner_agent → creates step-by-step plan based on Option A

─── 🚦 Gate 1 ───
  Orchestrator: "Plan ready: 5 tasks, estimated 2h. Proceed?"
  User: "yes"

─── Phase: Implement ───
  ui agent → executes each task

─── Phase: Judge ───
  judge_agent → Composite: 87.1/100 → PASS ✅

─── 🚦 Gate 2 ───
  Orchestrator: "Judge verdict: PASS. Create PR?"
  User: "ship it"

─── Phase: Ship ───
  pr_creator_agent → PR #42 opened
```

---

## Standalone usage

Both propose and judge agents work independently of the full SDLC flow:

```text
# Propose without implementing
"Propose approaches for adding caching to the product service"

# Judge existing code without changing it
"Judge the quality of src/auth/ — I want to know where tech debt is"

# Judge another agent's output
"Have the judge evaluate what backend agent just produced"
```

---

## Related files

| File                                        | Purpose                                    |
|---------------------------------------------|--------------------------------------------|
| `shared/context/sdlc-workflow.md`           | Runtime-injected workflow (agent sees)      |
| `shared/steering/autopilot.md`              | Autopilot steering rules                   |
| `shared/steering/session-state.md`          | Session state persistence rules            |
| `shared/hooks/validate-content.sh`          | Pre-write content validation               |
| `shared/hooks/context-inject.sh`            | On-demand context loading                  |
| `shared/hooks/design-review-pre-push.sh`    | Plan drift detection on push               |
| `docs/experimental/propose-judge.md`        | User-facing propose-judge guide            |
| `docs/experimental/autopilot.md`            | User-facing autopilot guide                |
| `docs/experimental/context-on-demand.md`    | On-demand context loading guide            |
| `docs/experimental/session-state.md`        | Session state persistence guide            |
| `docs/experimental/depth-calibration.md`    | Adaptive output depth guide                |
| `docs/experimental/content-validation.md`   | Pre-write validation guide                 |
| `docs/experimental/design-review-hook.md`   | Design review hook guide                   |

