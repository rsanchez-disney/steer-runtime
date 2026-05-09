# Release Notes

Machine-parseable release notes displayed by `koda upgrade` after sync.
Format: version header followed by bullet points. Only the latest version block is shown.

<!-- LATEST -->
## v0.2.77

- **jira_prefix string | string[]** — workspace schema now accepts single string or array of prefixes (ADR-001)
- **Finder Services workspace** — Triumph + Incredibles teams
- **dev-ai profile** — renamed from dev-ml, adds ai_orchestrator, data_scientist, llm_engineer, mlops_engineer
- **kiro-ide profile selection** — setup-kiro-ide.ps1 supports profile args, dev alias, interactive menu
- **Shield workspace** — initial workspace setup
- **fix:** normalize jira_prefix trailing dash; dev alias expands to all 9 dev-* profiles
- **fix:** documentation count drift (55→124 agents, 9→21 profiles)
<!-- END LATEST -->

## v0.2.76

- **KIRO_HOME-aware hooks** — all hooks respect KIRO_HOME env var for multi-workspace session isolation (#319)
- **steer-workspace** — development workspace for the steer ecosystem with docs_curator_agent and ai_research_agent (#318)
- **dev-java profile** — Java specialist agents (#315)
- **chrome-devtools-mcp wrapper** — launches Chrome before MCP for SSO-gated tools (#307)
- **resource-aware delegation** — orchestrators respect system profile injection and RAM constraints (#310)
- **yax recall-first** — all orchestrators auto-recall context on session start (#312)

## v0.2.75

- **inspector profile** — multi-dimensional audit with 10 agents (security, dependencies, config, access, drift, compliance, architecture, performance, logging)
- **SharePoint MCP server** — document management via Microsoft Graph API
- **translation_validator_agent** — validates translations for accuracy and cultural fit
- **web_scraping_validator_agent** — validates live web pages (DOM, accessibility, content)
- **time_machine_agent** — simulates date/time override for testing date-dependent content
- **jira-mcp: Reporter and StoryPoints** — first-class display across all Jira tools
