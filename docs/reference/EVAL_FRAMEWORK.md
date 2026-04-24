# Eval Framework — Architecture & Implementation Plan

> Author: Ricardo Sanchez | Date: 2026-03-30

---

## 1. Problem

steer-runtime has 54 agents with rich prompts. When someone edits a prompt, there's no automated way to know if the output got better, worse, or broke entirely. The `run-flow.sh` harness runs agents end-to-end but doesn't score what they produce. Quality is verified manually.

This doesn't scale. One subtle prompt regression in the orchestrator can silently break delegation across the entire dev profile.

---

## 2. Approach

**LLM-as-judge + structural checks**, run through Koda's existing ACP client.

```
Fixture (input prompt)
    → Koda ACP → kiro-cli → Agent
        → Output
            → Structural checks (deterministic, fast, free)
            → LLM-as-judge (quality scoring, costs tokens)
                → Score report (pass/fail per rubric)
```

Two scoring layers:
- **Structural checks** — regex, section presence, format validation. Deterministic, zero cost. Catches broken outputs.
- **LLM-as-judge** — sends output + rubric to an LLM and asks "score this 0-100 on each dimension." Catches quality regressions.

Structural checks run always. LLM scoring runs on demand (`--deep` flag) or in CI.

---

## 3. Architecture

```
steer-runtime/
└── evals/
    ├── fixtures/                    # Input scenarios per agent
    │   ├── orchestrator/
    │   │   ├── implement-story.md   # Fixture: "Implement DPAY-14337"
    │   │   └── multi-repo.md        # Fixture: "Feature spanning 2 repos"
    │   ├── code_review/
    │   │   └── java-pr.md           # Fixture: "Review this Java change"
    │   ├── test_planner/
    │   │   └── api-endpoint.md      # Fixture: "Plan tests for new endpoint"
    │   └── ...
    │
    ├── rubrics/                     # Scoring criteria per agent
    │   ├── orchestrator.yaml
    │   ├── code_review.yaml
    │   ├── test_planner.yaml
    │   └── ...
    │
    ├── baselines/                   # Known-good outputs for comparison
    │   ├── orchestrator/
    │   │   └── implement-story.md
    │   └── ...
    │
    ├── results/                     # Timestamped score reports (gitignored)
    │   └── 2026-03-30T17-58/
    │       ├── orchestrator.json
    │       └── summary.json
    │
    ├── judge.md                     # LLM-as-judge system prompt
    └── config.yaml                  # Thresholds, model, settings
```

### Koda integration

```
internal/
  eval/
    runner.go          # Spawns ACP, sends fixture, collects output
    scorer.go          # Structural checks + LLM-as-judge
    reporter.go        # Score aggregation, pass/fail, diff from baseline
    types.go           # Fixture, Rubric, Score, Result types
  cli/
    eval.go            # koda eval command
```

---

## 4. Core Components

### 4.1 Fixtures

A fixture is a markdown file with a prompt and optional context. One fixture = one test case.

```markdown
---
agent: orchestrator
name: implement-story
description: Implement a Jira story end-to-end
timeout: 120
tags: [dev-core, critical]
mock_context:
  ticket: "DPAY-14337: Add refund endpoint to payment-controls-api"
  acceptance_criteria:
    - "POST /refunds returns 201"
    - "Validates refund amount ≤ original charge"
    - "Writes audit log entry"
---

Implement ticket DPAY-14337. The project is at ~/wdpr-payment-controls-api.

This is a Java Spring Boot service. Base branch is main.
```

Key fields:
- `agent` — which agent to run
- `timeout` — max seconds (agents can be slow)
- `mock_context` — structured data the rubric can reference for correctness checks
- Body — the actual prompt sent to the agent

### 4.2 Rubrics

A rubric defines what "good" looks like for an agent. YAML format with structural checks and quality dimensions.

```yaml
# evals/rubrics/orchestrator.yaml
agent: orchestrator
description: SDLC orchestrator — delegates to specialists, produces implementation plan

structural_checks:
  - name: has_plan
    description: Output contains an implementation plan
    pattern: "(?i)(implementation plan|plan:|## plan|### tasks)"
    required: true

  - name: has_delegation
    description: Delegates to at least one specialist agent
    pattern: "(?i)(delegat|@backend|@webapi|@ui|@test_runner|use_subagent)"
    required: true

  - name: has_approval_gate
    description: Pauses for user approval before implementation
    pattern: "(?i)(approv|confirm|proceed|checkpoint|gate)"
    required: true

  - name: no_direct_main_push
    description: Never pushes directly to main
    pattern: "git push.*main|git push.*master"
    required: false
    expect: absent

quality_dimensions:
  - name: completeness
    weight: 30
    description: >
      Does the output cover all SDLC phases? (analysis, planning,
      implementation, testing, review, PR creation)

  - name: correctness
    weight: 30
    description: >
      Are the proposed changes aligned with the ticket requirements?
      Does it reference the right files and patterns for the project?

  - name: delegation_quality
    weight: 20
    description: >
      Does it delegate to the right specialist agents?
      (backend for Java, ui for Angular, test_runner for tests)

  - name: safety
    weight: 20
    description: >
      Does it follow golden rules? (feature branch, no secrets,
      approval gates, minimal diff)

thresholds:
  structural: 100    # All required structural checks must pass
  quality: 70        # Composite quality score must be ≥ 70
```

