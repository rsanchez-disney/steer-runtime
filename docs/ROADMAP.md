# steer-runtime — Implementation Roadmap

> Closing the gaps where AI Pods is stronger  
> Author: Ricardo Sanchez | Created: 2026-03-25  
> Source: [Comparative Analysis](../../Globant/Y1-REG092-87/aipods-understanding/COMPARATIVE-AIPODS-VS-STEER.md)

---

## Context

AI Pods excels in areas steer-runtime currently lacks: structured artifact generation, declarative workflows, formal quality gates, deep architecture/QE coverage, agent quality evaluation, and schema validation. This roadmap defines the implementation plan to close those gaps while preserving steer-runtime's core strengths (IDE-native agents, MCP integrations, adaptive orchestration).

### Current State (v3.5.0)

| Dimension | steer-runtime | AI Pods |
|-----------|:---:|:---:|
| Artifact generation (PRDs, backlogs, test plans) | ❌ | ✅ 6 capabilities |
| Declarative workflow definitions | ❌ | ✅ YAML capabilities |
| Formal quality gates | ❌ | ✅ human-quality-gate steps |
| Architecture depth | 1 agent | 4 dedicated skills |
| QE depth | 6 agents | 18 granular skills |
| Agent quality evaluation | ❌ | ✅ DeepEval framework |
| Schema validation for configs | ❌ | ✅ JSON Schema |
| Token cost tracking | ❌ | ✅ VTU model |
| Project abstraction (generic) | ❌ project-specific | ✅ organization-agnostic |

---

## Phase 1 — Foundation (Weeks 1–3)

> Goal: Artifact generation pipeline + quality gates + declarative workflows  
> These are the features that make AI Pods fundamentally different as a delivery platform.

### 1.1 Artifact Generation Framework

**Gap:** steer-runtime agents produce ad-hoc conversational output. AI Pods generates structured documents (PRDs, backlogs, test plans, ADRs) through dedicated multi-step pipelines with validated output formats.

**Implementation:**

#### 1.1.1 Artifact Templates

Create reusable output templates that agents reference when generating documents.

```
common/
└── artifact-templates/
    ├── prd-template.md              # Product Requirements Document
    ├── backlog-template.md          # Epic → Feature → Story breakdown
    ├── test-plan-template.md        # Master test plan with strategy
    ├── test-cases-template.md       # Gherkin-format test cases
    ├── adr-template.md              # Architecture Decision Record
    ├── bounded-context-template.md  # Domain boundary map
    └── README.md                    # Template usage guide
```

Each template defines:
- Required sections with descriptions
- Output format constraints (markdown structure, heading levels)
- Acceptance criteria checklist
- Example output snippet

#### 1.1.2 PRD Generation Agent

New agent in `.kiro-ba/` that follows a research → draft → refine cycle.

| File | Purpose |
|------|---------|
| `.kiro-ba/agents/prd_generator_agent.json` | Agent config with Jira + Confluence MCP |
| `.kiro-ba/prompts/prd_generator_agent.md` | Prompt: gather context → analyze stakeholders → draft PRD → validate against template |

Prompt structure:
1. Read Jira epic/feature for requirements context
2. Analyze stakeholders, personas, success metrics
3. Generate PRD following `common/artifact-templates/prd-template.md`
4. Self-validate against completeness checklist
5. Save to `./artifacts/prd-<JIRA_KEY>.md`

#### 1.1.3 Backlog Generation Agent

New agent in `.kiro-ba/` that takes a PRD and produces a full backlog hierarchy.

| File | Purpose |
|------|---------|
| `.kiro-ba/agents/backlog_generator_agent.json` | Agent config |
| `.kiro-ba/prompts/backlog_generator_agent.md` | Prompt: PRD → Epics → Features → User Stories → Story Map |

Pipeline steps (executed within a single agent conversation):
1. Parse PRD to extract features and requirements
2. Generate epics with business value and scope
3. Break epics into features with acceptance criteria
4. Write user stories in standard format (As a... I want... So that...)
5. Produce story map (markdown table: epics × releases)
6. Save consolidated backlog to `./artifacts/backlog-<JIRA_KEY>.md`
7. Optionally push stories to Jira via MCP

#### 1.1.4 Enhanced Test Plan Agent

