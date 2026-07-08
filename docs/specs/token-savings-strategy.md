# Spec: token savings strategy

**Repo**: steer-runtime, Koda
**Status**: Draft
**Author**: Ricardo Sanchez
**Date**: 2026-07-06

---

## Problem

Every agent interaction consumes cloud API tokens. As steer-runtime scales (more agents, more teams, more sessions), token costs grow linearly. Current architecture sends every request — regardless of complexity — through expensive cloud models with full context loaded.

Key cost drivers today:

- Orchestrator spends tokens on routing decisions that are often deterministic
- All agents use the same model tier regardless of task complexity
- Full context loads unconditionally (partially addressed by E1 conditional loading)
- No caching layer for repeated or semantically similar queries
- Failed delegations retry with full token cost
- No budget enforcement per agent or session

---

## Goals

1. Reduce token consumption by 40–60% without degrading output quality
2. Maintain current UX — user should not notice the optimization layer
3. Preserve auditability — track which strategy saved tokens and by how much
4. Incremental adoption — each strategy is independent and can ship separately

---

## Strategy overview

| #  | Strategy                        | Layer     | Savings estimate | Complexity | Priority |
|:--:|:--------------------------------|:----------|:----------------:|:----------:|:--------:|
| S1 | Deterministic routing shortcuts | Routing   |      15–20%      |    Low     |    P0    |
| S2 | Local model for intent classification | Model |   10–15%      |    Med     |    P0    |
| S3 | Agent-level model tiering       | Model     |      20–30%      |    Med     |    P1    |
| S4 | Prompt caching (Anthropic)      | Infra     |      10–15%      |    Low     |    P1    |
| S5 | Response caching (yax)          | Output    |       5–10%      |    Low     |    P1    |
| S6 | Context compression             | Context   |      10–20%      |    Med     |    P2    |
| S7 | Token budget enforcement        | Infra     |       5–10%      |    Low     |    P2    |
| S8 | Prompt scorer / rejection gate  | Routing   |       5–10%      |    Med     |    P2    |
| S9 | On-demand resource loading (README index) | Context | 10–15% |    Low     |    P0    |
| S10 | Orchestrator tool surface reduction | Routing |    5–10%      |    Low     |    P1    |

---

## S1: Deterministic routing shortcuts

### Problem

The orchestrator burns a full LLM call (2K–5K input tokens + 500 output tokens) to decide "this Jira URL should go to story_analyzer_agent" — a decision that regex can make in 0 tokens.

### Design

Add a pre-LLM routing layer in Koda that pattern-matches common intents before spawning the orchestrator.

```text
User input → Pattern matcher → Match found? → Direct agent spawn (skip orchestrator)
                                    ↓ No match
                              Orchestrator (full LLM call)
```

#### Pattern rules (`.kiro/routing-rules.json`)

```json
{
  "rules": [
    {
      "name": "jira_url",
      "pattern": "https?://(disneyexperiences\\.atlassian\\.net|jira\\.disney\\.com|myjira\\.disney\\.com)",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and analyze: {url}",
      "confidence": "high"
    },
    {
      "name": "wiki_url",
      "pattern": "https?://(disneyexperiences\\.atlassian\\.net/wiki|mywiki\\.disney\\.com|confluence\\.disney\\.com)",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and summarize this Confluence page: {url}",
      "confidence": "high"
    },
    {
      "name": "ticket_key",
      "pattern": "^[A-Z]{2,10}-\\d{1,6}$",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and analyze Jira ticket: {match}",
      "confidence": "high"
    },
    {
      "name": "create_pr",
      "pattern": "create (a )?pr|create (a )?pull request|open (a )?pr",
      "agent": "pr_creator_agent",
      "confidence": "medium"
    }
  ],
  "fallback": "orchestrator",
  "confidence_threshold": "medium"
}
```

#### Behavior

- `high` confidence: skip orchestrator entirely, spawn agent directly
- `medium` confidence: skip orchestrator but pass full user message as context (agent decides scope)
- `low` confidence or no match: fall through to orchestrator

#### Metrics

- Log every shortcut hit: `{rule_name, agent, tokens_saved_estimate, timestamp}`
- Compare shortcut accuracy against orchestrator decisions in harness tests

### Implementation

- **Koda side**: Add routing-rules engine before agent spawn logic
- **steer-runtime side**: Define and maintain `routing-rules.json` per workspace/profile

---

## S2: Local model for intent classification

### Problem

When deterministic patterns don't match, the full orchestrator prompt (3K+ tokens system prompt + context) loads to classify intent. A local model could classify intent at zero API cost for most requests.

### Design

Run a lightweight local model (Phi-3-mini, Llama-3.2-1B, or similar) as an intent classifier.

```text
User input → Local classifier → {agent: "...", confidence: 0.92}
                                    ↓ confidence < threshold
                              Orchestrator (cloud LLM)
```

#### Classification output schema

```json
{
  "intent": "read_wiki_page",
  "agent": "story_analyzer_agent",
  "confidence": 0.94,
  "extracted_entities": {
    "url": "https://disneyexperiences.atlassian.net/wiki/..."
  }
}
```

#### Training / fine-tuning approach

1. Collect orchestrator delegation logs from yax/harness (input → agent routed to)
2. Build classification dataset (500–1000 examples from real usage)
3. Fine-tune local model on: `user_message → {intent, agent}`
4. Deploy as local inference (Ollama, llama.cpp, or MLX on macOS)

#### Confidence threshold

- ≥ 0.85: route directly to classified agent
- 0.60–0.84: route to agent but inject "verify this is what the user wants" instruction
- < 0.60: fall through to cloud orchestrator

#### Fallback guarantees

- If local model is unavailable (not running, crashed): fall through to orchestrator transparently
- If local model latency > 2s: skip and use orchestrator
- Never block on local model — treat as best-effort optimization

### Implementation

- **Koda side**: Add local inference client (Ollama API or direct llama.cpp binding)
- **steer-runtime side**: Provide training data pipeline from harness/yax logs
- **Config**: `~/.kiro/config.json` → `"localModel": {"enabled": true, "endpoint": "http://localhost:11434", "model": "phi3:mini"}`

---

## S3: Agent-level model tiering

### Problem

All agents currently use the same model (e.g., Claude Sonnet). But `story_analyzer_agent` (fetch URL + summarize) doesn't need the same reasoning power as `architecture_agent` (complex design decisions).

### Design

Add a `model` field to agent JSON configuration:

