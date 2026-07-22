# Release Notes

Machine-parseable release notes displayed by `koda upgrade` after sync.
Format: version header followed by bullet points. Only the latest version block is shown.

<!-- LATEST -->
## v0.2.168

- **fix(orchestrator)** — remove `@cortex/*` from dev-core orchestrator (not yet stable for general routing)
- **fix(qa_orchestrator)** — restrict to routing-only tools; remove direct Jira/Confluence access that bypassed delegation
- **fix(sustainment_orchestrator)** — strengthen RCA delegation rule as hard constraint (FORBIDDEN list) to prevent certification failures
- **improve(leadership_orchestrator)** — explicit "always delegate" rule to prevent direct report generation
- **chore(certification)** — updated report: Trust Score 85/100 (16/26 delegation, 4/4 structural, 100 quality)
<!-- END LATEST -->

## v0.2.167

- **feat(catalog)** — populate studio-fnb managed services catalog with 36 FNB applications (#599)
- **feat(agents)** — integrate graphify MCP tools into codebase_explorer and architecture agents for code-graph-aware analysis (#604)
- **feat(workspace)** — add ai-analytics-team workspace (#605)

## v0.2.164

- **feat(adaptive-payments-team)** — graphify reports (25 repos), knowledge base (incident patterns, architecture decisions, Splunk cookbook), and workspace steering
- **feat(steer-platform)** — steering, knowledge, and graphify reports for all 10 platform projects
- **improve(sustainment-beast)** — new template for incident reports in beast-team context (#583)
- **docs** — release workflow reference with Mermaid diagrams, download stats, and adoption tracking
- **fix** — align VERSION and RELEASE_NOTES with published v0.2.156
- **chore** — rebuild MCP bundles, update certification report, ignore graphify-out/
<!-- END LATEST -->

## v0.2.164

- **feat(security)** — block EDR-triggering commands: browser DB reads, credential store access, and other EDR-suspicious operations
- **feat(jira-mcp)** — `xray_cloud_get_test_datasets` and `xray_cloud_update_test_datasets` tools for XRay Cloud dataset management
- **feat(pos-team)** — Bug Triage Agent, orchestration agent, QA Validation Agent, architecture management, receipts refactor learnings, DSP bug report format
- **feat(sustainment)** — rewrite RCA agent prompt & enrich services catalog with extended metadata
- **feat(workspace)** — Connected Products team workspace initial setup
- **docs** — S9/S10 token strategy specs, Compass MCP setup guide
- **fix(orchestrator)** — Harness URL routing to deployment_agent for CI/CD delegation
- **fix(sustainment)** — catalog-index hooks support singular and plural CI field names
- **fix(jira-mcp)** — GraphQL variable naming alignment and deprecation warnings
- **fix(catalog)** — encoding issues from PR #554 review
<!-- END LATEST -->

## v0.2.164

- **docs** — token savings strategy spec: 8 strategies scored on impact/efficiency/backward compatibility with phased implementation plan
- **fix(orchestrator)** — wiki URL delegation examples and trigger phrases to prevent misclassification of bare wiki/confluence URLs
- **chore** — migrate myjira + mywiki references to Atlassian Cloud URLs
<!-- END LATEST -->

## v0.2.164

- **steer-certify** — trust score and certification report combining delegation tests + evals into a single quality gate
- **Orchestrator delegation test harness** — 24 scenarios across 12 orchestrators validating correct delegation to specialists
- **Unified eval runner** — auto-discovers and evaluates 187 agents + skills via `make eval-all`
- **Certification pipeline** — `make certify` runs sync + delegation tests + evals + generates CERTIFICATION.md
- **validate-agents guardrail** — flags orchestrators with non-routing tools to prevent delegation regression
- **Orchestrator prompt strengthening** — explicit anti-patterns for coding tasks (never write code, run tests, or explore codebase)
- **STEER_HOME** — env var for kiro-cli isolation (Koda translates to KIRO_HOME)
- **Skill materializer** — directory skills (SKILL.md + references/) auto-flattened for kiro-cli discovery
- **Workspace naming** — `sustainment-uad` moved under `sustainment/`, `app-team` renamed to `adaptive-payments-team`
- **fix:** orchestrator tools restricted to routing-only (subagent, thinking, todo_list, @yax/*)
- **fix:** sustainment_orchestrator retains fs_read for service catalog lookups (Option C hybrid)
- **fix:** dev specialist agents (backend, webapi, ui, etc.) now include code + grep tools
- **fix:** ACP prompt format corrected for delegation runner + eval runner
- **fix:** delegation runner rewritten in Python with 180s timeout and subagent/list_update detection
<!-- END LATEST -->

## v0.2.164

- **Catalog-index hook fix** — both `catalog-index.sh` and `catalog-index.ps1` now correctly resolve workspace source from `~/.kiro/steer-runtime` instead of `$KIRO_HOME`, fixing `koda chat --ws` scenarios
- **Hook validation tests** — `make validate-catalog` now tests both KIRO_HOME scenarios + PowerShell syntax check via `pwsh`
- **DGE workspace** — DLP Digital Guest Experience team with 6 services (DPAO, DPAU, VQ, TMS, Wallet, Linking), Harness CI/CD, Jira Cloud integration
- **Demo generator agent** — DPS team agent for generating comprehensive demo documentation from log files and context

## v0.2.164

- **MCP-UI widgets for jira-mcp** — tool responses now include interactive HTML (ticket cards, issue tables, sprint boards) for Kite rendering
- **ui_inspector_agent** — new agent for Chrome DevTools UI validation (navigates, inspects DOM/CSS, executes console JS)
- **cerebro-sustainment workspace** — DX Profile incident ops with 8-section response format
- **Retail & Restaurant workspace** — full workspace for FNB/MERCH teams with architecture, testing conventions
- **Sustainment catalog enrichment** — 20+ services across ticketing-checkout studios with real Splunk queries, runbooks, troubleshooting
- **chrome-launch.sh fix** — `--user-data-dir` required for debug port binding, restored headless mode and WSL support
