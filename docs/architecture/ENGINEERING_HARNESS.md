# Engineering harness architecture

A comprehensive overview of the steer-runtime engineering harness: structure, philosophy, SDLC integration, verification points, and capabilities.

## Philosophy

The harness is **declarative configuration** (JSON + Markdown + Shell hooks) that tells the model how to behave, what tools it has, and who to delegate to. Execution is handled by kiro-cli/Koda (Go CLI speaking ACP protocol). The central idea: **separate model instructions from tooling runtime**, so you can evolve agents without touching executable code.

Key principles:

- Agents are configuration, not code — JSON config + Markdown prompt + resource references
- Orchestration is prompt-driven hierarchical delegation via description-match against an agent registry
- Each agent sees only its relevant context (domain isolation, not everything-to-everyone)
- Quality gates are enforced at every stage transition
- The same harness works across IDEs (Kiro, Cursor) and interfaces (CLI, TUI, desktop app, web)

---

## Harness structure

```text
profiles/              → Agent bundles by role (dev-core, qa, ops, pm, ba, design, leadership...)
  <profile>/agents/    → JSON configs (name, prompt, tools, resources, hooks)
  <profile>/prompts/   → System prompts in Markdown
  <profile>/context/   → Profile-specific context files
  <profile>/skills/    → Domain knowledge and workflow guides
workspaces/            → Per-team configuration (repos, MCP servers, team-specific context)
  <workspace>/         → workspace.json + context/ + skills/ + profiles/
shared/
  hooks/               → Automated verifications (preToolUse, postToolUse, agentSpawn)
  tools/mcp-servers/   → Custom MCP server implementations
  context/             → Shared context files (SDLC workflow, golden rules, etc.)
  steering/            → Behavioral rules injected into all agents
common/                → Files installed to all users regardless of profile
scripts/               → Validation, telemetry, release scripts
evals/                 → Agent evaluation framework
```

**21 profiles, 150+ agents, 40+ hooks, 12 MCP servers**

---

## Profiles and agent distribution

| Profile     | Agents | Audience                                                      |
|-------------|:------:|---------------------------------------------------------------|
| dev-core    |   25   | All developers (orchestrator, code review, security, PRs)     |
| qa          |   25   | QA engineers (test planning, automation, coverage, defects)    |
| sustainment |   11   | Production support (incident triage, RCA, log analysis)        |
| inspector   |   10   | Browser inspection, web discovery, UI validation               |
| steer-master|    9   | Platform admins (release management, workspace health)         |
| ops         |    9   | DevOps (deployment, infra check, CI/CD, metrics)              |
| ba          |    9   | Business analysts (story analysis, requirements, estimation)   |
| design      |    7   | UX/UI (accessibility, usability, component review)             |
| pm          |    6   | Product managers (sprint planning, delivery reports, risks)    |
| leadership  |    5   | Directors/VPs (quarterly reports, portfolio health)            |
| cloudops    |    4   | Cloud infrastructure (AWS ECS, scaling, cost)                  |
| dev-web     |    5   | Web specialists (Node, Express, SSR)                          |
| dev-ai      |    5   | AI/ML specialists (prompt engineering, eval, research)         |
| presales    |    1   | Client intake and project briefs                              |

Each team installs only the profiles they need — no context pollution across domains.

---

## SDLC workflow

The orchestrator follows a gated workflow with two strategies and two modes.

### Strategies (what phases execute)

| Strategy      | When to use                                            | Flow                                                                                |
|---------------|--------------------------------------------------------|-------------------------------------------------------------------------------------|
| Standard      | Clear requirements, single approach, low risk          | Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship              |
| Propose-judge | Multiple viable approaches, irreversible decisions     | Analyze → Propose → 🚦 Gate 0 → Plan → 🚦 Gate 1 → Implement → Judge → 🚦 Gate 2 → Ship |

### Modes (how autonomous the agent is)

| Mode        | Behavior                                           | When to use                                   |
|-------------|----------------------------------------------------|-----------------------------------------------|
| Interactive | Pause at every gate, wait for human approval       | Default. Complex decisions, first-time patterns|
| Autopilot   | Auto-proceed when quality criteria pass (max 3 retries) | Well-defined tickets, high test coverage  |

### Auto-detection rules

The orchestrator selects propose-judge when:

- Multiple architectural approaches are viable
- Task introduces a new dependency or library
- Change crosses 3+ layers (UI + API + backend + DB)
- User explicitly asks for options
- Task involves unfamiliar technology

