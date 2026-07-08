## 🔄 Refactor Plan — [Feature/Bug area]

### Related Tickets
- [{TICKET_1}](https://myjira.disney.com/browse/{TICKET_1}): {summary}
- [{TICKET_2}](https://myjira.disney.com/browse/{TICKET_2}): {summary}

### Root Cause Analysis

**Symptoms:**
- {Bug 1 behavior}
- {Bug 2 behavior}

**Root Cause:**
{Underlying architectural weakness that causes these bugs}

**Evidence:**
- {Code reference showing the issue}
- {Historical MR or failure pattern}

### Proposed Solution

**Pattern:** {MVVM + Compose | MVP extension | UseCase redesign}
**Feature flag:** `FEATURE_FLAG_NAME`
**Scope:** {isolated module | cross-module}

**New behavior (flag ON):**
- {Description of new code path}

**Old behavior (flag OFF):**
- {Preserved — no changes to existing path}

### Migration Path

| Phase | Action | Validation |
|-------|--------|------------|
| 1 | Deploy with flag OFF | Existing tests pass, no behavior change |
| 2 | Enable in staging | QA validation on all 3 business models |
| 3 | Enable in production | Monitor metrics for 48h |
| 4 | Remove old code path | After 2 sprints of stability |

### Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `path/to/NewImpl.kt` | {description} |
| Modify | `path/to/FeaturesManager.kt` | Add flag |
| Modify | `path/to/Existing.kt` | Branch on flag |

### Risk Assessment

- **Rollback safety:** {Safe — flag OFF restores previous behavior}
- **Impact scope:** {Isolated to X module | Cross-cutting}
- **Business models:** {All 3 | Specific model}
- **Testing confidence:** {High — both paths independently tested}

> ⚠️ **Please confirm to proceed, or let me know if you'd like changes.**
