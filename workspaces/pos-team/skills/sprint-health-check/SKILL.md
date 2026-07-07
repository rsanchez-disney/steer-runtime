---
name: sprint-health-check
description: Sprint status assessment with risk identification, blocker tracking, and velocity insights for POS team
agents: [pos_story_analyzer_agent, dsp_bug_report_agent]
---

# Sprint Health Check

Provides a snapshot of current sprint health across POS team workstreams. Identifies risks, blockers, and delivery confidence.

## Prerequisites

- Jira MCP configured with access to POS project
- Knowledge of current sprint/release scope

## Workflow

### Step 1: Identify Active Sprint

1. Query Jira for the active sprint in POS project
2. Check boards: Android/Mobile, Backoffice, QA
3. Determine sprint dates (start, end, days remaining)

### Step 2: Sprint Composition

Query all issues in the active sprint:

```jql
project = POS AND sprint in openSprints() ORDER BY priority DESC
```

Categorize:
- Stories (feature work)
- Bugs (defect fixes)
- Tasks (technical/operational)
- Spikes (research)

Calculate:
- Total story points committed
- Story points completed
- Story points in progress
- Story points not started

### Step 3: Progress Assessment

For each workstream:

**Android Mobile:**
- Features in progress vs completed
- Test coverage status
- PR/MR status (open, approved, merged)

**Backoffice (PHP/Go/React):**
- Backend changes status
- Frontend changes status
- Integration status

**QA:**
- Test execution progress
- Regression test pass rate
- Bugs found in current sprint

### Step 4: Risk Identification

**Blockers:**
- Issues in "Blocked" status
- Unresolved dependencies
- Waiting on external teams

**Velocity Risk:**
- Current burn rate vs sprint capacity
- Scope creep (items added mid-sprint)

**Quality Risk:**
- Bug injection rate
- Failed tests or rework cycles
- Code review bottlenecks

**Delivery Risk:**
- Items at risk of not completing
- Missing test coverage
- Unreviewed PRs aging >2 days

### Step 5: Generate Report

```markdown
## Sprint Health Check: {Sprint Name}

### 📊 Sprint Metrics
| Metric | Value |
|--------|-------|
| Sprint dates | {start} → {end} ({days remaining} days left) |
| Total points committed | {N} |
| Points completed | {N} ({%}) |
| Points in progress | {N} ({%}) |
| Points not started | {N} ({%}) |

### 🚦 Health Score: {🟢 On Track | 🟡 At Risk | 🔴 Off Track}

### ⚠️ Risks & Blockers
| # | Type | Issue | Impact | Mitigation |

### 📈 Velocity Projection
- Current burn rate: {X pts/day}
- Required rate: {Y pts/day}
- Confidence: {High/Medium/Low}

### 👥 Workstream Status
| Workstream | Status | Key Items |
|------------|--------|-----------|
| Android | {🟢/🟡/🔴} | ... |
| Backoffice | {🟢/🟡/🔴} | ... |
| QA | {🟢/🟡/🔴} | ... |

### 💡 Recommendations
1. {Actionable recommendation}
```

**Agent:** `pos_story_analyzer_agent`

## Health Score Rules

- 🟢 **On Track:** ≥80% points completed or in progress, no blockers, burn rate sufficient
- 🟡 **At Risk:** 60-80% progress, minor blockers, burn rate marginal
- 🔴 **Off Track:** <60% progress, critical blockers, or burn rate insufficient

## Important Rules

- **Data-driven only** — never speculate without Jira data
- **Identify root causes** — not just symptoms
- **Actionable recommendations** — every risk should have a mitigation
- **Cross-workstream awareness** — dependencies between mobile and backoffice
