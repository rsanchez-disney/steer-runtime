# Release Notes

Machine-parseable release notes displayed by `koda upgrade` after sync.
Format: version header followed by bullet points. Only the latest version block is shown.

<!-- LATEST -->
## v0.2.99

- **GitLab MCP** — new MCP server with 9 tools (MRs, file access, code review, search) + `mcp-meta.json` for auto-discovery
- **RCA agent enhancement** — autonomous context resolution via catalog index, ServiceNow MCP integration, AI tool attribution in work notes
- **Studio Cerebro catalog** — 17 BAPPs fully populated (app.yaml, runbooks, troubleshooting, business-rules)
- **Studio Kaos catalog** — 9 BAPPs enriched with operational data, Splunk queries, scaling info
- **Studio Beast workspace** — `sustainment-beast` with 42 projects, 3 BAPPs, DLP Guest Mobile App context
- **Cerebro workspace unified** — moved from root-level `cerebro-sustainment/` to `sustainment/sustainment-cerebro/` (standard pattern)
- **Catalog index enrichment** — `catalog-index.sh/.ps1` now includes Assignment Group and Description columns
- **Commerce ticketing workspace** — new workspace with RCA agent override, team context, ServiceNow conventions
- **ServiceNow MCP** — 8 new tools (comments, related, CHG, CI, KB, on-call, bulk, timeline)
- **AppDynamics MCP** — 7 new tools (backends, errors, events, policies, actions, dashboards, compare)
- **Splunk MCP** — 21 tools with Basic Auth, pre-built bundle
<!-- END LATEST -->

## v0.2.96

- **MCP-UI widgets for jira-mcp** — tool responses now include interactive HTML (ticket cards, issue tables, sprint boards) for Kite rendering
- **ui_inspector_agent** — new agent for Chrome DevTools UI validation (navigates, inspects DOM/CSS, executes console JS)
- **cerebro-sustainment workspace** — DX Profile incident ops with 8-section response format
- **Retail & Restaurant workspace** — full workspace for FNB/MERCH teams with architecture, testing conventions
- **Sustainment catalog enrichment** — 20+ services across ticketing-checkout studios with real Splunk queries, runbooks, troubleshooting
- **chrome-launch.sh fix** — `--user-data-dir` required for debug port binding, restored headless mode and WSL support
## v0.2.95

