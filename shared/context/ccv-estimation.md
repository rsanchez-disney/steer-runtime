# CCV Estimation Method
## A Risk-Weighted Framework for Traditional Software Project Estimation

**Version:** 1.0  
**Status:** Agent-Ready Specification  
**Purpose:** Defines the complete CCV (Complexity, Completeness, Volatility) estimation method for traditional (non-AI) software projects, including scoring rules, hour calculation, Monte Carlo simulation, AI Productivity Multiplier, and team sizing. Intended for use as a Kiro agent steering file.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Concepts](#2-core-concepts)
3. [The Three CCV Axes](#3-the-three-ccv-axes)
   - 3.1 [Complexity](#31-complexity)
   - 3.2 [Completeness](#32-completeness)
   - 3.3 [Volatility](#33-volatility)
4. [Risk Resolution Matrix](#4-risk-resolution-matrix)
5. [T-Shirt Size Scale](#5-t-shirt-size-scale)
6. [Hour Estimation Formula](#6-hour-estimation-formula)
7. [Story Point Mapping](#7-story-point-mapping)
8. [Probabilistic Simulation (Monte Carlo)](#8-probabilistic-simulation-monte-carlo)
9. [AI Productivity Multiplier (APM)](#9-ai-productivity-multiplier-apm)
10. [Team Sizing Model](#10-team-sizing-model)
11. [Estimation Layers and Outputs](#11-estimation-layers-and-outputs)
12. [Scoring Rubrics and Elicitation Guide](#12-scoring-rubrics-and-elicitation-guide)
13. [Worked Examples](#13-worked-examples)
14. [Agent Interaction Protocol](#14-agent-interaction-protocol)
    - 14.1 [Input Elicitation](#141-input-elicitation)
    - 14.2 [Output Schema](#142-output-schema)
    - 14.3 [Estimation Dialogue Flow](#143-estimation-dialogue-flow)
15. [Validation and Gap Analysis](#15-validation-and-gap-analysis)
16. [Glossary](#16-glossary)

---

## 1. Overview

The CCV method is a **risk-adjusted effort estimation framework** for traditional software project planning. It was designed for RFP (Request for Proposal) responses, SOW (Statement of Work) construction, and sprint-level backlog estimation.

The method operates at the **feature/story level**. For each work item, three risk axes are scored categorically — Complexity, Completeness, and Volatility — and combined into a single risk classification (LOW, MED, or HIGH). That risk classification then applies a multiplier to a base hour estimate derived from a T-shirt size, producing the final deterministic hour estimate.

On top of this deterministic core, the method adds two optional layers:

- **Probabilistic simulation** using Monte Carlo to produce optimistic, expected, and pessimistic hour ranges.
- **AI Productivity Multiplier (APM)** to adjust estimates when AI tooling is part of the delivery model.

The method produces five distinct outputs for each project:

1. **Deterministic hours** — the CCV-weighted estimate
2. **Probabilistic hours** — the Monte Carlo simulation range
3. **APM-adjusted hours** — AI-productivity-corrected estimate
4. **Team sizing** — FTE count per profile over time
5. **Risk profile** — distribution of LOW/MED/HIGH risk items across the backlog

---

## 2. Core Concepts

### Unit of Estimation

The CCV method estimates at the **story level**, not the epic or feature level directly. Each story is a discrete unit of work assigned to a specific component and delivery profile (Backend, Frontend, QA, etc.).

Stories roll up to features, features to epics, and epics to the total project estimate.

### Categorical Inputs, Numeric Outputs

The three CCV axes use **categorical values** (not numeric scales). This is intentional — categorical inputs reduce estimation bias and are faster to score in workshops. The resolution of categories into a risk level, and the application of multipliers, happens mechanically after scoring.

### Deterministic vs. Probabilistic

CCV produces two parallel estimates:

- **Deterministic (CCV):** Hours = T-shirt base hours × Risk multiplier. A single point estimate.
- **Probabilistic (Monte Carlo):** Simulated using a normal distribution around the deterministic estimate. Produces a range.

The gap between the two is a model health indicator. A gap under 5% signals excellent alignment; over 20% signals that CCV risk factors may be miscalibrated.

---

## 3. The Three CCV Axes

### 3.1 Complexity

**Definition:** The structural and technical difficulty of implementing the feature. Captures the number of system layers, integration points, and novel patterns involved.

**Valid values:**

| Value | Description |
|-------|-------------|
| `SIMPLE` | Single component, well-understood pattern. Minimal dependencies. Known implementation path. |
| `STANDARD` | Multiple components or a moderate integration. Some design decisions required but no novel patterns. |
| `COMPLEX` | Multi-service coordination, significant integration work, novel architecture, or cross-cutting technical concerns. |

**Scoring guidance:**
- Ask: *"How many systems or layers does this touch? Are there novel patterns or established ones?"*
- `SIMPLE` → one service, one file, one known pattern
- `STANDARD` → 2–3 services, one integration, established approach with some decisions
- `COMPLEX` → 4+ services, novel approach, shared infrastructure, or security/data-model impact

---

### 3.2 Completeness

**Definition:** How well-specified the requirements, acceptance criteria (AC), and edge cases are at estimation time.

**Valid values:**

| Value | Description |
|-------|-------------|
| `COMPLETE` | Acceptance criteria fully written. Edge cases documented. Technical approach agreed. No open questions. |
| `INCOMPLETE` | Requirements direction is clear, but AC has gaps. Some edge cases undocumented. Key decisions still open. |
| `UNKNOWN` | Requirements are vague or exploratory. No AC. Significant discovery work required before implementation. |

**Scoring guidance:**
- Ask: *"Do you have written acceptance criteria? Are edge cases covered? Are there open design questions?"*
- `COMPLETE` → ready to implement, no blockers from missing specs
- `INCOMPLETE` → implementable but will require clarification during the sprint
- `UNKNOWN` → requires a spike or discovery phase before estimation is reliable

---

### 3.3 Volatility

**Definition:** The probability that requirements will change before or during implementation.

**Valid values:**

| Value | Description |
|-------|-------------|
| `YES` | Requirements are likely to change. Active stakeholder discussions, upstream decisions pending, or design is being revised. |
| `NO` | Requirements are stable. Stakeholders are aligned. No known change risks. |

**Note:** Volatility in the CCV method is a **binary flag**, not a scale. This differs from frameworks that treat volatility as a continuous risk dimension. The binary model is intentional — it forces a definitive commitment from stakeholders rather than hedging.

**Scoring guidance:**
- Ask: *"Is there anything currently being discussed that could change the scope of this story before it is delivered?"*
- `YES` if any upstream decision, design review, or stakeholder approval is pending
- `NO` only when requirements are fully locked and signed off

---

## 4. Risk Resolution Matrix

The three CCV inputs are resolved into a single risk level — `LOW`, `MED`, or `HIGH` — using the following deterministic lookup table.

### Resolution Rules (in evaluation order)

| Rule | Complexity | Completeness | Volatility | → Risk |
|------|-----------|--------------|-----------|--------|
| 1 | COMPLEX | UNKNOWN | NO | HIGH |
| 2 | COMPLEX | INCOMPLETE | YES | HIGH |
| 3 | COMPLEX | UNKNOWN | YES | HIGH |
| 4 | COMPLEX | INCOMPLETE | NO | MED |
| 5 | STANDARD | COMPLETE | NO | LOW |
| 6 | SIMPLE | COMPLETE | NO | LOW |
| 7 | *(any other combination)* | | | MED |

### Resolution Logic

```
IF   (Complexity=COMPLEX  AND Completeness=UNKNOWN   AND Volatility=NO)  → HIGH
ELIF (Complexity=COMPLEX  AND Completeness=INCOMPLETE AND Volatility=YES) → HIGH
ELIF (Complexity=COMPLEX  AND Completeness=UNKNOWN   AND Volatility=YES)  → HIGH
ELIF (Complexity=COMPLEX  AND Completeness=INCOMPLETE AND Volatility=NO)  → MED
ELIF (Complexity=STANDARD AND Completeness=COMPLETE  AND Volatility=NO)  → LOW
ELIF (Complexity=SIMPLE   AND Completeness=COMPLETE  AND Volatility=NO)  → LOW
ELSE → MED
```

### Key Observations

- `HIGH` risk requires COMPLEX complexity in every case — no SIMPLE or STANDARD story can be HIGH risk.
- `LOW` risk requires COMPLETE completeness AND NO volatility — any ambiguity floors the risk at MED.
- The "catch-all" default is `MED`, not `LOW`. Uncertainty defaults upward, not downward.
- A COMPLEX story with COMPLETE specs and NO volatility resolves to MED, not LOW. Complexity alone is sufficient to prevent LOW classification.

### Risk Distribution Targets

A healthy backlog typically shows this distribution:

| Risk Level | Typical % | Signal if exceeded |
|------------|----------|-------------------|
| LOW | 50–70% | If lower: specs need refinement before sprint |
| MED | 25–40% | Normal range |
| HIGH | < 15% | If higher: project has too many unknowns to estimate reliably |

---

## 5. T-Shirt Size Scale

T-shirt sizes capture the **base effort** of a story before risk adjustment. They represent expected hours for a story at LOW risk.

| Size | Story Points | Base Hours | Description |
|------|-------------|------------|-------------|
| XS | 2 SP | 10 hrs | Trivial: config change, documentation, single-line fix |
| S | 5 SP | 30 hrs | Small: simple endpoint, minor feature, unit test suite |
| M | 13 SP | 60 hrs | Medium: full feature with tests, moderate integration |
| L | 21 SP | 90 hrs | Large: multi-component feature, significant integration |
| XL | 34 SP | 150 hrs | Extra-large: subsystem, platform feature, split recommended |

**Sizing guidance:**
- Always size for the **expected case at LOW risk**. The risk multiplier handles upside.
- If a story cannot fit in XL (150 hrs), it must be split before estimation.
- Sprint velocity baseline: **80 hrs/person/sprint** (2-week sprint).

---

## 6. Hour Estimation Formula

### Base Formula

```
Estimated Hours = Base Hours(T-shirt) × Risk Factor(Risk Level)
```

### Risk Factor Table

| Risk Level | Multiplier |
|-----------|-----------|
| LOW | 1.00 × |
| MED | 1.15 × |
| HIGH | 1.25 × |

### Examples

| T-Shirt | Risk | Base Hrs | Multiplier | Final Hrs |
|---------|------|----------|-----------|----------|
| S | LOW | 30 | × 1.00 | 30 hrs |
| M | LOW | 60 | × 1.00 | 60 hrs (rounded) |
| M | MED | 60 | × 1.15 | 69 hrs |
| M | HIGH | 60 | × 1.25 | 75 hrs |
| L | MED | 90 | × 1.15 | 104 hrs |
| XL | HIGH | 150 | × 1.25 | 188 hrs |

**Note:** Results are rounded to the nearest whole number.

### CCV Adjustment Factors (for fine-tuning)

The Parameters sheet also defines adjustment factors by axis that can be used for advanced calibration:

| Axis Value | Adjustment |
|-----------|-----------|
| COMPLEX | +0.20 |
| STANDARD | +0.10 |
| INCOMPLETE | +0.10 |
| UNKNOWN | +0.20 |
| Volatility YES | +0.20 |
| COMPLETE | −0.05 |
| SIMPLE | −0.05 |
| Volatility NO | −0.05 |

These adjustment factors are available for calibration purposes and reflect the directional weight of each axis. In the base formula, they are collapsed into the Risk Factor lookup above.

---

## 7. Story Point Mapping

Story points correspond directly to T-shirt sizes and are used for sprint planning and velocity tracking. They do **not** change with risk level — risk affects hours, not points.

| T-Shirt | Story Points |
|---------|-------------|
| XS | 2 |
| S | 5 |
| M | 13 |
| L | 21 |
| XL | 34 |

**Rationale:** Story points capture relative effort scope. Risk multipliers inflate hours (the cost of delivering) but do not change the scope of the work itself. A MED-risk M story is still a 13-point story — it just takes 69 hours instead of 60.

---

## 8. Probabilistic Simulation (Monte Carlo)

The Monte Carlo layer adds statistical uncertainty bands around the deterministic CCV estimate. It simulates thousands of possible outcomes using a normal distribution, producing three scenario outputs.

### Simulation Parameters

Three scenarios are defined in the Parameters sheet:

| Scenario | Mean (distribution over risk mix) | Standard Deviation |
|----------|-----------------------------------|--------------------|
| Optimistic | Proportion of LOW-risk stories | 0.05 |
| Expected | Proportion of MED-risk stories | 0.15 |
| Pessimistic | Proportion of HIGH-risk stories | 0.10 |

The mean values for each scenario are computed dynamically from the actual risk distribution of the backlog:

```
Optimistic mean  = count(LOW stories)  / count(all stories)
Expected mean    = count(MED stories)  / count(all stories)
Pessimistic mean = count(HIGH stories) / count(all stories)
```

### Story-Level Simulation

For each story, three simulated factors are drawn from their respective normal distributions:

```
Optimistic factor  ~ N(mean_LOW,  σ=0.05)
Expected factor    ~ N(mean_MED,  σ=0.15)
Pessimistic factor ~ N(mean_HIGH, σ=0.10)
```

These factors are then applied to the story's CCV deterministic hours:

```
Simulated Hours (scenario) = CCV Hours × Scenario Factor
```

### Project-Level Totals

```
Total Hours (scenario) = SUM(Simulated Hours across all stories for that scenario)
```

### Gap Analysis

The gap between the deterministic (CCV) total and the probabilistic (Monte Carlo) total is the primary model health indicator:

```
Gap = |CCV Total - Monte Carlo Total| / MIN(CCV Total, Monte Carlo Total)
```

| Gap | Interpretation |
|-----|---------------|
| < 5% | Excellent alignment. CCV risk calibration is accurate. |
| 5–10% | Acceptable. Monitor for systematic over/under-weighting of risk factors. |
| 10–20% | Not acceptable. Meaningful divergence — re-examine risk scoring. |
| > 20% | Misalignment. CCV and probabilistic models are inconsistent. |

**Important:** The GAP threshold in the model is set at **0.5 (50%)** for the internal GAP Value parameter, which is a normalization reference. The interpretive thresholds above (5%, 10%, 20%) are the actionable bands.

---

## 9. AI Productivity Multiplier (APM)

The APM layer adjusts the CCV deterministic hours downward to reflect AI-assisted delivery. It is computed per story using four parameters.

### APM Parameters

Each parameter is drawn from a triangular distribution defined by minimum (B), mode (C), and maximum (D) values:

| Parameter | Symbol | Min (B) | Mode (C) | Max (D) | Description |
|-----------|--------|---------|---------|--------|-------------|
| Applicability | `a` | 0.20 | 0.60 | 0.90 | What fraction of the story's work is AI-applicable |
| Gain | `g` | 0.10 | 0.30 | 0.50 | Productivity gain factor for the applicable portion |
| Revision Rate | `r` | 0.03 | 0.08 | 0.15 | Fraction of AI output requiring human revision |
| Participation | `p` | 0.39 | 0.50 | 0.40 | Team participation rate in AI-assisted work |

### APM Formula

```
AdjHours = CCV Hours × (1 − a × g × (1 − r) × p)
```

Where:
- `a × g` = raw productivity gain on applicable work
- `(1 − r)` = fraction of AI output accepted without revision
- `p` = fraction of the team applying AI tooling
- The product `a × g × (1 − r) × p` is the net hour reduction factor

### AAI% (AI Adoption Impact)

```
AAI% = 1 − (AdjHours / CCV Hours)
```

This percentage represents the net time savings from AI adoption for that story.

### APM Optimization at Project Level

```
APM Optimization = (CCV Total Hours − APM Adjusted Hours) / CCV Total Hours
```

This is the overall project-level efficiency gain from AI adoption. Example: a value of 0.083 means AI tooling reduces total project hours by ~8.3%.

### APM Interpretation

| AAI% | Interpretation |
|------|---------------|
| < 3% | Minimal AI impact — story is largely non-automatable |
| 3–8% | Moderate impact — AI assists but human judgment dominates |
| 8–15% | Strong impact — AI significantly reduces implementation effort |
| > 15% | High impact — story is highly AI-automatable (boilerplate, tests, docs) |

---

## 10. Team Sizing Model

The FTE (Full-Time Equivalent) model derives team headcount automatically from the estimated hours, project duration, sprint velocity, and story distribution by profile.

### Profiles and Keywords

| Profile | Keywords (matched against story Component/Description) |
|---------|--------------------------------------------------------|
| Backend Engineer | API, Backend, Middleware, Security |
| Architect | Integration, Documentation, Architecture, Design, Diagram |
| Frontend Engineer | UI, Dashboard |
| QA Engineer | Test, QA |
| DevOps | AWS, Infrastructure |
| Business Analyst | Requirement, Business |

Stories are auto-assigned to profiles by matching keywords in the Component or Story Description fields. If no keyword matches, the story is flagged as **Unassigned** — this should never occur in a finalized backlog.

### FTE Calculation

```
FTE(profile) = ROUNDUP(
  (Profile Hours Share × Total Project Hours) /
  (Project Duration in Months × 2 × Hours per Sprint)
)
```

Where:
- `Profile Hours Share` = fraction of total hours attributed to that profile
- `Hours per Sprint` = 80 hrs/person/sprint (configurable)
- `× 2` = number of sprints per month (2-week sprints)

### Staffing Distribution Over Time

FTEs are distributed across months using a **bell-curve ramp-up/ramp-down** pattern derived from a normal distribution. The distribution peaks at the project midpoint (Peak Month = Total Months / 2) and tapers at the start and end.

The sigma (spread) of the distribution depends on a configurable setting:

| Sigma Setting | Value | Use Case |
|--------------|-------|----------|
| Small | 1 | Tight, concentrated team with fast ramp-up |
| Medium | Duration / 3 | Standard ramp curve |
| Large | Duration / 2 | Gradual onboarding and extended tail |

### Team Sizing from the Sample Template

For a 12-month project with ~21,900 deterministic hours:

| Profile | Total Hours | Participation % | FTEs |
|---------|-------------|----------------|------|
| Backend Engineer | 13,704 hrs | 40.7% | 5 |
| Architect | 3,606 hrs | 10.7% | 2 |
| Frontend Engineer | 5,394 hrs | 16.0% | 2 |
| QA Engineer | 2,460 hrs | 7.3% | 1 |
| DevOps | 7,620 hrs | 22.6% | 3 |
| Business Analyst | 882 hrs | 2.6% | 1 |
| **Total** | | | **14 FTEs** |

---

## 11. Estimation Layers and Outputs

The CCV method produces outputs at three layers. Each layer adds analytical depth.

### Layer 1 — Deterministic Estimate (CCV)

**What it is:** The primary, point estimate. Fast to compute, fully explainable.

**Inputs:** T-shirt size + CCV axes → Risk Level → Hours

**Outputs per story:**
- Risk Level: LOW / MED / HIGH
- Estimated Hours: numeric
- Story Points: numeric (from T-shirt)

**Outputs per project:**
- Total deterministic hours
- Risk distribution (% LOW / MED / HIGH)
- Hours by Epic, Feature, and Profile

---

### Layer 2 — Probabilistic Estimate (Monte Carlo)

**What it is:** A simulation that produces a range of outcomes based on the backlog's risk profile.

**Outputs:**
- Optimistic total hours
- Expected total hours
- Pessimistic total hours
- Gap % vs. deterministic estimate

---

### Layer 3 — AI-Adjusted Estimate (APM)

**What it is:** A downward adjustment to deterministic hours based on AI tooling adoption.

**Outputs:**
- APM-adjusted total hours
- APM Optimization % (overall project hour reduction)
- AAI% per story (individual story AI impact)

---

### Summary Output Table

A complete CCV estimation produces this project-level summary:

| Output | Description |
|--------|-------------|
| CCV / Deterministic | Total hours from T-shirt × Risk Factor |
| Monte Carlo / Probabilistic | Simulated total hours |
| APM Adjusted | AI-productivity-corrected hours |
| Det./Prob. Variance (Gap) | Model health — should be < 10% |
| APM Optimization | Project hour savings from AI |
| Expected Duration | Months (project input) |
| Team FTEs | Auto-sized headcount per profile |

---

## 12. Scoring Rubrics and Elicitation Guide

### For Each Story, Collect

1. **Epic** — top-level grouping (e.g., "Foundation & Infrastructure")
2. **Feature** — second-level grouping (e.g., "AWS Environment Setup")
3. **Component** — technical component or system affected (e.g., "Backend", "UI", "Infrastructure")
4. **Story Description** — user story format: *"As a [role], I need [what] so that [why]"*
5. **Priority** — High / Medium / Low (business priority, not technical)
6. **T-Shirt Size** — XS / S / M / L / XL
7. **Complexity** — SIMPLE / STANDARD / COMPLEX
8. **Completeness** — COMPLETE / INCOMPLETE / UNKNOWN
9. **Volatility** — YES / NO

### Complexity Elicitation

Ask: *"How many systems, services, or layers does this story involve? Is the implementation pattern known or novel?"*

| Answer | Complexity |
|--------|-----------|
| One file, one service, known pattern, copy-paste from existing | SIMPLE |
| 2–3 services, some design choices, established approach | STANDARD |
| 4+ services, novel approach, shared infrastructure, security, data model | COMPLEX |

### Completeness Elicitation

Ask: *"Do you have written acceptance criteria? Are edge cases documented? Are there open design questions?"*

| Answer | Completeness |
|--------|-------------|
| AC written, edge cases covered, technical approach agreed, no open questions | COMPLETE |
| AC partially written, some edge cases missing, minor open decisions | INCOMPLETE |
| No AC, idea-level only, requires discovery sprint before implementation | UNKNOWN |

### Volatility Elicitation

Ask: *"Is there anything currently in discussion — stakeholder decisions, design reviews, upstream dependencies — that could change this story before it is delivered?"*

| Answer | Volatility |
|--------|-----------|
| Yes — any pending decision that could alter scope | YES |
| No — requirements are locked, stakeholders aligned | NO |

### T-Shirt Elicitation

Ask: *"Relative to a simple API endpoint (S = 30 hours), is this story smaller, similar, or significantly larger?"*

Use this anchor scale:
- **XS** — faster than a day (< 10 hrs): a config change, a documentation update
- **S** — 3–4 days: a simple endpoint with tests
- **M** — 1.5–2 weeks: a full feature with integration and tests
- **L** — 2–3 weeks: multi-service feature, significant integration
- **XL** — 3+ weeks: a subsystem or platform feature — must be split if possible

---

## 13. Worked Examples

### Example 1 — Simple Infrastructure Task

**Story:** "As a developer, I need Cloud Logging configured so that application errors are visible in the observability platform."

**Scoring:**

| Axis | Value | Rationale |
|------|-------|-----------|
| T-Shirt | S | 1–2 days of config work, well-understood |
| Complexity | SIMPLE | Single infrastructure component, known GCP pattern |
| Completeness | COMPLETE | Logging spec is documented, destination bucket defined |
| Volatility | NO | Infrastructure decisions finalized |

**Resolution:**

```
SIMPLE + COMPLETE + NO → LOW
Hours = 30 × 1.00 = 30 hrs
Story Points = 5
```

---

### Example 2 — Standard Feature with Incomplete Specs

**Story:** "As a user, I want an analytics dashboard showing real-time event data from the monitoring service."

**Scoring:**

| Axis | Value | Rationale |
|------|-------|-----------|
| T-Shirt | M | UI + backend data pipeline + real-time integration |
| Complexity | STANDARD | Multi-component but established patterns (React + REST) |
| Completeness | INCOMPLETE | Dashboard wireframes exist but data model TBD |
| Volatility | NO | Core direction locked, data model decision is minor |

**Resolution:**

```
STANDARD + INCOMPLETE + NO → MED (catch-all)
Hours = 60 × 1.15 = 69 hrs
Story Points = 13
```

---

### Example 3 — Complex Integration with Unknown Requirements

**Story:** "As a business owner, I need a high-level design for the Maximo API integration so that work orders can be synchronized bidirectionally."

**Scoring:**

| Axis | Value | Rationale |
|------|-------|-----------|
| T-Shirt | L | Multi-service, bidirectional sync, retry mechanisms |
| Complexity | COMPLEX | 4+ services, novel integration, data model impact |
| Completeness | UNKNOWN | Maximo API documentation not yet reviewed |
| Volatility | NO | Discovery sprint planned but scope direction agreed |

**Resolution:**

```
COMPLEX + UNKNOWN + NO → HIGH (Rule 1)
Hours = 90 × 1.25 = 113 hrs (rounded)
Story Points = 21
```

---

### Example 4 — Complex Feature with High Volatility

**Story:** "As a developer, I need to implement the Publishing / Retry Mechanism for the Maximo Publisher service."

**Scoring:**

| Axis | Value | Rationale |
|------|-------|-----------|
| T-Shirt | M | Retry logic, dead-letter queue, monitoring hooks |
| Complexity | STANDARD | Known retry patterns, but multi-component |
| Completeness | COMPLETE | Retry strategy documented, SLA defined |
| Volatility | YES | SLA thresholds under stakeholder review |

**Resolution:**

```
STANDARD + COMPLETE + YES → MED (catch-all, volatility prevents LOW)
Hours = 60 × 1.15 = 69 hrs
Story Points = 13
```

Note: Even though Completeness is COMPLETE, a YES on Volatility prevents LOW classification. The default MED applies.

---

### Project-Level Summary (Sample Template Actuals)

| Metric | Value |
|--------|-------|
| Total Stories | ~300 |
| Total Deterministic Hours | 21,864 hrs |
| Total Monte Carlo Hours | 21,917 hrs |
| APM Adjusted Hours | 20,045 hrs |
| Det./Prob. Gap | 0.24% (Excellent) |
| APM Optimization | 8.3% |
| Project Duration | 12 months |
| Team Size | 14 FTEs |
| Peak Team (Month 5–7) | 19 FTEs |

**Epic Hour Distribution:**

| Epic | Hours | % |
|------|-------|---|
| Foundation & Infrastructure | 4,404 | 20.8% |
| Initiation & Discovery | 3,696 | 17.5% |
| Core Development | 2,496 | 11.8% |
| Quality Assurance & Testing | 2,460 | 11.6% |
| Post-Deployment & Hypercare | 2,418 | 11.4% |
| Continuous Improvement | 1,986 | 9.4% |
| Release & Deployment | 1,854 | 8.8% |
| Operational Support & Handoff | 1,860 | 8.8% |

---

## 14. Agent Interaction Protocol

### 14.1 Input Elicitation

The agent accepts stories in three forms:

**Form A — Structured JSON**

```json
{
  "epic": "Foundation & Infrastructure",
  "feature": "AWS Environment Setup",
  "component": "Backend",
  "story": "As a developer, I need to configure S3 buckets for artifact storage",
  "priority": "High",
  "tshirt": "S",
  "complexity": "SIMPLE",
  "completeness": "COMPLETE",
  "volatility": "NO"
}
```

**Form B — Natural Language**

The agent infers axis values from the description and confirms before computing:

*"We need to build the retry mechanism for the Maximo publisher. It's complex because the error handling strategy is still being defined by the architecture team."*

Agent inference:
- Complexity: COMPLEX (architecture decisions pending)
- Completeness: INCOMPLETE (error handling strategy undefined)
- Volatility: YES (architecture team input pending)
- T-Shirt: M (retry mechanism, moderate scope)

**Form C — Interactive Dialogue**

The agent asks questions in sequence using the rubrics in §12. See §14.3.

---

### 14.2 Output Schema

```markdown
## CCV Estimation: [Story Title]

### Inputs
| Field | Value |
|-------|-------|
| Epic | [epic] |
| Feature | [feature] |
| Component | [component] |
| T-Shirt | [size] |
| Complexity | [SIMPLE/STANDARD/COMPLEX] |
| Completeness | [COMPLETE/INCOMPLETE/UNKNOWN] |
| Volatility | [YES/NO] |

### Risk Resolution
- **Complexity:** [value]
- **Completeness:** [value]
- **Volatility:** [value]
- **Risk Level:** [LOW / MED / HIGH]
- **Rule applied:** [e.g., "COMPLEX + UNKNOWN + NO → HIGH (Rule 1)"]

### Estimate
| Output | Value |
|--------|-------|
| Story Points | [SP] |
| Base Hours | [T-shirt base hrs] |
| Risk Factor | [×1.00 / ×1.15 / ×1.25] |
| **Estimated Hours** | **[final hrs]** |

### APM Adjustment (if AI delivery)
| Parameter | Value |
|-----------|-------|
| Applicability (a) | [0.20–0.90] |
| Gain (g) | [0.10–0.50] |
| Revision Rate (r) | [0.03–0.15] |
| Participation (p) | [0.39–0.50] |
| **AI-Adjusted Hours** | **[AdjHours]** |
| AAI% | [%] |

### Notes
[Any flags, assumptions, or recommendations]
```

---

### 14.3 Estimation Dialogue Flow

```
1. RECEIVE story title and/or description
2. INFER initial CCV scores from description (if provided)
3. CONFIRM inferred scores or ELICIT missing ones:
   a. Ask: "How many systems does this touch? Is the pattern known?"  → Complexity
   b. Ask: "Do you have written acceptance criteria?"                 → Completeness
   c. Ask: "Could requirements change before this is delivered?"      → Volatility
   d. Ask: "Relative to a simple endpoint (S = 30 hrs), how large?"  → T-Shirt
4. RESOLVE risk level using the Risk Resolution Matrix (§4)
5. COMPUTE hours = Base Hours × Risk Factor
6. COMPUTE story points from T-shirt mapping
7. OPTIONALLY COMPUTE APM adjustment if AI delivery context
8. OUTPUT estimation report (§14.2 format)
9. OFFER: "Would you like to estimate another story, run a backlog summary, or adjust any inputs?"
```

**Priority order for clarification:** If time is limited, always confirm Complexity first, then Completeness. Volatility can often be inferred from context. T-shirt size is easiest to anchor once risk is known.

---

## 15. Validation and Gap Analysis

### Deterministic vs. Probabilistic Gap

After estimating a full backlog, compute:

```
Gap = |CCV Total − Monte Carlo Total| / MIN(CCV Total, Monte Carlo Total)
```

| Gap | Action |
|-----|--------|
| < 5% | No action needed. Model is well-calibrated. |
| 5–10% | Monitor. Check if HIGH-risk stories are consistently under/over-estimated. |
| 10–20% | Re-examine risk scoring on MED stories. Likely under-assigning COMPLEX complexity. |
| > 20% | Model recalibration required. CCV risk factors do not match team's actual delivery patterns. |

### Backlog Health Checks

The agent should flag the following conditions after backlog estimation:

| Condition | Flag |
|-----------|------|
| > 15% of stories are HIGH risk | ⚠ Too many unknowns — backlog needs refinement before sprint commitment |
| Any story is UNKNOWN + COMPLEX | ⚠ Must be converted to a spike or discovery task |
| Any story is XL without a split plan | ⚠ Epic-sized story — recommend decomposition |
| Unassigned stories > 0 | ⚠ Profile keyword match failed — manual assignment required |
| Det./Prob. Gap > 10% | ⚠ CCV calibration drift — re-score highest-risk stories |

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **AAI%** | AI Adoption Impact percentage. The net hour reduction per story from AI-assisted delivery. |
| **AC** | Acceptance Criteria. The conditions a story must satisfy to be considered complete. |
| **APM** | AI Productivity Multiplier. The four-parameter model that adjusts CCV hours for AI tooling adoption. |
| **Applicability (a)** | APM parameter. The fraction of a story's work that is applicable to AI assistance. Range: 0.2–0.9. |
| **CCV** | Complexity, Completeness, Volatility. The three categorical risk axes used to classify story risk. |
| **Completeness** | CCV axis. Measures how well-specified the requirements and acceptance criteria are. Values: COMPLETE / INCOMPLETE / UNKNOWN. |
| **Complexity** | CCV axis. Measures the structural and technical scope of the story. Values: SIMPLE / STANDARD / COMPLEX. |
| **Deterministic Estimate** | The point estimate produced by the CCV formula: Base Hours × Risk Factor. |
| **Epic** | Top-level grouping of features. Examples: "Foundation & Infrastructure", "Core Development". |
| **Feature** | Second-level grouping of stories under an Epic. |
| **FTE** | Full-Time Equivalent. A unit of team capacity equal to one person working full-time. |
| **Gain (g)** | APM parameter. The productivity gain factor for AI-applicable work. Range: 0.1–0.5. |
| **Gap** | The percentage difference between the deterministic (CCV) and probabilistic (Monte Carlo) estimates. A model health indicator. |
| **HIGH** | Risk level indicating a complex, incomplete, or volatile story requiring 25% hour inflation. |
| **LOW** | Risk level indicating a well-understood, fully-specified, stable story. No hour inflation applied. |
| **MED** | Risk level indicating moderate risk. Applies a 15% hour inflation. |
| **Monte Carlo** | A simulation method that samples from probability distributions to produce a range of outcomes. Used for probabilistic estimation. |
| **Participation (p)** | APM parameter. The fraction of the team applying AI tooling to this story. Range: 0.39–0.50. |
| **Probabilistic Estimate** | The Monte Carlo simulated estimate. Produces optimistic, expected, and pessimistic totals. |
| **Revision Rate (r)** | APM parameter. The fraction of AI-generated output requiring human revision. Range: 0.03–0.15. |
| **Risk Factor** | The hour multiplier applied based on risk level: LOW=1.0, MED=1.15, HIGH=1.25. |
| **Risk Level** | The resolved risk classification (LOW, MED, HIGH) derived from the three CCV axes. |
| **RFP** | Request for Proposal. A procurement document that CCV is commonly used to respond to. |
| **SOW** | Statement of Work. A project contract that formalizes scope, timeline, and deliverables. |
| **Spike** | A time-boxed investigation task used when Completeness is UNKNOWN. Not estimated with CCV. |
| **Story Points** | Dimensionless effort units mapped directly from T-shirt size. Used for sprint velocity tracking. |
| **T-Shirt Size** | Categorical size label (XS/S/M/L/XL) representing a story's base effort before risk adjustment. |
| **Volatility** | CCV axis. Binary flag (YES/NO) indicating whether requirements are at risk of changing. |

---

*End of specification. Place at `.kiro/specs/ccv-estimation.md` and add to agent steering:*
*"When performing CCV estimation for traditional software projects, follow the method defined in `.kiro/specs/ccv-estimation.md`. Always confirm all three CCV axes and T-shirt size before computing. Never skip the Risk Resolution step."*
