# Spec: orchestration, harness, and context improvements

**Repo**: steer-runtime
**Epics**: E1, E2, E4, E7, E8, E10, E12, E13, E14
**Estimated points**: 95 (of 171 total across all repos)
**Dependencies**: None (this repo has no code dependencies on Koda or steer-autopilot)

---

## E1: Conditional context loading (13 pts)

### Problem

All 20 files in `shared/context/` load unconditionally for every agent session. The two estimation files alone are 67KB — loaded even when no estimation is needed. This wastes context window budget and reduces space for actual conversation.

### Design

Extend the `resources` array in agent JSON to accept both strings (backward-compatible) and objects with conditional loading rules.

#### Schema extension

```json
{
  "resources": [
    "file://.kiro/context/golden_rules.md",
    {
      "path": "file://.kiro/context/ccv-estimation.md",
      "when": "task_contains:estimate|estimation|story points|sizing|ccv",
      "priority": "low"
    }
  ]
}
```

#### `when` operators

| Operator                    | Semantics                                                  |
|-----------------------------|------------------------------------------------------------|
| `always`                    | Default. Load unconditionally.                             |
| `task_contains:<pattern>`   | Load if user's first message matches regex pattern.        |
| `agent_is:<glob>`           | Load if the spawning agent's name matches the glob.        |
| `profile_is:<name>`         | Load if the agent belongs to the named profile.            |

#### `priority` values

| Value      | Behavior during context compaction                |
|------------|---------------------------------------------------|
| `critical` | Never compressed or dropped.                      |
| `high`     | Summarized only under extreme pressure.           |
| `normal`   | Default. Summarized when context is tight.        |
| `low`      | Dropped first when context budget is exceeded.    |

#### File classification (20 files)

| File                        | Size   | Condition                                                    |
|-----------------------------|--------|--------------------------------------------------------------|
| `golden_rules.md`           | 4.8KB  | `always`, priority `critical`                                |
| `project_mappings.md`       | 5.3KB  | `always`, priority `critical`                                |
| `mcp_priority.md`           | 2.1KB  | `always`, priority `high`                                    |
| `ccv-estimation.md`         | 34KB   | `task_contains:estimate\|story points\|sizing\|ccv`          |
| `drift-estimation.md`       | 33KB   | `task_contains:drift\|token cost\|token budget`              |
| `splunk_indexes.md`         | 1.1KB  | `agent_is:splunk_*\|log_*`                                   |
| `servicenow_reference.md`   | 2.1KB  | `agent_is:log_*\|ops_*`                                      |
| `test_templates.md`         | 2.6KB  | `profile_is:qa`                                              |
| `api_test_patterns.md`      | 1.7KB  | `profile_is:qa`                                              |
| `defect_templates.md`       | 1.0KB  | `profile_is:qa`                                              |
| `story_templates.md`        | 1.5KB  | `profile_is:ba`                                              |
| `pm_guidelines.md`          | 1.1KB  | `profile_is:pm`                                              |
| `ops_guidelines.md`         | 1.0KB  | `profile_is:ops`                                             |
| `api_standards.md`          | 792B   | `always`                                                     |
| `performance_patterns.md`   | 1.4KB  | `always`                                                     |
| `automation_patterns.md`    | 2.3KB  | `always`                                                     |
| `vista_web_components.md`   | 2.5KB  | `always`                                                     |
| `domain_glossary.md`        | 674B   | `always`                                                     |
| `enterprise_architecture.md`| 436B   | `always`                                                     |
| `email_guidelines.md`       | 1.2KB  | `always`                                                     |

#### Impact

- Non-estimation tasks save ~67KB of context
- Non-QA tasks save ~5.3KB additional
- Non-ops tasks save ~3.2KB additional

### Files to create/modify

| File                                                    | Action  |
|---------------------------------------------------------|---------|
| `common/schemas/agent.schema.json`                      | Create  |
| `shared/memory-bank/steer-master/schema-inventory.md`   | Update  |
| `profiles/steer-master/context/agent_schema.md`         | Update  |
| `profiles/dev-core/agents/orchestrator.json`            | Modify  |
| All agents referencing conditional context              | Modify  |
| `profiles/steer-master/agents/schema_validator_agent.json` | Update |

### Backward compatibility

String entries in `resources` remain unchanged. The object format is purely additive. If kiro-cli does not support `when` conditions, Koda can pre-resolve them before passing to kiro-cli (fallback strategy).

---

## E2: Structured context compression (8 pts)

### Problem

`agent-registry.sh` outputs ~3KB of formatted markdown every session. Most of it (full agent descriptions, MCP server list) is only needed during delegation decisions. Several always-loaded context files use verbose prose that could be 2-3x denser.