- **Workspace naming convention** — formal 4-tier naming: `{name}-vertical`, `{name}-team`, `sustainment-{studio}`, `app-{name}` (docs/WORKSPACE_NAMING.md)
- **29 workspace renames** — all workspaces now follow the naming convention (auto-migrated via `renames.json`)
- **`managed_studios` schema field** — scopes managed services catalog per workspace (replaces invalid `context.catalog_scope`)
- **Sustainment Radar** — new `radar.json` with 18 powers for incident triage, health checks, catalog browse, and reports
- **Smart Checklist tools** — 5 new jira-mcp tools for managing Smart Checklist plugin (get, set, add, check, delete)
- **PhotoPass studios** — 25 new catalog entries across studio-photopass-dpi-support and studio-photopass-imagine
- **fix:** Welcome message shows correct workspace after switch (Koda ordering fix)
- **fix:** Hangar ETIMEDOUT — async exec with 10min timeout for app updates (Kite)
- **Workspace MCP template** — `shared/templates/workspace-mcp/` skeleton for teams to scaffold custom MCPs
- **failing_scenarios_finder_agent** (QA) — Jenkins MCP integration with Feature column, emojis, and token persistence (#351)
- **docs_curator_agent: MkDocs knowledge** — MkDocs maintenance and site generation knowledge added (#354)
- **Core utility agents (3)** — `document_analyzer_agent` (PDF/DOCX/OCR), `deck_builder_agent` (PPTX generation), `ai_adoption_stats_agent` (GitHub/Jira metrics)
- **Profile cockpit configs (12)** — dashboard definitions for ba, qa, pm, leadership, ops, presales, design, core, cloudops, inspector, sustainment, steer-master
- **MkDocs documentation site** — context flow and daily commands cheat sheet with GitHub Pages link (#350)
- **JIRA MCP: Agile API epic link** — bypasses screen scheme restrictions using `/rest/agile/1.0/epic/{key}/issue` as fallback
- **workspace_path env vars** — supports `${VAR}`, `$VAR`, `%VAR%`, `~` for cross-platform portability
- **test-workspace-mcp.sh** — local validation script (21 assertions)
- **fix:** kiro-cli 2.2.1 compat — removed contextBudget, renamed agentComplete hook (#339)
- **fix:** JIRA MCP no longer includes epicLink in create fields (prevents hard errors on restrictive projects)
- **fix:** Shield workspace config and README updates (#331, #353)
- **fix:** release guardrails to prevent wrong-repo publishing (#332)
- **fix:** docs cleanup — stale agent counts updated (55→124 agents, 9→21 profiles), mermaid diagrams, broken links (#333-#337)
- **Jira MCP: 270+ custom field aliases** — complete myjira field registry so all teams can use friendly names (storyPoints, aiAssistedEffort, etc.) instead of raw IDs
- **Jira MCP: native sub-task creation** — added `parent` parameter; agents can now create real Sub-tasks instead of Task+link workaround (#355)
- **fix:** Jira MCP field ID corrections — sprint, storyPoints, epicLink now point to correct myjira fields
## v0.2.95

- **Workspace + Fork MCP levels** — 4-level MCP architecture (global → fork → workspace → user) with variable resolution, `_overrides`, and `_source` tracking
- **MCP Levels Guide** — new `docs/guides/mcp-levels.md` explaining all 4 levels with examples
- **Custom MCP Builder Guide** — new `docs/guides/building-custom-mcps.md` with step-by-step for fork and workspace MCPs
- **Workspace MCP template** — `shared/templates/workspace-mcp/` skeleton for teams to scaffold custom MCPs
- **JIRA MCP: Agile API epic link** — bypasses screen scheme restrictions using `/rest/agile/1.0/epic/{key}/issue` as fallback
- **Core utility agents (3)** — `document_analyzer_agent` (PDF/DOCX/OCR), `deck_builder_agent` (PPTX generation), `ai_adoption_stats_agent` (GitHub/Jira metrics)
- **Profile cockpit configs (12)** — dashboard definitions for ba, qa, pm, leadership, ops, presales, design, core, cloudops, inspector, sustainment, steer-master
- **workspace_path env vars** — supports `${VAR}`, `$VAR`, `%VAR%`, `~` for cross-platform portability
- **test-workspace-mcp.sh** — local validation script (21 assertions)
- **fix:** JIRA MCP no longer includes epicLink in create fields (prevents hard errors on restrictive projects)

## v0.2.95

- **KIRO_HOME-aware hooks** — all hooks respect KIRO_HOME env var for multi-workspace session isolation (#319)
- **steer-workspace** — development workspace for the steer ecosystem with docs_curator_agent and ai_research_agent (#318)
- **dev-java profile** — Java specialist agents (#315)
- **chrome-devtools-mcp wrapper** — launches Chrome before MCP for SSO-gated tools (#307)
- **resource-aware delegation** — orchestrators respect system profile injection and RAM constraints (#310)
- **yax recall-first** — all orchestrators auto-recall context on session start (#312)

## v0.2.95

- **inspector profile** — multi-dimensional audit with 10 agents (security, dependencies, config, access, drift, compliance, architecture, performance, logging)
- **SharePoint MCP server** — document management via Microsoft Graph API
- **translation_validator_agent** — validates translations for accuracy and cultural fit
- **web_scraping_validator_agent** — validates live web pages (DOM, accessibility, content)
- **time_machine_agent** — simulates date/time override for testing date-dependent content
- **jira-mcp: Reporter and StoryPoints** — first-class display across all Jira tools
