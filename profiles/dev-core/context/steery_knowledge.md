# Steery knowledge base

Condensed reference for the steer-runtime support assistant.

## Platform overview

steer-runtime is an AI agent platform for software teams. 151 agents across 21 profiles.

Tools: **Koda** (terminal companion + TUI) · **Kiro** (CLI engine) · **Kite** (Electron desktop) · **Mouseketool** (web chat) · **yax** (persistent memory)

## Profiles

| Profile      | Agents | Orchestrator                     | Focus                                                         |
|--------------|:------:|----------------------------------|---------------------------------------------------------------|
| dev-core     |   26   | orchestrator                     | SDLC orchestration, planning, code review, security, PRs      |
| qa           |   25   | qa_orchestrator_agent            | Test planning, automation, defect analysis, API & perf testing |
| sustainment  |   11   | sustainment_orchestrator_agent   | Incident triage, RCA, stability, GSM, crash analysis          |
| ops          |   10   | ops_orchestrator_agent           | AI metrics, infra, deployments, log analysis, email           |
| inspector    |   10   | —                                | Multi-dimensional audit and compliance                        |
| steer-master |    9   | steer_orchestrator_agent         | steer-runtime/Koda development and review                     |
| ba           |    9   | ba_orchestrator_agent            | Requirements, scope, user stories, PRDs, estimation           |
| design       |    7   | —                                | Design discovery and UX research                              |
| pm           |    6   | pm_orchestrator_agent            | Sprints, standups, retros, risk tracking, delivery reports    |
| core         |    6   | —                                | Email, log analysis, story analysis                           |
| leadership   |    5   | leadership_orchestrator_agent    | Cross-team analytics, quarterly reports, executive briefings  |
| dev-web      |    5   | —                                | Java backend, Node.js API, Angular UI, UX, Astro             |
| dev-ai       |    5   | —                                | ML training, data science, LLM apps, MLOps                   |
| cloudops     |    4   | —                                | Infrastructure strategy and SRE                               |
| dev-ui       |    3   | —                                | Legacy Angular, Polymer, Lambda                               |
| dev-mobile   |    3   | —                                | Flutter, Android native, iOS native                           |
| dev-dotnet   |    3   | —                                | .NET / C# development                                        |
| presales     |    1   | —                                | Pre-sales and client intake                                   |
| dev-python   |    1   | —                                | Python (FastAPI, Flask, Django)                               |
| dev-php      |    1   | —                                | PHP / Zend                                                    |
| dev-infra    |    1   | —                                | Terraform / IaC                                               |

Profile aliases: `dev` = all dev-* profiles combined.

## Install with Koda

```bash
curl -fsSL https://github.disney.com/raw/SANCR225/steer-runtime/main/tools/install-koda.sh | bash
koda setup                        # Check dependencies
koda install dev                  # Install dev agents
koda mcp-install                  # Setup MCP servers
koda configure                    # Configure tokens
koda chat --agent orchestrator    # Start chatting
```

## Install with setup.sh (alternative)

```bash
git clone <repo> ~/steer-runtime && cd ~/steer-runtime
./setup.sh install dev
./setup.sh mcp-install
```

## Koda commands

- `koda` — interactive TUI dashboard
- `koda chat [--agent NAME] [--model MODEL]` — chat with an agent
- `koda chat --ws NAME` — chat with a workspace session
- `koda chat --target cursor` — route to Cursor IDE
- `koda install/remove/sync/list/clean` — profile management
- `koda workspace list/show/apply/create` — team workspaces
- `koda configure` — token setup
- `koda mcp-install` — MCP server setup
- `koda doctor` — deep health check
- `koda setup` — install dependencies
- `koda status` — one-liner status
- `koda team` — multi-agent team orchestration
- `koda plan` — read-only planning mode
- `koda ci run` — headless execution for pipelines
- `koda graphify` — code knowledge graph builder
- `koda stats submit` — AI metrics recording
- `koda config set/get` — configuration management (model, etc.)
- `koda kiro-cli install` — install/update kiro-cli

## Workspaces

39 team workspaces pre-configure profiles, rules, MCP servers, and context:

- `koda workspace list` — see available
- `koda workspace apply payments-core` — apply team config
- `koda workspace create my-team` — scaffold new workspace

Workspaces support inheritance (`extends`), exclusive overrides, project cloning, and Cortex integration.

## MCP servers (22 available)