### Design

#### 2.1: Two-tier agent-registry output

Split `agent-registry.sh` into compact stdout (injected into context) and full detail (written to file for on-demand loading).

Compact output (~500 bytes):
```text
## System
Profiles: dev-core(20), dev-web(5), qa(14), ops(9), ba(7), pm(6), inspector(10), ...
Agents: 124 installed. Default: orchestrator. Workspace: app-team.
RAM: 32GB (standard). Max concurrent: 4.
```

Full output written to `~/.kiro/context/_dynamic/agent-registry-full.md` — loaded as a `low` priority conditional resource by orchestrators.

#### 2.2: Compress always-loaded context files

| File                        | Current | Target | Method                    |
|-----------------------------|---------|--------|---------------------------|
| `email_guidelines.md`       | 1.2KB   | ~400B  | Bullet points             |
| `ops_guidelines.md`         | 1.0KB   | ~400B  | Bullet points             |
| `domain_glossary.md`        | 674B    | ~400B  | Compact table             |
| `enterprise_architecture.md`| 436B    | ~300B  | Compact table             |
| `api_standards.md`          | 792B    | ~400B  | Bullet points             |

### Files to create/modify

| File                                | Action  |
|-------------------------------------|---------|
| `shared/hooks/agent-registry.sh`    | Modify  |
| `shared/hooks/agent-registry.ps1`   | Modify  |
| `shared/context/email_guidelines.md`| Rewrite |
| `shared/context/ops_guidelines.md`  | Rewrite |
| `shared/context/domain_glossary.md` | Rewrite |
| `shared/context/enterprise_architecture.md` | Rewrite |
| `shared/context/api_standards.md`   | Rewrite |

### Backward compatibility

Same files, same paths, denser content. No schema change. No downstream impact.

---

## E4: Extended hook lifecycle (10 pts — steer-runtime portion: 8 pts)

### Problem

Only 3 hook events exist: `agentSpawn`, `preToolUse`, `postToolUse`. There's no way to run cleanup, emit metrics, or update memory when a session ends. The feedback loop is broken — hooks inject context but never update state based on outcomes.

### Design

Add 3 new lifecycle events to the agent JSON `hooks` schema:

| Event          | Trigger                        | Stdin payload                                                    |
|----------------|--------------------------------|------------------------------------------------------------------|
| `agentComplete`| Session ends successfully      | `{ "agent", "sessionId", "duration_ms", "tool_calls", "context_usage_pct" }` |
| `agentFailed`  | Session ends with error        | `{ "agent", "sessionId", "error", "duration_ms", "last_tool" }` |
| `agentTimeout` | Session exceeds timeout        | `{ "agent", "sessionId", "duration_ms", "timeout_ms" }`         |

#### New hooks

**`session-summary.sh`** — fires on `agentComplete`. Appends JSONL to `~/.kiro/logs/session-history.jsonl`. Rotates at 1MB.

**`memory-bank-update.sh`** — fires on `agentComplete`. Updates `active-context.md` with last session timestamp if session >60s and >5 tool calls. Append-only, trims entries >7 days.

### Files to create/modify

| File                                                    | Action  |
|---------------------------------------------------------|---------|
| `shared/memory-bank/steer-master/schema-inventory.md`   | Update  |
| `profiles/steer-master/context/agent_schema.md`         | Update  |
| `shared/hooks/session-summary.sh`                       | Create  |
| `shared/hooks/session-summary.ps1`                      | Create  |
| `shared/hooks/memory-bank-update.sh`                    | Create  |
| `shared/hooks/memory-bank-update.ps1`                   | Create  |

### Backward compatibility

New optional keys in `hooks` object. Existing agents without them are unaffected. Hook exit code convention unchanged (0 = allow, 2 = block).

---

## E7: Orchestrator prompt decomposition (20 pts)

### Problem

12 orchestrators have inline routing tables, rules, and (3 of them) SDLC workflows. Total: 1,613 lines. Shared rules are duplicated across 8-9 of them (~610 lines of duplication). Routing tables go stale when agents are added or renamed.

### Design

Extract shared content into 3 reusable files + 1 auto-generated hook output. Each orchestrator retains its unique identity and domain-specific rules.

#### Shared files

**`shared/context/orchestrator_rules.md`** (~80 lines, priority `critical`):

1. Delegation mandate (~15 lines) — always delegate via `subagent`, never do specialist work
2. Yax persistent memory (~45 lines) — session lifecycle, auto-save triggers, retrieve-first, no secrets/PII
3. Protected files (~10 lines) — require user approval for modifications
4. Instance routing (~10 lines) — Confluence vs MyWiki, email confirmation

