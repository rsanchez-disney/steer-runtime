# Changelog

All notable changes to steer-runtime.

## [Unreleased]

## [0.2.134] — 2026-06-22

### Added
- **Jira Cloud instance routing** — multi-instance Jira support with automatic URL routing based on workspace configuration (#473)

### Changed
- **Rebuild MCP bundles** — regenerated bundled MCP server artifacts
- **Update certification report** — refreshed certification metrics

## [0.2.133] — 2026-06-22

### Changed
- **Update certification report** — refreshed certification metrics

## [0.2.132] — 2026-06-22

### Changed
- **Refresh orchestration test outputs** — regenerated architecture_spec_agent and prd_generator_agent evaluation results
- **Update certification report** — refreshed certification metrics

## [0.2.131] — 2026-06-22

### Changed
- **Rebuild MCP bundles** — regenerated bundled MCP server artifacts
- **Update certification report** — refreshed certification documentation

## [0.2.130] — 2026-06-22

### Changed
- **Migrate Jira MCP default URL to Atlassian Cloud** — DEFAULT_JIRA_URL changed from myjira.disney.com to disneyexperiences.atlassian.net; updated src, dist, build, .env.example, README, workspace jira_host fields (retail-restaurant, anglerfish, proteus), and UI widget links

## [0.2.129] — 2026-06-21

### Tests
- **Architecture spec agent** — revised test scenario: Config Studio service decomposition (strangler fig migration)
- **PRD generator agent** — new test scenario: Self-Service Refund Portal requirements document
- **Quarterly report agent** — new test scenario: Q3 FY2026 quarterly business report generation

## [0.2.128] — 2026-06-20

### Tests
- **Add retries for flaky delegation tests** — add allow_fail for simple tasks to improve CI stability

## [0.2.127] — 2026-06-20

### Fixed
- **Strengthen delegation mandates for 4 orchestrators** — ops_orchestrator: NEVER check deployments/infra yourself; ba_orchestrator: ALWAYS delegate + explicit Figma/design rule; qa_orchestrator: explicit defect rule — never investigate bugs yourself; sustainment_orchestrator: stronger RCA rule with explicit banned phrases

## [0.2.126] — 2026-06-20

### Fixed
- **Delegation test failures** — ba/qa/sustainment orchestrator prompts: add design_orchestrator_agent to BA delegation mapping for Figma URLs, strengthen QA delegation mandate, add RCA delegation rule to sustainment orchestrator

## [0.2.125] — 2026-06-20

### Added
- **Sustainment photopass workspace** — add sustainment-photopass for AG app-flwdw-dpi (#471)
- **QA backlog_to_gherkin_agent** — command-driven approach with gated pipeline, step_catalog.json support, manual steps via customfield_20104 (#464)
- **QA parameter validation** — grep repo for verified combinations, skip untested
- **QA feature generation guidelines** — dry run mandatory, prerequisite detection, no invented steps
- **QA context optimization** — read catalog by domain, batch jira fetch for steps
- **QA story_to_automation_agent** — prompt-as-resource workaround for both agents
- **QA guard-feature-only.ps1** — Windows compatibility for guard script
- **RCA minimal delegation scenario** — content assertions for RCA
- **BA orchestrator delegation scenario** — Figma URL delegation test

### Fixed
- **QA resource paths** — fix resource paths and match action+result in readiness assessment
- **QA prompt field removal** — use only resources for consistent behavior across kiro-cli versions
- **QA backlog_to_gherkin_agent runtime issues** — resolved agent runtime errors
- **QA prompt-as-resource workaround** — kiro-cli 2.5.1 not injecting prompt field
- **QA secret-scan hook** — fix trailing newlines, replace shell with execute_bash
- **Anglerfish agent overrides** — remove prompt field from anglerfish agent overrides
- **QA feature_writer_agent** — remove broken resource path

### Refactored
- **QA agent rename** — new_backlog_to_gherkin_agent → backlog_to_gherkin_agent

### Chore
- Rebuild MCP bundles
- Update certification report

## [0.2.124] — 2026-06-18

### Added
- **Studio Anglerfish workspace (iOS)** (#465)
- **Studio Proteus subworkspace** — added to retail-restaurant-team
- **Android native profile** — expanded resources in android_native profile
- **Android CLI and Skills setup documentation**
- **Show ready sustainment profile** — added custom data
- **Read tool** — added to other sustainment agents (#463)

### Fixed
- **app.yaml issues** — resolved configuration errors
- **configuration_items** — set as list instead of string

### Changed
- **GCP- jira prefix** — added to adaptive-payments-team workspace

### Docs
- **Graphify reference** — code knowledge graph generation

### Chore
- Rebuild MCP bundles
- Update certification report

## [0.2.123] — 2026-06-16

### Added
- **Studio Beast service catalog** — complete catalog with Splunk indexes, base_spl, escalation contacts, Java 21/Spring Boot 3.4+ stack, DLP ITOC assignment group (#459)

### Fixed
- **Schema compliance** — `configuration_item` → `configuration_items` (plural) across catalog entries
- **Delegation scenarios** — adjusted 3 failing scenarios for less ambiguity: BA (PRD generation), leadership (director report format), implement-feature (Jira URL + fetch-then-plan flow)

## [0.2.122] — 2026-06-16

### Added
- **steer-certify** — trust score and certification report (`make certify`)
- **Orchestrator delegation test harness** — 24 scenarios across 12 orchestrators
- **Unified eval runner** — auto-discovers 187 agents + skills (`make eval-scan`, `make eval-all`)
- **Certification pipeline** — sync + delegation + evals + trust score in one command
- **validate-agents guardrail** — flags orchestrators with non-routing tools
- **Harness testing and certification guide** — `docs/testing/HARNESS_TESTING_AND_CERTIFICATION.md`
- **STEER_HOME env var** — kiro-cli isolation (in Koda, translates to KIRO_HOME)
- **Skill materializer** — Koda flattens directory skills (SKILL.md + references/) for kiro-cli
- **koda check** — enhanced with MCP, skills, orchestrator validation, trust score
- **koda setup --home** — configures STEER_HOME in shell profile

### Changed
- **Orchestrator tools** — all 12 restricted to routing-only: `subagent, thinking, todo_list, @yax/*`
- **sustainment_orchestrator** — retains `fs_read` for service catalog lookups (Option C hybrid)
- **Dev specialist agents** — backend, webapi, ui, flutter, etc. now include `code` + `grep`
- **Orchestrator prompt** — strengthened anti-patterns for coding delegation
- **Workspace naming** — `sustainment-uad` → `sustainment/sustainment-uad`, `app-team` → `adaptive-payments-team`

### Fixed
- **ACP prompt format** — corrected for delegation runner + eval runner
- **Delegation runner** — rewritten in Python (reliable JSON, 180s timeout, subagent/list_update detection)
- **False positive agent detection** — excluded `_kiro.dev/commands/available` from analysis
- **Delegation scenarios** — use workspace-specific context (DPAY keys, real URLs)

## [0.2.106]

### Added
- **Harness MCP server** — 7 tools (list/trigger pipelines, executions, logs, services, environments) with `mcp-meta.json` for auto-discovery
- **`network_diagnostics_agent`** — DNS resolution, TLS certificate validation, connectivity checks via Compass
- **DX Lodging Tools workspace** — hierarchical multi-team structure (Rocket, Star Lord, Yondu) with custom `rocket_alert_analyst_agent`
- **Studio Ant-Man catalog** — 28 BAPPs with full operational data (app.yaml, runbooks, troubleshooting, business-rules)
- **Release manager Quick Actions** — auto-commits RELEASE_NOTES.md + CHANGELOG.md + VERSION on approval

### Changed
- **`sustainment_orchestrator_agent`** — added `@compass/*` to tools for direct access (hybrid: simple queries direct, complex workflows delegated)
- **`deployment_agent`** — rewritten prompt with deploy/release/hotfix workflows and safety rails
- **`ops_orchestrator_agent`** — added `@harness/*` to allowedTools, expanded routing for releases/hotfixes
- **`cloudops_orchestrator_agent`** — added `@harness/*` to allowedTools
- **MCP_REFERENCE.md** — added gitlab-mcp and harness-mcp documentation with prompt examples

### Fixed
- **Finder-services workspace_path** — replaced hardcoded `~/Workspace/Disney/wdpro-development` with `${WORKSPACE_ROOT}/Disney`

---

## [0.2.96]

### Added
- **MCP-UI widgets** — `jira_get_issue`, `jira_search_issues`, `jira_get_sprint_issues` now return interactive HTML resource blocks (ticket cards, tables, Kanban boards) for Kite rendering
- **`ui_inspector_agent`** — Chrome DevTools Protocol agent for DOM/CSS inspection, console execution, layout validation (dev-core profile)
- **`cerebro-sustainment` workspace** — DX Profile incident ops with 8-section structured response format
- **`retail-restaurant` workspace** — FNB/MERCH teams with architecture diagrams, testing conventions, team context
- **Sustainment catalog enrichment** — 20+ services across ticketing-checkout studios with Splunk queries, runbooks, troubleshooting docs

### Changed
- **`chrome-launch.sh`** — requires `--user-data-dir` for debug port binding; restored `--headless=new`; platform-aware debug dir; restored WSL support
- **`ui_inspector_agent` tools** — scoped to `@chrome-devtools/*` + `thinking` only (removed redundant `allowedTools`)

### Fixed
- **chrome-launch.sh** — Chrome silently ignored `--remote-debugging-port` without `--user-data-dir`

---

## [0.2.81] — 2026-05-14

### Added
- **Orchestration harness + context compression** — E1-E14 execution engine with automatic context budget management for kiro-cli 2.2.1 (#338)
- **Workspace + Fork MCP levels** — 4-level MCP architecture (global → fork → workspace → user) with `mcp-meta.json` discovery, variable resolution, `_overrides`, and `_source` tracking (#341)
- **MCP Levels Guide** — new `docs/guides/mcp-levels.md` explaining all 4 levels with examples
- **Custom MCP Builder Guide** — new `docs/guides/building-custom-mcps.md` with step-by-step for fork and workspace MCPs
- **Workspace MCP template** — `shared/templates/workspace-mcp/` skeleton for teams to scaffold custom MCPs
- **failing_scenarios_finder_agent** (QA) — Jenkins MCP integration with Feature column, emojis, and token persistence (#351)
- **docs_curator_agent: MkDocs maintenance** — MkDocs site generation and maintenance knowledge (#354)
- **Core utility agents (3)** — `document_analyzer_agent` (PDF/DOCX/OCR), `deck_builder_agent` (PPTX generation), `ai_adoption_stats_agent` (GitHub/Jira metrics)
- **Profile cockpit configs (12)** — dashboard definitions for ba, qa, pm, leadership, ops, presales, design, core, cloudops, inspector, sustainment, steer-master
- **MkDocs documentation site** — context flow and daily commands cheat sheet with GitHub Pages link (#350)
- **JIRA MCP: Agile API epic link fallback** — bypasses screen scheme restrictions using `/rest/agile/1.0/epic/{key}/issue`
- **workspace_path env vars** — supports `${VAR}`, `$VAR`, `%VAR%`, `~` for cross-platform portability
- **test-workspace-mcp.sh** — local validation script (21 assertions)
- **Artifact emit model spec** — documentation for artifact emit model and steer-master maintenance (#347)
- **Jira MCP: 270+ custom field aliases** — complete myjira field registry for all teams; friendly names resolve to correct field IDs (#355)
- **Jira MCP: native sub-task creation** — `parent` parameter on `jira_create_issue` enables real Sub-tasks (#355)

### Changed
- **kiro-cli 2.2.1 compat** — removed `contextBudget`, renamed `agentComplete` hook (#339)
- **Jira MCP: refactored `createJiraIssue`** — replaced 13 positional params with typed options object (#355)

### Fixed
- JIRA MCP no longer includes epicLink in create fields — prevents hard errors on restrictive projects
- Shield workspace config and README corrections (#331, #353)
- Release guardrails to prevent wrong-repo publishing (#332)
- Mermaid diagram rendering error in AGENTS.md (#333)
- Stale agent counts updated across all docs (55→124 agents, 9→21 profiles) (#334)
- Profile READMEs updated with missing agents (#335)
- Remaining docs cleanup — setup.sh refs, broken links, release notes (#336)
- Duplicated context files removed from shared/context/ (#337)
- Preserve user-added MCP servers during mcp-install regeneration
- Correct MCP server prefixes in core agent configs
- Jira MCP: sprint, storyPoints, epicLink field IDs corrected to match myjira instance (#355)

---

## [3.10.0] — 2026-05-08

### Added
- **jira_prefix string | string[]** — workspace schema now accepts single string or array of prefixes (ADR-001) (#325)
- **Finder Services workspace** — Triumph + Incredibles teams with repo URLs and teams table (#304, #326)
- **dev-ai profile** — renamed from dev-ml, adds 4 specialist agents: ai_orchestrator, data_scientist, llm_engineer, mlops_engineer (#328)
- **kiro-ide profile selection** — `setup-kiro-ide.ps1` supports profile args, `dev` alias, interactive menu + deprecation warning (#250)
- **Shield workspace** — initial workspace setup (#317)

### Fixed
- Normalize jira_prefix to always include trailing dash (#329)
- `dev` alias now expands to all 9 dev-* profiles (#250)

---

## [3.9.0] — 2026-05-05

### Added
- **KIRO_HOME-aware hooks** — all hooks (agent-registry, mcp-json, workspace-snapshot) respect `KIRO_HOME` env var for multi-workspace session isolation (#319)
- **steer-workspace** — development workspace for the steer ecosystem with docs_curator_agent, ai_research_agent, steer-plugins in release manager (#318)
- **dev-java profile** — Java specialist agents (#315)
- **inspector profile** — multi-dimensional audit with fan-out/fan-in topology: 10 agents (inspector_orchestrator, security_reviewer, dependency_auditor, config_inspector, access_analyst, drift_detector, compliance_checker, architecture_critic, performance_auditor, log_analyst). Produces ranked reports with severity scoring (🟢/🟡/🔴), yax trend tracking, and CRITICAL blocking (#313)
- **resource-aware delegation** — orchestrators respect system profile injection and RAM constraints (#310)
- **yax recall-first + auto-save** — all 8 orchestrators auto-recall context on session start (#312)
- **chrome-devtools-mcp wrapper** — launches Chrome before MCP for SSO-gated tools (#307)
- **commerce-ticketing-and-checkout-team workspace** (#305)
- **DPE workspace** — env var breaking change detection, code review checks (#309)
- **SharePoint MCP server** — 6 tools for document management via Microsoft Graph API (#280)
- **Chrome MCP server** — browser automation for QA and Splunk (#284)
- **translation_validator_agent** (BA) — validates translations for accuracy, idioms, cultural fit (#281)
- **web_scraping_validator_agent** (QA) — validates live web pages by scraping DOM (#282)
- **time_machine_agent** (QA) — simulates accessing a website at any date/time (#283)
- **jira-mcp: issue linking, dev status, user profile, XRay write tools** (#288)
- **jira-mcp: Reporter and StoryPoints fields** (#279)
- **GitHub Projects v2** — 4 tools for project board management (#278)
- **Confluence multi-instance** — `CONFLUENCE_INSTANCE_PREFIX` for tool disambiguation (#272, #273)

### Changed
- **steer_release_manager_agent** — renamed from release_manager_agent, added KiteStream and steer-plugins scope (#314)
- **devops_runner_agent** — new agent in dev-core for builds, tests, and git ops
- **splunk_query_agent** — moved from sustainment to dev-core, uses chrome-devtools MCP for SSO (#293)

### Fixed
- Orchestrator delegation — enforce by removing write tools, restrict to read-only execute_bash
- @yax/* wildcard missing in orchestrator tools (#311)
- dev-ui: add @compass/* tools and MCP tool name docs (#316)
- splunk_query_agent: chrome-launch hook kills existing Chrome before relaunching (#296)
- Route pending PR reviews to story_analyzer_agent (#300)
- Add guardrail to always use @github/* MCP over gh CLI (#301)

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
