# Release Notes

Machine-parseable release notes displayed by `koda upgrade` after sync.
Format: version header followed by bullet points. Only the latest version block is shown.

<!-- LATEST -->
## v0.2.139

- **feat(jira-mcp)** — XRay Cloud tools: create tests with steps, create executions, report pass/fail, link tests to stories, read steps and runs via GraphQL
- **fix(orchestrator)** — add fallback URL delegation rule and Jira ticket creation routing
- **chore** — deprecate setup.sh and setup.ps1 (replaced by Koda)
<!-- END LATEST -->

## v0.2.137

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

## v0.2.137

- **Catalog-index hook fix** — both `catalog-index.sh` and `catalog-index.ps1` now correctly resolve workspace source from `~/.kiro/steer-runtime` instead of `$KIRO_HOME`, fixing `koda chat --ws` scenarios
- **Hook validation tests** — `make validate-catalog` now tests both KIRO_HOME scenarios + PowerShell syntax check via `pwsh`
- **DGE workspace** — DLP Digital Guest Experience team with 6 services (DPAO, DPAU, VQ, TMS, Wallet, Linking), Harness CI/CD, Jira Cloud integration
- **Demo generator agent** — DPS team agent for generating comprehensive demo documentation from log files and context

## v0.2.137

- **MCP-UI widgets for jira-mcp** — tool responses now include interactive HTML (ticket cards, issue tables, sprint boards) for Kite rendering
- **ui_inspector_agent** — new agent for Chrome DevTools UI validation (navigates, inspects DOM/CSS, executes console JS)
- **cerebro-sustainment workspace** — DX Profile incident ops with 8-section response format
- **Retail & Restaurant workspace** — full workspace for FNB/MERCH teams with architecture, testing conventions
- **Sustainment catalog enrichment** — 20+ services across ticketing-checkout studios with real Splunk queries, runbooks, troubleshooting
- **chrome-launch.sh fix** — `--user-data-dir` required for debug port binding, restored headless mode and WSL support