**`shared/context/sdlc-workflow.md`** (~60 lines, conditional: `agent_is:orchestrator|steer_orchestrator*|qa_orchestrator*`):

- 5-phase SDLC workflow (Analyze → Plan → Gate → Implement → Quality → Gate → Ship)
- Gate definitions, phase-to-agent mappings
- Resource-aware strategy tiers (light/standard/power)

**`shared/hooks/delegation-map.sh`** — fires on `agentSpawn` for orchestrators:

- Reads `~/.kiro/agents/*.json`
- Groups by profile, outputs per-profile agent table + cross-profile appendix
- Writes full map to `~/.kiro/context/_dynamic/delegation-map.md`
- Compact summary injected via stdout

#### Decomposition waves

| Wave | Orchestrators                                              | Validation                    |
|------|------------------------------------------------------------|-------------------------------|
| 1    | dev-core (398→≤150 lines)                                  | 3 tasks + SDLC workflow test  |
| 2    | steer-master (302→≤180), qa (142→≤100)                     | 3 tasks each                  |
| 3    | ops, sustainment, pm, ba, leadership, inspector, cloudops, design, dev-ai | 3 tasks each    |

#### Per-orchestrator: what stays vs. what's extracted

| Orchestrator   | Stays (domain-specific)                                                                    | Extracted (shared)                    |
|----------------|--------------------------------------------------------------------------------------------|---------------------------------------|
| dev-core       | 14-category intent classification, URL pre-classification, resource-aware tiers            | yax, delegation, protected files, SDLC |
| steer-master   | Breaking change rules, fork classification, agent creation workflow                        | yax, delegation, protected files, SDLC |
| qa             | qTest rules, quality gate review, web scraping/time machine workflows                     | yax, delegation, protected files, SDLC |
| ops            | ServiceNow prefix routing (9 prefixes), Compass MCP, release workflow                     | yax, delegation, protected files       |
| sustainment    | Severity classification, P1/P2 escalation, incident/CTASK workflows                      | yax, delegation, protected files       |
| pm             | Sprint/standup/retro delegation specifics                                                  | yax, delegation, protected files       |
| ba             | Estimation modes (CCV/DRIFT), translation validation                                      | yax, delegation, protected files       |
| leadership     | Workspace teams first, cross-team side-by-side, actionable recommendations                | yax, delegation, protected files       |
| inspector      | FindingSet schema, deduplication, scoring, report writing, max 3 concurrent               | delegation, protected files (own yax)  |
| cloudops       | (already small — just add hook + shared rules reference)                                  | delegation, protected files            |
| design         | (already small — just add hook + shared rules reference)                                  | delegation, protected files            |
| dev-ai         | (already small — just add hook + shared rules reference)                                  | delegation, protected files            |

### Files to create/modify

| File                                              | Action  |
|---------------------------------------------------|---------|
| `shared/context/orchestrator_rules.md`            | Create  |
| `shared/context/sdlc-workflow.md`                 | Create  |
| `shared/hooks/delegation-map.sh`                  | Create  |
| `shared/hooks/delegation-map.ps1`                 | Create  |
| All 12 orchestrator prompts                       | Modify  |
| All 12 orchestrator agent JSONs                   | Modify  |

### Backward compatibility

Same behavior, different structure. Routing tables auto-generated from actual registry eliminates stale tables. Fallback: if delegation-map hook fails, orchestrators use description-based matching (current behavior).

---

## E8: Token budgeting per context category (10 pts — steer-runtime portion: 6 pts)

### Problem

When kiro-cli compacts context, steer-runtime has no way to influence what gets preserved. System prompts and golden rules should never be compressed, while conversation history can be summarized aggressively.

### Design

New optional `contextBudget` field in agent JSON:

```json
{
  "contextBudget": {
    "system_prompt": 0.20,
    "resources": 0.20,
    "hooks": 0.10,
    "conversation": 0.40,
    "tools": 0.10
  }
}
```

Values are fractions of total context window. Must sum to ≤1.0. If kiro-cli doesn't support this field, it's ignored (advisory metadata).

#### Default budgets by role

| Role            | system_prompt | resources | hooks | conversation | tools |
|-----------------|:-------------:|:---------:|:-----:|:------------:|:-----:|
| Orchestrator    |     0.20      |   0.20    | 0.10  |     0.40     | 0.10  |
| Implementation  |     0.10      |   0.15    | 0.05  |     0.60     | 0.10  |
| Analysis        |     0.10      |   0.10    | 0.05  |     0.65     | 0.10  |

### Files to create/modify

