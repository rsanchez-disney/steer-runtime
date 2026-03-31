# DRIFT
## Dimensions of Risk, Implementation, and Feature Tokens

**Version:** 1.0  
**Status:** Agent-Ready Specification  
**Purpose:** Defines the mathematical model, input protocol, and output schema for a Kiro agent that estimates software features in both story points and expected LLM token consumption.

> **DRIFT** — *Dimensions of Risk, Implementation, and Feature Tokens*  
> A unified estimation framework that fuses classical DRIFT risk theory with LLM-native token economics, producing story point estimates and token cost projections from a single 7-dimension scoring pass.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Name and Acronym](#2-name-and-acronym)
3. [Conceptual Framework](#3-conceptual-framework)
4. [Dimension Definitions](#4-dimension-definitions)
   - 4.1 [CCV Axes (Risk)](#41-ccv-axes-risk)
   - 4.2 [LLM Axes (Token Drivers)](#42-llm-axes-token-drivers)
5. [The Math Model](#5-the-math-model)
   - 5.1 [Derived Factor: Ambiguity (A)](#51-derived-factor-ambiguity-a)
   - 5.2 [Phase Formulas](#52-phase-formulas)
   - 5.3 [Unified Formula](#53-unified-formula)
   - 5.4 [Story Points Bridge](#54-story-points-bridge)
   - 5.5 [Cost Projection](#55-cost-projection)
6. [Scoring Rubrics](#6-scoring-rubrics)
7. [Worked Examples](#7-worked-examples)
8. [Agent Interaction Protocol](#8-agent-interaction-protocol)
   - 8.1 [Input Elicitation](#81-input-elicitation)
   - 8.2 [Output Schema](#82-output-schema)
   - 8.3 [Estimation Dialogue Flow](#83-estimation-dialogue-flow)
9. [Sprint Planning Mode](#9-sprint-planning-mode)
10. [Calibration and Tuning](#10-calibration-and-tuning)
11. [Glossary](#11-glossary)

---

## 1. Overview

Traditional story point estimation captures **human cognitive effort**. It does not capture the cost of AI-assisted development, where the real unit of work is **tokens flowing through an LLM** — for spec reasoning, context ingestion, code generation, review iteration, and test production.

**DRIFT** unifies both views into a single estimation pass:

- **CCV (Complexity, Completeness, Volatility)** provides the risk signal, inherited from classical risk estimation theory.
- **LLM Dimensions (Context, Output, Reasoning Depth, Tool Calls)** capture the mechanical token cost of executing the feature with AI assistance.
- **Story Points** are retained as a human-facing output, derived from the same dimensional inputs, ensuring teams do not need to maintain two parallel estimation systems.

The result is a single DRIFT estimation that produces:
1. A **story point estimate** (Fibonacci-aligned, with confidence band)
2. A **token estimate** per phase and total
3. An **expected cost** given a target LLM pricing model
4. A **DRIFT risk score** (0–100) for sprint risk management

---

## 2. Name and Acronym

**DRIFT** stands for:

| Letter | Word | Role in the model |
|--------|------|-------------------|
| **D** | Dimensions | The 7-axis scoring space (3 CCV + 4 LLM) that drives all outputs |
| **R** | Risk | The CCV triad (Complexity, Completeness, Volatility) — the risk signal |
| **I** | Implementation | The LLM execution surface (Context, Output, Reasoning, Tools) |
| **F** | Feature | The unit of estimation — a discrete deliverable with AC and scope |
| **T** | Tokens | The primary output unit — expected LLM token consumption by phase |

The word *drift* is semantically intentional. In the context of software delivery, drift describes what happens when requirements are vague, scope shifts, or volatility compounds — the exact failure modes that DRIFT is designed to surface before a sprint starts. A feature that scores high on Volatility (V) is, literally, at risk of drifting.

---

## 3. Conceptual Framework

```
┌─────────────────────────────────────────────────────────┐
│                    FEATURE INPUT                        │
│         (title, description, acceptance criteria)       │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   DRIFT · 7 DIMS    │
          │                     │
          │  CCV (Risk):        │
          │   Cx  Complexity    │
          │   Cp  Completeness  │
          │   V   Volatility    │
          │                     │
          │  LLM (Impl):        │
          │   C   Context Lines │
          │   O   Output Lines  │
          │   Rd  Reasoning     │
          │   Tc  Tool Calls    │
          └──────────┬──────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    STORY POINTS   TOKENS    CCV RISK
    (Fibonacci)  (by phase)  (0–100)
         │           │           │
         └───────────┴───────────┘
                     │
              SPRINT BUDGET
              PROJECTION
```

The key architectural insight is that **Completeness (Cp) is not a separate output** — it becomes the **Ambiguity Factor (A)** that modulates all uncertainty-sensitive phases. A well-specified feature deflates token cost; a vague one inflates it.

---

## 4. Dimension Definitions

### 4.1 CCV Axes (Risk)

#### Cx — Complexity

Measures the structural and cognitive scope of the feature. How many architectural layers, services, or conceptual abstractions must be reasoned about.

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Trivial | Single function/method. No cross-service impact. Known pattern. |
| 2 | Simple | Single module or small component. Clear implementation path. |
| 3 | Moderate | Multiple modules. Some cross-service coordination. Design decisions required. |
| 4 | Complex | Multi-service. Schema changes, API contracts, or infrastructure impact. |
| 5 | Cross-cutting | Platform-level. Affects shared libraries, security, data models, or CI/CD. |

**Token role:** Drives `T_spec`. High Cx requires deeper system-level prompting, schema negotiation, and architecture reasoning before any code is generated.

---

#### Cp — Completeness

Measures how well-defined the requirements, acceptance criteria, and edge cases are at estimation time.

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Vague | Idea-level. No acceptance criteria. Significant discovery required. |
| 2 | Partial | Direction known, but key decisions unresolved. AC incomplete. |
| 3 | Defined | Core AC written. Edge cases partially covered. Some ambiguity remains. |
| 4 | Detailed | Full AC. Edge cases documented. Technical approach agreed. |
| 5 | Complete | Fully spec'd. Mock-ready. No open questions. |

**Token role:** Cp is the primary input to the Ambiguity Factor (A). It does not appear directly in phase formulas — instead it modulates T_spec and T_review, which are the phases most sensitive to under-specification. See §5.1.

---

#### V — Volatility

Measures the probability that requirements, scope, or priorities will change during or after implementation.

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Frozen | Requirements locked. Stakeholders aligned. No risk of change. |
| 2 | Stable | Minor clarifications expected. Core scope unlikely to shift. |
| 3 | Drifting | Active stakeholder discussions. Scope changes are plausible. |
| 4 | Unstable | Known open decisions upstream. Scope changes are likely. |
| 5 | Chaotic | Actively being debated. Estimates should be treated as placeholders. |

**Token role:** Drives `T_review` — volatile requirements generate rework, causing re-ingestion of context and re-generation of code. V is multiplied by A, because vague + volatile is the worst-case compound risk.

---

### 4.2 LLM Axes (Token Drivers)

#### C — Context Lines

The number of lines of existing code, documentation, schemas, or specifications the LLM must read and retain to reason about the feature. This is the **read cost**.

- Includes: files to be modified, referenced interfaces, API contracts, migration scripts
- Excludes: code that will not be read during this feature's execution
- Approximation: count lines across all files that will be opened during implementation

**Token role:** `T_context = C × 0.75`. Context ingestion is deterministic — it is not affected by ambiguity. 0.75 tokens/line is a conservative average for mixed code/comment density.

---

#### O — Output Lines

The estimated number of lines that will be **generated or materially modified** by the LLM. This is the **write cost**.

- Includes: new files, modified functions, generated tests, updated configs
- Excludes: lines read but not changed (those belong to C)
- Approximation: sum of net-new lines and substantially-rewritten lines

**Token role:** O appears in `T_impl`, `T_review`, and `T_tests`. It is the most broadly impactful parameter — a large O amplifies the cost of high V and high Rd simultaneously.

---

#### Rd — Reasoning Depth

Measures the planning and chain-of-thought overhead required before the LLM begins producing output. Features that require architectural decisions, multi-step decomposition, or careful dependency analysis score higher.

| Score | Label | Description |
|-------|-------|-------------|
| 1 | Direct | No planning needed. Pattern is established. Write immediately. |
| 2 | Shallow | Brief analysis. Approach is clear. Minimal CoT. |
| 3 | Standard | Multi-step reasoning. Approach selection needed. |
| 4 | Deep | Architecture decision required. Tradeoff analysis. Decomposition planning. |
| 5 | Extended CoT | Full agent planning loop. Multi-subtask decomposition. Research phase likely. |

**Token role:** Adds `Rd × 3` tokens per output line on top of the 12-token base. At Rd=5, each line costs 27 tokens to generate versus 12 at Rd=1 — a 2.25× multiplier on impl cost.

---

#### Tc — Tool Calls

The expected number of external tool invocations during agentic execution. Includes MCP calls, file reads/writes, shell executions, API lookups, and search queries.

- Each tool call incurs overhead: the structured invocation prompt + result ingestion
- Conservative estimate: 150 tokens per call (higher for verbose MCP responses)
- For Kiro-style agents: include steering reads, hook triggers, and spec file lookups

**Token role:** `T_tools = Tc × 150`. Tool call cost is additive and deterministic — it is independent of A and V since tool calls happen regardless of spec quality.

---

## 5. The Math Model

### 5.1 Derived Factor: Ambiguity (A)

Ambiguity is not scored directly. It is derived from Completeness (Cp) as an inverse relationship:

```
A = 1 + (5 − Cp) × 0.375
```

| Cp | A | Interpretation |
|----|---|----------------|
| 5 (Complete) | 1.000 | No inflation. Full spec. |
| 4 (Detailed) | 1.375 | Minimal inflation. Minor open questions. |
| 3 (Defined) | 1.750 | Moderate inflation. Some discovery expected. |
| 2 (Partial) | 2.125 | High inflation. Significant ambiguity. |
| 1 (Vague) | 2.500 | Maximum inflation. Exploratory work. |

**Design rationale:** A wraps only the phases that are sensitive to under-specification (Spec and Review). Context ingestion and Tool Calls are mechanically deterministic — they do not change because requirements are vague.

---

### 5.2 Phase Formulas

The total token cost is computed across six phases:

#### Phase 1: Spec & Design

```
T_spec = Cx × 800 × A
```

Captures the cost of prompting the LLM to understand requirements, reason about architecture, and produce a plan. Scales with structural complexity (Cx) and inflates with ambiguity (A) because vague features require more exploratory design dialogue.

---

#### Phase 2: Context Ingestion

```
T_context = C × 0.75
```

The read cost of loading existing code and documentation into the LLM's working context. Purely mechanical — a line of code costs ~0.75 tokens to tokenize regardless of how well-defined the feature is.

---

#### Phase 3: Implementation

```
T_impl = O × (12 + Rd × 3)
```

The generative cost of producing code. The base rate of 12 tokens/line reflects a balanced mix of reasoning and output. Reasoning Depth (Rd) adds 3 tokens/line per unit — deep architectural work requires proportionally more thought per line generated.

---

#### Phase 4: Review & Iteration

```
T_review = O × 4.8 × V × A
```

The rework cost. Volatile requirements (V) cause partial or full regeneration of code, which costs proportional to the output surface (O). Ambiguity (A) is multiplied here because unclear specs compound volatility — when both are high, review cycles are both more frequent and more expensive per cycle.

---

#### Phase 5: Tests & Docs

```
T_tests = O × 6
```

Test generation is lighter than implementation — 6 tokens/line on average — because tests follow predictable structural patterns (arrange/act/assert) that require less reasoning overhead than production code.

---

#### Phase 6: Tool Calls

```
T_tools = Tc × 150
```

Agentic overhead from MCP invocations, file system reads, shell commands, and API calls. Each adds approximately 150 tokens of structured overhead (prompt framing + result parsing).

---

### 5.3 Unified Formula

Combining all phases:

```
T_total = T_spec + T_context + T_impl + T_review + T_tests + T_tools

T_total = (Cx × 800 × A)
        + (C × 0.75)
        + (O × (12 + Rd × 3))
        + (O × 4.8 × V × A)
        + (O × 6)
        + (Tc × 150)
```

Factoring the O-dependent terms:

```
T_total = 800·Cx·A  +  0.75·C  +  O·(18 + 3·Rd + 4.8·V·A)  +  150·Tc
```

Where `A = 1 + (5 − Cp) × 0.375`.

**Token distribution (approximate):**
- Input tokens: 62% of T_total (context, prompts, tool results)
- Output tokens: 38% of T_total (generated code, responses)

---

### 5.4 Story Points Bridge

Story points are derived from the same dimensional inputs, bypassing the token formula and using a separate mapping that captures human effort rather than machine cost.

#### SP Score (raw)

```
SP_raw = (Cx × 2.0) + ((5 − Cp) × 1.5) + (V × 1.0) + (O / 80) + (C / 500)
```

The weights reflect effort contribution:
- Complexity (Cx) is the dominant driver (×2.0)
- Incompleteness penalizes directly (×1.5 on the inverse of Cp)
- Volatility adds delivery risk to estimation (×1.0)
- Output and Context add proportional implementation burden

#### Fibonacci Mapping

| SP_raw | Story Points | Label |
|--------|-------------|-------|
| < 2.0 | 1 | Trivial |
| 2.0 – 3.5 | 2 | XS |
| 3.5 – 5.5 | 3 | Small |
| 5.5 – 8.0 | 5 | Medium |
| 8.0 – 11.0 | 8 | Large |
| 11.0 – 15.0 | 13 | XL |
| > 15.0 | 21 | Epic (split recommended) |

#### Confidence Band

The confidence of the SP estimate is inversely proportional to Ambiguity:

```
SP_low  = SP × (1 / A)
SP_high = SP × A
```

Example: SP=5, A=1.75 → band is [2.9, 8.75], reported as "3–8 points".

---

### 5.5 Cost Projection

Given a selected LLM pricing model with `price_in` (per 1M input tokens) and `price_out` (per 1M output tokens):

```
Cost = (T_total × 0.62 / 1,000,000) × price_in
     + (T_total × 0.38 / 1,000,000) × price_out
```

**Reference pricing (USD per 1M tokens, March 2026):**

| Model | Input | Output |
|-------|-------|--------|
| Claude Opus 4 | $15.00 | $75.00 |
| Claude Sonnet 4 | $3.00 | $15.00 |
| Claude Haiku 4 | $0.80 | $4.00 |
| GPT-4o | $2.50 | $10.00 |
| GPT-4o Mini | $0.15 | $0.60 |

> **Note for agent:** Always confirm pricing with the user before sprint-level projections. Model prices change frequently.

---

## 6. Scoring Rubrics

These rubrics are designed for agent use during elicitation. For each dimension, the agent should ask questions that map answers to numeric scores.

### Cx — Complexity Elicitation

Ask: *"How many services, modules, or architectural layers does this feature touch?"*

| Answer | Cx |
|--------|----|
| One function or method, no external deps | 1 |
| One module, no new contracts | 2 |
| 2–3 modules, one API contract change | 3 |
| Cross-service, schema or infra impact | 4 |
| Shared library, auth, CI/CD, or data model | 5 |

---

### Cp — Completeness Elicitation

Ask: *"Do you have written acceptance criteria? Are edge cases documented?"*

| Answer | Cp |
|--------|----|
| No AC, no edge cases, idea-level only | 1 |
| Rough direction, no AC written | 2 |
| AC exists but incomplete, gaps present | 3 |
| Full AC, most edge cases covered | 4 |
| Complete spec, all edge cases, approach agreed | 5 |

---

### V — Volatility Elicitation

Ask: *"How confident are you that requirements won't change before delivery?"*

| Answer | V |
|--------|---|
| Requirements locked, stakeholders signed off | 1 |
| Stable, minor wording tweaks expected | 2 |
| Possible scope change, ongoing discussions | 3 |
| Scope shift is likely, key decisions open | 4 |
| Requirements actively changing, do not commit | 5 |

---

### C — Context Lines Elicitation

Ask: *"Which files will the LLM need to read to implement this? Roughly how many lines total?"*

Heuristics for estimation when lines are unknown:

| Scenario | C estimate |
|----------|------------|
| Single small service file | 100–300 |
| One service + interface + tests | 300–700 |
| Multiple services + shared modules | 700–2000 |
| Full subsystem refactor | 2000–5000 |
| Platform-wide change | 5000+ |

---

### O — Output Lines Elicitation

Ask: *"How many lines of code do you expect to be written or substantially changed?"*

Heuristics:

| Scenario | O estimate |
|----------|------------|
| Bug fix or config change | 20–50 |
| New small endpoint | 50–150 |
| New feature with tests | 150–400 |
| New service or major refactor | 400–1000 |
| New subsystem | 1000+ |

---

### Rd — Reasoning Depth Elicitation

Ask: *"Does the implementation path require architectural decisions or just execution?"*

| Answer | Rd |
|--------|-----|
| Pattern is established, just write it | 1 |
| Minor approach selection needed | 2 |
| Design decision required, alternatives exist | 3 |
| Architecture-level decision, tradeoffs to analyze | 4 |
| Multi-agent planning, research loop, novel approach | 5 |

---

### Tc — Tool Calls Elicitation

Ask: *"How many external tool actions will the agent need? File reads, API calls, shell commands?"*

Heuristics for Kiro-based agents:

| Scenario | Tc estimate |
|----------|------------|
| Single-file edit, no lookups | 2–5 |
| Multi-file edit with spec reads | 5–12 |
| Service with integration tests | 10–20 |
| Cross-service with migrations | 20–35 |
| Platform-level with CI validation | 35+ |

---

## 7. Worked Examples

### Example A: Simple Bug Fix

**Feature:** Fix null pointer exception when payment method is missing in checkout flow.

**Scoring:**

| Dim | Score | Rationale |
|-----|-------|-----------|
| Cx | 2 | Single service, known failure point, no contract changes |
| Cp | 4 | Repro steps documented, fix direction clear, minor edge cases |
| V | 1 | Bug with reproduction — requirements cannot change |
| C | 150 | ~150 lines across checkout service and PaymentClient |
| O | 30 | Null check + test case |
| Rd | 1 | Pattern is defensive null check, no decision required |
| Tc | 4 | Read 2 files, write 2 files |

**Computed:**

```
A         = 1 + (5 − 4) × 0.375 = 1.375

T_spec    = 2 × 800 × 1.375       =  2,200
T_context = 150 × 0.75            =    113
T_impl    = 30 × (12 + 1 × 3)     =    450
T_review  = 30 × 4.8 × 1 × 1.375 =    198
T_tests   = 30 × 6                =    180
T_tools   = 4 × 150               =    600

T_total   = 3,741 tokens
```

**Story Points:**

```
SP_raw = (2 × 2.0) + ((5−4) × 1.5) + (1 × 1.0) + (30/80) + (150/500)
       = 4.0 + 1.5 + 1.0 + 0.375 + 0.3
       = 7.175
```

→ **Story Points: 5** (band: 3–7, A=1.375)

**Cost (Sonnet 4):** ≈ $0.025

---

### Example B: New Payment Method Integration

**Feature:** Add Apple Pay as a checkout option across web and mobile, including webhook handling for dispute events.

**Scoring:**

| Dim | Score | Rationale |
|-----|-------|-----------|
| Cx | 4 | Cross-service: payment-api, payment-client, checkout-ui, webhook handler |
| Cp | 3 | AC written for happy path, dispute edge cases partially documented |
| V | 3 | Apple Pay SDK version under review, UX design not finalized |
| C | 1200 | 4 services × ~300 lines each |
| O | 450 | New integration layer, handler, tests, config |
| Rd | 3 | Architecture decision on webhook retry strategy |
| Tc | 18 | Multi-file edits, schema migrations, CI checks |

**Computed:**

```
A         = 1 + (5 − 3) × 0.375 = 1.75

T_spec    = 4 × 800 × 1.75        =  5,600
T_context = 1200 × 0.75           =    900
T_impl    = 450 × (12 + 3 × 3)    =  9,450
T_review  = 450 × 4.8 × 3 × 1.75 = 11,340
T_tests   = 450 × 6               =  2,700
T_tools   = 18 × 150              =  2,700

T_total   = 32,690 tokens
```

**Story Points:**

```
SP_raw = (4 × 2.0) + ((5−3) × 1.5) + (3 × 1.0) + (450/80) + (1200/500)
       = 8.0 + 3.0 + 3.0 + 5.625 + 2.4
       = 22.025
```

→ **Story Points: 21** (Epic — recommend splitting)  
**Band:** 12–37 (A=1.75, high uncertainty)

**Cost (Sonnet 4):** ≈ $0.22  
**Cost (Opus 4):** ≈ $1.08

---

### Example C: Exploratory R&D Spike

**Feature:** Investigate feasibility of replacing rule-based fraud scoring with an ML inference endpoint, produce a technical decision record.

**Scoring:**

| Dim | Score | Rationale |
|-----|-------|-----------|
| Cx | 5 | Platform-level. Touches fraud-service, data pipeline, model registry |
| Cp | 1 | Open-ended exploration. No AC — success criterion is a decision |
| V | 4 | Outcome-dependent. Scope changes based on findings |
| C | 2500 | Fraud service internals, existing scoring logic, data schemas |
| O | 100 | Decision record + prototype stub (not full implementation) |
| Rd | 5 | Full research planning loop, multi-option analysis |
| Tc | 25 | Schema reads, doc fetches, prototype runs |

**Computed:**

```
A         = 1 + (5 − 1) × 0.375 = 2.5

T_spec    = 5 × 800 × 2.5        = 10,000
T_context = 2500 × 0.75          =  1,875
T_impl    = 100 × (12 + 5 × 3)   =  2,700
T_review  = 100 × 4.8 × 4 × 2.5 =  4,800
T_tests   = 100 × 6              =    600
T_tools   = 25 × 150             =  3,750

T_total   = 23,725 tokens
```

**Story Points:**

```
SP_raw = (5 × 2.0) + ((5−1) × 1.5) + (4 × 1.0) + (100/80) + (2500/500)
       = 10.0 + 6.0 + 4.0 + 1.25 + 5.0
       = 26.25
```

→ **Story Points: 21** (Epic — time-boxed spike recommended)  
**Band:** 8–52 (A=2.5 — extreme uncertainty, do not use as a delivery commitment)

**Cost (Sonnet 4):** ≈ $0.16  
> Note: Spikes are relatively cheap in tokens despite high story point count — the high SP reflects discovery risk, not generation volume.

---

## 8. Agent Interaction Protocol

### 8.1 Input Elicitation

The agent must collect sufficient information to score all 7 dimensions. The agent may receive input in three forms:

**Form A — Structured JSON** (programmatic invocation)

```json
{
  "feature": "Add rate limiting to the payments API",
  "dimensions": {
    "Cx": 3,
    "Cp": 4,
    "V": 2,
    "C": 400,
    "O": 120,
    "Rd": 2,
    "Tc": 8
  },
  "model": "claude-sonnet-4"
}
```

**Form B — Natural Language Feature Description**

The agent must extract dimension scores from the description using the scoring rubrics in §6. The agent should confirm inferred scores before computing.

Example prompt: *"We need to add Redis caching to the product catalog service to reduce DB load."*

Agent inference:
- Cx=2 (single service, known pattern)
- Cp=3 (goal clear, cache invalidation strategy not specified)
- V=2 (stable, infrastructure feature)
- C=300 (catalog service + cache client)
- O=80 (cache layer + tests)
- Rd=2 (cache-aside is standard)
- Tc=6 (file reads + writes)

**Form C — Interactive Dialogue**

The agent asks questions sequentially using the rubrics in §6. See §7.3 for the dialogue flow template.

---

### 8.2 Output Schema

The agent must produce output in the following structure. Format as Markdown for human-readable output or JSON when invoked programmatically.

```markdown
## DRIFT Estimation Report: [Feature Title]

### Dimension Scores
| Dimension | Score | Label | Notes |
|-----------|-------|-------|-------|
| Cx — Complexity | 3 | Moderate | Multi-module, one API change |
| Cp — Completeness | 4 | Detailed | AC written, minor gaps |
| V — Volatility | 2 | Stable | Requirements locked |
| C — Context Lines | 400 | - | catalog-service + cache client |
| O — Output Lines | 120 | - | Cache layer + integration tests |
| Rd — Reasoning Depth | 2 | Shallow | Cache-aside pattern |
| Tc — Tool Calls | 8 | - | File reads + writes + CI |

### Derived Factor
- **Ambiguity (A):** 1.375  ← A = 1 + (5 − 4) × 0.375

### Token Estimate
| Phase | Formula | Tokens |
|-------|---------|--------|
| Spec & Design | 3 × 800 × 1.375 | 3,300 |
| Context Ingestion | 400 × 0.75 | 300 |
| Implementation | 120 × (12 + 2×3) | 2,160 |
| Review & Iteration | 120 × 4.8 × 2 × 1.375 | 1,584 |
| Tests & Docs | 120 × 6 | 720 |
| Tool Calls | 8 × 150 | 1,200 |
| **TOTAL** | | **9,264** |

- Input tokens (~62%): 5,744
- Output tokens (~38%): 3,520

### Story Points
- SP_raw: 9.1
- **Story Points: 8** (Fibonacci)
- Confidence band: 5–11 (A=1.375)

### Cost Estimate
| Model | Cost |
|-------|------|
| Claude Sonnet 4 | $0.070 |
| Claude Opus 4 | $0.352 |
| Claude Haiku 4 | $0.019 |

### DRIFT Risk Score
- **Score: 38/100** — MODERATE
- Primary risk driver: Cx=3 (multi-module coordination)
- Mitigation: Confirm cache invalidation strategy before sprint start

### Recommendation
✅ Ready for sprint. Story point estimate is reliable (A < 1.5). Consider pairing with a smaller feature to balance sprint token budget.
```

---

### 8.3 Estimation Dialogue Flow

When operating in interactive mode, the agent follows this sequence:

```
1. RECEIVE feature title and/or description
2. INFER initial scores from description (if provided)
3. CONFIRM inferred scores or ELICIT missing ones:
   a. Ask about Cx if description doesn't clarify scope
   b. Ask about Cp: "Do you have written AC?"
   c. Ask about V: "How stable are the requirements?"
   d. Ask about C: "Which files will need to be read?"
   e. Ask about O: "Roughly how many lines will change?"
   f. Ask about Rd: "Is the implementation path clear?"
   g. Ask about Tc: "How many tool calls / external actions?"
4. COMPUTE all formulas
5. OUTPUT estimation report (§8.2 format)
6. OFFER: "Would you like to compare models, run a sprint simulation, or adjust any dimension?"
```

**Clarification priority:** If time is limited and only partial elicitation is possible, prioritize Cx and Cp — they have the highest impact on both SP and T_total. V and Rd are secondary. C, O, and Tc can be approximated from heuristics.

---

## 9. Sprint Planning Mode

When estimating a full sprint (multiple features), the agent should:

### 9.1 Per-Feature Summary

Produce a summary table for all features in the sprint:

```
| Feature | SP | T_total | Cost (Sonnet) | DRIFT Risk |
|---------|----|---------|---------------|----------|
| Feature A | 3 | 5,200 | $0.038 | LOW (22) |
| Feature B | 8 | 18,400 | $0.134 | MOD (48) |
| Feature C | 5 | 9,800 | $0.071 | LOW (31) |
| **TOTAL** | **16** | **33,400** | **$0.243** | |
```

### 9.2 Sprint Budget Check

```
Budget utilization = T_sprint_total / T_sprint_budget × 100%
```

If utilization > 80%: warn that token budget is near capacity.  
If utilization > 100%: block and recommend removing the highest-token feature.

### 9.3 Risk Distribution

Flag sprints where more than 30% of story points carry DRIFT risk score > 60. High-risk features should not exceed one-third of sprint capacity.

---

## 10. Calibration and Tuning

The model constants (800, 0.75, 12, 3, 4.8, 6, 150) are empirical starting values. Teams should calibrate them after 3–5 sprints by comparing estimates to actuals.

### Calibration Process

1. After each sprint, record actual token usage from LLM API logs
2. Compare to estimated T_total for each feature
3. Compute calibration factor per constant:

```
k_calibrated = k_original × (T_actual / T_estimated)
```

4. Apply a rolling 3-sprint average to smooth noise

### Constants and Their Sensitivity

| Constant | Default | Sensitivity | Notes |
|----------|---------|-------------|-------|
| Spec base (800) | 800 | High | Varies with prompt engineering quality |
| Context rate (0.75) | 0.75 | Low | Stable — code tokenization is consistent |
| Impl base (12) | 12 | High | Varies with model CoT verbosity |
| Reasoning adder (3) | 3 | Medium | Tune based on Rd=5 features |
| Volatility rate (4.8) | 4.8 | High | Tune based on observed rework in volatile sprints |
| Test rate (6) | 6 | Low | Stable — test patterns are consistent |
| Tool call overhead (150) | 150 | Medium | Tune based on MCP server response sizes |

### Kiro-Specific Calibration

For Kiro agents, `Tc` overhead may be higher than 150 tokens/call if:
- Spec files (`.kiro/specs/`) are large and fully ingested per call
- Steering rules (`.kiro/steering/`) are prepended on every invocation
- Hook outputs generate verbose confirmations

Recommended starting value for Kiro: **Tc × 200** (instead of 150) until empirical data is available.

---

## 11. Glossary

| Term | Definition |
|------|------------|
| **A** | Ambiguity Factor. Derived from Cp. Modulates uncertainty-sensitive phases. Range: 1.0–2.5. |
| **AC** | Acceptance Criteria. The defined conditions a feature must satisfy to be considered complete. |
| **ACP** | Agent Communication Protocol. The JSON-RPC 2.0 / stdio protocol used by Kiro CLI. |
| **C** (dimension) | Context Lines. Lines of existing code the LLM must ingest to reason about the feature. |
| **CCV** | Complexity, Completeness, Volatility. The three-axis risk foundation that DRIFT extends. |
| **Cp** | Completeness. CCV axis measuring how well-specified a feature is. Inverse of ambiguity. |
| **Cx** | Complexity. CCV axis measuring structural and cognitive scope of a feature. |
| **CoT** | Chain of Thought. LLM reasoning pattern where intermediate steps are generated before the answer. |
| **Context Window** | The maximum number of tokens an LLM can process in a single inference call. |
| **DRIFT** | Dimensions of Risk, Implementation, and Feature Tokens. The unified estimation framework defined in this document. |
| **DRIFT Risk Score** | Composite CCV risk score (0–100) produced by a DRIFT estimation. Weighted: Cx 35%, Cp-inverse 35%, V 30%. |
| **Fibonacci Scale** | Estimation scale (1, 2, 3, 5, 8, 13, 21) used in agile story point estimation. Reflects growing uncertainty at higher values. |
| **Input Tokens** | Tokens sent to the LLM (prompts, context, tool results, system instructions). Billed at lower rates. |
| **Kiro** | Tauri 2.0 desktop application wrapping Kiro CLI as a sidecar via ACP. |
| **Kiro CLI** | The command-line LLM agent engine that Kiro wraps. Uses `.kiro/` directory for specs, steering, and hooks. |
| **MCP** | Model Context Protocol. Standard for exposing tools and context to LLMs. Tool calls via MCP contribute to Tc. |
| **O** | Output Lines. Lines of code generated or materially modified by the LLM during feature implementation. |
| **Output Tokens** | Tokens generated by the LLM (code, responses, plans). Billed at higher rates than input. |
| **Rd** | Reasoning Depth. LLM dimension measuring planning and CoT overhead per feature. |
| **SP** | Story Points. Abstract unit of effort estimate, typically on Fibonacci scale. |
| **SP_raw** | Continuous story point score before Fibonacci rounding. |
| **Sprint** | A fixed time-box (typically 2 weeks) containing a planned set of features. |
| **T_context** | Token cost of context ingestion phase. |
| **T_impl** | Token cost of implementation generation phase. |
| **T_review** | Token cost of review and rework iteration phase. |
| **T_spec** | Token cost of spec and design reasoning phase. |
| **T_tests** | Token cost of test and documentation generation phase. |
| **T_tools** | Token cost of agentic tool call overhead. |
| **T_total** | Sum of all phase token costs for a feature. |
| **Tc** | Tool Calls. Count of external tool invocations during agentic execution. |
| **Token** | Atomic unit of LLM processing. Approximately 0.75 words in English; ~0.75 lines in code per token inverse (i.e., ~0.75 tokens per character of code on average). |
| **V** | Volatility. CCV axis measuring probability of requirement change during delivery. |

---

*End of specification. This document is intended for direct use as a Kiro agent steering file or spec. Place at `.kiro/specs/drift.md` and reference from your agent's steering rules with: "When estimating features, follow the DRIFT method defined in `.kiro/specs/drift.md`."*
