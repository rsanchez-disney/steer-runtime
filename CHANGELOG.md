# Changelog

All notable changes to steer-runtime.

## [Unreleased]

### Added
- **SharePoint MCP server** — 6 tools for document management via Microsoft Graph API (list sites, drives, items, search, get, upload) (#280)
- **translation_validator_agent** (BA) — validates translations for accuracy, idioms, cultural fit across 10+ languages (#281)
- **web_scraping_validator_agent** (QA) — validates live web pages by scraping DOM: structure, content, accessibility (WCAG 2.1 AA), links (#282)
- **time_machine_agent** (QA) — simulates accessing a website at any date/time by overriding browser JS Date via Chrome MCP (#283)
- **jira-mcp: Reporter and StoryPoints fields** — first-class display and input across all tools (get, search, sprint, create, update) (#279)

---

## [0.2.x] — 2026-04-10 → 2026-04-26

### Added — Profiles & Agents
- **leadership profile** — cross-team analytics, quarterly reports, executive briefings: 5 agents (leadership_orchestrator, portfolio_analyst, quarterly_reporter, executive_briefing, cross_team_coordinator) (#218)
- **sustainment profile** — incident response, RCA, stability validation, GSM: 5 agents + ServiceNow ticket awareness across ops/sustainment (#206)
- **core profile** — always-installed infrastructure agents (email_agent, log_analyzer_agent, story_analyzer_agent)
- **dev-php profile** — PHP/Zend Framework specialist with code review checklist (#175)
- **dev-dotnet profile** — .NET specialist agents for self-host-api and serverless archetypes (#175)
- **email_agent** — dedicated agent for sending emails via Compass MCP
- **log_analyzer_agent** (ops) — log parsing, error patterns, incident summaries via Compass MCP
- **scrum_master_agent** (app-team) — sprint tracking, velocity, reports via Jira (#198)
- **delivery_reporter_agent** (PM) — generates sprint reports matching DPE MyWiki 10-section template (#203)

### Added — MCP Servers
- **GitHub Projects v2** — 4 new tools for project board management in github-mcp (#278)
- **Confluence multi-instance** — `CONFLUENCE_INSTANCE_PREFIX` for tool disambiguation across instances (#272, #273)
- **Jira multi-instance** — `JIRA_URL` + `JIRA_INSTANCE_PREFIX` for multiple Jira instances (#166)
- **Jira Cloud support** — expanded fields, child issues tool, Cloud vs Server auth detection
- **Jira Xray tools** — 10 test management tools (test steps, executions, plans, sets, pre-conditions, statuses)
- **Jira custom fields** — configurable via `JIRA_CUSTOM_FIELDS` env var, alias resolution by name or ID
- **AppDynamics MCP** — OAuth client credentials, 17 observability tools (#226)
- **ServiceNow MCP** — incident/change/problem management tools (#226)
- **Splunk MCP** — Basic Auth migration, log search and analysis (#226, #239)
- **qTest MCP** — test management with rate limiting and module cache (#226)
- **MCP priority context** — all agents prefer dedicated @jira/@confluence over Compass (#65b75f2)
- **Parallel MCP builds** — `make build-mcp` parallelizes all server builds (#269)

### Added — Workspaces
- **Payments & Accounting** workspace vertical (#244)
- **Lodging Sales Distribution** workspace with teams schema (#266)
- **bolt-team** workspace for BOLT Admin AngularJS→Angular 20 migration
- **txp-team** workspace for quick quote web components
- **ge-team** and **trips** workspaces
- **ra-team** and **phoenix** workspaces
- **cart-checkout-tep3** workspace for SDD practices (#164)

### Added — Orchestrator Improvements
- **Delegation mappings** — all orchestrators have explicit MCP delegation tables, protected files safeguard (#275, #276, #277)
- **Yax persistent memory** — all 8 orchestrators get persistent memory across sessions
- **Intent classification** — orchestrators classify user intent before delegating
- **Compass MCP awareness** — email, ServiceNow, GitLab, DNS tool routing across orchestrators
- **ServiceNow ticket awareness** — ops/sustainment orchestrators auto-detect SNOW prefixes (INC, CTASK, CHG, PRB)

### Added — Documentation
- **AI Fundamentals glossary** — concepts and definitions for AI agents, SteerMesh ecosystem (#266, #267)
- **System layers architecture** — responsibilities and boundaries document
- **Workspace agent merge** — how global + workspace agents merge into single agent
- **Markdown formatting skill** — applied to docs
- **Windows native CLI setup** — rewritten for native (no WSL) with troubleshooting
- **Role-based profile installation guide** in README

### Fixed
- Orchestrators explicitly prohibit direct MCP tool calls — must delegate (#264, #274)
- Orchestrator delegates general Jira queries to story_analyzer (#263)
- `@mywiki/*` tools added to 16 agents missing MyWiki access (#260)
- Correct tool names across all orchestrators (`subagent`, `todo_list`) (#208, #209, #210)
- Hardcoded Jira prefixes removed from orchestrator welcome messages
- `jira.disney.com` → `myjira.disney.com` across docs and prompts
- Stale MCP dist bundles rebuilt (confluence-mcp, github-mcp)
- qTest MCP moved from `.kiro/` to `shared/tools/` for Koda discovery
- bolt-team agent moved to profile overlay for Koda install compatibility

### Changed
- Orchestrators disable `includeMcpJson` to prevent direct MCP calls — all MCP work delegated to specialists (#264)
- Removed `@compass/*` from all orchestrators — must delegate to log_analyzer or email_agent
- Removed context7 MCP — blocked at Disney
- Removed mywiki-mcp — mywiki now reuses confluence-mcp binary with instance prefix

---

## [0.1.x] — 2026-03-28 → 2026-04-10

### Added
- **steer-master profile** — specialized code reviewer for steer-runtime & Koda consistency: 5 agents, 6 golden rules, 2 validation hooks, memory bank (#163)
- **Enterprise Memory Bank** — service/channel bank templates, shared context (enterprise architecture, domain glossary, API standards), Config Studio example (#151)
- **Orchestrator execution modes** — review mode (pause after each specialist) and autopilot mode (run straight through) (#160)
- **Agent registry hook** — automatic agent discovery via `agent-registry.sh` on session start (#157)
- **Kiro IDE setup** — `setup-kiro-ide.ps1` for Windows + `kiro-ide` subcommand in `setup.sh` (#153)
- **Developer Quick Start Guide** — practical copy-paste prompts for orchestrator (#154, #150)
- **memory-mcp** — persistent semantic memory for agents via containerized vector store (#149)
- **WSL path detection** — `to_win_path()` converts Linux paths to Windows UNC format (#159, #161)
- **Figma MCP server** — compiled and bundled figma-mcp for UI/UX agents (#152)
- **Compass MCP server** — SSE-based remote MCP for global search (#140)
- **Multi-instance GitHub MCP** — support multiple GitHub remotes with per-remote config (#135)
- **Astro agent + Vista web components** — SSR specialist with React islands, Nanostores state (#138)
- **dev-python profile** — Python specialist for FastAPI, Flask, Django (#134)
- **dev-infra profile** — Terraform/IaC specialist (#134)
- **Amazon Q sync agent** — sync rules + context + MCP to Amazon Q plugin (#145)
- **Generate steering from agents** — skill to convert kiro-cli agent definitions into Kiro IDE steering files (#147)

### Fixed
- WSL path deduplication — extracted `to_win_path()` to single definition (#161)
- Windows setup guide — WSL prerequisites formatting (#155, #158)
- `setup.sh` — removed `local` keyword outside function scope (#148)
- MCP build scripts — added esbuild to devDependencies (#143, #144)
- MCP bundle script — ship self-contained `dist/index.cjs` (#141)
- `setup.sh` workspace commands — support nested folders (#137)
- Stale doc counts — fixed agent/profile counts (#139)

### Changed
- Orchestrator prompt — replaced manual "Agent Discovery" with injected "Agent Registry" from hook (#157)
- MCP_SETUP.md — comprehensive rewrite with all servers documented (#142)
- Workspace model — supports nested child workspaces (#136)
- Workspace apply — auto-clone repos, init memory banks, resolve paths (#132)

---

## [0.1.0] — 2026-03-28

Initial release with dev-core, dev-web, dev-mobile, ba, qa, ops, pm profiles.
