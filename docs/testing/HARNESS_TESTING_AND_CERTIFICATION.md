# Harness Testing & Certification

Automated framework for evaluating orchestrator delegation, agent output quality, and generating a trust score before each steer-runtime release.

---

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                   make certify                          │
├───────────────────┬─────────────────┬──────────────────┤
│  Delegation Tests │  Structural Eval│  Quality Eval    │
│      (40%)        │      (30%)      │     (30%)        │
├───────────────────┼─────────────────┼──────────────────┤
│ Did orchestrators │ Does output     │ How good is      │
│ use subagent?     │ match expected  │ the output?      │
│                   │ shape/patterns? │ (LLM judge)      │
└───────────────────┴─────────────────┴──────────────────┘
                          ↓
              ┌──────────────────────┐
              │   Trust Score 0-100  │
              │   🟢🟡🟠🔴 Tier     │
              └──────────────────────┘
```

## Quick Start

```bash
cd ~/Workspace/Disney/SANCR225/steer-runtime

# Preview what will be tested
make test-delegation DRY=1
make eval-all DRY=1

# Run full certification (complete pipeline)
make certify-full

# Or run individual parts:
make validate-all       # structural checks
make validate-delegation # delegation tests only
make eval-fast          # quick quality + compliance
make certify            # trust score from existing results

# Or step by step:
make test-delegation    # delegation tests only
make eval-all           # eval suite only
make certify-report     # combine results into score
```

---

## 1. Delegation Tests

**Purpose:** Verify orchestrators delegate to specialist agents instead of executing tasks themselves.

**Location:** `steer-runtime/tests/orchestration/`

### How it works

1. Spawns kiro-cli in ACP mode with the orchestrator agent
2. Sends a task prompt via JSON-RPC
3. Captures the response stream
4. Checks for `subagent` tool calls
5. Validates the correct specialist was invoked
6. Verifies forbidden tools were not called directly

### Scenario format

```json
{
  "name": "analyze-story",
  "description": "What this test validates",
  "agent": "orchestrator",
  "prompt": "The task to send",
  "expect": {
    "delegated": true,
    "agents_called": ["exact_agent"],
    "agents_called_any": ["one_of_these", "or_these"],
    "forbidden_tools": ["tools_orchestrator_must_not_call"]
  },
  "timeout_seconds": 60
}
```

| Field | Description |
|-------|-------------|
| `delegated` | Must the `subagent` tool be called? |
| `agents_called` | ALL listed agents must be invoked |
| `agents_called_any` | At least ONE must be invoked |
| `forbidden_tools` | Must NOT be called directly by the orchestrator |

### Current coverage

| Orchestrator | Scenarios | Tests |
|---|---|---|
| orchestrator (SDLC) | 3 | analyze, implement, review |
| sustainment_orchestrator | 3 | triage, RCA, stability |
| ba_orchestrator | 1 | requirements analysis |
| qa_orchestrator | 1 | test planning |
| ops_orchestrator | 1 | deployment check |
| pm_orchestrator | 1 | sprint status |
| steer_orchestrator | 1 | PR review |
| leadership_orchestrator | 1 | quarterly report |
| ai_orchestrator | 1 | ML task routing |
| cloudops_orchestrator | 1 | infra investigation |
| design_orchestrator | 1 | architecture review |
| inspector_orchestrator | 1 | UI inspection |
| **Total** | **16** | |

### Adding scenarios

Create a `.json` file in `tests/orchestration/scenarios/{agent_name}/`:

```bash
# The runner auto-discovers all *.json files
tests/orchestration/scenarios/
├── orchestrator/
│   ├── 01-analyze-story.json
│   └── 02-implement-feature.json
├── qa_orchestrator_agent/
│   └── 01-plan-testing.json
└── ...
```

---

## 2. Eval Framework

**Purpose:** Evaluate the quality and correctness of agent outputs using structural checks and (optionally) LLM-as-judge scoring.

**Location:** `steer-runtime/evals/`

### Auto-discovery

The runner scans the steer-runtime tree and discovers all evaluable artifacts:

```bash
make eval-scan
```

```
📊 Discovery Report
──────────────────────────────────────────────────
  Agents:    138
  Skills:    49
  Total:     187
  Evaluable: 3 (have rubrics)
```

To make an agent or skill evaluable, add:

```
evals/rubrics/{agent_name}.yaml           # for agents
evals/rubrics/skills/{skill_name}.yaml    # for skills
evals/fixtures/{agent_name}/scenario.md   # test prompts
```

### Rubric format

```yaml
agent: orchestrator
description: What this agent should do

structural_checks:
  - name: has_plan
    pattern: "(?i)(implementation plan|## plan)"
    required: true

  - name: no_secrets
    pattern: "(password|token|secret)\\s*[:=]\\s*['\"][^'\"]{8,}"
    required: false
    expect: absent

quality_dimensions:
  - name: completeness
    weight: 30
    description: Does it cover all required aspects?
  - name: correctness
    weight: 30
    description: Is the output technically accurate?
  - name: delegation_quality
    weight: 20
    description: Right specialist agents selected?
  - name: safety
    weight: 20
    description: Follows golden rules?
```

### Fixture format

```markdown
---
agent: orchestrator
name: implement-story
timeout: 300
tags: [dev-core, critical]
---