```json
{
  "name": "story_analyzer_agent",
  "model": "fast",
  "description": "Fetches and analyzes Jira stories..."
}
```

#### Tier definitions (`.kiro/model-tiers.json`)

```json
{
  "tiers": {
    "fast": {
      "provider": "anthropic",
      "model": "claude-haiku",
      "max_tokens": 2048,
      "use_cases": "Fetch + summarize, simple formatting, slot extraction"
    },
    "standard": {
      "provider": "anthropic",
      "model": "claude-sonnet",
      "max_tokens": 4096,
      "use_cases": "Code review, test generation, planning"
    },
    "powerful": {
      "provider": "anthropic",
      "model": "claude-sonnet",
      "max_tokens": 8192,
      "use_cases": "Architecture, complex multi-file implementation"
    },
    "local": {
      "provider": "ollama",
      "model": "codellama:13b",
      "max_tokens": 4096,
      "use_cases": "Code completion, simple refactors, formatting"
    }
  }
}
```

#### Suggested agent-to-tier mapping

| Agent                    | Tier       | Rationale                                    |
|:-------------------------|:-----------|:---------------------------------------------|
| `story_analyzer_agent`   | `fast`     | Fetch + summarize, no complex reasoning      |
| `codebase_explorer_agent`| `fast`     | File discovery, pattern matching             |
| `devops_runner_agent`    | `fast`     | Execute commands, report results             |
| `code_review_agent`      | `standard` | Needs reasoning about code quality           |
| `planner_agent`          | `standard` | Task decomposition, dependency analysis      |
| `test_runner_agent`      | `fast`     | Run commands, parse output                   |
| `pr_creator_agent`       | `fast`     | Templated output, formatting                 |
| `architecture_agent`     | `powerful` | Complex design decisions                     |
| `backend` / `ui` / `webapi` | `standard` | Code generation needs quality reasoning  |
| `orchestrator`           | `standard` | Routing (or replaced by S1/S2)               |

#### Override behavior

- User can override per-session: `"use powerful model for this"`
- If fast model produces low-quality output (detected by scorer), auto-escalate to next tier
- Workspace-level overrides in workspace JSON

### Implementation

- **Koda side**: Read `model` field from agent JSON, resolve tier, select provider/model
- **steer-runtime side**: Add `model` field to agent configs, maintain tier definitions

---

## S4: Prompt caching (Anthropic)

### Problem

The orchestrator's system prompt (~3K tokens) and agent prompts are sent identically on every call. Anthropic charges full input token price each time.

### Design

Leverage Anthropic's prompt caching feature:

- System prompts marked with `cache_control: {"type": "ephemeral"}`
- First call pays full price + cache write cost
- Subsequent calls (within 5-min TTL) pay 90% less for cached portions

#### What to cache

| Content                  | Size    | Cache benefit |
|:-------------------------|:--------|:--------------|
| Orchestrator system prompt | ~3K tokens | High — called every session |
| Agent base prompts       | 1–3K tokens | High — stable between deploys |
| Shared context files (`golden_rules.md`, etc.) | 2–5K tokens | Medium — loaded frequently |
| Steering files           | Variable | Low — changes often |

#### Implementation

- **Koda side**: Add `cache_control` markers to system message blocks when calling Anthropic API
- **steer-runtime side**: No changes needed — caching is transparent at API layer
- **Config**: Enable/disable in Koda config. Default: enabled for Anthropic provider

---

## S5: Response caching (yax)

### Problem

Users ask semantically equivalent questions across sessions. "What agents are available?" or "what does story_analyzer do?" produces the same answer every time until a deploy changes things.

### Design

Before calling the LLM, check yax for a cached response:

```text
User input → Semantic hash → yax lookup → Cache hit? → Return cached response
                                              ↓ No
                                         LLM call → Cache response in yax
```

#### Cache key strategy

- Hash: normalized user message + agent name + relevant context version
- TTL: configurable per agent (default: 24h for informational, 0 for action-based)
- Invalidation: on steer-runtime deploy, clear cache for affected agents

#### What to cache vs not

| Cacheable                          | NOT cacheable                       |
|:-----------------------------------|:------------------------------------|
| "What agents are available?"       | "Implement DPAY-1234"               |
| "What tools does X agent have?"    | "Create a PR for my changes"        |
| "Summarize page X" (if unchanged) | "Review this code" (code changes)   |
| Agent registry queries             | Any write/mutation operation         |

### Implementation

- **Koda side**: Add cache-check hook before LLM call
- **steer-runtime side**: Define cacheability rules per agent
- **yax side**: Add `type: "cache"` observation type with TTL support

---

## S6: Context compression

### Problem

Long conversations accumulate context. After 10 turns, early turns consume tokens but rarely contribute to the current task.

### Design

Implement rolling context compression:

- After N turns (configurable, default: 6), summarize turns 1 through N-2 into a compressed block
- Keep last 2 turns verbatim for continuity
- Compression done by a local model (S2 infrastructure) or cheap cloud tier

```text
Turn 1: [full] ──┐
Turn 2: [full]   ├── Compress into ~200 token summary
Turn 3: [full] ──┘
Turn 4: [full]         ← Keep verbatim
Turn 5: [full]         ← Keep verbatim (current)
```

#### Compression rules

- Preserve: decisions made, file paths mentioned, ticket IDs, tool outputs
- Discard: exploratory discussion, rejected approaches, verbose explanations
- Format: structured summary with bullet points

### Implementation

- **Koda side**: Add compression hook triggered by turn count or token count threshold
- Reuse local model from S2 for compression (zero API cost)

---

## S7: Token budget enforcement

### Problem

Some agents generate unnecessarily verbose responses. `story_analyzer_agent` might return 2000 tokens when 500 would suffice.

### Design

Add `max_tokens` to agent JSON:

```json
{
  "name": "story_analyzer_agent",
  "model": "fast",
  "max_tokens": 1024,
  "budget": {
    "input_warning": 8000,
    "input_hard_limit": 16000
  }
}
```

#### Behavior

- `max_tokens`: passed directly to API call, hard caps output
- `input_warning`: log warning if input exceeds this (context too large)
- `input_hard_limit`: trigger context compression before calling API

#### Session-level budget

```json
{
  "session_budget": {
    "max_total_tokens": 100000,
    "warn_at": 80000,
    "action_at_limit": "compress_and_continue"
  }
}
```

### Implementation

- **Koda side**: Enforce limits at API call layer, add telemetry
- **steer-runtime side**: Add budget fields to agent JSON configs

