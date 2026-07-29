# Steer Platform — Features & Capabilities

AI-assisted development platform providing specialized agents, role-based profiles, team workspaces, and MCP tool integrations for engineering teams.

---

## Platform overview

| Metric                | Value                |
|-----------------------|----------------------|
| Total agents          | 225                  |
| Role profiles         | 21                   |
| Team workspaces       | 103                  |
| MCP tool servers      | 22                   |
| Shared hooks          | 15+                  |
| Reusable skills       | 12+                  |
| Studios               | 28                   |
| Managed services (BAPPs) | 295               |

---

## SDLC lifecycle coverage

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                        SDLC Lifecycle Coverage                            │
├──────────┬───────────┬───────────┬──────────┬──────────┬────────────────┤
│ Analyze  │   Plan    │   Build   │   Test   │  Deploy  │   Operate      │
├──────────┼───────────┼───────────┼──────────┼──────────┼────────────────┤
│ BA       │ Planner   │ Dev-Core  │ QA       │ Ops      │ Sustainment    │
│ PM       │ Architect │ Dev-Web   │ Security │ DevOps   │ Inspector      │
│ Design   │ Story     │ Dev-Mobile│ Perf     │ Release  │ CloudOps       │
│ Presales │ Estimator │ Dev-AI    │ E2E      │ Harness  │ Incident       │
│ Leads    │ Scope     │ Dev-.NET  │ API Test │ CI/CD    │ RCA            │
│          │ PRD       │ Dev-Infra │ Coverage │ Monitor  │ GSM            │
└──────────┴───────────┴───────────┴──────────┴──────────┴────────────────┘
```

---

## Agentic solutions by role

### Development (dev-core, dev-web, dev-mobile, dev-ai, dev-dotnet, dev-infra, dev-python, dev-php, dev-ui)

| Agent                    | Capability                                                    |
|--------------------------|---------------------------------------------------------------|
| `orchestrator`           | SDLC orchestrator — routes tasks to specialists via subagent  |
| `planner_agent`          | Creates implementation plans with tasks + dependencies        |
| `architecture_agent`     | Architecture guidance, design patterns, ADRs                  |
| `architecture_spec_agent`| Component diagrams, integration patterns, deployment topology |
| `code_review_agent`      | Security, quality, performance, testing review                |
| `security_scanner_agent` | Automated vulnerability and secrets detection                 |
| `codebase_explorer_agent`| Finds relevant files, patterns, dependencies                  |
| `pr_creator_agent`       | Creates PRs with proper formatting and metadata               |
| `discussion_agent`       | Captures decisions before planning begins                     |
| `bounded_context_agent`  | Domain boundaries, aggregates, context maps                   |
| `performance_agent`      | Benchmarks before/after, detects regressions                  |
| `db_analyst_agent`       | Database analysis and query optimization                      |
| `technical_writer_agent` | READMEs, API docs, architecture guides, runbooks              |
| `devops_runner_agent`    | Executes builds, tests, git operations                        |

**Stack-specific agents:** `backend` (Java), `webapi` (Node), `ui` (Angular), `astro` (SSR), `flutter`, `android_native`, `ios_native`, `python`, `terraform`, `dotnet`

### Quality Assurance (qa)

| Agent                        | Capability                                          |
|------------------------------|-----------------------------------------------------|
| `qa_orchestrator_agent`      | Coordinates all QA activities                       |
| `test_planner_agent`         | Creates test plans and test cases                   |
| `test_automation_agent`      | Writes automated test scripts                       |
| `api_tester_agent`           | REST API contract validation                        |
| `performance_tester_agent`   | Load testing and performance analysis               |
| `e2e_test_generator_agent`   | Gherkin scenarios from user stories                 |
| `defect_analyst_agent`       | Root cause analysis of bugs                         |
| `test_coverage_analyzer_agent`| Epic coverage gaps + reusable test discovery       |
| `flaky_test_fixer_agent`     | Diagnoses and fixes intermittent test failures      |
| `web_scraping_validator_agent`| DOM validation, accessibility, content checking    |
| `web_discovery_agent`        | Discovers testable elements and page objects        |
| `test_recorder_agent`        | Records browser interactions via Playwright         |
| `time_machine_agent`         | Date-dependent content testing                      |
| `bruno_collection_agent`     | Converts specs to Bruno API test collections        |
| `failing_scenarios_finder_agent`| Identifies recurring failures across runs        |

### Business Analysis (ba)

| Agent                     | Capability                                            |
|---------------------------|-------------------------------------------------------|
| `ba_orchestrator_agent`   | Coordinates BA/PO tasks                               |
| `requirements_analyst_agent`| Analyzes requirements, identifies gaps              |
| `feature_writer_agent`    | User stories with acceptance criteria                 |
| `scope_definer_agent`     | Project scope, boundaries, constraints                |
| `prd_generator_agent`     | Product requirement documents                         |
| `backlog_generator_agent` | Epic breakdown and backlog generation                 |
| `estimation_agent`        | CCV (hours/story points) + DRIFT (token cost)         |
| `translation_validator_agent`| Translation accuracy and cultural validation       |

### Project Management (pm)

| Agent                      | Capability                                           |
|----------------------------|------------------------------------------------------|
| `pm_orchestrator_agent`    | Coordinates PM workflows                             |
| `sprint_manager_agent`     | Sprint planning, burndown tracking                   |
| `standup_agent`            | Async standup summaries                              |
| `retro_agent`              | Sprint retrospective facilitation                    |
| `delivery_reporter_agent`  | Delivery progress reporting                          |
| `risk_tracker_agent`       | Risk identification and mitigation tracking          |

### Operations (ops)

| Agent                      | Capability                                           |
|----------------------------|------------------------------------------------------|
| `ops_orchestrator_agent`   | Coordinates ops workflows                            |
| `deployment_agent`         | CI/CD pipeline management via Harness                |
| `release_manager_agent`    | Release notes, tag comparison, GitHub releases       |
| `infra_check_agent`        | AWS ECS tasks, clusters, services status             |
| `log_analyzer_agent`       | Splunk/ServiceNow log analysis                       |
| `code_quality_agent`       | SonarQube metrics retrieval                          |
| `ai_metrics_agent`         | AI-assisted development metrics tracking             |
| `email_agent`              | Email via Compass MCP                                |

### Sustainment & Incident Response

| Agent                          | Capability                                       |
|--------------------------------|--------------------------------------------------|
| `sustainment_orchestrator`     | Coordinates incident response workflows          |
| `incident_triage_agent`        | ServiceNow INC classification and severity       |
| `rca_agent`                    | Root cause analysis (8-section report)           |
| `stability_validator_agent`    | Post-incident/post-release validation            |
| `gsm_analyst_agent`            | GSM reporting, SLA tracking, trends              |
| `catalog_ingestion_agent`      | Onboards new apps into managed services catalog  |
| `network_diagnostics_agent`    | DNS, certificate, connectivity checks            |
| `splunk_query_agent`           | Interactive Splunk SPL execution                 |

### Leadership & Strategy

| Agent                          | Capability                                       |
|--------------------------------|--------------------------------------------------|
| `leadership_orchestrator_agent`| Coordinates leadership workflows                 |
| `quarterly_reporter_agent`     | Quarterly progress reports                       |
| `portfolio_analyst_agent`      | Cross-project portfolio analysis                 |
| `executive_briefing_agent`     | Executive-ready summaries                        |
| `cross_team_coordinator_agent` | Cross-team dependency analysis                   |

### Design & UX

| Agent                      | Capability                                           |
|----------------------------|------------------------------------------------------|
| `design_orchestrator_agent`| Coordinates design workflows                         |
| `ux_specialist_agent`      | WCAG 2.1 AA accessibility, usability patterns        |
| `prototype_prompt_agent`   | Design prototype analysis                            |
| `user_research_agent`      | Interview guides, personas, journey maps             |
| `design_discovery_agent`   | Design discovery and research                        |

### Inspector (Security & Compliance)

| Agent                       | Capability                                          |
|-----------------------------|-----------------------------------------------------|
| `inspector_orchestrator`    | Coordinates deep inspection workflows               |
| `security_reviewer_agent`   | Security vulnerability review                       |
| `dependency_auditor_agent`  | Dependency vulnerability scanning                   |
| `compliance_checker_agent`  | Regulatory compliance validation                    |
| `architecture_critic_agent` | Architecture pattern critique                       |
| `performance_auditor_agent` | Performance anti-pattern detection                  |
| `drift_detector_agent`      | Configuration drift detection                       |

---

## MCP tool integrations (22 servers)

| Server               | Capability                                                |
|----------------------|-----------------------------------------------------------|
| `jira-mcp`          | Jira Cloud + Server (issues, sprints, boards, Xray)       |
| `confluence-mcp`    | Confluence Cloud + Server (pages, search, spaces)         |
| `github-mcp`        | GitHub (PRs, issues, repos, code search)                  |
| `gitlab-mcp`        | GitLab (MRs, pipelines, projects)                         |
| `splunk-mcp`        | Splunk (SPL queries, dashboards, saved searches)          |
| `servicenow-mcp`    | ServiceNow (incidents, CTASKs, CIs, knowledge)            |
| `servicenow-graph-mcp`| ServiceNow graph traversal                             |
| `harness-mcp`       | Harness CI/CD (pipelines, deployments, triggers)          |
| `chrome-mcp`        | Chrome browser automation (navigation, DOM, screenshots)  |
| `chrome-devtools-mcp`| Chrome DevTools Protocol (console, network, CSS)         |
| `appium-mcp`        | Mobile test execution (iOS/Android)                       |
| `bruno-mcp`         | Bruno API test collections                                |
| `figma-mcp`         | Figma design file analysis                                |
| `appdynamics-mcp`   | AppDynamics APM (metrics, dashboards)                     |
| `newrelic-mcp`      | New Relic observability                                   |
| `azure-devops-mcp`  | Azure DevOps (work items, pipelines)                      |
| `teams-mcp`         | Microsoft Teams messaging                                 |
| `sharepoint-mcp`    | SharePoint document management                            |
| `qtest-mcp`         | qTest test management                                     |
| `mermaid-diagram-mcp`| Mermaid diagram rendering                               |
| `memory-mcp`        | Per-project persistent memory                             |
| `openrouter-mcp`    | Multi-model routing                                       |

---

## Platform tools & applications

| Tool                  | Type        | Purpose                                              |
|-----------------------|-------------|------------------------------------------------------|
| **Koda**              | Go CLI/TUI  | Agent management, profiles, workspaces, sync, upgrade|
| **Kite**              | Electron    | Desktop app — chat, launchpad, release management    |
| **Mouseketool**       | Web app     | Team chat interface (Vue + NestJS)                   |
| **steer-autopilot**   | Go          | Autonomous agent runner (headless pipelines)         |
| **steer-plugins**     | VS Code ext | IDE integration for ACP protocol                    |
| **yax**               | Go          | Persistent memory (observations, graph, search)      |
| **prompt-scorer**     | Go          | Prompt quality scoring and token tracking            |
| **spar**              | Go          | Architecture modeling (MCP + CLI)                    |
| **graphify**          | Go (Koda)   | Code knowledge graph builder                         |
| **Cortex**            | Python      | Architectural knowledge graph                        |
| **DCC**               | Electron    | Release and delivery dashboard                       |

---

## Key platform features

### Workspace system
- **Inheritance:** 58+ workspaces with `extends` for layered context
- **Project mapping:** Repos, stacks, hosts, Jira prefixes per workspace
- **Automatic materialization:** Context synced to IDE on workspace switch
- **Multi-workspace tabs:** Parallel ACP sessions in Kite

### Release management (Kite Launchpad)
- **Publish All:** Cross-compile, sign, encrypt, publish all repos
- **Release Candidates:** Publish RC → Certify → Promote | Discard workflow
- **Code Signing:** Self-signed PFX (EV pending), Windows Authenticode
- **Signature verification:** Thumbprint validation on all .exe
- **Version health badge:** Private/Public/Local consistency check
- **Download stats:** Per-repo, per-platform, sparklines

### Certification system
- **Trust Score:** Delegation (26 scenarios) + Structural (4 checks) + Quality (3 evals)
- **Delegation tests:** Live orchestrator scenarios with retries
- **Structural validation:** Workspaces, agents, catalog, inheritance, playbooks
- **Quality evals:** Rubric-based agent output scoring
- **Component versions:** Records all repo versions at certification time
- **History:** SQLite + JSON, displayed in Kite with score trends

### Guardrails & hooks
- **branch-guard:** Blocks direct commits to main/master
- **agent-registry:** Injects available agents at session start
- **delegation-map:** Generates routing map for orchestrators
- **catalog-index:** Generates managed services index for sustainment
- **check-cross-references:** Validates file references after writes
- **context-retrieval:** Injects relevant context per request

### Managed services catalog
- **295 BAPPs** tracked across 28 studios
- **Per-app:** app.yaml, troubleshooting.md, business-rules.md, runbook.md
- **Fill rates:** Identity 100%, Components 47%, Splunk 39%, Cloud 46%
- **catalog_ingestion_agent:** Automates onboarding from wiki/Confluence

### Observability & metrics
- **AI metrics tracking:** Token usage, session duration, stories completed
- **Prompt scoring:** Quality scores per prompt
- **Release stats:** Downloads per version, platform breakdown
- **Certification trends:** Score history over time

---

## Supported technology stacks

| Stack      | Agent(s)            | Languages/Frameworks                |
|------------|---------------------|-------------------------------------|
| Java       | `backend`           | Spring Boot, Maven/Gradle           |
| Node       | `webapi`            | NestJS, Express, TypeScript         |
| Angular    | `ui`                | Angular 18+, standalone components  |
| React/Astro| `astro`             | Astro SSR, React components         |
| Go         | (platform tools)    | Koda, yax, prompt-scorer, spar      |
| Python     | `python`            | FastAPI, Click, Poetry/uv           |
| .NET       | `dotnet`            | C#, Lambda, self-host API           |
| Flutter    | `flutter`           | Dart, cross-platform mobile         |
| iOS        | `ios_native`        | Swift, UIKit/SwiftUI                |
| Android    | `android_native`    | Kotlin, Jetpack Compose             |
| Terraform  | `terraform`         | HCL, AWS/Azure providers            |
| PHP        | `php_agent`         | Zend, legacy migration              |

---

## IDE support

| IDE/Editor     | Integration                                    |
|----------------|------------------------------------------------|
| VS Code        | steer-plugins extension (ACP protocol)         |
| Cursor         | Rules (.mdc files) synced by Koda              |
| Amazon Q       | Templates synced by amazonq_sync_agent         |
| Kiro CLI       | Native ACP sessions                            |
| Kite (desktop) | Full GUI with chat, launchpad, modules         |
| Web (Mouseketool)| Team chat interface                          |

---

## Security features

- **Code signing:** Authenticode for all Windows binaries (self-signed, EV pending)
- **Encrypted distribution:** AES-256-CBC encrypted tarballs for steer-runtime
- **SHA-256 checksums:** Published alongside every release artifact
- **Policy signing:** GEAI access policies cryptographically signed
- **Branch guards:** Hooks prevent direct pushes to protected branches
- **Secrets management:** tokens.env (gitignored) + env var injection
- **Certificate backup:** Encrypted in steer-vault private repo

---

*Last updated: July 28, 2026*