---

## Verification points

| Point                 | What it does                                                         | Agents / mechanism                           |
|-----------------------|----------------------------------------------------------------------|----------------------------------------------|
| Plan review           | Present implementation plan before touching code                     | planner_agent → user gate                    |
| Branch guard          | Block direct commits to main/master                                  | preToolUse hook (branch-guard.sh)            |
| Secret scan           | Detect tokens, keys, credentials before commit                       | preToolUse hook (secret-scan.sh)             |
| Guard writes          | Block writes to node_modules, dist, .git                             | preToolUse hook (guard-writes.sh)            |
| Feature-only guard    | Prevent changes outside task scope                                   | preToolUse hook (guard-feature-only.sh)      |
| Build verification    | Compile after each change — fail triggers retry with error context   | test_runner_agent, devops_runner_agent        |
| Unit test execution   | Run tests — failures auto-fix → re-run (max 3x)                     | test_runner_agent                            |
| Lint on write         | Run linter after every file write                                    | postToolUse hook (lint-on-write.sh)          |
| Code review           | Static review of diff (security, quality, patterns)                  | code_review_agent                            |
| Security scan         | Detect vulnerabilities, compliance issues                            | security_scanner_agent                       |
| Judge scoring         | Evaluate implementation across 6 dimensions (≥80 = PASS)            | judge_agent (propose-judge strategy only)    |
| PR metadata           | Validate PR has proper description, test evidence, linked ticket     | pr_creator_agent                             |
| Warn destructive      | Post-execution warning on destructive commands (rm -rf, DROP TABLE)  | postToolUse hook (warn-destructive.sh)       |
| Session telemetry     | Log what happened, duration, token usage on session end              | stop hook (session-summary.sh)               |

---

## Agent harness schema

Each agent is defined by a JSON config:

```json
{
  "name": "agent_name",
  "description": "One-line purpose (used for delegation routing)",
  "prompt": "file://prompts/agent_name.md",
  "tools": ["fs_read", "fs_write", "code", "grep", "@jira/*"],
  "resources": ["file://context/domain.md"],
  "hooks": {
    "agentSpawn": [{ "command": "git-context.sh" }],
    "preToolUse": [{ "matcher": "fs_write", "command": "guard-writes.sh" }],
    "postToolUse": [{ "matcher": "fs_write", "command": "lint-on-write.sh" }]
  },
  "includeMcpJson": true
}
```

The prompt file contains the system instructions. Resources are loaded as context. Tools define what the agent can do. Hooks inject verification at runtime.

---

## Custom agents and model routing

### Hierarchical delegation

The orchestrator classifies user intent and delegates to the right agent:

```text
Orchestrator (router)
  ├── qa_orchestrator_agent (QA domain)
  │     ├── test_planner_agent
  │     ├── test_automation_agent
  │     ├── coverage_analyzer_agent
  │     └── defect_analyst_agent
  ├── ops_orchestrator_agent (Operations domain)
  │     ├── deployment_agent
  │     ├── log_analyzer_agent
  │     └── infra_check_agent
  └── Specialists (direct delegation)
        ├── backend, ui, webapi (by tech stack)
        ├── code_review_agent
        ├── security_scanner_agent
        └── pr_creator_agent
```

### Token optimization

Each sub-agent has its own context window — the parent passes only relevant information via `prompt_template`. Children don't inherit the full parent history. Results return as summaries.

### Model selection

Agents can specify a model preference per subagent stage, but in practice all use the same backend model (Claude via ACP). Multi-model routing (cheap model for simple tasks, powerful for architecture) is not yet supported at the provider level.

---

## Integration with QA, product, and design

### QA team integration

The `qa` profile (25 agents) covers the full testing lifecycle:

- **Test planning** — test_planner_agent creates test cases from requirements
- **Test automation** — test_automation_agent writes Playwright/Jest scripts
- **E2E generation** — e2e_test_generator_agent produces Gherkin scenarios
- **API testing** — api_tester_agent + bruno_collection_agent for REST validation
- **Coverage analysis** — test_coverage_analyzer_agent finds gaps across epics
- **Flaky test fixing** — flaky_test_fixer_agent diagnoses intermittent failures
- **Defect analysis** — defect_analyst_agent performs root cause analysis
- **Performance testing** — performance_tester_agent for load tests

### Product (PM/BA) integration