---

## S8: Prompt scorer / rejection gate

### Problem

Users sometimes send vague, overly broad, or inefficient requests that burn tokens on clarification loops. A pre-check could catch these before they hit the expensive model.

### Design

Score incoming prompts on actionability before routing:

```text
User input → Scorer (local) → Score < threshold? → Ask for clarification (cheap)
                                    ↓ Pass
                              Route to agent (full cost)
```

#### Scoring dimensions

| Dimension      | Weight | Example of low score                     |
|:---------------|:------:|:-----------------------------------------|
| Specificity    |  0.3   | "help me with my code"                   |
| Actionability  |  0.3   | "what do you think about microservices?"  |
| Completeness   |  0.2   | "create a ticket" (no details)           |
| Scope          |  0.2   | "refactor everything"                    |

#### Thresholds

- Score ≥ 0.7: route normally
- Score 0.4–0.7: route but inject "ask for clarification if needed" instruction
- Score < 0.4: respond with a clarification template (no LLM call)

#### Clarification templates

Pre-built responses for common low-score patterns — served without LLM cost:
- "What ticket/URL are you referring to?"
- "Which repo/service should I focus on?"
- "Can you describe the specific behavior you want?"

### Implementation

- **Koda side**: Add scorer in pre-routing pipeline (reuse local model from S2)
- **steer-runtime side**: Define scoring rules and clarification templates

---

---

## Implementation phases

### Phase 1 — Zero-risk quick wins (Weeks 1–2)

**Goal**: 25% token cost reduction with zero quality risk and zero behavior change.

**Strategies**: S1 (Deterministic routing) + S4 (Prompt caching) + S7 (Budget enforcement)

#### Week 1: Telemetry baseline + prompt caching

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
|  1  | Add token telemetry to Koda API call layer             | Koda       | Per-call logging: agent, tokens in/out, model, duration |
|  2  | Instrument orchestrator calls separately               | Koda       | Tag routing calls vs delegation calls in logs |
|  3  | Implement prompt caching (`cache_control` markers)     | Koda       | System prompts + agent prompts marked cacheable |
|  4  | Deploy telemetry + caching to dev                      | Koda       | Baseline metrics collection begins  |
|  5  | Analyze 1-week baseline: tokens by agent, by call type | Both       | Baseline report with actual cost breakdown |

**Prompt caching implementation detail:**

```go
// Koda: when building Anthropic API request
func buildMessages(agent Agent, userMsg string) []Message {
    return []Message{
        {
            Role:    "system",
            Content: agent.SystemPrompt,
            CacheControl: &CacheControl{Type: "ephemeral"}, // ← add this
        },
        // ... conversation turns
    }
}
```

**Telemetry schema:**

```json
{
  "session_id": "uuid",
  "timestamp": "ISO-8601",
  "call_type": "routing | delegation | continuation",
  "agent": "orchestrator",
  "model": "claude-sonnet-4-20250514",
  "input_tokens": 4200,
  "output_tokens": 680,
  "cache_read_tokens": 3100,
  "cache_write_tokens": 0,
  "latency_ms": 2340,
  "shortcut_hit": false,
  "shortcut_rule": null
}
```

#### Week 2: Deterministic routing + budget caps

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
|  1  | Define `routing-rules.json` schema + initial rules     | steer-rt   | 8–10 rules covering URL patterns, ticket keys, common commands |
|  2  | Implement routing engine in Koda pre-spawn pipeline    | Koda       | Pattern match → direct agent spawn, bypass orchestrator |
|  3  | Add confidence levels + fallback behavior              | Koda       | high/medium/low routing with orchestrator fallback |
|  4  | Add `max_tokens` to agent JSON schema + set initial budgets | Both  | Budget field in schema, conservative limits on 5 agents |
|  5  | Harness validation: compare shortcut routing vs orchestrator decisions | steer-rt | Accuracy report, false-positive rate |

**Routing rules — initial set:**

```json
{
  "version": "1.0",
  "rules": [
    {
      "name": "atlassian_cloud_url",
      "pattern": "https?://disneyexperiences\\.atlassian\\.net",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and analyze this Atlassian resource: {url}",
      "confidence": "high"
    },
    {
      "name": "wiki_url_legacy",
      "pattern": "https?://(mywiki|confluence)\\.disney\\.com",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and summarize this Confluence page: {url}",
      "confidence": "high"
    },
    {
      "name": "jira_url_legacy",
      "pattern": "https?://(jira|myjira)\\.disney\\.com",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and analyze this Jira resource: {url}",
      "confidence": "high"
    },
    {
      "name": "github_url",
      "pattern": "https?://github\\.disney\\.com",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and analyze this GitHub resource: {url}",
      "confidence": "high"
    },
    {
      "name": "bare_ticket_key",
      "pattern": "^\\s*[A-Z]{2,10}-\\d{1,6}\\s*$",
      "agent": "story_analyzer_agent",
      "prompt_template": "Fetch and analyze Jira ticket: {match}",
      "confidence": "high"
    },
    {
      "name": "create_pr",
      "pattern": "(?i)(create|open|make|submit)\\s+(a\\s+)?(pr|pull request|merge request)",
      "agent": "pr_creator_agent",
      "confidence": "medium"
    },
    {
      "name": "run_tests",
      "pattern": "(?i)^(run|execute)\\s+(the\\s+)?(tests?|specs?|unit tests?)",
      "agent": "test_runner_agent",
      "confidence": "medium"
    },
    {
      "name": "run_build",
      "pattern": "(?i)^(run|execute)\\s+(the\\s+)?build",
      "agent": "devops_runner_agent",
      "confidence": "medium"
    }
  ],
  "fallback": "orchestrator",
  "confidence_threshold": "medium"
}
```

**Budget enforcement — initial values:**

| Agent                    | `max_tokens` | Rationale                               |
|:-------------------------|:------------:|:----------------------------------------|
| `story_analyzer_agent`   |    2048      | Summaries shouldn't exceed 1.5K tokens  |
| `pr_creator_agent`       |    2048      | PR description is templated             |
| `devops_runner_agent`    |    1024      | Reports command output, minimal prose   |
| `test_runner_agent`      |    1024      | Reports pass/fail + summary             |
| `codebase_explorer_agent`|    2048      | File listings + brief analysis          |
| `orchestrator`           |    1024      | Routing decision + delegation call only |

All other agents: no cap (use API default of 4096/8192).

#### Phase 1 exit criteria