| File                                                    | Action  |
|---------------------------------------------------------|---------|
| `shared/memory-bank/steer-master/schema-inventory.md`   | Update  |
| `profiles/steer-master/context/agent_schema.md`         | Update  |
| `profiles/dev-core/agents/orchestrator.json`            | Modify  |
| `profiles/dev-web/agents/backend.json`                  | Modify  |
| `profiles/dev-web/agents/ui.json`                       | Modify  |
| `profiles/dev-web/agents/webapi.json`                   | Modify  |

---

## E10: Structured observability (13 pts — steer-runtime portion: 5 pts)

### Problem

No structured telemetry exists. Session outcomes, durations, and tool usage are not tracked. No way to identify expensive agents or detect context pressure patterns.

### Design

New hook: `shared/hooks/telemetry-emit.sh` — fires on `agentComplete` and `agentFailed`.

Output format (JSONL to `~/.kiro/logs/telemetry.jsonl`):
```json
{"ts":"2026-05-09T12:00:00Z","event":"complete","agent":"backend","session_id":"abc","duration_ms":45000,"tool_calls":12,"ctx_pct":34}
```

Rotates at 5MB. Registered on key agents: orchestrator, backend, ui, webapi, story_analyzer, code_review, security_scanner.

### Files to create/modify

| File                                                    | Action  |
|---------------------------------------------------------|---------|
| `shared/hooks/telemetry-emit.sh`                        | Create  |
| `shared/hooks/telemetry-emit.ps1`                       | Create  |
| `profiles/dev-core/agents/orchestrator.json`            | Modify  |
| `profiles/dev-web/agents/backend.json`                  | Modify  |
| `profiles/dev-web/agents/ui.json`                       | Modify  |
| `profiles/dev-web/agents/webapi.json`                   | Modify  |
| `profiles/dev-core/agents/code_review_agent.json`       | Modify  |
| `profiles/dev-core/agents/security_scanner_agent.json`  | Modify  |

---

## E12: Hierarchical memory with auto-summarization (15 pts — steer-runtime portion: 7 pts)

### Problem

Memory bank files require manual updates. `active-context.md` goes stale. No automated mechanism keeps them in sync with actual project state.

### Design

New hook: `shared/hooks/session-to-memory.sh` — fires on `agentComplete`.

Behavior:
- Only triggers if session >60s AND >5 tool calls
- Appends timestamped markdown section to `active-context.md`
- Format: `### {date} — {agent}: {one-line summary}`
- Trims entries older than 7 days
- Validates existing file format before writing (never corrupts)

### Files to create/modify

| File                                    | Action  |
|-----------------------------------------|---------|
| `shared/hooks/session-to-memory.sh`     | Create  |
| `shared/hooks/session-to-memory.ps1`    | Create  |

---

## E13: RAG-based context retrieval (15 pts — steer-runtime portion: 5 pts)

### Problem

Large knowledge bases (estimation files, operational references) are rarely needed but always loaded. A retrieval approach would load only relevant chunks on demand.

### Design

New hook: `shared/hooks/context-retrieval.sh` — fires on `agentSpawn`.

Behavior:
- Reads user's first message from stdin
- Queries `~/.kiro/context/_index.json` (built by Koda at install time)
- Returns top-5 relevant chunks (max 4KB total)
- Falls back to full file loading if index missing
- `critical` priority resources always load fully regardless

### Files to create/modify

| File                                      | Action  |
|-------------------------------------------|---------|
| `shared/hooks/context-retrieval.sh`       | Create  |
| `shared/hooks/context-retrieval.ps1`      | Create  |

---

## E14: Dynamic tool injection by phase (13 pts — steer-runtime portion: 6 pts)

### Problem

Agents get all their tools for the entire session. A code review agent has write access even during the analysis phase. No least-privilege per task phase.

### Design

New optional `phases` field in agent JSON:

```json
{
  "phases": {
    "analyze": {
      "tools": ["read", "grep", "code"],
      "allowedTools": ["@jira/*"]
    },
    "implement": {
      "tools": ["read", "write", "shell"],
      "allowedTools": []
    },
    "verify": {
      "tools": ["shell"],
      "allowedTools": []
    }
  }
}
```

Phase activation: orchestrator includes `[PHASE:analyze]` marker in delegation prompt. If no phases defined, all tools available (backward compat).

### Files to create/modify

| File                                                    | Action  |
|---------------------------------------------------------|---------|
| `shared/memory-bank/steer-master/schema-inventory.md`   | Update  |
| `profiles/steer-master/context/agent_schema.md`         | Update  |
| `profiles/dev-core/prompts/orchestrator.md`             | Modify  |
| `profiles/dev-web/agents/backend.json`                  | Modify  |
| `profiles/dev-core/agents/code_review_agent.json`       | Modify  |
