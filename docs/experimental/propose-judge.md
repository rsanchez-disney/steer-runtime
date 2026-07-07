# Propose-Judge Strategy

> 🧪 **Status:** Experimental
> **Since:** v0.2.150 (steer-runtime)

The propose-judge strategy extends the orchestrator's SDLC workflow with two new phases: **Propose** (explore alternatives before committing) and **Judge** (evaluate quality with dimensional scoring after implementation). This produces higher-quality outcomes for complex tasks by preventing premature commitment to suboptimal approaches.

## Quick start

```bash
# The orchestrator auto-selects this strategy for complex tasks
koda chat "propose alternatives for adding caching to the product service"

# Explicit trigger phrases
koda chat "what's the best approach for implementing SSO with OneID V5?"
koda chat "judge the code in src/services/payment.service.ts"

# Full SDLC with propose-judge (auto-detected for complex stories)
koda chat "implement DPAY-15900"
```

## How it works

### Standard strategy (simple tasks)

```
Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship
```

### Propose-judge strategy (complex tasks)

```
Analyze → Propose → 🚦 Gate 0 → Plan → 🚦 Gate 1 → Implement → Judge → 🚦 Gate 2 → Ship
              │                                                    │
              │ 2-4 alternatives                                   │ Score card
              │ with scores                                        │ + verdict
              ▼                                                    ▼
         User picks                                     PASS → Ship
         an option                                      CONDITIONAL → fix → re-Judge
                                                        FAIL → re-Implement
```

## When the orchestrator activates it

The orchestrator auto-selects propose-judge when ANY of these apply:

- Multiple architectural approaches are viable
- Task introduces a new dependency or library
- Change crosses 3+ layers (UI + API + backend + DB)
- User explicitly asks for options or alternatives
- Story has ambiguous acceptance criteria
- Task involves a technology the team hasn't used before

## Example prompts

### Triggering proposals

```
"Propose alternatives for implementing rate limiting on the gateway"

"What's the best approach for migrating from RxJS to signals in this component?"

"I need to add real-time notifications — what are my options?"

"How should I structure the new payment reconciliation service?"

"Suggest implementation approaches for DPAY-16000"
```

### Triggering judgment

```
"Judge the code I just wrote in internal/ops/ps.go"

"Score the quality of the authentication module"

"Evaluate this PR's implementation quality"

"How good is the error handling in src/services/?"

"Rate the code that backend agent produced"
```

### Full flow example

```
User: "Implement GEW-1752 — upgrade the logger block to Angular 20"

Orchestrator: [detects: new major version, crosses multiple layers → propose-judge strategy]

─── Phase: Analyze ───
  story_analyzer_agent → fetches ticket, extracts ACs
  codebase_explorer_agent → scans logger block structure

─── Phase: Propose ───
  propose_agent → generates 3 alternatives:
    Option A: Incremental upgrade (v18→19→20) with ng update
    Option B: Clean rewrite with standalone APIs + signals
    Option C: Parallel implementation (keep old, build new, swap)
  → Scores each on correctness, maintainability, alignment, performance, simplicity
  → Recommends Option A (8.4/10) — safest, aligns with team's migration playbook

─── 🚦 Gate 0 ───
  Orchestrator: "I recommend Option A (incremental upgrade). Approve?"
  User: "go with A"

─── Phase: Plan ───
  planner_agent → creates step-by-step plan based on Option A's code sketch

─── 🚦 Gate 1 ───
  Orchestrator: "Plan ready: 5 tasks, estimated 2h. Proceed?"
  User: "yes"

─── Phase: Implement ───
  ui agent → executes each task

─── Phase: Judge ───
  judge_agent → evaluates result:
    Correctness: 90/100
    Maintainability: 85/100
    Performance: 82/100
    Security: 95/100
    Testability: 78/100
    Idiomatic: 88/100
    Composite: 87.1/100 → PASS ✅

─── 🚦 Gate 2 ───
  Orchestrator: "Judge verdict: PASS (87.1/100). Ready to create PR?"
  User: "ship it"

─── Phase: Ship ───
  pr_creator_agent → creates PR
```

## Proposal output format

The `propose_agent` presents alternatives in a structured format:

```markdown
# Proposal: Rate Limiting for Gateway

## Alternatives

### Option A: Token Bucket (in-memory)
**Score: 8.2/10** | Effort: S
- Correctness: 9/10 — handles burst and sustained traffic
- Simplicity: 9/10 — no external dependencies
- Cons: lost on restart, not shared across instances

### Option B: Redis Sliding Window
**Score: 7.8/10** | Effort: M
- Correctness: 9/10 — distributed, survives restarts
- Alignment: 8/10 — Redis already in stack
- Cons: adds latency per request (~2ms)

### Option C: API Gateway Level (Kong/Envoy)
**Score: 6.5/10** | Effort: L
- Performance: 10/10 — handled before app code
- Cons: infra change, deployment dependency, team unfamiliar

## Recommendation → Option A
Simplest approach that works for current scale. Upgrade to Option B
when we need multi-instance support.
```

## Judge verdict format

The `judge_agent` produces a score card:

```markdown
# Code Judgment Report

## Verdict: ✅ PASS (87.1/100)

| Dimension      | Score  | Key finding                         |
|----------------|:------:|-------------------------------------|
| Correctness    | 90/100 | All ACs covered, 1 edge case noted  |
| Maintainability| 85/100 | Clean structure, good naming        |
| Performance    | 82/100 | O(n) acceptable at current scale    |
| Security       | 95/100 | Input validated, auth checked       |
| Testability    | 78/100 | Missing test for empty array edge   |
| Idiomatic      | 88/100 | Follows project conventions         |

## Top improvements
1. Add edge case test for empty config array
2. Consider batch query to prevent future N+1
```

## Using propose and judge standalone

You don't have to run the full SDLC flow — both agents work independently:

```bash
# Propose without implementing
"Propose approaches for X — I just want to think through options"

# Judge existing code without changing it
"Judge the quality of src/auth/ — I want to know where tech debt is"

# Judge another agent's output
"Have the judge evaluate what backend agent just produced"
```

## Configuration

No configuration needed — the strategy is built into the orchestrator's routing logic. To force a specific strategy:

```
"Skip the proposal phase and just implement DPAY-16000"  → forces standard
"Propose alternatives for DPAY-16000 before implementing" → forces propose-judge
```

## Relationship to other features

| Feature                          | Relationship                                              |
|----------------------------------|-----------------------------------------------------------|
| [Autopilot](autopilot.md)       | Autopilot skips gates. Propose-judge adds gates. Incompatible by design — autopilot always uses standard strategy. |
| [Planning Mode](planning-mode.md) | Planning mode is read-only. Propose-judge generates a plan that leads to implementation. |
| code_review_agent                | Reviews PRs (diffs only). Judge evaluates full files/modules with dimensional scoring. |
| architecture_agent               | Provides design guidance on demand. Propose generates and scores concrete options. |