I need to implement ticket DPAY-14337...
```

---

## 3. Certification

**Purpose:** Combine delegation + eval results into a single trust score that gates releases.

**Location:** `steer-runtime/evals/certify.py`

### Trust Score Formula

```
Trust Score = (delegation_pass_rate × 40%) + (structural_pass_rate × 30%) + (quality_avg × 30%)
```

### Tiers

| Score | Badge | Meaning | Release? |
|-------|-------|---------|----------|
| 90-100 | 🟢 Certified | All orchestrators delegate, output quality high | ✅ Ship it |
| 70-89 | 🟡 Qualified | Most delegation works, minor quality gaps | ✅ Ship with notes |
| 50-69 | 🟠 Conditional | Known delegation failures | ⚠️ Justify |
| <50 | 🔴 Uncertified | Broken delegation | ❌ Do not release |

### Output files

```
evals/results/
├── CERTIFICATION.md     # Human-readable report
├── certification.json   # Machine-readable for CI
├── orchestrator.json    # Per-target eval results
└── summary.json         # Delegation test results
```

### Integration with release pipeline

The certification gate runs automatically during `make publish-all`:

```
validate-workspaces → validate-agents → validate-catalog → certify → MCP build → publish
```

Currently **non-blocking** (warns if below Qualified). To make it blocking:

```makefile
# Change the certify step to exit 1 on failure:
python3 $(STEER_ROOT)/evals/certify.py || { echo "❌ Certification failed"; exit 1; }
```

---

## 4. Workflow

### Before a release

```bash
# 1. Run delegation tests
make test-delegation

# 2. Run eval suite
make eval-all

# 3. Generate certification
make certify

# 4. Review report
cat ../steer-runtime/evals/results/CERTIFICATION.md
```

### After modifying an orchestrator prompt

```bash
# Test just that orchestrator
make test-delegation  # runs all, or use runner.sh directly:
../steer-runtime/tests/orchestration/runner.sh scenarios/orchestrator/01-analyze-story.json
```

### After adding a new orchestrator

1. Create scenario: `tests/orchestration/scenarios/{name}/01-basic.json`
2. Run: `make test-delegation`
3. Verify it passes

### After modifying a skill or agent prompt

1. Add rubric: `evals/rubrics/{name}.yaml`
2. Add fixture: `evals/fixtures/{name}/test.md`
3. Run: `make eval-run TARGET={name}`

---

## 5. Evaluator Framework (v2)

> **Since:** v0.2.160

A Python-based evaluation framework (`evals/evaluator/`) that extends certification with quality scoring and compliance checks. Uses `uv` for dependency management.

### New Makefile targets

| Target | Purpose | Speed |
|--------|---------|:-----:|
| `make eval-quality` | Score output completeness and correctness | ~3min |
| `make eval-compliance` | Verify SDLC flow adherence (gates, phases) | ~2min |
| `make eval-fast` | Quick smoke test (delegation + compliance, 60s timeout) | ~1min |
| `make eval-report` | Generate markdown evaluation report | ~3min |
| `make eval-list` | Show available test cases | instant |
| `make certify-full` | Complete pipeline: validate-all + delegation + eval-fast + certify | ~8min |

### Scoring dimensions

| Dimension | Weight | What it measures |
|-----------|:------:|-----------------|
| delegation_accuracy | 25% | Correct agent selected for task |
| phase_compliance | 20% | Correct SDLC phases followed |
| gate_adherence | 15% | Gates not skipped |
| output_quality | 20% | Actionable, complete, no hallucinations |
| context_efficiency | 10% | Tokens used vs minimum needed |
| tool_discipline | 10% | No forbidden tools called |

### Test case structure

```text
evals/evaluator/
├── config/
│   ├── default.yaml          # Full evaluation config
│   └── fast.yaml             # Quick smoke test
├── test_cases/
│   ├── delegation/           # Agent routing correctness
│   ├── quality/              # Output completeness
│   └── compliance/           # SDLC workflow adherence
└── packages/
    ├── execution/            # Run agent sessions
    ├── scoring/              # Score results by dimension
    └── reporting/            # Generate reports
```

### Adding a test case

```json
{
  "prompt": "The task to evaluate",
  "expected_agent": "backend",
  "expected_pattern": "regex to match in output",
  "category": "delegation_accuracy",
  "metadata": { "description": "What this tests" }
}
```

### Running the full pipeline

```bash
# Quick validation before a release
make certify-full

# Equivalent to running:
make validate-all          # structural checks
make validate-delegation   # delegation tests
make eval-fast             # quality + compliance (fast)
make certify               # trust score
```

### Relationship to existing certification

| Component | Existing (`certify.py`) | New (`evaluator/`) |
|-----------|:-----------------------:|:------------------:|
| Delegation tests | ✅ 26 scenarios | ✅ Extensible test cases |
| Structural eval | ✅ Pattern matching | ✅ Same + JSON schema |
| Quality scoring | ❌ Manual | ✅ LLM-as-judge (when configured) |
| Compliance | ❌ Not checked | ✅ SDLC phase verification |
| Context efficiency | ❌ Not measured | ✅ Token usage tracking |
| Report format | Markdown | Markdown + JSON |

The new evaluator **complements** `certify.py` — both run in `make certify-full`.

---

## 6. Future enhancements

- [ ] LLM judge integration (quality dimension scoring via Bedrock)
- [ ] Parallel scenario execution
- [ ] CI/CD integration (run on PR merge to steer-runtime)
- [ ] Historical trend tracking (score over versions)
- [ ] Per-workspace certification (workspace-specific orchestrators)
- [ ] Skill-specific structural checks (HTML output, chart presence, etc.)
- [ ] Latency benchmarks (delegation should happen within N seconds)
- [ ] Model comparison reports (eval same cases across different models)
- [ ] Batch evaluation across all test cases with CSV export