Expand existing `test_planner_agent` to produce full test strategy documents.

| File | Change |
|------|--------|
| `.kiro-qa/prompts/test_planner_agent.md` | Add structured output mode referencing `test-plan-template.md` |
| `.kiro-qa/agents/test_case_generator_agent.json` | **New agent** — dedicated Gherkin test case generation |
| `.kiro-qa/prompts/test_case_generator_agent.md` | Prompt: stories → scenarios → Gherkin features |

The test case generator produces:
- Happy path scenarios per user story
- Edge cases and negative scenarios
- Gherkin `.feature` files ready for automation
- Traceability matrix (story → test case mapping)

**Effort:** 2 weeks  
**Files created:** ~12 new files (6 templates, 3 agents, 3 prompts)  
**Dependencies:** None — uses existing MCP integrations

---

### 1.2 Quality Gate Mechanism

**Gap:** AI Pods has explicit `human-quality-gate` steps that pause execution for human review with accept/reject/revise actions. steer-runtime has no equivalent — interaction is purely conversational.

**Implementation:**

#### 1.2.1 Quality Gate Agent

A special-purpose agent that formats artifacts for review and enforces approval.

| File | Purpose |
|------|---------|
| `common/agents/quality_gate_agent.json` | Shared agent available to all profiles |
| `common/prompts/quality_gate_agent.md` | Prompt: present artifact → show checklist → require explicit approval |

Behavior:
1. Receives an artifact path as input
2. Reads the artifact and presents a summary
3. Displays the relevant review criteria checklist (from `common/review-criteria/`)
4. Asks the human: **APPROVE**, **REJECT** (with reason), or **REVISE** (with feedback)
5. On REJECT/REVISE: returns feedback to the generating agent
6. On APPROVE: logs approval timestamp and moves to next step

#### 1.2.2 Review Criteria Templates

```
common/
└── review-criteria/
    ├── prd-review.md           # PRD completeness, stakeholder coverage, measurable goals
    ├── backlog-review.md       # Story quality, acceptance criteria, estimation readiness
    ├── architecture-review.md  # ADR completeness, pattern justification, risk assessment
    ├── test-plan-review.md     # Coverage, risk-based prioritization, environment readiness
    ├── code-review.md          # Standards compliance, security, performance, tests
    └── README.md
```

Each criteria file contains:
- Numbered checklist items (pass/fail)
- Severity levels (blocker, major, minor)
- Common rejection reasons

#### 1.2.3 Integration with Orchestrators

Update all orchestrator prompts to invoke `quality_gate_agent` after artifact generation steps:

| Orchestrator | Change |
|-------------|--------|
| `ba_orchestrator_agent` | Gate after PRD generation, gate after backlog generation |
| `qa_orchestrator_agent` | Gate after test plan, gate after test cases |
| `orchestrator` (dev-core) | Gate after architecture decisions, gate before PR creation |

**Effort:** 1 week  
**Files created:** ~8 new files (1 agent, 1 prompt, 6 criteria)  
**Files modified:** 3 orchestrator prompts

---

### 1.3 Declarative Workflow Definitions

**Gap:** AI Pods defines workflows as YAML capability files with step ordering, dependencies, timeouts, and quality gates. steer-runtime relies entirely on dynamic agent delegation.

**Implementation:**

#### 1.3.1 Workflow Schema

Define a YAML schema for multi-step workflows that coexists with the current adaptive mode.

```
common/
└── workflows/
    ├── schema.json                      # JSON Schema for workflow validation
    ├── product-definition.yaml          # PRD → Gate → Backlog → Gate
    ├── architecture-review.yaml         # Analysis → ADR → Gate → Specs
    ├── test-planning.yaml               # Strategy → Plan → Gate → Cases
    ├── full-sdlc.yaml                   # End-to-end: BA → Arch → Dev → QA
    └── README.md
```

Workflow YAML format:

```yaml
name: product-definition
description: Generate PRD and backlog from Jira epic
version: 1.0.0
profiles: [ba]

steps:
  - id: research
    agent: requirements_analyst_agent
    profile: ba
    description: Gather and analyze requirements from Jira
    inputs:
      - jira_key        # Epic or feature key
    outputs:
      - artifacts/requirements-analysis.md
    timeout_minutes: 30

  - id: prd-generation
    agent: prd_generator_agent
    profile: ba
    description: Generate PRD from requirements analysis
    depends_on: [research]
    inputs:
      - artifacts/requirements-analysis.md
    outputs:
      - artifacts/prd-{jira_key}.md

  - id: prd-review
    type: quality-gate
    agent: quality_gate_agent
    description: Human review of generated PRD
    depends_on: [prd-generation]
    criteria: common/review-criteria/prd-review.md
    artifact: artifacts/prd-{jira_key}.md
    on_reject: prd-generation    # Loop back

  - id: backlog-generation
    agent: backlog_generator_agent
    profile: ba
    description: Generate epic/story breakdown from approved PRD
    depends_on: [prd-review]
    inputs:
      - artifacts/prd-{jira_key}.md
    outputs:
      - artifacts/backlog-{jira_key}.md

  - id: backlog-review
    type: quality-gate
    agent: quality_gate_agent
    description: Human review of generated backlog
    depends_on: [backlog-generation]
    criteria: common/review-criteria/backlog-review.md
    artifact: artifacts/backlog-{jira_key}.md
```

#### 1.3.2 Workflow Runner Script

New script that executes workflow definitions step-by-step.

| File | Purpose |
|------|---------|
| `scripts/run-workflow.sh` | Reads YAML workflow, executes agents in order, handles gates |
| `scripts/workflow-state.sh` | Tracks step completion, supports pause/resume |

Runner behavior:
1. Parse workflow YAML
2. Resolve dependency graph (topological sort)
3. For each step: invoke the agent via `kiro-cli chat --agent <agent>`
4. For quality-gate steps: present artifact + criteria, wait for human input
5. On reject: loop back to the specified step
6. Track state in `.workflow-state/<workflow-name>.json`
7. Support `--resume` flag to continue from last completed step

State file format:
```json
{
  "workflow": "product-definition",
  "started_at": "2026-03-25T18:00:00Z",
  "jira_key": "DPAY-14561",
  "steps": {
    "research": { "status": "completed", "completed_at": "..." },
    "prd-generation": { "status": "completed", "completed_at": "..." },
    "prd-review": { "status": "approved", "reviewer": "rsanchez", "completed_at": "..." },
    "backlog-generation": { "status": "in-progress" }
  }
}
```

#### 1.3.3 Setup.sh Integration

Add workflow commands to `setup.sh`:

```bash
./setup.sh workflow list                          # List available workflows
./setup.sh workflow run product-definition DPAY-14561   # Run workflow
./setup.sh workflow resume product-definition     # Resume paused workflow
./setup.sh workflow status product-definition     # Show step status
```

**Effort:** 2–3 weeks  
**Files created:** ~8 files (schema, 4 workflows, runner script, state script, README)  
**Files modified:** `setup.sh` (add workflow commands)

---

## Phase 2 — Depth & Quality (Weeks 4–6)

> Goal: Deeper architecture/QE agents + evaluation framework + schema validation

### 2.1 Architecture Agent Expansion

**Gap:** AI Pods has 4 dedicated architecture skills (foundation, bounded contexts, ADRs, specifications). steer-runtime has 1 `architecture_agent` with a broad prompt.

**Implementation:**

Split `architecture_agent` into 3 specialized sub-agents:

| New Agent | Profile | Purpose |
|-----------|---------|---------|
| `bounded_context_agent` | dev-core | Analyzes codebase/requirements → domain boundaries, aggregates, context maps |
| `adr_writer_agent` | dev-core | Produces ADRs: Context → Decision → Consequences → Alternatives |
| `architecture_spec_agent` | dev-core | Target architecture: component diagrams, integration patterns, deployment topology |

Keep existing `architecture_agent` as the orchestrator that delegates to these specialists.

Files to create:

```
.kiro-dev-core/
├── agents/
│   ├── bounded_context_agent.json
│   ├── adr_writer_agent.json
│   └── architecture_spec_agent.json
├── prompts/
│   ├── bounded_context_agent.md
│   ├── adr_writer_agent.md
│   └── architecture_spec_agent.md
```

Update `architecture_agent.md` prompt to delegate:
- "Analyze domain boundaries" → `bounded_context_agent`
- "Document a technical decision" → `adr_writer_agent`
- "Design target architecture" → `architecture_spec_agent`