### 4.3 Runner (`runner.go`)

Uses Koda's existing ACP client to execute agents:

```go
type EvalRun struct {
    Agent    string
    Fixture  Fixture
    Output   string
    Duration time.Duration
    Error    string
}

func RunFixture(fixture Fixture) (EvalRun, error) {
    client, err := acp.Spawn(fixture.Agent)
    // ... create session, send fixture prompt, collect output
    // ... respect fixture.Timeout
    // ... return EvalRun with full output
}
```

The runner reuses the exact same ACP path that `koda chat` and `koda team` use — no new infrastructure.

### 4.4 Scorer (`scorer.go`)

Two passes:

**Pass 1 — Structural checks (deterministic):**
```go
type StructuralResult struct {
    Name     string
    Passed   bool
    Pattern  string
    Expected string // "present" or "absent"
}

func RunStructuralChecks(output string, checks []StructuralCheck) []StructuralResult {
    // regex match each check against output
    // required checks must pass for overall structural pass
}
```

**Pass 2 — LLM-as-judge (quality scoring):**
```go
func RunQualityScoring(output string, rubric Rubric, fixture Fixture) (QualityScore, error) {
    // Build judge prompt:
    //   "You are an eval judge. Score this agent output 0-100 on each dimension.
    //    Fixture: <fixture prompt>
    //    Rubric: <dimension descriptions>
    //    Output: <agent output>
    //    Return JSON: {dimensions: [{name, score, reasoning}]}"
    //
    // Send to kiro-cli via ACP (uses whatever model is configured)
    // Parse JSON scores
}
```

The judge prompt (`evals/judge.md`):
```markdown
You are an evaluation judge for AI agent outputs. Score the output on each
dimension from 0 to 100. Be strict — 70 is "acceptable", 90 is "excellent".

For each dimension, return:
- score (0-100)
- reasoning (one sentence explaining the score)

Return ONLY valid JSON:
{"dimensions": [{"name": "...", "score": N, "reasoning": "..."}]}
```

### 4.5 Reporter (`reporter.go`)

```
$ koda eval orchestrator

  orchestrator / implement-story
  ─────────────────────────────────────
  Structural checks:
    ✓ has_plan
    ✓ has_delegation
    ✓ has_approval_gate
    ✓ no_direct_main_push (absent)
    4/4 passed

  Quality scores (--deep):
    completeness:       82/100  "Covers all phases except security scan"
    correctness:        91/100  "Correctly identifies Spring Boot patterns"
    delegation_quality: 78/100  "Delegates to backend but misses test_runner"
    safety:             95/100  "Feature branch, approval gates, no secrets"
    ─────────────────────────
    Composite:          86/100  ✓ PASS (threshold: 70)

  Duration: 34s
  Result: PASS
```

Results saved to `evals/results/<timestamp>/` as JSON for trend tracking.

---

## 5. CLI Interface

```bash
# Run all fixtures for one agent
koda eval orchestrator

# Run all fixtures for all agents
koda eval --all

# Run only structural checks (fast, free, no LLM)
koda eval orchestrator --structural

# Run structural + LLM quality scoring
koda eval orchestrator --deep

# Set custom threshold
koda eval orchestrator --threshold 80

# Run specific fixture
koda eval orchestrator --fixture implement-story

# Run all agents in a profile
koda eval --profile dev-core

# Save baseline from current run (after verifying output is good)
koda eval orchestrator --save-baseline

# Compare against baseline
koda eval orchestrator --diff

# JSON output (for CI)
koda eval --all --json

# List available fixtures
koda eval --list
```

---

## 6. Config

```yaml
# evals/config.yaml
defaults:
  timeout: 120           # seconds per fixture
  threshold_structural: 100
  threshold_quality: 70
  deep: false            # structural-only by default

judge:
  agent: ""              # empty = default model via kiro-cli
  prompt: judge.md

profiles:
  critical:              # agents to eval on every prompt change
    - orchestrator
    - ba_orchestrator_agent
    - qa_orchestrator_agent
  standard:              # eval weekly or on-demand
    - backend
    - code_review_agent
    - test_planner_agent
    - security_scanner_agent
    - pr_creator_agent
```

---

## 7. Implementation Plan

### Phase 1 — Foundation (3 days)

**Day 1: Types + Runner**
- Define Go types: `Fixture`, `Rubric`, `StructuralCheck`, `QualityDimension`, `EvalRun`, `Score`
- Implement `runner.go` — spawn ACP, send fixture, collect output with timeout
- Parse fixture markdown frontmatter (YAML header + body)

**Day 2: Structural Scorer + Reporter**
- Implement structural checks (regex match, present/absent)
- Implement reporter — terminal output with pass/fail formatting
- Save results as JSON to `evals/results/`

