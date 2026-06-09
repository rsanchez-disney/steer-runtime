# MCP Server Reference — steer-runtime

Complete reference for all MCP servers: tools, capabilities, prompt examples, and agent access.

**Total:** 17 MCP servers | 200+ tools | 58 agents connected

---

## Quick Reference

| MCP Server | Tools | Auth | Type | Used By |
|------------|-------|------|------|---------|
| [jira-mcp](#jira-mcp) | 25 | PAT | stdio | 40+ agents |
| [confluence-mcp](#confluence-mcp) | 8 | PAT | stdio | 35+ agents |
| [github-mcp](#github-mcp) | 15 | PAT | stdio | 20+ agents |
| [gitlab-mcp](#gitlab-mcp) | 11 | PAT | stdio | 15+ agents |
| [harness-mcp](#harness-mcp) | 7 | API Key | stdio | 4 agents |
| [chrome-mcp](#chrome-mcp) | 8 | None | stdio | 2 agents |
| [sharepoint-mcp](#sharepoint-mcp) | 6 | Azure AD | stdio | — |
| [qtest-mcp](#qtest-mcp) | 20 | Bearer | stdio | 6 agents |
| [servicenow-mcp](#servicenow-mcp) | 23 | Credentials | stdio | 1 agent |
| [splunk-mcp](#splunk-mcp) | 21 | Credentials | stdio | 1 agent |
| [appdynamics-mcp](#appdynamics-mcp) | 17 | OAuth | stdio | 1 agent |
| [figma-mcp](#figma-mcp) | 5 | Token | stdio | 3 agents |
| [bruno-mcp](#bruno-mcp) | 10 | None | stdio | 6 agents |
| [yax](#yax-persistent-memory) | 15 | None | stdio (Go) | All orchestrators |
| [mermaid-diagram-mcp](#mermaid-diagram-mcp) | 1 | None | stdio | — |
| [compass](#compass) | Dynamic | Token | Remote SSE | 10+ agents |
| [newrelic-mcp](#newrelic-mcp) | 5 | API Key | stdio | 1 agent |

---

## jira-mcp

**Purpose:** Full Jira integration — issues, sprints, boards, XRay test management.
**Auth:** `JIRA_PAT_{instance}` (multi-instance: `jira`, `myjira`)
**Multi-instance:** `JIRA_INSTANCE_PREFIX` env var for tool name prefixing.

### Tools (25)

| Tool | Description |
|------|-------------|
| `jira_get_issue` | Fetch issue by key with custom field support |
| `jira_search_issues` | JQL search with pagination |
| `jira_create_issue` | Create issue with story points, components, labels, sprint |
| `jira_update_issue` | Update fields including reporter, story points, custom fields |
| `jira_transition_issue` | Move issue to a new status |
| `jira_assign_issue` | Assign issue to a user |
| `jira_comment_on_issue` | Add comment (ADF for Cloud, plain text for Server) |
| `jira_get_projects` | List all projects |
| `jira_get_issue_types` | Get available issue types |
| `jira_get_transitions` | Get available status transitions for an issue |
| `jira_get_boards` | List boards (Scrum/Kanban) |
| `jira_get_sprints` | List sprints for a board |
| `jira_get_sprint_issues` | Get all issues in a sprint with reporter and story points |
| `jira_get_attachments` | Get issue attachments |
| `jira_get_child_issues` | Get sub-tasks and child issues |
| `xray_get_test_case_full` | Get full XRay test case with steps, pre-conditions, executions |
| `xray_get_test_steps` | Get test steps for a test issue |
| `xray_get_test_exec_tests` | Get tests in a test execution |
| `xray_get_test_plan_tests` | Get tests in a test plan |
| `xray_get_test_set_tests` | Get tests in a test set |
| `xray_get_test_runs` | Export test run results |
| `xray_search_test_cases` | Search XRay test cases |
| `xray_get_test_statuses` | Get available test statuses |
| `xray_get_test_pre_conditions` | Get pre-conditions for a test |
| `xray_get_pre_condition_tests` | Get tests associated with a pre-condition |

### Prompt Examples

```
Fetch the details of DPAY-1234
Search for all open bugs in project DPAY assigned to me
Create a Story in DPAY: "Add retry logic to payment gateway" with 5 story points
Move DPAY-1234 to "In Review"
Get all issues in the current active sprint for board 11077
Show me the XRay test steps for DPAY-TEST-100
What are the test execution results for test plan DPAY-TP-50?
```

### Agents with Access

**All profiles:** story_analyzer_agent, orchestrator (via delegation)
**BA:** ba_orchestrator, scope_definer, feature_writer, requirements_analyst, prd_generator, estimation, backlog_generator, translation_validator
**QA:** qa_orchestrator, test_planner, defect_analyst, e2e_test_generator, test_coverage_analyzer, qe_strategy
**PM:** pm_orchestrator, sprint_manager, delivery_reporter, risk_tracker, retro, standup
**Dev-core:** pr_creator, planner, code_review
**Leadership:** leadership_orchestrator, executive_briefing, quarterly_reporter, portfolio_analyst, cross_team_coordinator
**Sustainment:** sustainment_orchestrator, incident_triage, gsm_analyst

---

## confluence-mcp

**Purpose:** Read and write Confluence pages, spaces, and attachments.
**Auth:** `CONFLUENCE_PAT_{instance}` — serves both `confluence.disney.com` and `mywiki.disney.com`.
**Multi-instance:** `CONFLUENCE_INSTANCE_PREFIX` env var. Tool prefix: `@confluence/*` for confluence.disney.com, `@mywiki/*` for mywiki.disney.com.

### Tools (8)

| Tool | Description |
|------|-------------|
| `get_confluence_page` | Get page by ID with body content |
| `search_confluence_pages` | Search pages using CQL |
| `get_confluence_space` | Get space details |
| `list_confluence_spaces` | List all accessible spaces |
| `create_confluence_page` | Create new page in a space |
| `update_confluence_page` | Update existing page content |
| `comment_on_confluence_page` | Add comment to a page |
| `upload_attachment` | Upload file attachment to a page |

### Prompt Examples

```
Search MyWiki for "sprint report" in the DPE space
Get the content of Confluence page 1293418985
Create a new page in the DPE space titled "Sprint 425 Report"
Update the architecture page with the new diagram
Upload the test results CSV to the QA documentation page
```

### Routing Rule

- **confluence.disney.com** → use `@confluence/*` tools
- **mywiki.disney.com** → use `@mywiki/*` tools
- If unclear, ask the user which instance.

### Agents with Access

**BA:** ba_orchestrator, scope_definer, feature_writer, requirements_analyst, prd_generator, translation_validator
**QA:** qa_orchestrator, test_planner, defect_analyst, test_coverage_analyzer
**PM:** pm_orchestrator, sprint_manager, delivery_reporter, risk_tracker, retro
**Dev-core:** pr_creator, planner, technical_writer
**Leadership:** leadership_orchestrator, executive_briefing, quarterly_reporter
**Sustainment:** sustainment_orchestrator, gsm_analyst, rca
**Ops:** ops_orchestrator, ai_metrics, release_documenter

---

## github-mcp

**Purpose:** GitHub PRs, repos, file reading, Projects v2 boards.
**Auth:** `GITHUB_TOKEN_{remote}` (multi-instance: `disney` for github.disney.com, `public` for github.com).
**Multi-instance:** Tool names prefixed with remote name when 2+ remotes configured.

### Tools (15)

| Tool | Description |
|------|-------------|
| `github_get_pr` | Get PR details (diff, comments, status) |
| `github_create_pr` | Create pull request |
| `github_comment_on_pr` | Add comment to PR |
| `github_get_pr_comments` | Get all PR comments |
| `github_update_pr` | Update PR title, body, or state |
| `github_get_repo` | Get repository info |
| `github_search_prs` | Search PRs by query |
| `github_list_remotes` | List configured GitHub remotes |
| `github_get_file` | Get single file content from repo |
| `github_get_files` | Get multiple files from repo |
| `github_create_review` | Create inline PR review with comments |
| `github_get_project` | Get GitHub Project v2 details |
| `github_list_project_items` | List items in a project board |
| `github_create_project_item` | Add item to project board |
| `github_update_project_item_field` | Update project item field (status, priority) |

### Prompt Examples

```
Create a PR from feat/my-branch to main with title "Add retry logic"
Get the diff for PR #279 on SANCR225/steer-runtime
Search for open PRs by SANCR225 on steer-runtime
Read the README.md from the main branch of steer-runtime
Add all items from the Waypoints project board
Comment on PR #280: "LGTM, approved"
```

### Agents with Access

**Dev-core:** pr_creator, code_review, technical_writer, story_analyzer
**BA:** ba_orchestrator, scope_definer, feature_writer, requirements_analyst, prd_generator, translation_validator
**QA:** qa_orchestrator, test_planner, test_coverage_analyzer
**PM:** pm_orchestrator
**Ops:** ops_orchestrator, release_manager, release_documenter, ai_metrics
**Steer-master:** steer_orchestrator, steer_reviewer, koda_reviewer, compatibility

---

## gitlab-mcp

**Purpose:** GitLab merge requests, file access, code review, and repository operations.
**Auth:** `GITLAB_TOKEN` (Personal Access Token with `api` scope).
**Multi-instance:** `GITLAB_REMOTE` env var prefixes tool names (e.g., `disney_gitlab_get_mr`).
**Default host:** `gitlab.disney.com`

### Tools (11)

| Tool | Description |
|------|-------------|
| `gitlab_get_project` | Fetch project (repository) information |
| `gitlab_get_mr` | Fetch a merge request by IID |
| `gitlab_create_mr` | Create a new merge request |
| `gitlab_update_mr` | Update MR title, description, state, assignees, reviewers |
| `gitlab_comment_on_mr` | Add a comment (note) to a merge request |
| `gitlab_get_mr_comments` | Fetch all comments from a merge request |
| `gitlab_search_mrs` | Search/list merge requests with filters |
| `gitlab_get_file` | Read a single file from the repository |
| `gitlab_get_files` | Read multiple files in a single call |
| `gitlab_create_review` | Post inline review comments and optionally approve |
| `gitlab_list_remotes` | Show the configured GitLab instance URL |

### Prompt Examples

```
Get the details of MR !42 on WDPR-DLP-IS/wdpr-dlp-is-mobile-bff-core-service
Search for open MRs targeting main in my project
Create a MR from feat/my-branch to main with title "Add error handling"
Read the src/config.ts file from the develop branch
Post a code review on MR !15 with inline comments
List all MRs I authored in the last week
Get the README.md and package.json from the project
```

### Agents with Access

**Dev-core:** pr_creator, code_review, story_analyzer, technical_writer
**Steer-master:** steer_orchestrator, steer_reviewer, koda_reviewer, compatibility, steer_release_manager
**Ops:** ops_orchestrator, release_manager, release_documenter, ai_metrics
**QA:** qa_orchestrator, test_coverage_analyzer, defect_analyst, test_planner
**BA:** ba_orchestrator, translation_validator, feature_writer, requirements_analyst, scope_definer, prd_generator
**PM:** pm_orchestrator

---

## harness-mcp

**Purpose:** Harness CI/CD — pipeline management, deployments, releases, and hotfixes.
**Auth:** `HARNESS_API_KEY` (x-api-key header), `HARNESS_ACCOUNT_ID`.
**Default host:** `https://disney.harness.io`

### Tools (7)

| Tool | Description |
|------|-------------|
| `harness_list_pipelines` | List pipelines in a project |
| `harness_list_executions` | List recent pipeline executions with filters |
| `harness_get_execution` | Get execution details with stages, steps, durations |
| `harness_get_logs` | Get step-level logs from an execution |
| `harness_trigger_pipeline` | Trigger a pipeline execution |
| `harness_list_services` | List services in a project |
| `harness_list_environments` | List environments in a project |

### Prompt Examples

```
List all pipelines in the Commerce/WDPRT_Trimaxion project
Show me the last 5 deployments for the trimaxion-api pipeline
Why did the last deployment fail? Show me the logs
Deploy the cart-service to the stage environment from the main branch
What services are available in the Commerce/WDPR_Payments project?
List environments for the ticketing project
Trigger a hotfix deployment for payment-gateway from hotfix/fix-timeout branch
What's the status of the currently running pipeline?
```

### Agents with Access

**Ops:** deployment_agent (primary), ops_orchestrator (via delegation)
**CloudOps:** cloudops_orchestrator (via delegation)

---

## chrome-mcp

**Purpose:** Browser automation — navigate, screenshot, click, type, extract DOM, execute JavaScript.
**Auth:** None (local headless Chrome via Puppeteer).
**Security:** `chrome_evaluate` logs all scripts to stderr. `chrome_navigate` only accepts `http://` and `https://` URLs.

### Tools (8)

| Tool | Description |
|------|-------------|
| `chrome_navigate` | Navigate to a URL (http/https only) |
| `chrome_screenshot` | Capture page or element screenshot (base64 PNG) |
| `chrome_click` | Click element by CSS selector |
| `chrome_type` | Type text into input field |
| `chrome_get_text` | Extract visible text from page or element |
| `chrome_get_dom` | Get HTML content of page or element |
| `chrome_evaluate` | Execute JavaScript in page context (audit-logged) |
| `chrome_wait_for` | Wait for element to appear |

### Prompt Examples

```
Navigate to https://example.com and take a screenshot
Extract all heading text from the current page
Click the login button and type my username
Check if the holiday banner is visible on the homepage
Override the browser date to December 25, 2024 and navigate to the promotions page
Get the DOM of the navigation menu
Wait for the loading spinner to disappear, then screenshot the results
```

### Agents with Access

**QA:** web_scraping_validator_agent, time_machine_agent

---

## sharepoint-mcp

**Purpose:** Read, search, and manage documents in SharePoint Online via Microsoft Graph API.
**Auth:** Azure AD app registration — `SHAREPOINT_TENANT_ID`, `SHAREPOINT_CLIENT_ID`, `SHAREPOINT_CLIENT_SECRET`, `SHAREPOINT_SITE_URL`.
**Multi-instance:** `SHAREPOINT_INSTANCE_PREFIX` env var.

### Tools (6)

| Tool | Description |
|------|-------------|
| `sharepoint_list_sites` | Search for SharePoint sites by keyword |
| `sharepoint_list_drives` | List document libraries for a site |
| `sharepoint_list_items` | List files/folders in a library path |
| `sharepoint_search_documents` | Search documents across SharePoint |
| `sharepoint_get_document` | Get document metadata and details |
| `sharepoint_upload_document` | Upload local file to a library (path-validated) |

### Prompt Examples

```
Search for SharePoint sites matching "payments"
List all document libraries on the DPE site
Show me the files in the Reports/Q1 folder
Search for documents about "architecture review"
Upload the sprint report to the Reports library
```

### Agents with Access

Not yet wired to any agents. Add `@sharepoint/*` to agents that need document management.

---

## qtest-mcp

**Purpose:** Test management — test cases, runs, cycles, suites, requirements, defects.
**Auth:** `QTEST_BEARER_TOKEN`.

### Tools (20)

| Tool | Description |
|------|-------------|
| `qtest_get_projects` | List projects |
| `qtest_get_project` | Get project details |
| `qtest_get_test_case` | Get test case |
| `qtest_create_test_case` | Create test case |
| `qtest_update_test_case` | Update test case |
| `qtest_search_test_cases` | Search test cases |
| `qtest_get_test_run` | Get test run |
| `qtest_create_test_run` | Create test run |
| `qtest_update_test_run_result` | Update test run result |
| `qtest_get_test_cycles` | Get test cycles |
| `qtest_create_test_cycle` | Create test cycle |
| `qtest_get_test_suites` | Get test suites |
| `qtest_create_test_suite` | Create test suite |
| `qtest_get_requirements` | Get requirements |
| `qtest_get_requirement` | Get single requirement |
| `qtest_link_requirement` | Link requirement to test |
| `qtest_create_requirement` | Create requirement |
| `qtest_get_defects` | Get defects |
| `qtest_link_defect` | Link defect to test |
| `qtest_submit_defect` | Submit new defect |

### Prompt Examples

```
Search for test cases related to "payment processing" in project 12345
Create a test cycle for Sprint 425
Get the test run results for the regression suite
Link requirement REQ-100 to test case TC-200
Submit a defect for the failed checkout test
```

### Agents with Access

**QA:** qa_orchestrator, test_planner, test_automation, api_tester, defect_analyst, test_coverage_analyzer

---

## servicenow-mcp

**Purpose:** Incident management, change requests, problem records, knowledge base.
**Auth:** ServiceNow instance credentials via environment variables.

### Tools (23)

| Tool | Description |
|------|-------------|
| `get_incident` | Get incident by number |
| `create_incident` | Create new incident |
| `update_incident` | Update incident fields |
| `resolve_incident` | Resolve incident |
| `query_incidents` | Query incidents with filters |
| `get_incident_comments` | Get incident comments |
| `get_incident_timeline` | Get incident timeline |
| `get_related_incidents` | Get related incidents |
| `add_work_note` | Add work note to incident |
| `change_ci` | Change CI on incident |
| `change_assignment_group` | Reassign incident |
| `add_parent_incident` | Set parent incident |
| `bulk_update_incidents` | Bulk update incidents |
| `create_problem` | Create problem record |
| `create_change_request` | Create change request |
| `get_change_request` | Get change request details |
| `get_ctask` | Get change task |
| `add_ctask_work_note` | Add work note to change task |
| `update_ctask` | Update change task |
| `close_ctask` | Close change task with close code and target state |
| `get_ci_details` | Get CI details |
| `search_knowledge_base` | Search knowledge base |
| `get_on_call` | Get on-call schedule |

### Prompt Examples

```
Get details for INC28731532
Create a P2 incident for the payment gateway timeout
Add a work note to INC28731532: "Identified root cause as DB connection pool exhaustion"
Query all P1 incidents from the last 24 hours
Search the knowledge base for "SSL certificate renewal"
Who is on-call for the payments team?
```

### Agents with Access

**Sustainment:** sustainment_orchestrator_agent (via `@servicenow-mcp/*`)

---

## splunk-mcp

**Purpose:** Log search, alerts, dashboards, reports, data models.
**Auth:** Splunk instance credentials via environment variables.

### Tools (21)

| Tool | Description |
|------|-------------|
| `search_events` | Search Splunk events |
| `oneshot_search` | Blocking one-shot search |
| `get_indexes` | List indexes |
| `get_sourcetypes` | List sourcetypes |
| `get_fields` | Get field summary |
| `get_saved_searches` | List saved searches |
| `run_saved_search` | Run a saved search |
| `get_job_status` | Get search job status |
| `get_alerts` | Get fired alerts |
| `get_alert_details` | Get alert details |
| `get_alert_history` | Get alert history |
| `suppress_alert` | Suppress an alert |
| `export_results` | Export search results |
| `list_dashboards` | List dashboards |
| `get_dashboard` | Get dashboard details |
| `run_dashboard_panel` | Run dashboard panel search |
| `get_datamodels` | List data models |
| `get_datamodel_fields` | Get data model fields |
| `list_reports` | List reports |
| `get_report_results` | Get report results |
| `get_server_info` | Get Splunk server info |

### Prompt Examples

```
Search for errors in the dpe-calculator index from the last hour
List all fired alerts for the payments application
Run the saved search "Payment Gateway Errors - Last 24h"
Get the field summary for index=dpe-svc-latest
Export the results of the last error search to CSV
Show me the Splunk dashboards for the DPE application
```

### Agents with Access

**Sustainment:** sustainment_orchestrator_agent (via `@splunk-mcp/*`)

---

## appdynamics-mcp

**Purpose:** Application performance monitoring — health, metrics, transactions, anomalies.
**Auth:** OAuth 2.0 client credentials (`APPD_CONTROLLER_URL`, `APPD_CLIENT_ID`, `APPD_CLIENT_SECRET`).

### Tools (17)

| Tool | Description |
|------|-------------|
| `list_applications` | List monitored applications |
| `get_application_health` | Get application health status |
| `get_business_transactions` | Get business transactions |
| `get_metric_data` | Get metric data for a path |
| `get_tiers` | Get application tiers |
| `get_nodes` | Get tier nodes |
| `get_health_violations` | Get health rule violations |
| `get_error_rate` | Get error rate |
| `get_snapshots` | Get transaction snapshots |
| `get_anomalies` | Get anomaly events |
| `get_backends` | Get backend services |
| `get_errors` | Get error details |
| `get_events` | Get events |
| `get_policies` | Get policies |
| `get_actions` | Get actions |
| `get_dashboards` | Get dashboards |
| `compare_metrics` | Compare metrics across time ranges |

### Prompt Examples

```
List all monitored applications
What is the health status of the DPE Calculator app?
Show me the error rate for the last hour
Get transaction snapshots for slow requests (>5s)
Compare response times between this week and last week
What anomalies were detected in the last 24 hours?
```

### Agents with Access

**Sustainment:** sustainment_orchestrator_agent (via `@appdynamics-mcp/*`)

---

## figma-mcp

**Purpose:** Read Figma design files, nodes, comments, and styles.
**Auth:** `FIGMA_TOKEN`.

### Tools (5)

| Tool | Description |
|------|-------------|
| `get_file` | Get Figma file structure |
| `get_node` | Get specific node details |
| `get_comments` | Get file comments |
| `get_styles` | Get file styles (colors, typography) |
| `export_images` | Export images from nodes |

### Prompt Examples

```
Get the structure of the Figma file for the checkout redesign
Export the hero banner component as PNG
What comments are on the latest design file?
Get the color styles defined in the design system file
```

### Agents with Access

**Dev-web:** astro, ui, ux_specialist_agent

---

## bruno-mcp

**Purpose:** API collection management and testing using Bruno.
**Auth:** None.

### Tools (10)

| Tool | Description |
|------|-------------|
| `create_collection` | Create Bruno API collection |
| `create_environment` | Create environment config |
| `create_request` | Create API request |
| `add_test_script` | Add test script to request |
| `create_test_suite` | Create test suite |
| `create_crud_requests` | Generate CRUD request set |
| `list_collections` | List existing collections |
| `get_collection_stats` | Get collection statistics |
| `run_request` | Execute a single request |
| `run_collection` | Run entire collection |

### Prompt Examples

```
Create a Bruno collection for the Payment Gateway API
Generate CRUD requests for the /api/v1/transactions endpoint
Run the checkout flow test suite
Add a test script to verify the response status is 200
List all API collections in the project
```

### Agents with Access

**Dev-web:** backend, webapi
**QA:** qa_orchestrator, test_planner, test_automation, api_tester, test_coverage_analyzer

---

## yax (persistent memory)

**Purpose:** Persistent memory for AI agents across sessions — save observations, search, graph traversal, session tracking.
**Auth:** None (local SQLite + FTS5 database at `~/.yax/`).
**Runtime:** Standalone Go binary (`yax mcp --tools=agent`), stdio transport.
**Replaces:** The legacy `memory-mcp` (Docker/Python/Redis) is deprecated. Yax is the active replacement.

### Tools (15)

| Tool | Description |
|------|-------------|
| `yax_save` | Save an observation to persistent memory (title, content, type, project) |
| `yax_search` | Full-text search across memories |
| `yax_context` | Get recent context from previous sessions |
| `yax_get` | Get observation by ID |
| `yax_update` | Update an existing observation |
| `yax_delete` | Delete an observation (soft or hard) |
| `yax_timeline` | Chronological context around an observation |
| `yax_link` | Create edge between two observations (graph) |
| `yax_unlink` | Remove edge between observations |
| `yax_related` | Get connected observations via graph traversal |
| `yax_session_start` | Register start of coding session |
| `yax_session_end` | Mark session as completed |
| `yax_session_summary` | Save end-of-session summary |
| `yax_save_prompt` | Save user prompt to memory |
| `yax_stats` | Memory system statistics |

### Observation Types

`manual`, `decision`, `architecture`, `bugfix`, `pattern`, `config`, `discovery`, `learning`

### Prompt Examples

```
Save this architecture decision: "We chose event sourcing for the payment ledger"
Search my memories for anything about "database migration"
What context do I have for the steer-runtime project?
Start a new work session for DPAY-1234
End the session with summary: "Completed retry logic implementation"
Show me observations related to observation #42 (graph traversal)
Link observation #10 to #15 with relationship "caused_by"
Show me the timeline around observation #30
```

### Agents with Access

All orchestrators get `@yax/*` automatically via `GenerateMcpJson` (injected as a static server entry when the `yax` binary is found on PATH).

---

## mermaid-diagram-mcp

**Purpose:** Generate PNG images from Mermaid diagram syntax.
**Auth:** None.

### Tools (1)

| Tool | Description |
|------|-------------|
| `generate_mermaid_image` | Generate PNG from Mermaid diagram content |

### Prompt Examples

```
Generate a sequence diagram showing the payment flow between client, gateway, and processor
Create a class diagram for the DPE Calculator domain model
```

### Agents with Access

Not yet wired to specific agents. Available for any agent that needs diagram generation.

---

## compass

**Purpose:** Remote MCP gateway for email, ServiceNow, Splunk logs, and fallback Jira/Confluence.
**Auth:** `COMPASS_TOKEN` (SSE endpoint).
**Type:** Remote SSE — `https://compass.wdprapps.disney.com/api/mcp/...`

### Capabilities

| Capability | Tools | Notes |
|------------|-------|-------|
| Email | `sre_toolsets_email_send_email` | **Compass-exclusive** — no dedicated MCP |
| ServiceNow | `servicenow_tool_snow_*` | Fallback; prefer servicenow-mcp when available |
| Splunk Logs | Log search tools | Fallback; prefer splunk-mcp when available |
| Jira | Jira tools | **Fallback only** — always prefer @jira/* |
| Confluence | Confluence tools | **Fallback only** — always prefer @confluence/* |

### Prompt Examples

```
Send an email to the team about the deployment schedule
Look up ServiceNow incident INC28731532
Search Splunk logs for payment errors in the last hour
```

### Agents with Access

**Core:** email_agent, log_analyzer_agent
**Orchestrators:** ba_orchestrator, qa_orchestrator, pm_orchestrator, ops_orchestrator, sustainment_orchestrator, leadership_orchestrator, steer_orchestrator

---

## newrelic-mcp

**Purpose:** New Relic observability — NRQL queries, entity search, golden signals, alerts, deployments via NerdGraph API.
**Auth:** `NEW_RELIC_API_KEY` (User API Key, starts with `NRAK-`), `NEW_RELIC_ACCOUNT_ID`.
**Region:** US (default) or EU via `NEW_RELIC_REGION`.
**Security:** Read-only enforced — queries validated to reject mutation keywords.

### Tools (5)

| Tool | Description |
|------|-------------|
| `run_nrql` | Execute NRQL SELECT queries (read-only enforced) |
| `list_entities` | Search monitored entities (apps, hosts, services) by name/type |
| `get_entity_golden_signals` | Get response time, throughput, error rate for an entity |
| `get_alert_violations` | Get active/recent alert violations |
| `get_deployments` | Get recent deployment markers for change correlation |

### Prompt Examples

```
Run this NRQL: SELECT count(*) FROM Transaction SINCE 1 hour ago
List all entities matching "booking-svc"
What are the golden signals for the payment-gateway app?
Are there any open alert violations?
Show me recent deployments for the commerce-ui application
Run: FROM MobileCrash SELECT uniqueCount(swid) WHERE appVersion not like '%-dev' SINCE 7 days ago TIMESERIES 1 day
Compare crash rates today vs yesterday using COMPARE WITH
```

### Agents with Access

**Sustainment:** sustainment_orchestrator_agent (via `@newrelic/*`)

---

## MCP Routing Priority

Always prefer dedicated MCP servers over Compass:

```
Jira tasks       → @jira/* or @myjira/*     (NOT Compass)
Confluence pages → @confluence/* or @mywiki/* (NOT Compass)
GitHub PRs       → @github/*                 (Compass has no GitHub)
Email            → Compass only              (no dedicated MCP)
Splunk logs      → Compass or @splunk-mcp/*
ServiceNow       → Compass or @servicenow-mcp/*
```

---

## Setup

```bash
# Install MCP servers
koda mcp-install

# Tokens stored in
~/.kiro/tokens.env

# Generated config
~/.kiro/settings/mcp.json

# Verify
koda doctor
```

See [MCP_SETUP.md](MCP_SETUP.md) for detailed setup instructions.