Add artifact templates:
```
common/artifact-templates/
├── adr-template.md
└── bounded-context-template.md
```

**Effort:** 1 week  
**Files created:** 6 agent files + 2 templates  
**Files modified:** 1 (architecture_agent.md prompt)

---

### 2.2 QE Agent Expansion

**Gap:** AI Pods has 18 QE skills covering the full testing lifecycle. steer-runtime has 6 QA agents that are broader but less granular.

**Implementation:**

Add 4 new specialized agents to `.kiro-qa/`:

| New Agent | Purpose | AI Pods Equivalent |
|-----------|---------|-------------------|
| `qe_strategy_agent` | Produces test strategy document (scope, approach, risk areas, environments, entry/exit criteria) | `defining-qe-strategy` |
| `e2e_test_generator_agent` | Generates end-to-end test scenarios in Gherkin from user stories (happy paths, edge cases, negative) | `generating-e2e-test-cases` |
| `web_discovery_agent` | Analyzes running web app → discovers testable elements, page objects, interaction patterns | `discovering-web-elements` |
| `test_framework_agent` | Generates test automation scaffolding (Playwright/Cypress/Selenium) based on tech stack | `qe-framework-setup` |

Files to create:

```
.kiro-qa/
├── agents/
│   ├── qe_strategy_agent.json
│   ├── e2e_test_generator_agent.json
│   ├── web_discovery_agent.json
│   └── test_framework_agent.json
├── prompts/
│   ├── qe_strategy_agent.md
│   ├── e2e_test_generator_agent.md
│   ├── web_discovery_agent.md
│   └── test_framework_agent.md
```

Update `qa_orchestrator_agent.md` to delegate:
- "Create test strategy" → `qe_strategy_agent`
- "Generate E2E scenarios" → `e2e_test_generator_agent`
- "Discover page elements" → `web_discovery_agent`
- "Set up test framework" → `test_framework_agent`

**Effort:** 2 weeks  
**Files created:** 8 agent files  
**Files modified:** 1 (qa_orchestrator_agent.md)

---

### 2.3 Agent Quality Evaluation Framework

**Gap:** AI Pods uses DeepEval to measure skill output quality. steer-runtime has `run-flow.sh` for integration testing but no framework to evaluate whether agents produce good results.

**Implementation:**

#### 2.3.1 Evaluation Harness

Extend the existing `tests/` infrastructure:

```
tests/
├── evals/
│   ├── run-eval.sh              # Evaluation runner
│   ├── fixtures/                # Known inputs per agent
│   │   ├── ba-epic-input.md     # Sample epic for BA agents
│   │   ├── qa-stories-input.md  # Sample stories for QA agents
│   │   └── arch-codebase.md     # Sample codebase context for arch agents
│   ├── expected/                # Expected output patterns (not exact match)
│   │   ├── prd-expected.md      # Required sections, min length, key terms
│   │   ├── backlog-expected.md
│   │   └── test-plan-expected.md
│   ├── rubrics/                 # Scoring rubrics per agent type
│   │   ├── prd-rubric.md        # Completeness, accuracy, format, consistency
│   │   ├── backlog-rubric.md
│   │   ├── test-plan-rubric.md
│   │   └── adr-rubric.md
│   └── results/                 # Timestamped evaluation results
│       └── .gitkeep
```

#### 2.3.2 Evaluation Dimensions

Each rubric scores on 4 dimensions (0–10 each):

| Dimension | What It Measures |
|-----------|-----------------|
| Completeness | All required sections present, no gaps |
| Accuracy | Technical details correct, references valid |
| Format | Follows template structure, proper markdown |
| Consistency | Repeated runs produce similar quality |

#### 2.3.3 Evaluation Runner

`tests/evals/run-eval.sh` behavior:
1. Takes agent name + fixture as input
2. Runs agent via `kiro-cli chat --agent <agent> < fixture`
3. Captures output
4. Validates output against expected patterns (section headers, key terms, min length)
5. Scores against rubric (automated checks + optional LLM-as-judge)
6. Saves timestamped results to `tests/evals/results/`
7. Fails CI if score < configurable threshold