- **Story analysis** — story_analyzer_agent fetches and analyzes Jira stories, Confluence pages
- **Sprint management** — sprint planning, capacity, retrospectives
- **Estimation** — story point estimation with historical calibration
- **Delivery reporting** — sprint reports, velocity tracking, risk identification
- **Requirements** — business rules extraction, acceptance criteria validation

### Design integration

- **UX specialist** — WCAG 2.1 AA compliance, usability patterns
- **Accessibility audit** — automated checks against accessibility standards
- **UI inspection** — browser-based validation of rendered components
- **Component review** — design system compliance, responsive behavior

---

## Skills and domain knowledge

Skills are Markdown documents loaded as agent context for specific workflows:

- **Coding skills** — backend (Java/Spring), UI (Angular), webapi (Node), Python, Flutter, Terraform, Astro
- **QA skills** — XRay integration, Gherkin conventions, performance baselines
- **Ops skills** — Harness deployment, Splunk queries, ServiceNow workflows
- **Domain skills** — per-workspace knowledge banks (payment flows, booking APIs, etc.)

---

## MCP servers (tool integrations)

| Server            | Purpose                                           |
|-------------------|---------------------------------------------------|
| chrome-mcp        | Browser automation via CDP (navigate, click, screenshot) |
| gitlab            | MR management, code search, pipelines             |
| jira-cloud        | Ticket CRUD, sprint queries, JQL search           |
| confluence-cloud  | Page read/write, space search                     |
| github-disney     | Enterprise GitHub (PRs, code search, releases)    |
| github-public     | Public GitHub repos                               |
| harness           | Deployment pipelines, environment status          |
| bruno             | API collection management and execution           |
| compass           | ServiceNow, Splunk, internal tools                |
| mermaid           | Diagram generation from text                      |
| yax               | Persistent memory (observations, graph, search)   |
| fetch             | HTTP requests for external APIs                   |

---

## Known limitations and pain points

| Pain                         | Impact                                                         | Mitigation                                    |
|------------------------------|----------------------------------------------------------------|-----------------------------------------------|
| Context window saturation    | Large projects fill context fast                               | Resource-aware delegation, domain isolation   |
| Model instruction adherence  | Model sometimes ignores steering in long delegation chains     | Hooks that enforce compliance post-hoc        |
| Tool connection flakiness    | MCP servers disconnect (Jira, Splunk, VPN-dependent)           | Self-healing: retry + fallback chains         |
| Autopilot trust boundary     | How much autonomy without human oversight                      | Conservative default (interactive mode)       |
| No native gate engine        | Gates are prompt-driven, not runtime-enforced                  | Model can skip gates if it hallucinates       |
| Single model per session     | No cost optimization by routing to cheaper models for simple tasks | All agents use same backend model          |
| Hook latency                 | preToolUse hooks add ~100-200ms per tool call                  | Keep hooks lightweight, skip on trusted tools |

---

## Platform capabilities (Kiro/kiro-cli)

| Capability                          | Status      | Notes                                              |
|-------------------------------------|:-----------:|----------------------------------------------------|
| Declarative agent configs (JSON+MD) | ✅ Native   | `~/.kiro/agents/`, steering files                  |
| Multi-agent delegation (subagent)   | ✅ Native   | DAG pipelines with dependencies and loops          |
| Independent context per sub-agent   | ✅ Native   | Parent passes prompt_template, child gets own window|
| Hooks (preToolUse, postToolUse)     | ✅ Native   | Shell/PowerShell scripts with matcher patterns     |
| MCP server integration              | ✅ Native   | stdio-based, auto-discovered via mcp-meta.json     |
| Steering files (behavioral rules)   | ✅ Native   | `steering/` directory, always-loaded               |
| Persistent memory across sessions   | ✅ Custom   | yax MCP server (not built-in to Kiro)              |
| Quality gates (build/test pass)     | ⚠️ Prompt   | Prompt-driven, not runtime-enforced                |
| Multi-model routing per agent       | ⚠️ Partial  | Field exists but all use same backend model        |
| Metrics/telemetry                   | ✅ Custom   | Session hooks + koda stats submit                  |
| Workspace isolation (multi-team)    | ✅ Custom   | workspaces/ directory with inheritance             |
| Autopilot (autonomous execution)    | ✅ Custom   | Steering-driven, no runtime changes needed         |
| IDE agnostic                        | ✅ Native   | Works in Kiro, Cursor, terminal, Electron app      |
