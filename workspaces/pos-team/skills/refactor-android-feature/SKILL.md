---
name: refactor-android-feature
description: Feature-flagged refactoring of Android code — bug analysis, architecture redesign, safe implementation with rollback capability
agents: [android_refactor_agent, android_dev_agent, android_test_agent, android_quality_agent, android_pr_agent]
---

# Refactor Android Feature

Safe, feature-flagged refactoring workflow for ActivateX. Starts from Jira bugs, identifies root causes and architectural weaknesses, then implements fixes behind feature flags for safe rollout.

## Prerequisites

- One or more Jira ticket IDs (POS-XXXXX) with related bugs or tech debt
- Clean working tree on `main` branch
- Understanding of affected business model(s)

## Workflow

### Step 1: Bug & Weakness Analysis

1. Fetch all related Jira tickets
2. Read GitLab MR history for the epic/feature
3. Map the bug pattern: is it a symptom or root cause?
4. Review `context/memory-bank/learnings.md` for past patterns
5. Identify architectural weaknesses:
   - Tight coupling
   - Missing error handling
   - Race conditions
   - State management issues
   - Business model edge cases not covered

**Agent:** `android_refactor_agent` (analysis phase)

### Step 2: Feature Context Loading

**Agent:** `android_refactor_agent`

**Purpose:** Load relevant feature context on demand (only if the refactoring relates to a documented feature).

**Actions:**
1. Check the ticket number prefix against the feature index in `context/features/README.md`
2. If the ticket belongs to or relates to a documented feature (matching by ticket number or feature description), read the full feature file:
   ```
   fs_read context/features/{matching-feature-file}.md
   ```
3. If no feature matches, skip this step and proceed without feature context

**Output:** Feature context loaded into conversation (or skipped if not applicable)

**Gate:** None — proceed immediately

### Step 3: Architecture Redesign

1. Propose a redesigned solution that addresses the root cause
2. Ensure the design:
   - Works for all three business models (Merchandise, QSR, Table Service)
   - Follows current architecture patterns (MVVM for new, MVP if extending)
   - Uses proper DI (Hilt)
   - Has injectable dispatchers for testability
3. Design feature flag boundary (what toggles between old/new behavior)
4. Identify rollback path

**Agent:** `android_refactor_agent` (design phase)

### Step 4: Present Refactor Plan (BLOCKING GATE)

```
## 🔄 Refactor Plan — [Feature/Bug area]

### Root Cause Analysis
- Bug symptoms vs underlying issue
- Architectural weakness identified

### Proposed Solution
- New pattern/approach
- Feature flag: `FEATURE_FLAG_NAME`
- Old behavior preserved when flag OFF

### Migration Path
1. Deploy with flag OFF (old behavior)
2. Enable flag in staging → validate
3. Enable flag in production → monitor
4. Remove old code path after stabilization

### Files to Create/Modify
| Action | File | Description |

### Risk Assessment
- Rollback: {safe/risky}
- Impact: {isolated/cross-cutting}
```

**⏸ GATE — User must approve before implementation begins**

### Step 5: Implement Feature-Flagged Solution

1. Add feature flag to `FeaturesManager`
2. Implement new code path (flag ON)
3. Preserve old code path (flag OFF)
4. Ensure clean branching at the flag check point
5. Follow existing patterns within the module

**Agent:** `android_dev_agent`

### Step 6: Write Tests for Both Paths

- Tests with flag ON (new behavior)
- Tests with flag OFF (old behavior preserved)
- Edge cases for the transition boundary
- Regression tests for the original bug

**Agent:** `android_test_agent`

### Step 7: Quality Review

- Verify feature flag is properly scoped
- Confirm rollback path works
- Check that old behavior is truly unchanged when flag OFF
- Architecture compliance

**Agent:** `android_quality_agent`

### Step 8: PR & Documentation

- PR description includes:
  - Root cause explanation
  - Feature flag name and rollout plan
  - How to test both paths
  - Rollback instructions

**Agent:** `android_pr_agent`

## Important Rules

- **Feature flags are mandatory** — no refactoring without safe rollback
- **Old behavior must be preserved** when flag is OFF
- **Both code paths must be tested** independently
- **Rollback must be immediate** — flag OFF = instant revert, no deploy needed
- **Business model coverage** — validate all three models in both paths
- **Memory bank update** — add learnings from this refactor to `learnings.md`
