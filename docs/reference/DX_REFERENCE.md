# New Features Guide

This document covers all features added in the v0.2.136 release. Each section includes
purpose, usage, commands, and examples.

---

## Table of Contents

1. [Onboarding Agent](#1-onboarding-agent)
2. [Self-Healing Orchestration](#2-self-healing-orchestration)
3. [Hooks & DX Improvements](#3-hooks--dx-improvements)
4. [Context Improvements](#4-context-improvements)
5. [Playbooks](#5-playbooks)
6. [Workspace Inheritance](#6-workspace-inheritance)
7. [Cross-Workspace Agent Sharing](#7-cross-workspace-agent-sharing)
8. [Telemetry Dashboard](#8-telemetry-dashboard)
9. [Team Knowledge Sync](#9-team-knowledge-sync)

---

## 1. Onboarding Agent

**Profile:** dev-core  
**File:** `profiles/dev-core/agents/onboarding_agent.json`

### Purpose

Helps new team members understand a project quickly — build commands, architecture,
config locations, ownership, and conventions — without reading every file or asking
10 people.

### How to Use

```bash
koda chat --agent onboarding_agent
```

Or ask the orchestrator — it auto-delegates onboarding questions:

```
> I'm new to this project, how do I build it?
> What's the architecture?
> Where's the config for payment processing?
> Who owns the authentication module?
> What conventions should I follow?
```

### What It Does

| Question Type | Data Source | Output |
|---|---|---|
| "How do I build?" | project.yaml, package.json, Makefile, pom.xml | Numbered quick-start checklist |
| "What's the architecture?" | docs/, README, directory structure | Service diagram + layer summary |
| "Where's the config?" | grep for config files | File paths + descriptions |
| "Who owns this?" | CODEOWNERS, git log | Team + top contributors |
| "What conventions?" | .kiro/steering/, golden_rules.md | Top 5-7 rules summary |
| "Key files for feature X?" | grep + file tree | Annotated file tree |

### Tools Available

`fs_read`, `grep`, `glob`, `execute_bash` — no MCP required, works immediately.

### Orchestrator Routing

The orchestrator auto-delegates these triggers to `onboarding_agent`:
- "onboarding", "how do I build", "getting started", "new to this", "what conventions"

---

## 2. Self-Healing Orchestration

**File:** `shared/context/self_healing_rules.md`

### Purpose

When a sub-agent fails (timeout, MCP connection error, context overflow), the orchestrator
now attempts ONE recovery before reporting failure to the user.

### How It Works

The orchestrator follows this protocol automatically — no user action needed:

```
1. DETECT  → Sub-agent returns error
2. CLASSIFY → Match error to failure type
3. RETRY (if retryable, max 1 attempt):
   - timeout → re-delegate with reduced scope
   - MCP connection → switch to fallback tool source
   - context overflow → re-delegate with "summarize briefly"
4. REPORT → Tell user what happened + what was tried
5. LOG → Save pattern to yax for future reference
```

### Fallback Chains

| Primary Tool | Fallback | When |
|---|---|---|
| @jira/* (jira-mcp) | Compass jira tools | jira-mcp connection fails |
| @confluence/* | Compass confluence tools | confluence-mcp connection fails |
| @github/* | devops_runner_agent + gh CLI | github-mcp connection fails |
| mem_* (memory-mcp) | yax_* tools | memory-mcp unreachable |

### What's NOT Retried

- Permission/auth errors (will fail identically)
- Agent not found errors
- Never more than once per failure type per session

### Example Recovery

```
User: "Read DPAY-14500 and plan the implementation"
  → orchestrator delegates to story_analyzer_agent
  → story_analyzer_agent: jira-mcp timeout after 30s
  → orchestrator: RETRY with Compass jira tools
  → story_analyzer_agent: success via Compass
  → orchestrator: "Retrieved ticket. Here's the plan: ..."
```

---

## 3. Hooks & DX Improvements

### 3A. Post-Merge Memory Hook

**File:** `shared/hooks/post-merge-memory.kiro.hook`

**Purpose:** After a PR merges, automatically save a memory observation so agents
remember what changed.

**Trigger:** `postToolUse` matching merge operations.

**What it saves:**
- PR title as memory title
- Changed files, summary, reason as content
- `type: decision`, `topic_key: PR-number`

**No configuration needed** — installed automatically with dev-core profile.

---

### 3B. Secret-Scan Autofix

**File:** `shared/hooks/secret-scan.sh`

**Purpose:** Enhanced secret detection that not only blocks commits but suggests
the exact fix.

**Before (old):**
```
Blocked: potential secret detected in file content
```

**After (new):**
```
BLOCKED: 1 potential secret(s) in src/config.ts

  Line 12: API Key detected
  FIX_SUGGESTION:
    action: move_to_env
    var_name: API_KEY
    file: src/config.ts
    line: 12
    replacement: process.env.API_KEY (JS/TS) or System.getenv("API_KEY") (Java)
    gitignore_add: .env.local
```

**Detected patterns:** API keys, bearer tokens, passwords, AWS keys, private keys, connection strings.

---

### 3C. Workspace Health Check

**File:** `shared/hooks/workspace-health.sh`

**Purpose:** Single command to diagnose your workspace state.

**Usage:**
```bash
make workspace-health
# or directly:
bash shared/hooks/workspace-health.sh
```

**Output:**
```
🏥 Workspace Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅ MCP: github (enabled)
  ✅ MCP: jira-cloud (enabled)
  ⚠️  MCP: confluence (disabled)
  ✅ Tokens: JIRA_PAT configured
  ✅ Agents: 35 installed
  ✅ Version: v0.2.136
  ✅ Memory: yax reachable
  ⚠️  Context: 2/22 files older than 30 days

Suggested actions:
  → Enable disabled MCPs with 'koda mcp-install --assistant'
  → Run 'koda sync' to refresh stale context
```

**Checks performed:**
- MCP server connections (enabled/disabled)
- Token presence (JIRA_PAT, CONFLUENCE_PAT, GITHUB_TOKEN)
- Agent files installed
- steer-runtime version
- Memory system connectivity (yax)
- Context file freshness

---

## 4. Context Improvements

### 4A. Dynamic Context Injection

**File:** `shared/hooks/context-inject.sh`

**Purpose:** Automatically recommends relevant context files based on what you're
working on (git diff), so agents get domain-specific knowledge without loading everything.

**Trigger:** `agentSpawn` (runs at session start)

**How it works:**
```
1. Reads git diff (staged + unstaged files)
2. Matches file patterns to context recommendations:
   - *.java, pom.xml → api_standards.md + performance_patterns.md
   - *.spec.ts → test_templates.md + automation_patterns.md
   - *.component.ts → vista_web_components.md
   - Dockerfile, k8s/*.yaml → ops_guidelines.md
3. Outputs JSON with top 3 most relevant context files
```

**Example output:**
```json
{
  "inject_context": ["api_standards.md", "performance_patterns.md"],
  "reason": "2 files changed, matched 2 context files"
}
```

**Max injection:** 3 files (configurable via `MAX_INJECT` variable)

---

### 4B. Channel-Aware Routing

**File:** `shared/context/channel-routing.json`

**Purpose:** When working on a Jira ticket, automatically load the correct payment
channel context (flows, contracts, error handling) based on the ticket's component.

**Mapping example:**
```json
{
  "component_map": {
    "Payment Controls": "config-studio",
    "Config Studio": "config-studio",
    "DPS Core": "dps-core",
    "POS": "payment-controls"
  }
}
```

**What happens:**
1. Orchestrator sees Jira ticket with component "Config Studio"
2. Looks up `channel-routing.json` → maps to `config-studio`
3. Loads `channels/config-studio/flows.md`, `channel-contracts.md`, `error-handling.md`
4. Passes to specialist agent as additional context

**No manual action needed** — works automatically when working on tickets.

---

## 5. Playbooks

**Directory:** `shared/playbooks/`

### Purpose

Declarative multi-step workflows that chain agents together with quality gates.
Think of them as "recipes" for common multi-agent operations.

### Usage

```bash
# Run a playbook (future — requires Koda CLI integration)
koda run hotfix --jira_key DPAY-14500

# List available playbooks
ls shared/playbooks/*.yaml

# Create a new playbook from template
cp shared/playbooks/_template.yaml shared/playbooks/my-workflow.yaml
```

### Available Playbooks

| Playbook | Steps | Purpose |
|----------|:-----:|---------|
| `hotfix.yaml` | 7 | Emergency fix: analyze → plan → implement → test → scan → PR → review |
| `incident-response.yaml` | 5 | P1/P2 triage: signals → changes → diagnose → communicate → document |
| `_template.yaml` | 2 | Starter template for new playbooks |

### Playbook Format

```yaml
name: My Workflow
version: "1.0.0"
description: What this does
trigger: manual
inputs:
  jira_key:
    type: jira_key
    required: true
    description: "Ticket to work on"
steps:
  - name: Analyze
    agent: story_analyzer_agent
    instruction: "Read {{jira_key}} and summarize"
    gate:
      type: user_approval
    on_failure: stop
```

### Gates

| Type | Behavior |
|------|----------|
| `auto` | Proceed if step succeeds |
| `user_approval` | Pause for user approve/reject |
| `pass_threshold` | Check numeric result (e.g., test pass rate ≥100) |
| `condition` | Evaluate expression |

### Failure Strategies

| Strategy | Behavior |
|----------|----------|
| `stop` | Halt entire playbook |
| `skip` | Skip step, continue |
| `retry` | Try once more |
| `fallback` | Use `fallback_agent` |

---

## 6. Workspace Inheritance

**File:** `scripts/workspace_resolver.py`

### Purpose

Workspaces can extend a parent workspace with `"extends": "<parent-name>"`,
inheriting profiles, projects, and rules — reducing duplication across 30+ workspaces.

### Usage

```bash
# Resolve a workspace (show final merged config)
make workspace-resolve WS=payments-core-team

# Validate all inheritance chains
make workspace-validate-inherit
```

### How to Use in workspace.json

```json
{
  "name": "my-sub-team",
  "extends": "payments-core-team",
  "profiles": ["+pm", "+leadership"],
  "projects": [
    { "name": "my-new-service", "repo": "Org/my-service" }
  ],
  "rules": ["+general-python-development"],
  "jira_prefix": "MYTEAM-"
}
```

### Merge Rules

| Field | Strategy |
|-------|----------|
| name, description, team | Child wins |
| profiles, rules, services | Additive (`+item` to add, `-item` to remove) |
| projects | Child appended, same-name overrides parent |
| jira_prefix, jira_host | Child wins if set |
| default_agent | Child wins if set, else inherits |

### Prefix Operators

```json
"profiles": ["+dev-web"]          // Add to parent's profiles
"profiles": ["-ops"]              // Remove ops from parent's profiles
"profiles": ["qa"]                // Replace entirely (no prefix = override)
```

### Validation

```bash
make workspace-validate-inherit
# Output:
#   ✅ sustainment-checkout: inheritance resolves cleanly
#   ✅ rocket-team: inheritance resolves cleanly
#   ❌ app-config-studio: parent 'app-team' not found
```

---

## 7. Cross-Workspace Agent Sharing

**File:** `scripts/share-agent.sh`  
**Directory:** `common/agents/contributed/`

### Purpose

Teams build great agents locally. This provides a path to share them org-wide
with proper review.

### Usage

```bash
# Share an agent from a workspace
make share-agent WS=dps-team AGENT=demo_generator_agent

# Or directly:
bash scripts/share-agent.sh <workspace-name> <agent-name>
```

### What It Does

1. Finds the agent in the workspace's profiles
2. Validates: name, description, tools, prompt file
3. Copies agent JSON + prompt to `common/agents/contributed/`
4. Creates metadata file with source and status
5. Prints next steps for PR creation

### Output Example

```
📂 Found workspace: workspaces/dps-team
📄 Found agent: .../demo_generator_agent.json
📝 Found prompt: .../demo_generator_agent.md

🔍 Validating agent...
  ✅ name: demo_generator_agent
  ✅ description: Generates comprehensive demo documentation...
  ✅ tools: 7 tools

📦 Copying to common/agents/contributed/
  ✅ Copied agent JSON
  ✅ Copied prompt: demo_generator_agent.md
  ✅ Created metadata

✅ Agent 'demo_generator_agent' shared!

Next steps:
  1. Review the agent in common/agents/contributed/
  2. Create a PR
  3. Maintainer assigns to a profile and merges
```

### Contribution Lifecycle

`pending_review` → `approved` → `promoted` (moved to official profile)

---

## 8. Telemetry Dashboard

**File:** `scripts/telemetry-dashboard.py`

### Purpose

Aggregates agent usage data from `~/.kiro/telemetry/*.jsonl` into an actionable report
showing which agents are used, delegation success rate, and underused agents.

### Usage

```bash
# Text report (last 30 days)
make telemetry

# JSON export
make telemetry-json

# Custom time range
python3 scripts/telemetry-dashboard.py --days 7
python3 scripts/telemetry-dashboard.py --days 90 --format csv
```

### Output Example

```
📊 Agent Usage Report (last 30 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total sessions: 847
  Avg duration: 4m 32s
  Total tool calls: 12,450
  Avg context usage: 67%
  Delegation success: 94.2%

  Top agents:
     1. orchestrator                     312 ████████████████
     2. code_review_agent                198 ██████████
     3. pr_creator_agent                 156 ████████

  Underused agents (installed but <5 uses):
    - compliance_agent
    - adr_writer_agent
    - bounded_context_agent
```

### Data Source

The `telemetry-emit` hook (already installed) writes JSONL entries to `~/.kiro/telemetry/`
after each agent session. This dashboard reads and aggregates them.

### Output Formats

| Format | Flag | Use Case |
|--------|------|----------|
| text | `--format text` (default) | Human-readable terminal report |
| json | `--format json` | Programmatic consumption, dashboards |
| csv | `--format csv` | Spreadsheet import |

---

## Quick Reference

| Feature | Command |
|---------|---------|
| Chat with onboarding agent | `koda chat --agent onboarding_agent` |
| Workspace health check | `make workspace-health` |
| Resolve workspace inheritance | `make workspace-resolve WS=<name>` |
| Validate all inheritance | `make workspace-validate-inherit` |
| Share an agent | `make share-agent WS=<workspace> AGENT=<agent>` |
| View telemetry | `make telemetry` |
| Export telemetry JSON | `make telemetry-json` |
| Push team knowledge | `koda knowledge push` |
| Pull team knowledge | `koda knowledge pull` |
| Materialize knowledge | `make knowledge-materialize WS=<name>` |


## 9. Team Knowledge Sync

**Files:** `scripts/knowledge-push.sh`, `scripts/knowledge-materialize.sh`, `scripts/knowledge-pull.sh`

### Purpose

Sync memory bank (yax + mem + memory-bank files) across team members within a workspace — automatically, daily, zero friction. What one person discovers, everyone's agents benefit from.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  Each team member (daily, automatic)                            │
│                                                                 │
│  Local yax + mem + memory-bank/                                 │
│       │                                                         │
│       ▼                                                         │
│  koda knowledge push                                            │
│  (export + secret scan + push to knowledge branch)              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Nightly (GitHub Action or cron)                                │
│                                                                 │
│  All member exports → koda knowledge materialize                │
│  (dedup by topic_key → team_knowledge.md + team_learned.md)     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Each team member (next morning, on koda sync)                  │
│                                                                 │
│  koda knowledge pull                                            │
│  → .kiro/context/team_knowledge.md                              │
│  → .kiro/steering/99-team-learned.md                            │
│  → .kiro/memory-bank/team/                                      │
│                                                                 │
│  Agents see team knowledge automatically via resources          │
└─────────────────────────────────────────────────────────────────┘
```

### Usage

```bash
# Push your local observations to team (all workspaces you worked in)
koda knowledge push

# Dry run — see what would be pushed without pushing
koda knowledge push --dry-run

# Pull team knowledge to your local context
koda knowledge pull

# Materialize exports for a workspace (runs centrally/nightly)
koda knowledge materialize --workspace tep3-team

# Materialize all workspaces
make knowledge-materialize-all
```

### What Gets Synced

| Source | What's Shared | What's Excluded |
|--------|--------------|-----------------|
| yax (cross-project) | decisions, architecture, patterns, discoveries | sessions, personal learnings |
| mem (per-project) | project decisions, patterns | bugfixes in-progress, configs |
| memory-bank/ files | tech.md, architecture docs | active-context.md (ephemeral) |

### Multi-Workspace Support

If you work on multiple workspaces in one day, ALL get exported:

```bash
# User works on tep3-team in the morning, payments-core-team in the afternoon
# Nightly push exports both:
koda knowledge push
#   ✅ tep3-team: 8 observations + 2 memory-bank files
#   ✅ payments-core-team: 3 observations + 1 memory-bank file
```

### Storage: Orphan Branch

```
steer-runtime repo
├── main branch              ← protected, PRs required
└── knowledge branch         ← unprotected, direct push
    ├── tep3-team/
    │   ├── exports/
    │   │   ├── dev-a.jsonl
    │   │   └── dev-b.jsonl
    │   ├── memory-banks/
    │   │   ├── dev-a/tech.md
    │   │   └── dev-b/tech.md
    │   ├── team_knowledge.md      ← materialized output
    │   └── team_learned.md        ← steering conventions
    └── payments-core-team/
        └── ...
```

### Security

- Secret scanning (regex) runs before every push — tokens, keys, passwords blocked
- Only shareable types exported (decision, architecture, pattern, discovery)
- No PII, no session data, no configs with env-specific values
- First push auto-creates workspace folder (zero manual setup)

### Materialized Output

**team_knowledge.md** (loaded as agent context):
```markdown
# tep3-team — Team Knowledge
> Auto-materialized: 2026-06-24 (15 observations from 4 members)

## Architecture Decisions
- **2026-06-20** [dev-a]: Package calendar uses event sourcing
  > What: Event sourcing for audit trail. Why: regulatory compliance

## Patterns & Conventions
- **2026-06-18** [dev-b]: Always UTC internally
  > Date handling: convert to park timezone only at API boundary

## Discoveries & Gotchas
- **2026-06-15** [qa-c]: offer-service returns 200 with empty array
  > Not 404 — returns 200 + [] when no packages found
```

**team_learned.md** (loaded as steering — injected into agent prompts):
```markdown
---
inclusion: auto
---
# Team-Learned Conventions (tep3-team)

- **Always UTC internally**: Convert to park timezone only at API boundary
- **Empty results = 200 + []**: Never 404 for "no results found"
- **Circuit breakers**: Resilience4j, 5s timeout, 3 retries on external calls
```

### Makefile Targets

```bash
make knowledge-push              # Push local observations
make knowledge-pull              # Pull team knowledge
make knowledge-materialize WS=x  # Materialize one workspace
make knowledge-materialize-all   # Materialize all workspaces
```