- [ ] Telemetry running for 5+ days with baseline established
- [ ] Prompt caching enabled, cache hit rate measured
- [ ] Routing shortcuts active with ≥ 95% accuracy vs orchestrator decisions
- [ ] Budget caps set on 6 agents, no truncation incidents in harness tests
- [ ] Measured cost reduction: ≥ 20% vs baseline

---

### Phase 2 — Model tiering (Weeks 3–5)

**Goal**: 50% total token cost reduction by routing agents to appropriate model tiers.

**Strategies**: S3 (Agent-level model tiering) + S7 refinement (data-driven budget tuning)

#### Week 3: Schema + tier infrastructure

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
|  1  | Define `model-tiers.json` schema                       | Both       | Tier definitions: fast, standard, powerful, local |
|  2  | Add `model` field to agent JSON schema                 | steer-rt   | Schema validation accepts optional `model` field |
|  3  | Implement tier resolution in Koda                      | Koda       | Agent spawn reads `model` → resolves to provider/model |
|  4  | Add tier override mechanism (per-session, per-workspace) | Koda     | User can say "use powerful model" to escalate |
|  5  | Assign initial tiers to `fast` candidates              | steer-rt   | 5 agents moved to `fast` tier in their JSON configs |

**Schema change (agent JSON):**

```json
{
  "name": "story_analyzer_agent",
  "description": "Fetches and analyzes Jira stories...",
  "model": "fast",
  "prompt": "story_analyzer_agent.md",
  "tools": ["@confluence/*", "@jira/*", "..."]
}
```

**Tier resolution logic:**

```text
Agent has "model" field?
├── Yes → Resolve tier from model-tiers.json
│         ├── Provider available? → Use configured model
│         └── Provider unavailable → Fallback to "standard"
└── No → Use "standard" (backward compatible default)
```

#### Week 4: Quality validation + fast-tier rollout

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
| 1–2 | Run harness tests: same inputs through fast vs standard | steer-rt  | Quality comparison report per agent |
|  3  | Identify agents that degrade on fast tier              | Both       | Go/no-go decision per agent         |
| 4–5 | Roll out fast tier to validated agents in production   | Both       | 5–8 agents on fast tier, monitored  |

**Quality validation protocol:**

For each candidate `fast` agent:

1. Collect 20 representative inputs from harness/yax logs
2. Run each input through both `standard` (current) and `fast` (proposed) tier
3. Score outputs on: completeness, accuracy, formatting, tool use correctness
4. Pass criteria: `fast` output scores ≥ 85% of `standard` output on all dimensions
5. If fails: keep on `standard`, document which capabilities require higher tier

**Expected fast-tier assignments after validation:**

| Agent                    | Likely outcome | Risk area                              |
|:-------------------------|:---------------|:---------------------------------------|
| `story_analyzer_agent`   | ✅ Fast         | None — fetch + format                  |
| `codebase_explorer_agent`| ✅ Fast         | None — file search + list              |
| `devops_runner_agent`    | ✅ Fast         | None — run commands + report           |
| `test_runner_agent`      | ✅ Fast         | None — run commands + parse            |
| `pr_creator_agent`       | ✅ Fast         | Might need standard for complex PRs    |
| `splunk_query_agent`     | ✅ Fast         | Query construction might need standard |
| `onboarding_agent`       | ⚠️ Standard     | Needs reasoning about project structure |
| `planner_agent`          | ⚠️ Standard     | Task decomposition needs reasoning     |

#### Week 5: Auto-escalation + budget refinement

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
| 1–2 | Implement auto-escalation: fast → standard on failure  | Koda       | Retry with higher tier if output is malformed/truncated |
|  3  | Refine `max_tokens` budgets using Phase 1 telemetry data | steer-rt | Data-driven budget values (P95 of actual output lengths) |
| 4–5 | Measure Phase 2 savings vs Phase 1 baseline            | Both       | Cost reduction report, quality metrics |

**Auto-escalation triggers:**

```text
Fast model response → Quality check:
├── Tool call malformed → Retry on standard
├── Output truncated (hit max_tokens) → Retry on standard with 2x budget
├── Response is empty/error → Retry on standard
└── Output passes → Serve to user
```

Escalation budget: allow max 1 retry per agent call. If standard also fails → report error to user.

#### Phase 2 exit criteria

- [ ] `model` field supported in agent JSON schema
- [ ] 5–8 agents validated and running on `fast` tier
- [ ] Auto-escalation logic implemented and tested
- [ ] Budget values refined using real telemetry data
- [ ] Measured cost reduction: ≥ 45% vs original baseline
- [ ] Harness pass rate: ≥ 95%
- [ ] No user-reported quality degradation in 2-week soak period

---

### Phase 3 — Local intelligence (Weeks 6–9)

**Goal**: 60% total cost reduction by adding local inference for routing and compression.

**Strategies**: S2 (Local model classifier) + S6 (Context compression) + S5 (Response caching)

#### Week 6: Local model infrastructure

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
|  1  | Define local model requirements (memory, latency, accuracy) | Both  | Hardware spec + model shortlist     |
|  2  | Implement Ollama client in Koda                        | Koda       | HTTP client for local inference API |
|  3  | Add graceful degradation (unavailable → skip)          | Koda       | Timeout + fallback + health check   |
| 4–5 | Integration test: local model responds within latency budget | Koda  | P95 latency < 500ms confirmed      |

**Local model selection criteria:**

| Criterion        | Requirement                    | Candidates                    |
|:-----------------|:-------------------------------|:------------------------------|
| Size             | ≤ 4GB VRAM / 8GB RAM          | Phi-3-mini, Llama-3.2-1B/3B  |
| Latency          | < 500ms for classification     | All candidates pass on M-series Mac |
| Accuracy         | ≥ 85% on routing dataset       | Needs fine-tuning evaluation  |
| Platform         | macOS (Apple Silicon), Linux   | Ollama supports both          |

**Koda config addition:**

```json
{
  "localModel": {
    "enabled": true,
    "provider": "ollama",
    "endpoint": "http://localhost:11434",
    "model": "phi3:mini",
    "timeout_ms": 2000,
    "healthcheck_interval_s": 30,
    "fallback_on_failure": true
  }
}
```

