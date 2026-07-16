# Spec: AI-DLC pattern adoption for steer-runtime

Integrates proven patterns from AWS AI-DLC Workflows into the steer-runtime harness.

## Motivation

AI-DLC introduces patterns that solve known pain points in steer-runtime: context window saturation, inconsistent output depth, lack of pre-write validation, and limited evaluation tooling. These six features are additive — no breaking changes.

---

## Feature 1: Extension opt-in (context-on-demand)

### Problem

All context files with `inclusion: always` load into every agent session regardless of relevance. A payments task loads QA guidelines, a bug fix loads architecture docs. This wastes 10-30K tokens per session.

### Design

Add a new inclusion mode: `on-demand`. Files with this mode are only loaded when the task matches a keyword trigger.

```markdown
---
inclusion: on-demand
trigger: "security|auth|credentials|encryption|PII|GDPR|vulnerability"
description: "Security context — loaded when task involves auth, encryption, or compliance"
---
```

### Implementation

1. **steer-runtime** — Define the `on-demand` inclusion frontmatter schema
2. **Koda (ops/install)** — During materialization, tag on-demand files separately (don't inject into agent resources)
3. **Orchestrator prompt** — Add instruction: "Before starting work, scan available on-demand context files. If the task matches any trigger pattern, load those files. Present to user: 'Loading security context (task mentions auth)'"
4. **Agent spawn hook** — New `context-inject.sh` hook reads task description, matches against on-demand triggers, injects matching files into the agent's context
5. **Fallback** — If no hook support, orchestrator manually reads and includes relevant on-demand files via `fs_read`

### Files to change

- `shared/context/` — migrate heavy context files to `inclusion: on-demand`
- `shared/hooks/context-inject.sh` — new hook
- `profiles/dev-core/prompts/orchestrator.md` — add on-demand loading instructions
- `docs/reference/CONTEXT_MANAGEMENT.md` — document the pattern

### Candidates for on-demand migration

| File | Trigger | Current size |
|------|---------|:------------:|
| `security_guidelines.md` | security, auth, encryption, PII | ~4KB |
| `estimation_reference.md` | estimate, story points, capacity | ~3KB |
| `ops_guidelines.md` | deploy, incident, monitoring | ~5KB |
| `email_guidelines.md` | email, notify, send message | ~2KB |
| `defect_templates.md` | bug, defect, RCA, incident | ~3KB |
| `api_testing_with_bruno.md` | bruno, API test, collection | ~4KB |

### Success criteria

- 30%+ reduction in average context tokens per session
- No functional regression (agent still gets context when needed)
- Clear log of what was loaded and why

### Effort: 2 days

---

## Feature 2: Evaluator framework upgrade

### Problem

Our current `evals/certify.py` runs delegation tests (does the orchestrator route correctly?) but doesn't score output quality, compare models, or run batch evaluations. AI-DLC's evaluator is more comprehensive.

### Design

Adopt a Python evaluator inspired by AI-DLC's structure:

```text
evals/
├── certify.py              → existing (keep)
├── evaluator/
│   ├── pyproject.toml      → uv-managed Python project
│   ├── config/
│   │   ├── default.yaml    → base eval config
│   │   └── fast.yaml       → quick smoke test config
│   ├── test_cases/
│   │   ├── delegation/     → existing scenarios (migrated)
│   │   ├── quality/        → output quality scoring
│   │   └── compliance/     → steering rule adherence
│   ├── packages/
│   │   ├── execution/      → run agent sessions
│   │   ├── scoring/        → score outputs against criteria
│   │   └── reporting/      → generate comparison reports
│   └── run.py              → CLI entry point
```

### Scoring dimensions (from AI-DLC, adapted)

| Dimension | What it measures |
|-----------|-----------------|
| Delegation accuracy | Correct agent selected for task |
| Phase compliance | Correct SDLC phases followed |
| Gate adherence | Gates not skipped |
| Output quality | Actionable, complete, no hallucinations |
| Context efficiency | Tokens used vs minimum needed |
| Tool discipline | No forbidden tools called |

### Implementation

1. Create `evals/evaluator/` as a uv-managed Python project
2. Migrate existing delegation scenarios to `test_cases/delegation/`
3. Add quality test cases: "given this ticket, does the agent produce a valid plan?"
4. Add compliance test cases: "does the agent follow the SDLC workflow?"
5. Scoring uses Bedrock/Claude to evaluate outputs (LLM-as-judge)
6. Reports generated as markdown + JSON for CI integration
7. `make eval` and `make eval-fast` Makefile targets

### Files to change

- `evals/evaluator/` — new Python package
- `Makefile` — add `eval`, `eval-fast`, `eval-report` targets
- `evals/certify.py` — keep as lightweight delegation-only check

### Success criteria

- Can evaluate all 3 dimensions (delegation + quality + compliance)
- Batch evaluation across multiple test cases
- Report comparing before/after changes
- Runs in under 5 minutes for `eval-fast`

### Effort: 3-4 days

---

## Feature 3: Content validation pre-write hook

### Problem

Agents sometimes write malformed markdown: broken Mermaid diagrams, unclosed code blocks, tables with misaligned columns, or files without trailing newlines. We catch this post-hoc with `lint-on-write.sh` but don't prevent it.

### Design

A `preToolUse` hook on `fs_write` and `fs_create` that validates the content before it hits disk.

### Validation rules

| Check | Action on failure |
|-------|-------------------|
| Mermaid blocks parse (basic syntax) | Reject write, return error to agent |
| Code blocks have language identifier | Warn (allow write, log warning) |
| Markdown tables have aligned pipes | Auto-fix (pad columns) |
| File ends with single newline | Auto-fix |
| No trailing whitespace | Auto-fix |
| JSON files parse correctly | Reject write |
| YAML files parse correctly | Reject write |

### Implementation

1. `shared/hooks/validate-content.sh` — the pre-write hook
2. Uses `python3 -c` for JSON/YAML validation (available everywhere)
3. Mermaid validation: regex check for common errors (unclosed blocks, invalid node syntax)
4. Table auto-fix: awk script to pad pipe columns
5. Register in `orchestrator.json` and all agents that write files

### Hook signature

```json
{
  "matcher": "fs_write|fs_create",
  "command": "$HOME/.forge/hooks/validate-content.sh",
  "description": "Validate markdown, JSON, YAML before writing"
}
```

### Files to change

- `shared/hooks/validate-content.sh` — new hook
- Agent JSONs — add to `preToolUse` (or register globally)
- `docs/reference/HOOKS_AND_POWERS.md` — document

### Success criteria

- Zero broken Mermaid diagrams in written files
- Zero malformed JSON/YAML writes
- Tables auto-formatted on write
- No measurable latency impact (<100ms per write)

### Effort: 1 day

---

## Feature 4: Session state file (lightweight memory)

### Problem

Teams without yax MCP have no session continuity. If the agent session resets, all context about the current task (which phase, what was decided, what gates passed) is lost.

### Design

The orchestrator writes a `.forge/session-state.md` file tracking current progress. On session start, it reads this file to resume.

```markdown
# Session state

## Current task

- Ticket: PROJ-1234
- Strategy: propose-judge
- Phase: implement (3/7)
- Started: 2026-07-15T10:00:00

## Decisions

- Gate 0: Approved Option B (Redis sliding window)
- Gate 1: Plan approved (5 tasks)

## Progress

- [x] Analyze
- [x] Propose
- [x] Plan
- [ ] Implement (task 3/5 in progress)
- [ ] Judge
- [ ] Ship

## Context

- Branch: feature/PROJ-1234-rate-limiting
- Files modified: src/middleware/rateLimit.ts, src/config/redis.ts
```

### Implementation

1. Orchestrator steering update — "At each phase transition, write/update `.forge/session-state.md`"
2. On session start — "Check if `.forge/session-state.md` exists. If so, read it and resume from the recorded phase."
3. On task completion — "Clear session-state.md or mark as completed"
4. Exclude from git (add to `.gitignore` template)

### Files to change

- `profiles/dev-core/prompts/orchestrator.md` — add session state instructions
- `shared/steering/session-state.md` — steering rule for the pattern
- `common/templates/gitignore-additions.md` — add `.forge/session-state.md`

### Success criteria

- Agent resumes from correct phase after session reset
- No duplicate work on resume (doesn't re-run completed phases)
- Works without yax or any MCP dependency

### Effort: 0.5 days (prompt-only change)

---

## Feature 5: Design review pre-push hook

### Problem

The `code_review_agent` reviews PRs after creation. But there's no verification that the implementation matches the plan that was approved at Gate 1. Design drift happens silently.

### Design

A `pre-push` git hook that compares the diff against the session's approved plan and flags mismatches.

### Implementation

1. `shared/hooks/design-review-pre-push.sh` — git pre-push hook
2. Reads the approved plan from `.forge/session-state.md` (or yax if available)
3. Gets the staged diff (`git diff --cached --stat`)
4. Quick heuristic checks:
   - Files modified match planned files?
   - No unplanned files added?
   - Planned test files exist?
5. If mismatches found: print warning (non-blocking) with "These files weren't in the plan: ..."
6. Agent-assisted mode: if running in Koda, delegate to `code_review_agent` for deep comparison

### Lightweight check (no AI needed)

```bash
# Compare planned files vs actual changed files
PLANNED=$(grep "^- " .forge/session-state.md | grep -o '[^ ]*\.[a-z]*')
ACTUAL=$(git diff --cached --name-only)
UNPLANNED=$(comm -13 <(echo "$PLANNED" | sort) <(echo "$ACTUAL" | sort))
if [ -n "$UNPLANNED" ]; then
  echo "⚠️  Files not in plan: $UNPLANNED"
fi
```

### Files to change

- `shared/hooks/design-review-pre-push.sh` — new hook
- `.githooks/pre-push` template — wire up the hook
- `docs/reference/HOOKS_AND_POWERS.md` — document

### Success criteria

- Warns when implementation diverges from approved plan
- Does not block pushes (warning only)
- Works without AI (pure shell heuristic)
- Optional deep mode via agent delegation

### Effort: 1 day

---

## Feature 6: Adaptive output depth

### Problem

The agent produces the same level of detail for every task. A one-line config change gets a 50-line plan. A complex architecture refactor gets a terse 3-bullet plan.

### Design

Add depth calibration to the orchestrator's SDLC workflow. The orchestrator assesses task complexity and adjusts output depth accordingly.

### Depth levels

| Level | Trigger | Plan detail | Implementation detail |
|-------|---------|-------------|----------------------|
| Minimal | Config change, typo fix, version bump | 1-2 sentences | Direct implementation, no plan gate |
| Standard | Bug fix, small feature, routine CRUD | 3-5 bullet plan | Normal SDLC flow |
| Detailed | Multi-file feature, new pattern, 3+ layers | Full plan with file list + test strategy | Full SDLC + quality gate |
| Comprehensive | Architecture change, new service, migration | Plan + alternatives + risk assessment | Propose-judge strategy |

### Auto-detection rules

```markdown
## Depth calibration

Before planning, assess complexity:

- **Minimal** (skip plan gate): single file, <10 lines changed, no new dependencies, no tests needed
- **Standard** (default): 2-5 files, clear single approach, tests needed
- **Detailed**: 5+ files, new patterns, cross-layer changes
- **Comprehensive**: auto-selects propose-judge strategy (already handled)

Announce your depth: "Depth: standard (3 files, clear approach)"
```

### Implementation

1. Add depth calibration section to `shared/context/sdlc-workflow.md`
2. Update orchestrator prompt with depth rules
3. Allow user override: "use detailed depth" or "keep it short"

### Files to change

- `shared/context/sdlc-workflow.md` — add depth calibration section
- `profiles/dev-core/prompts/orchestrator.md` — reference depth rules

### Success criteria

- Config changes get 1-line plans (not 50-line plans)
- Complex tasks get proportionally detailed output
- User can override depth explicitly
- No new tokens used (just prompt instruction)

### Effort: 0.5 days (prompt-only change)

---

## Rollout plan

| Phase | Features | Effort | Risk |
|-------|----------|:------:|:----:|
| Week 1 | #4 Session state + #6 Depth calibration | 1 day | Low (prompt-only) |
| Week 1 | #3 Content validation hook | 1 day | Low (additive hook) |
| Week 2 | #1 Extension opt-in | 2 days | Medium (changes context loading) |
| Week 2 | #5 Design review hook | 1 day | Low (warning only, non-blocking) |
| Week 3-4 | #2 Evaluator framework | 3-4 days | Low (new package, no changes to existing) |

**Total effort: ~8-9 days**

---

## Dependencies

| Feature | Requires |
|---------|----------|
| #1 Extension opt-in | Koda change (hook or materialization update) |
| #2 Evaluator | Python 3.11+, uv, Bedrock access (for LLM-as-judge) |
| #3 Content validation | python3 available on system (for JSON/YAML parse) |
| #4 Session state | No dependencies (prompt-only) |
| #5 Design review | git hooks, session-state.md from #4 |
| #6 Depth calibration | No dependencies (prompt-only) |

---

## Metrics

After implementation, measure:

- Context tokens per session (target: -30% from #1)
- Broken file writes (target: 0 from #3)
- Session resume success rate (target: >90% from #4)
- Plan-to-implementation drift (target: flagged >80% of cases from #5)
- User satisfaction with output length (qualitative from #6)
- Eval coverage (target: 3 dimensions, 50+ test cases from #2)
