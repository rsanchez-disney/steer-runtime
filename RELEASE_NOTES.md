# Release Notes

Machine-parseable release notes displayed by `koda upgrade` after sync.
Format: version header followed by bullet points. Only the latest version block is shown.

<!-- LATEST -->
## v0.2.81

- **Orchestration harness + context compression** — E1-E14 execution engine with automatic context budget management for kiro-cli 2.2.1 (#338)
- **Workspace + Fork MCP levels** — 4-level MCP architecture (global → fork → workspace → user) with `mcp-meta.json` discovery, variable resolution, `_overrides`, and `_source` tracking
- **MCP Levels Guide + Custom MCP Builder Guide** — new docs explaining all 4 levels with step-by-step for fork and workspace MCPs
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
<!-- END LATEST -->

## v0.2.79

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

## v0.2.78

- **KIRO_HOME-aware hooks** — all hooks respect KIRO_HOME env var for multi-workspace session isolation (#319)
- **steer-workspace** — development workspace for the steer ecosystem with docs_curator_agent and ai_research_agent (#318)
- **dev-java profile** — Java specialist agents (#315)
- **chrome-devtools-mcp wrapper** — launches Chrome before MCP for SSO-gated tools (#307)
- **resource-aware delegation** — orchestrators respect system profile injection and RAM constraints (#310)
- **yax recall-first** — all orchestrators auto-recall context on session start (#312)

## v0.2.78

- **inspector profile** — multi-dimensional audit with 10 agents (security, dependencies, config, access, drift, compliance, architecture, performance, logging)
- **SharePoint MCP server** — document management via Microsoft Graph API
- **translation_validator_agent** — validates translations for accuracy and cultural fit
- **web_scraping_validator_agent** — validates live web pages (DOM, accessibility, content)
- **time_machine_agent** — simulates date/time override for testing date-dependent content
- **jira-mcp: Reporter and StoryPoints** — first-class display across all Jira tools