#### Week 7: Training data + intent classifier

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
|  1  | Extract routing decisions from telemetry logs          | steer-rt   | Dataset: 500+ (input → agent) pairs |
|  2  | Clean + augment dataset (paraphrases, edge cases)      | steer-rt   | 1000+ training examples             |
|  3  | Fine-tune local model on classification task           | steer-rt   | Fine-tuned model file (.gguf)       |
| 4–5 | Evaluate: accuracy, confidence calibration, edge cases | Both       | Eval report with confusion matrix   |

**Training data format:**

```jsonl
{"input": "read this page https://disneyexperiences.atlassian.net/wiki/spaces/DPS/pages/123", "agent": "story_analyzer_agent", "intent": "read_wiki_page"}
{"input": "implement the login form validation", "agent": "ui", "intent": "implement_feature"}
{"input": "what's the architecture of the payment service?", "agent": "architecture_agent", "intent": "architecture_question"}
{"input": "DPAY-1234", "agent": "story_analyzer_agent", "intent": "fetch_ticket"}
{"input": "create a PR for my changes", "agent": "pr_creator_agent", "intent": "create_pr"}
```

**Evaluation criteria:**

- Overall accuracy: ≥ 85% on held-out test set
- Confidence calibration: when model says 0.90 confidence, it should be correct ~90% of the time
- False positive rate (wrong agent at high confidence): < 3%
- Latency: P95 < 500ms on Apple Silicon M1+

#### Week 8: Context compression + integration

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
|  1  | Define compression rules (what to preserve vs discard) | steer-rt   | Extraction rules document           |
|  2  | Implement compression using local model                | Koda       | Compress turns 1..N-2 when turn count > threshold |
|  3  | Add entity preservation (ticket IDs, file paths, decisions) | Koda  | Regex extraction before compression |
|  4  | Test: 10-turn conversations with and without compression | Both    | Quality comparison + token savings  |
|  5  | Deploy classifier to routing pipeline                  | Koda       | S1 → S2 → Orchestrator fallback chain |

**Compression prompt (sent to local model):**

```text
Summarize this conversation history in under 200 tokens. PRESERVE: ticket IDs, file paths, decisions made, agent names used. DISCARD: exploratory discussion, verbose explanations, rejected approaches.

<conversation_turns>
```

**Full routing pipeline after Phase 3:**

```text
User input
    │
    ▼
┌─────────────────────────────┐
│ S1: Deterministic shortcuts │ ← Zero cost (regex)
│ Pattern match?              │
└─────────┬───────────────────┘
          │ No match
          ▼
┌─────────────────────────────┐
│ S2: Local model classifier  │ ← Zero API cost (local inference)
│ Confidence ≥ 0.85?         │
└─────────┬───────────────────┘
          │ Low confidence
          ▼
┌─────────────────────────────┐
│ Orchestrator (cloud LLM)    │ ← Full cost (only ~15% of requests reach here)
│ S4: Prompt cached           │
│ S7: Budget enforced         │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ Target agent                │
│ S3: Model tier applied      │ ← Fast/Standard/Powerful
│ S6: Context compressed      │ ← Long conversations only
│ S7: max_tokens enforced     │
└─────────────────────────────┘
```

#### Week 9: Response caching + soak

| Day | Task                                                   | Owner      | Deliverable                         |
|:---:|:-------------------------------------------------------|:-----------|:------------------------------------|
|  1  | Define cacheable vs non-cacheable queries              | steer-rt   | Rules per agent (informational = cacheable) |
|  2  | Implement semantic hash + yax cache lookup             | Koda       | Pre-LLM cache check, post-LLM cache write |
|  3  | Add cache invalidation on `koda update` / deploy       | Koda       | Stale cache cleared on version change |
| 4–5 | Full system soak test: run harness suite 3x with all strategies enabled | Both | Final accuracy + savings report |

**Cache rules per agent:**

| Agent                    | Cacheable | TTL    | Invalidation trigger            |
|:-------------------------|:---------:|:------:|:--------------------------------|
| `story_analyzer_agent`   | No        | —      | Content changes per-request     |
| `codebase_explorer_agent`| Partial   | 1h     | Git commit on repo              |
| `steery_agent`           | Yes       | 24h    | steer-runtime deploy            |
| `onboarding_agent`       | Yes       | 24h    | steer-runtime deploy            |
| `orchestrator`           | No        | —      | Routing is context-dependent    |
| Informational queries    | Yes       | 4h     | Deploy or explicit invalidation |

#### Phase 3 exit criteria

- [ ] Local model running with < 500ms P95 latency
- [ ] Intent classifier accuracy ≥ 85% on test set
- [ ] Context compression preserves critical entities in 95%+ of cases
- [ ] Response cache hit rate measured (target: 10–15% of informational queries)
- [ ] Full pipeline (S1 → S2 → orchestrator → agent with S3/S4/S6/S7) validated end-to-end
- [ ] Measured cost reduction: ≥ 55% vs original baseline
- [ ] Harness pass rate: ≥ 95%
- [ ] No compression-induced "amnesia" reported in 2-week soak

---

### Phase 4 — Optimization and hardening (Weeks 10–12)

**Goal**: Fine-tune all strategies based on production data, harden edge cases, establish ongoing maintenance.

#### Tasks

| Week | Task                                                   | Owner      |
|:----:|:-------------------------------------------------------|:-----------|
|  10  | Analyze 4 weeks of telemetry: identify top token consumers remaining | Both |
|  10  | Tune confidence thresholds based on real false-positive data | steer-rt |
|  10  | Expand routing rules to cover newly observed patterns  | steer-rt   |
|  11  | Retrain local model with 4 weeks of production routing data | steer-rt |
|  11  | Tune `max_tokens` budgets to P95 from real distributions | Both     |
|  11  | Implement auto-escalation telemetry (how often does fast → standard fire?) | Koda |
|  12  | Documentation: operator guide for tuning tiers, rules, thresholds | steer-rt |
|  12  | Create automated weekly cost report                    | Koda       |
|  12  | Define maintenance runbook: when/how to retrain, re-tune, add rules | Both |

#### Ongoing maintenance cadence

| Frequency | Action                                                |
|:----------|:------------------------------------------------------|
| Weekly    | Review token cost dashboard, flag anomalies           |
| Bi-weekly | Review routing shortcut miss log, add new rules       |
| Monthly   | Retrain local classifier with new data                |
| Per-deploy| Clear response cache, validate tier assignments       |
| Quarterly | Full harness re-certification with quality comparison |

#### Phase 4 exit criteria

- [ ] All strategies tuned with ≥ 4 weeks of production data
- [ ] Maintenance runbook documented and reviewed
- [ ] Weekly cost report automated
- [ ] Final measured cost reduction: ≥ 60% vs original baseline
- [ ] Quality: harness pass rate ≥ 95%, zero user-reported regressions