| Server            | Purpose                                          |
|-------------------|--------------------------------------------------|
| jira-mcp          | Jira issues, XRay test management, fix versions  |
| confluence-mcp    | Pages, search, attachments                       |
| github-mcp        | PRs, reviews, code search                        |
| gitlab-mcp        | MRs, pipelines, code search                      |
| chrome-mcp        | Browser automation with SSO                      |
| bruno-mcp         | API testing collections                          |
| harness-mcp       | CI/CD pipeline management                        |
| servicenow-mcp    | Incident management                              |
| splunk-mcp        | Log queries                                      |
| newrelic-mcp      | APM and crash analytics                          |
| appium-mcp        | Mobile test execution                            |
| figma-mcp         | Design file access                               |
| teams-mcp         | Microsoft Teams messaging                        |
| sharepoint-mcp    | Document management                              |
| memory-mcp        | Persistent memory (yax)                          |
| mermaid-diagram-mcp | Diagram generation                             |
| appdynamics-mcp   | Application performance monitoring               |
| azure-devops-mcp  | Azure DevOps boards and repos                    |
| qtest-mcp         | Test management                                  |
| openrouter-mcp    | Multi-model routing                              |
| servicenow-graph-mcp | ServiceNow graph queries                      |
| chrome-devtools-mcp | Chrome DevTools Protocol                        |

Tokens configured via `koda configure`. MCP servers auto-discovered via `mcp-meta.json`.

### Jira MCP highlights

- **Fix versions**: `fixVersions` (replace), `addFixVersions` (append), `removeFixVersions` (remove)
- **XRay folders**: `xray_list_repository_folders`, `xray_create_repository_folder`, `xray_get_folder_tests`, `xray_move_tests_to_folder`
- **Bulk operations**: `jira_bulk_update_issues`, `jira_transition_issue`

## Experimental features

| Feature            | Description                                                       |
|--------------------|-------------------------------------------------------------------|
| Autopilot          | Autonomous SDLC loop — ticket to PR without human gates           |
| Model routing      | Per-agent model selection — stronger models for complex tasks      |
| Propose-Judge      | Dual-strategy SDLC — explore alternatives + score quality         |
| CI Mode            | Headless agent execution for pipelines                            |
| Planning Mode      | Read-only exploration and plan generation                         |
| Graphify           | Code knowledge graph for codebase understanding                   |
| Per-Project Memory | SQLite-backed persistent memory isolated per project              |
| Cursor Integration | Multi-runtime — run agents in Cursor IDE                          |
| Cortex             | Platform knowledge graph — cross-repo service context via MCP     |
| Context On-Demand  | Load context files only when task matches keyword triggers         |
| Session State      | Lightweight session resume                                        |
| Depth Calibration  | Adaptive output detail based on task complexity                   |
| Content Validation | Pre-write hook validating JSON, YAML, and Markdown                |
| Design Review Hook | Pre-push plan drift detection                                     |

## Model routing (new)

Agents can specify which LLM model to use via `"model"` field in agent JSON:

```json
{"name": "code_review_agent", "model": "claude-opus-4.6"}
```

Resolution: CLI flag (`--model`) > agent JSON > settings default > `auto`.

Available models: `claude-opus-4.6` (2.2x), `claude-sonnet-4.6` (1.3x), `claude-sonnet-4` (1.3x), `claude-haiku-4.5` (0.4x), `auto` (default).

## Hooks

22 shared hooks in `shared/hooks/` (bash + PowerShell):

- `agentSpawn`: git-context, agent-registry, delegation-map, context-inject, catalog-index
- `preToolUse`: guard-writes, branch-guard, block-suspicious, guard-feature-only, secret-scan
- `postToolUse`: lint-on-write, session-to-memory, telemetry-emit, warn-destructive
- `agentComplete`: session-summary

## Common issues

**kiro-cli not found**: Install via `koda kiro-cli install` or `curl -fsSL https://cli.kiro.dev/install | bash`

**MCP servers not working**: Run `koda mcp-install` to verify bundles and generate mcp.json.

**Agent not responding**: Check `koda doctor` for missing dependencies. Ensure tokens are configured with `koda configure`.

**Permission errors on tools**: Use `koda chat --trust-all` or set trust preference on first prompt.

**Profile not found**: Run `koda list` to see available profiles. Use `koda sync` to update.

**Resources not loading from project dir**: Update Koda — file:// paths are now resolved to absolute at install time (fixed in v0.4.227).

**Windows issues**: Use PowerShell. Install via `irm .../install-koda.ps1 | iex`. All hooks have `.ps1` equivalents.

## Reporting issues

When reporting a bug, include: OS, kiro-cli version (`kiro-cli --version`), koda version (`koda version`), error message, and steps to reproduce.

## Feature requests

Describe: what you want, why it's useful, which profile/agent it relates to. Open an issue or PR against steer-runtime.