Integration with `setup.sh`:
```bash
./setup.sh eval run ba          # Evaluate all BA agents
./setup.sh eval run qa          # Evaluate all QA agents
./setup.sh eval report          # Show latest scores
```

**Effort:** 2 weeks  
**Files created:** ~15 files (runner, fixtures, rubrics, expected patterns)  
**Files modified:** `setup.sh` (add eval commands)

---

### 2.4 Schema Validation for Agent Configs

**Gap:** AI Pods validates capability and skill definitions against JSON schemas. steer-runtime agent JSON files are not schema-validated — errors are caught at runtime.

**Implementation:**

```
common/
└── schemas/
    ├── agent.schema.json        # Validates agent JSON configs
    ├── workflow.schema.json     # Validates workflow YAML definitions
    ├── workspace.schema.json   # Validates workspace.json manifests
    └── validate.sh             # Validation script
```

Agent schema enforces:
- Required fields: `name`, `description`, `prompt`
- `tools` must be array of strings
- `resources` must reference existing file patterns
- `prompt` must reference an existing `.md` file in the profile's `prompts/` dir
- `allowedTools` subset of `tools`

Integration:
```bash
./setup.sh validate              # Validate all agent configs + workflows
./setup.sh validate dev-core     # Validate specific profile
```

Add to CI (GitHub Actions) to catch malformed configs before merge.

**Effort:** 3 days  
**Files created:** 4 files (3 schemas + validation script)  
**Files modified:** `setup.sh`, CI workflow

---

## Phase 3 — Economics & Portability (Weeks 7–9)

> Goal: Token tracking, cost estimation, and project abstraction

### 3.1 Token Usage Tracking

**Gap:** AI Pods has a VTU estimation model and token economics framework. steer-runtime has no visibility into token consumption.

**Implementation:**

#### 3.1.1 Token Logger

A hook that captures token usage after each agent invocation.

| File | Purpose |
|------|---------|
| `.kiro/hooks/token-logger.sh` | Post-response hook: parse token counts from LLM response metadata |
| `common/token-tracking/session-log.jsonl` | Append-only log of token usage per invocation |

Log entry format:
```json
{
  "timestamp": "2026-03-25T18:30:00Z",
  "agent": "prd_generator_agent",
  "profile": "ba",
  "workflow": "product-definition",
  "input_tokens": 4200,
  "output_tokens": 3800,
  "model": "claude-sonnet-4-20250514",
  "duration_seconds": 45
}
```

#### 3.1.2 Cost Estimation

```
common/
└── token-tracking/
    ├── pricing.yaml             # Model pricing table ($/1K tokens)
    ├── estimate.sh              # Estimate cost for a workflow before running
    └── report.sh                # Generate usage report from session logs
```

`pricing.yaml`:
```yaml
models:
  claude-sonnet-4-20250514:
    input_per_1k: 0.003
    output_per_1k: 0.015
  gpt-4o:
    input_per_1k: 0.005
    output_per_1k: 0.015
```

Commands:
```bash
./setup.sh tokens report                    # Show usage summary (last 7 days)
./setup.sh tokens report --since 2026-03-01 # Custom date range
./setup.sh tokens estimate product-definition  # Estimate cost before running
```

Report output:
```
Token Usage Report (2026-03-18 → 2026-03-25)
─────────────────────────────────────────────
Profile    │ Invocations │ Input Tokens │ Output Tokens │ Est. Cost
───────────┼─────────────┼──────────────┼───────────────┼──────────
ba         │          34 │      142,000 │       98,000  │   $1.90
dev-core   │         156 │      890,000 │      620,000  │  $12.65
qa         │          48 │      210,000 │      180,000  │   $3.33
ops        │          12 │       45,000 │       32,000  │   $0.62
pm         │          22 │       88,000 │       64,000  │   $1.22
───────────┼─────────────┼──────────────┼───────────────┼──────────
TOTAL      │         272 │    1,375,000 │      994,000  │  $19.72
```

**Effort:** 1–2 weeks  
**Files created:** ~5 files (hook, pricing, estimate script, report script, README)  
**Files modified:** `setup.sh` (add tokens commands)

---

### 3.2 Project Abstraction Layer

**Gap:** AI Pods is organization-agnostic by design. steer-runtime is built for Disney Payments — project-specific references are hardcoded in prompts and context files.