---

## Metrics and validation

### Token tracking

Every LLM call logs:

```json
{
  "timestamp": "...",
  "agent": "story_analyzer_agent",
  "model_tier": "fast",
  "input_tokens": 1200,
  "output_tokens": 450,
  "cache_hit": false,
  "shortcut_used": "wiki_url",
  "tokens_saved_estimate": 3500
}
```

### Success criteria

- Phase 1: 20% reduction in total token spend (measured over 2-week window)
- Phase 2: 45% reduction
- Phase 3: 55–60% reduction
- Quality: harness test pass rate stays ≥ 95%
- Latency: P50 response time does not increase by more than 200ms

### Dashboard

Weekly token spend report:
- Total tokens by agent
- Shortcut hit rate
- Cache hit rate
- Local model vs cloud model split
- Cost comparison (projected vs actual)

---

## Risks and mitigations

| Risk                                          | Impact | Mitigation                                         |
|:----------------------------------------------|:------:|:---------------------------------------------------|
| Local model produces wrong classification     | Med    | Confidence threshold + fallback to cloud           |
| Prompt caching TTL causes stale responses     | Low    | 5-min TTL is short; deploy hook clears cache       |
| Fast model tier degrades output quality       | Med    | Auto-escalation on quality score; harness testing  |
| Deterministic shortcuts miss edge cases       | Low    | Fallback to orchestrator; log misses for review    |
| Response caching serves outdated info         | Med    | TTL + invalidation on deploy; never cache actions  |

---

## Deep-dive scoring

Each strategy is scored 1–5 across three dimensions:

- **Impact**: How much token savings does this realistically deliver in production?
- **Efficiency**: Ratio of savings delivered to implementation effort (ROI)
- **Backward compatibility**: How safely can this be introduced without breaking existing workflows?

### Scoring matrix

| #  | Strategy                             | Impact | Efficiency | Compat. | Total | Verdict           |
|:--:|:-------------------------------------|:------:|:----------:|:-------:|:-----:|:------------------|
| S1 | Deterministic routing shortcuts      |   4    |     5      |    5    |  14   | 🟢 Ship first      |
| S2 | Local model intent classification    |   3    |     3      |    5    |  11   | 🟡 High value, invest |
| S3 | Agent-level model tiering            |   5    |     4      |    4    |  13   | 🟢 Ship early      |
| S4 | Prompt caching (Anthropic)           |   3    |     5      |    5    |  13   | 🟢 Ship early      |
| S5 | Response caching (yax)               |   2    |     3      |    4    |   9   | 🟡 Nice-to-have    |
| S6 | Context compression                  |   4    |     2      |    3    |   9   | 🟡 High risk/reward |
| S7 | Token budget enforcement             |   2    |     4      |    5    |  11   | 🟡 Quick guardrail |
| S8 | Prompt scorer / rejection gate       |   2    |     2      |    3    |   7   | 🔴 Defer           |

---

### S1: Deterministic routing shortcuts — Score: 14/15

#### Impact: 4/5

- The orchestrator is invoked on **every** user request. Each invocation costs 2K–5K input + 500 output tokens
- Estimated 60–70% of requests match deterministic patterns (URLs, ticket keys, "create PR", "run tests")
- That's ~3,500 tokens saved per shortcut hit × 0.65 hit rate = **~2,275 tokens/request average savings**
- Doesn't save tokens on the downstream agent call itself — only eliminates the orchestrator hop
- Deducted 1 point: complex multi-intent messages ("analyze this ticket AND create a plan") won't match

#### Efficiency: 5/5

- Implementation is a regex engine + JSON config — no ML, no new infrastructure
- Can ship in 2–3 days of Koda development
- Rules are declarative and hot-reloadable — no redeploy to add new patterns
- Testing is trivial: input → expected agent, deterministic assertions
- Maintenance cost near zero once the rule format is stable

#### Backward compatibility: 5/5

- Pure additive — if no rule matches, behavior is identical to today (orchestrator handles it)
- No schema changes to agent JSON
- No changes to agent prompts
- No changes to MCP tools
- Existing workflows are completely unaffected
- Can be enabled/disabled per workspace via config flag
- **Risk**: only if a regex is too greedy and matches something the orchestrator would route differently. Mitigation: `confidence` levels + harness validation

---

### S2: Local model intent classification — Score: 11/15

#### Impact: 3/5

- Covers the 30–35% of requests that S1 can't match (ambiguous, multi-intent, natural language)
- Saves the same ~3,500 tokens per hit as S1
- But hit rate depends on classifier accuracy — realistically 70–80% of remaining traffic at ≥0.85 confidence
- Net new savings: ~3,500 × 0.30 (remaining traffic) × 0.75 (confidence hit rate) = **~790 tokens/request**
- Deducted 2 points: savings are marginal beyond S1, and local model adds latency (200–500ms)

#### Efficiency: 3/5

- Requires Ollama/llama.cpp infrastructure on developer machines
- Needs training data collection pipeline (harness logs → dataset → fine-tune)
- Initial fine-tuning effort: 1–2 weeks for dataset + training
- Ongoing maintenance: retrain when new agents are added or routing changes
- Hardware dependency: needs at least 8GB RAM for small models, 16GB+ for quality
- Deducted 2 points: infrastructure overhead is significant relative to marginal savings over S1

#### Backward compatibility: 5/5

- Completely transparent — graceful fallback to orchestrator on any failure
- No schema changes anywhere
- Optional dependency — works without local model (just loses the optimization)
- No behavior change for the user
- **Risk**: local model routes to wrong agent. Mitigation: confidence threshold + fallback guarantees

---

### S3: Agent-level model tiering — Score: 13/15

#### Impact: 5/5

- This is the **highest absolute savings** strategy
- Cost difference between Haiku and Sonnet is ~10x on input, ~5x on output
- If 40% of agents can run on `fast` tier (story_analyzer, codebase_explorer, devops_runner, test_runner, pr_creator): those calls cost 80–90% less
- Applied to typical session (orchestrator + 2–3 agent calls): saves 20–30% of total session cost
- Also reduces latency for fast-tier agents (Haiku is 2–3x faster)
- Full 5: this is the single most impactful cost lever

#### Efficiency: 4/5