**Day 3: CLI + First Fixtures**
- Add `koda eval` command (Cobra) with flags: `--all`, `--structural`, `--deep`, `--profile`, `--fixture`, `--json`, `--threshold`
- Write first 3 fixtures + rubrics:
  - `orchestrator/implement-story.md`
  - `code_review/java-pr.md`
  - `test_planner/api-endpoint.md`

**Deliverable:** `koda eval orchestrator --structural` works end-to-end.

### Phase 2 — LLM Scoring (2 days)

**Day 4: LLM-as-Judge**
- Implement `RunQualityScoring` — builds judge prompt, sends via ACP, parses JSON scores
- Write `judge.md` system prompt
- Composite score calculation (weighted average of dimensions)
- Threshold comparison and pass/fail

**Day 5: Baselines + Diff**
- `--save-baseline` saves current output as known-good
- `--diff` compares current output against baseline (structural diff + score delta)
- Highlight regressions: "completeness dropped 82 → 65 ⚠️"

**Deliverable:** `koda eval orchestrator --deep` produces quality scores.

### Phase 3 — Coverage (3 days)

**Days 6-8: Fixtures for priority agents**

Write fixtures + rubrics for the 10 highest-impact agents:

| Agent                    | Fixtures | Focus                                        |
|--------------------------|:--------:|----------------------------------------------|
| `orchestrator`           |    2     | Delegation, plan quality, approval gates     |
| `ba_orchestrator_agent`  |    2     | Scope extraction, story quality              |
| `qa_orchestrator_agent`  |    2     | Test strategy, coverage planning             |
| `code_review_agent`      |    2     | Review thoroughness, golden rule compliance  |
| `backend`                |    1     | Code quality, pattern adherence              |
| `test_planner_agent`     |    1     | Test plan completeness                       |
| `security_scanner_agent` |    1     | Vulnerability detection                      |
| `pr_creator_agent`       |    1     | PR description quality, conventional commits |
| `story_analyzer_agent`   |    1     | Ticket extraction completeness               |
| `planner_agent`          |    1     | Plan actionability, task granularity         |

**Deliverable:** 16 fixtures covering the critical path. `koda eval --all` runs the full suite.

### Phase 4 — CI Integration (optional, 1 day)

**Day 9:**
- GitHub Actions workflow: on PR touching `profiles/*/prompts/*.md`, run `koda eval --profile critical --deep --json`
- Parse JSON output, post score summary as PR comment
- Fail check if any agent drops below threshold

```yaml
# .github/workflows/eval.yml
on:
  pull_request:
    paths: ['profiles/*/prompts/**']
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: koda eval --profile critical --deep --json > results.json
      - run: |
          # Parse and post comment
          score=$(jq '.composite_score' results.json)
          if (( $(echo "$score < 70" | bc -l) )); then
            echo "::error::Eval score $score below threshold 70"
            exit 1
          fi
```

**Deliverable:** Prompt changes are automatically scored in CI.

---

## 8. Cost & Performance

| Mode                       |  LLM calls per agent  | Time per agent | Cost              |
|----------------------------|:---------------------:|:--------------:|-------------------|
| `--structural`             |  1 (agent run only)   |     30-60s     | Normal agent cost |
| `--deep`                   | 2 (agent run + judge) |    60-120s     | 2× agent cost     |
| `--all --deep` (10 agents) |          20           |    ~15 min     | 20× agent cost    |

Mitigations:
- Default to `--structural` (fast, free scoring)
- `--deep` only on demand or CI
- `--profile critical` limits to orchestrators (3 agents)
- Fixture timeouts prevent runaway sessions
- Cache agent outputs — re-score without re-running (`--rescore`)

---

## 9. File Summary

| File                                | Purpose                                          |
|-------------------------------------|--------------------------------------------------|
| `evals/config.yaml`                 | Thresholds, judge config, profile groups         |
| `evals/judge.md`                    | LLM-as-judge system prompt                       |
| `evals/fixtures/<agent>/<name>.md`  | Input scenarios (YAML frontmatter + prompt body) |
| `evals/rubrics/<agent>.yaml`        | Structural checks + quality dimensions per agent |
| `evals/baselines/<agent>/<name>.md` | Known-good outputs for diff comparison           |
| `evals/results/<timestamp>/`        | Score reports (gitignored)                       |
| `internal/eval/runner.go`           | ACP-based agent execution                        |
| `internal/eval/scorer.go`           | Structural checks + LLM-as-judge                 |
| `internal/eval/reporter.go`         | Terminal output + JSON export                    |
| `internal/eval/types.go`            | Shared types                                     |
| `internal/cli/eval.go`              | `koda eval` command                              |

---

## 10. Timeline

```
Week 1:
  Day 1-3: Phase 1 (types, runner, structural scorer, CLI, first 3 fixtures)
  Day 4-5: Phase 2 (LLM-as-judge, baselines, diff)

Week 2:
  Day 6-8: Phase 3 (16 fixtures for 10 priority agents)
  Day 9:   Phase 4 (CI integration — optional)
```

Total: **~9 days** for full implementation, or **5 days** for a working MVP (Phases 1-2).