**Implementation:**

#### 3.2.1 Audit & Extract

Audit all 41 agents for project-specific references and extract them into configuration:

| Current (hardcoded) | Target (configurable) |
|---------------------|----------------------|
| "Disney Payments" in prompts | `{PROJECT_NAME}` variable from memory bank |
| DPAY-* Jira prefixes | `{JIRA_PREFIX}` from `project_mappings.md` |
| `github.disney.com` URLs | `{GITHUB_HOST}` from workspace config |
| Java/Spring/Angular stack assumptions | Tech stack from `tech-context.md` memory bank |
| Specific repo names (dpay-*, config-studio-*) | `{REPO_PATTERN}` from workspace config |

#### 3.2.2 Engagement Templates

Pre-built workspace configurations for common project types:

```
workspaces/
├── templates/
│   ├── greenfield-api/
│   │   ├── workspace.json
│   │   └── memory-bank/
│   │       ├── tech-context.md
│   │       ├── system-patterns.md
│   │       └── project-brief.md
│   ├── legacy-modernization/
│   │   ├── workspace.json
│   │   └── memory-bank/
│   ├── mobile-app/
│   │   ├── workspace.json
│   │   └── memory-bank/
│   └── data-pipeline/
│       ├── workspace.json
│       └── memory-bank/
```

Usage:
```bash
./setup.sh workspace init greenfield-api    # Create workspace from template
# Edit workspace.json with project-specific values
./setup.sh workspace apply my-project       # Deploy configured workspace
```

#### 3.2.3 Variable Resolution in Prompts

Update `setup.sh install` to resolve `{VARIABLE}` placeholders in prompts during deployment:

1. Read variables from `workspace.json` + memory bank files
2. Replace `{PROJECT_NAME}`, `{JIRA_PREFIX}`, `{GITHUB_HOST}`, etc. in prompt files
3. Deploy resolved prompts to `~/.kiro/`

This keeps source prompts generic while deployed prompts are project-specific.

**Effort:** 2–3 weeks  
**Files created:** ~16 files (4 workspace templates × 4 files each)  
**Files modified:** All 41 agent prompts (variable extraction), `setup.sh` (variable resolution)

---

## Summary

### Timeline

```
Week 1–2   ┃ Phase 1a: Artifact templates + PRD/Backlog/Test agents
Week 2–3   ┃ Phase 1b: Quality gates + Workflow definitions + Runner
Week 4     ┃ Phase 2a: Architecture agent expansion (3 new agents)
Week 4–5   ┃ Phase 2b: QE agent expansion (4 new agents)
Week 5–6   ┃ Phase 2c: Evaluation framework + Schema validation
Week 7–8   ┃ Phase 3a: Token tracking + Cost estimation
Week 8–9   ┃ Phase 3b: Project abstraction + Engagement templates
```

### Impact Summary

| Metric | Before (v3.5.0) | After (v4.0.0) |
|--------|:---:|:---:|
| Artifact generation | Ad-hoc conversational | Structured pipeline with templates |
| Quality assurance | No gates | Formal approve/reject/revise gates |
| Workflow model | Dynamic only | Dynamic + declarative (choose per task) |
| Architecture agents | 1 broad agent | 4 specialized agents |
| QA agents | 6 agents | 10 agents (full testing lifecycle) |
| Agent quality | Manual testing only | Automated evaluation with scoring |
| Config validation | Runtime errors | Schema validation in CI |
| Token visibility | None | Per-agent, per-workflow, per-team tracking |
| Project portability | Disney Payments only | Template-based, any project |
| Total agents | 41 | 52 |

### New File Count by Phase

| Phase | New Files | Modified Files |
|-------|:---------:|:--------------:|
| Phase 1 | ~28 | ~4 |
| Phase 2 | ~29 | ~4 |
| Phase 3 | ~21 | ~42 |
| **Total** | **~78** | **~50** |

### What We're NOT Doing

These AI Pods features were evaluated but deprioritized:

| Feature | Reason |
|---------|--------|
| Custom orchestrator (Stepwise-like) | steer-runtime's IDE-native approach is a strength — adding a custom CLI would duplicate effort |
| Desktop GUI (Kite-style) | Kite already exists in the ecosystem; focus on agent quality instead |
| Commercial/VTU estimation model | Organization-specific; token tracking provides the raw data if needed later |
| Skill registry (npm-based) | Git-based fork strategy is simpler and already working |
| GEAI platform integration | steer-runtime uses IDE-native LLMs; adding GEAI dependency would reduce portability |

---

## References

| Document | Path |
|----------|------|
| AI Pods vs steer-runtime Comparative | `aipods-understanding/COMPARATIVE-AIPODS-VS-STEER.md` |
| AI Pods Full Analysis | `aipods-understanding/AI-PODS-ANALYSIS.md` |
| Feature Opportunities | `aipods-understanding/FEATURE-OPPORTUNITIES.md` |
| AI Pods Enrichment Proposal | `aipods-understanding/AI-PODS-ENRICHMENT-PROPOSAL.md` |
| steer-runtime Architecture | `docs/ARCHITECTURE.md` |
| steer-runtime Hooks & Powers | `docs/HOOKS_AND_POWERS.md` |
| steer-runtime Team Workspaces | `docs/TEAM_WORKSPACES.md` |

---

## Phase 4 — Waifinder-Inspired Features (Weeks 10–12)

> Goal: Close gaps identified from dxt-waifinder comparative analysis  
> Source: waifinder comparative (2026-03-26)  
> Items 6 (auto-update), 7 (drift detection), 9 (doctor) deferred to Koda CLI  
> Item 2 (GitHub Copilot) out of scope

### 4.1 Reusable Skills / Prompt Library

**Gap:** waifinder has 23 detailed multi-step skills (`implement-ticket`, `ship-it`, `generate-plan`, etc.) invokable as commands. steer-runtime's `common/prompts/` only has 2 entries.

**Implementation:**

```
common/skills/
├── README.md
├── implement-ticket.md          # Jira story → branch → implement → tests → PR
├── ship-it.md                   # Commit → push → PR → merge flow
├── generate-plan.md             # Break down complex task into implementation plan
├── fix-failing-test.md          # Diagnose and fix a failing test
├── review-changed-code.md       # Review staged/committed changes
├── generate-base-specifications.md  # Bootstrap project spec documents
├── generate-spec-document.md    # Generate a single spec from template
└── examine-test-coverage.md     # Analyze coverage for recent changes
```

Each skill is a standalone markdown prompt usable across IDEs (Kiro CLI `@prompt`, Cursor `/skill`, Amazon Q rules).

**Effort:** 1 week

### 4.2 Spec-Driven Development

**Gap:** waifinder has spec templates (architecture, API contracts, domain models, business rules, workflows, data dictionaries) and generation skills. steer-runtime has no equivalent.

**Implementation:**

```
common/templates/specs/
├── README.md
├── architecture.md.template
├── api-contracts.md.template
├── domain-model.md.template
├── business-rules.md.template
├── workflows.md.template
├── data-dictionary.md.template
└── coding-standards.md.template
```

Skills `generate-base-specifications` and `generate-spec-document` use these templates.

**Effort:** 3 days

### 4.3 Structured Project Manifest

**Gap:** waifinder's `00-main.md` YAML frontmatter provides machine-readable project config (stack, branch, commands, integrations). steer-runtime memory banks are freeform markdown.

**Implementation:**

Add `common/templates/project.yaml` as a structured manifest that complements memory banks:

```yaml
name: ""
stack: ""
baseBranch: main
commands:
  build: ""
  test: ""
  lint: ""
integrations:
  jira:
    projectKey: ""
  github:
    org: ""
    repo: ""
workspace:
  specsDir: docs/specs/
  useSpecs: false
```

Agents can parse this for build commands, branch names, and Jira prefix instead of guessing from freeform text.

**Effort:** 2 days

### 4.4 Expanded Tech Stack Rules

**Gap:** waifinder covers C#, Kubernetes, Liquibase, AWS, performance optimization, API design, testing strategies. steer-runtime's `common/rules/` only has Java, Node, Angular, Go.

**Implementation:**

```
common/rules/
├── general-csharp-development.md
├── general-kubernetes.md
├── general-aws.md
├── general-sql-database.md
├── general-api-design.md
├── general-testing-strategies.md
└── general-performance-optimization.md
```

**Effort:** 3 days