- Agent JSON schema change is minimal (`"model": "fast"`)
- Koda needs model resolution logic — moderate effort (1–2 weeks)
- Tier definitions are centralized and shared across all workspaces
- Deducted 1 point: requires careful per-agent quality validation. Moving `code_review_agent` to `fast` could degrade review quality. Each assignment needs harness testing

#### Backward compatibility: 4/5

- Schema change is additive — agents without `model` field default to `standard` (current behavior)
- No prompt changes needed
- No tool changes
- Deducted 1 point: if a `fast` model can't handle a complex prompt that `standard` handles today, the agent produces worse output. This is a **quality regression risk**, not a breaking change per se
- Mitigation: auto-escalation on low quality score, harness comparison tests (same input → compare output quality between tiers)
- **Risk**: prompt engineering that relies on Sonnet-level reasoning breaks on Haiku. Need per-agent validation

---

### S4: Prompt caching (Anthropic) — Score: 13/15

#### Impact: 3/5

- Anthropic caches reduce input token cost by 90% for cached portions
- Orchestrator system prompt (~3K tokens cached) saves ~$0.003 per call at Sonnet pricing
- Agent prompts (1–3K tokens) similarly cached
- Total per-session savings: 4–8K cached tokens × 90% reduction = **3.6–7.2K tokens worth of cost saved**
- But: only saves money, not actual token throughput. Context window usage stays the same
- Deducted 2 points: savings are real but modest in absolute terms. 5-min TTL means cache misses if user is slow between turns
- Best ROI for high-frequency agents (orchestrator, story_analyzer)

#### Efficiency: 5/5

- Almost zero implementation effort on steer-runtime side
- Koda just needs to add `cache_control` markers to API calls — ~1 day of work
- No configuration needed per agent or workspace
- No maintenance burden
- Works automatically once enabled
- Full 5: effort-to-savings ratio is excellent

#### Backward compatibility: 5/5

- Completely invisible to agents, prompts, and users
- No schema changes
- No behavior changes
- Pure API-layer optimization
- Works with any Anthropic model
- Fallback: if caching is unavailable, calls proceed normally at full price
- **Risk**: literally zero. This is a provider feature, not an architectural change

---

### S5: Response caching (yax) — Score: 9/15

#### Impact: 2/5

- Only applies to **informational** queries that repeat across sessions
- In practice, most developer workflows are action-oriented (implement, review, test) — not repeatable Q&A
- Realistic hit rate: 5–15% of requests are semantically equivalent to a previous one
- Savings per hit are high (full LLM call avoided), but hit rate is low
- Deducted 3 points: limited applicability in an action-oriented SDLC tool

#### Efficiency: 3/5

- Semantic hashing is non-trivial — need embedding model or fuzzy matching
- Cache invalidation logic is complex (when does "what agents are available?" become stale?)
- TTL tuning requires experimentation
- yax already exists so storage is free — but the lookup/invalidation layer is new work
- Deducted 2 points: implementation effort is disproportionate to the 5–15% hit rate

#### Backward compatibility: 4/5

- Transparent when working correctly
- Deducted 1 point: stale cache responses are a **UX regression** if invalidation fails. User asks "what agents are available?" and gets yesterday's answer missing the new agent you added today
- Mitigation: conservative TTLs, invalidation on `koda update`/deploy
- **Risk**: cache serving outdated information. Harder to debug because user sees a response but doesn't know it was cached

---

### S6: Context compression — Score: 9/15

#### Impact: 4/5

- Long conversations (10+ turns) accumulate 8–15K tokens of history
- Compressing early turns to ~200 tokens saves 5–10K tokens per continuation call
- Multiplicative savings: every subsequent turn benefits from the compression
- Most impactful for implementation sessions where orchestrator coordinates 5+ agent delegations
- Deducted 1 point: short sessions (1–3 turns) see no benefit. Many requests are one-shot

#### Efficiency: 2/5

- Compression quality depends on the summarization model
- If using cloud model for compression: burns tokens to save tokens (paradox). Need local model (ties to S2)
- Preserving critical details (ticket IDs, file paths, decisions) requires careful extraction logic
- Testing is hard: how do you validate that compressed context doesn't lose information that matters 5 turns later?
- Deducted 3 points: high implementation complexity, hard to test, needs S2 as prerequisite for cost-neutral compression

#### Backward compatibility: 3/5

- Changes conversation behavior: model no longer sees full verbatim history
- If compression loses a key detail, agent may contradict a previous decision or re-ask a question
- Users notice when the AI "forgets" something from earlier in the conversation
- Deducted 2 points: this is a **visible behavior change** that can regress UX quality
- Mitigation: keep last N turns verbatim, only compress older turns. Add "preserved entities" extraction
- **Risk**: information loss in compression causes incorrect downstream decisions. Hard to detect, hard to debug

---

### S7: Token budget enforcement — Score: 11/15

#### Impact: 2/5

- Caps verbose agents from generating excess tokens, but most agents already produce reasonable output
- `max_tokens` primarily prevents tail-case blowups (agent goes off-topic, infinite loop in reasoning)
- Real savings: prevents the worst 5% of calls from consuming 3–5x expected tokens
- Deducted 3 points: doesn't reduce average token consumption meaningfully. It's a guardrail, not an optimization

#### Efficiency: 4/5

- Trivial to implement: pass `max_tokens` to API call
- Input budget warnings are simple threshold checks
- No new infrastructure, no ML, no complex logic
- Can be enabled per-agent immediately
- Deducted 1 point: choosing the right `max_tokens` per agent requires analysis of output length distributions

#### Backward compatibility: 5/5

- Agents without budget fields behave identically to today (use API defaults)
- Purely additive schema change
- No prompt changes
- If `max_tokens` is set too low, output gets truncated — but this is operator error, not a breaking change
- Can be rolled out agent-by-agent
- **Risk**: setting budget too tight truncates useful output. Mitigation: set conservatively at P95 of observed output lengths, tighten later with data

---

### S8: Prompt scorer / rejection gate — Score: 7/15

#### Impact: 2/5

- Only saves tokens on the small percentage of requests that are genuinely vague/unactionable
- Most developers send reasonably specific prompts ("implement DPAY-1234", "review this PR")
- Realistic rejection rate: 5–10% of requests score below threshold
- Savings per rejection: one full LLM call avoided (~4K tokens)
- Deducted 3 points: low applicability + risk of annoying users with false rejections

#### Efficiency: 2/5

- Needs a scoring model (local or rules-based)
- Scoring dimensions (specificity, actionability, completeness, scope) are subjective and hard to calibrate
- False positives (rejecting valid prompts) create friction and erode trust
- Tuning the threshold requires significant experimentation
- Deducted 3 points: calibration effort is high relative to 5–10% applicability

#### Backward compatibility: 3/5

- **Introduces friction** — user sends a prompt and gets a "please clarify" instead of action
- This is a behavioral change the user explicitly experiences
- Even well-calibrated, it will occasionally reject valid prompts
- Deducted 2 points: any false positive is a perceived regression ("it used to just work, now it asks me questions")
- Mitigation: very conservative threshold (only reject truly ambiguous), show scorer as optional, let user override with "just do it"
- **Risk**: user frustration. Developers hate being told their prompt isn't good enough. Could reduce adoption

---

### Summary: recommended implementation order

Based on scores (Total = Impact + Efficiency + Backward Compatibility):

| Rank | Strategy | Total | Implementation order | Rationale                                    |
|:----:|:---------|:-----:|:---------------------|:---------------------------------------------|
|  1   | S1       |  14   | Week 1–2             | Highest ROI, zero risk, ships fast           |
|  2   | S4       |  13   | Week 1 (parallel)    | 1 day of work, pure upside, no risk          |
|  3   | S3       |  13   | Week 3–5             | Biggest absolute savings, needs validation   |
|  4   | S7       |  11   | Week 3 (parallel)    | Quick guardrail, protects against tail costs |
|  5   | S2       |  11   | Week 5–8             | Builds on S1 data, covers remaining gap      |
|  6   | S5       |   9   | Week 8+ (optional)   | Low hit rate limits value                    |
|  7   | S6       |   9   | Week 8+ (needs S2)   | High value but high risk, needs local model  |
|  8   | S8       |   7   | Defer / reconsider   | Friction risk outweighs savings              |

### Compound savings projection

```text
Phase 1 (S1 + S4):           ~25% cost reduction, 0% quality risk
Phase 2 (+ S3 + S7):         ~50% cost reduction, low quality risk (monitored)
Phase 3 (+ S2 + S5/S6):      ~60% cost reduction, moderate complexity
```

---

## S9: On-demand resource loading via README index

### Problem

Agents load entire context directories via glob patterns (`context/features/*`, `context/**/*.md`). For the POS team workspace alone, this was ~188KB auto-loaded per conversation regardless of whether the content was relevant to the task.

### Design

Replace directory globs with a lightweight README index file. Agents load only the index and fetch specific files on-demand via `fs_read` when the task matches.

```text
Before: "resources": ["file://.kiro/context/features/*"]     → 188KB loaded always
After:  "resources": ["file://.kiro/context/features/README.md"]  → 2KB index loaded
        Agent reads specific feature file only when ticket matches
```

#### README index format

```markdown
# Feature Context Files

Do NOT load all files — only read the specific file relevant to your current task.

| File | Feature | Trigger |
|------|---------|---------|
| `feature-a.md` | Gift Card Reload | POS-1936 |
| `feature-b.md` | Bundling | POS-1478 |
```

#### Adoption candidates (global)

| Workspace/Profile | Current glob | Est. savings |
|:------------------|:-------------|:-------------|
| pos-team/features | `context/features/*` | ~188KB |
| dev-core/context | `file://.kiro/context/**/*.md` | ~50-100KB (varies) |
| sustainment/catalog | `managed-services-catalog/**` | Large (loaded per RCA) |
| Any workspace with 5+ context files | Various globs | 20-100KB |

#### Implementation

- **steer-runtime side**: Create README.md index files for large context directories
- **Steering rule**: Document the pattern so new workspaces adopt it by default
- **Agent prompts**: Add "load on-demand" instruction in skill/workflow steps

### Validated by

POS team PR #563 — measured ~188KB savings per conversation.

---

## S10: Orchestrator tool surface reduction

### Problem

Orchestrators that have direct work tools (`code`, `grep`, `fs_read`, `execute_bash`) sometimes self-implement instead of delegating. This wastes tokens (orchestrator burns tokens reading code that a specialist will read again) and bypasses the delegation chain.

### Design

Remove direct work tools from pure orchestrators. Keep only delegation tools:

```json
// Pure orchestrator tool surface (target):
"tools": ["subagent", "thinking", "todo_list", "knowledge", "@mermaid/*"]

// Remove from orchestrators:
// "code", "grep", "fs_read", "fs_write", "execute_bash"
```

#### Decision matrix

| Agent role | Should have `execute_bash`? | Should have `code`/`grep`? |
|:-----------|:--:|:--:|
| Pure orchestrator (routes only) | ❌ | ❌ |
| Hybrid orchestrator (routes + light analysis) | ⚠️ Optional | ✅ Read-only |
| Specialist (does the work) | ✅ | ✅ |

#### Token savings mechanism

- Orchestrator can't self-implement → forces delegation → specialist handles it in one pass
- Eliminates duplicate reads: orchestrator reads file to "understand" → then delegates to specialist who reads same file
- Reduces orchestrator output tokens (no code in response, just delegation calls)

#### Adoption candidates

| Orchestrator | Current extra tools | Action |
|:-------------|:-------------------|:-------|
| `pos_backoffice_orchestrator` | ✅ Already cleaned (PR #563) | Done |
| dev-core `orchestrator` | `execute_bash` (via hooks) | Evaluate — diagnostics use case |
| `pos_team_orchestrator_agent` | None (already pure) | Already correct |

#### Risk

- If orchestrator occasionally needs to check git status or read a file for routing decisions, removing tools entirely may force unnecessary delegations
- Mitigation: keep `fs_read` as optional for "hybrid" orchestrators that need light context reads, but remove `execute_bash` and `code`

### Validated by

POS team PR #563 — removed `code`, `grep`, `fs_read`, `execute_bash` from backoffice orchestrator with no functionality loss.

---

## Open questions

1. Should local model be required (always-on Ollama) or optional (graceful degradation)?
2. Model tiering: per-workspace override or global only?
3. Token budget: hard-fail or soft-warn when exceeded?
4. Should the scorer reject prompts or just inject guidance into the agent call?

---

## References

- [E1: Conditional context loading][e1-spec] — related context optimization
- [Anthropic prompt caching docs][anthropic-cache]
- [Orchestrator Delegation Review][delegation-review]

<!-- Links -->
[anthropic-cache]: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
[delegation-review]: ../architecture/ORCHESTRATOR_DELEGATION_REVIEW.md
[e1-spec]: orchestration-harness-context.md
