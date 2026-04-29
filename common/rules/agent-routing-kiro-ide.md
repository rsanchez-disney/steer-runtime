# Agent Routing for Kiro IDE

Kiro IDE does not read `~/.kiro/agents/*.json` directly. Those agent definitions are designed
for `kiro-cli`. To bridge the gap, this steering file teaches you how to delegate tasks to the
correct specialist agent when a user's request matches one of the known agent capabilities.

## How to delegate

Use `invokeSubAgent` with `name: "general-task-execution"`. In the `prompt` field, include:

1. The agent's role and description (from the table below)
2. The content of the agent's prompt file from `~/.kiro/prompts/{prompt_file}`
3. Any relevant context files the agent would normally load

If the prompt file cannot be read (missing or inaccessible), inform the user which agent should
handle the task and suggest they run it via `kiro-cli chat --agent {agent_name}`.

## When to delegate

Delegate when the user's request clearly matches a specialist agent's domain **and** the task
would benefit from the specialist's focused prompt and constraints. For simple questions or
quick lookups, handle them directly — delegation adds overhead.

## Agent Registry

Read `~/.kiro/agents/` at runtime to discover all installed agents. The table below is a
reference snapshot; the actual installed set may differ per user.

### dev-core

| Agent File                     | Description                                                           | Trigger Keywords                                   |
|--------------------------------|-----------------------------------------------------------------------|----------------------------------------------------|
| `orchestrator.json`            | SDLC orchestrator with automatic multi-agent delegation               | orchestrate, implement story, end-to-end           |
| `planner_agent.json`           | Creates detailed implementation plans with tasks and dependencies     | plan, implementation plan, task breakdown          |
| `story_analyzer_agent.json`    | Fetches and analyzes Jira stories, Confluence pages, and GitHub repos | analyze story, Jira, requirements                  |
| `architecture_agent.json`      | Architecture guidance, design patterns, and technical decisions       | architecture, design pattern, technical decision   |
| `adr_writer_agent.json`        | Produces Architecture Decision Records                                | ADR, architecture decision record                  |
| `architecture_spec_agent.json` | Target architecture design with diagrams                              | architecture spec, component diagram, topology     |
| `bounded_context_agent.json`   | Domain boundary analysis using DDD principles                         | bounded context, DDD, domain model                 |
| `codebase_explorer_agent.json` | Explores codebase to find relevant files, patterns, and dependencies  | explore, codebase, find code, understand structure |
| `code_review_agent.json`       | Reviews code for security, quality, performance, and testing issues   | review, code review, review PR                     |
| `security_scanner_agent.json`  | Automated security scans to detect vulnerabilities and secrets        | security, vulnerabilities, scan, secrets           |
| `compliance_agent.json`        | Compliance validation against golden rules and standards              | compliance, standards, golden rules                |
| `test_runner_agent.json`       | Runs tests and validates coverage requirements                        | run tests, execute tests, coverage                 |
| `performance_agent.json`       | Benchmarks performance before/after changes to detect regressions     | performance, benchmark, regression                 |
| `pr_creator_agent.json`        | Creates GitHub pull requests with proper formatting and metadata      | PR, pull request, create PR, open PR               |
| `technical_writer_agent.json`  | Creates and maintains technical documentation                         | docs, documentation, technical writing, README     |
| `discussion_agent.json`        | Captures user preferences and decisions before planning               | discuss, preferences, decisions                    |

### dev-mobile

| Agent File            | Description                                                     | Trigger Keywords                |
|-----------------------|-----------------------------------------------------------------|---------------------------------|
| `flutter.json`        | Flutter/Dart specialist for cross-platform mobile development   | flutter, dart, widget, riverpod |
| `android_native.json` | Android native specialist for Kotlin/Java and platform channels | android, kotlin, gradle         |
| `ios_native.json`     | iOS native specialist for Swift/Obj-C and platform channels     | ios, swift, xcode, cocoapods    |

### dev-web

| Agent File                 | Description                                       | Trigger Keywords                     |
|----------------------------|---------------------------------------------------|--------------------------------------|
| `backend.json`             | Java services specialist                          | java, backend, spring, database      |
| `webapi.json`              | Node.js/TypeScript specialist for BFF/API layer   | node, typescript, webapi, BFF        |
| `ui.json`                  | Angular specialist for frontend development       | angular, frontend, component, UI     |
| `ux_specialist_agent.json` | Accessibility (WCAG 2.1 AA) and UX pattern review | accessibility, WCAG, UX, ARIA        |
| `astro.json`               | Astro SSR specialist with React components        | astro, SSR, react island, nanostores |

### ba

| Agent File                        | Description                                                           | Trigger Keywords                              |
|-----------------------------------|-----------------------------------------------------------------------|-----------------------------------------------|
| `ba_orchestrator_agent.json`      | Coordinates BA/PO tasks and delegates to specialized agents           | BA workflow, requirements workflow            |
| `scope_definer_agent.json`        | Defines project and feature scope, boundaries, and constraints        | scope, boundaries, constraints                |
| `feature_writer_agent.json`       | Creates user stories, acceptance criteria, and feature specifications | user story, acceptance criteria, feature spec |
| `requirements_analyst_agent.json` | Analyzes requirements, identifies gaps, validates completeness        | requirements, gap analysis, completeness      |
| `prd_generator_agent.json`        | Generates Product Requirements Documents from Jira epics              | PRD, product requirements                     |
| `backlog_generator_agent.json`    | Generates epic/story breakdowns from PRDs                             | backlog, stories, generate tickets, epic      |
| `estimation_agent.json`           | Dual-mode estimation — CCV (hours/points) and DRIFT (tokens/cost)     | estimate, story points, effort, cost          |

### qa

| Agent File                          | Description                                                          | Trigger Keywords                         |
|-------------------------------------|----------------------------------------------------------------------|------------------------------------------|
| `qa_orchestrator_agent.json`        | Orchestrates QA tasks and coordinates specialized testing agents     | QA workflow, testing workflow            |
| `test_planner_agent.json`           | Creates test plans, test cases, and test scenarios from requirements | test plan, test cases, test scenarios    |
| `test_automation_agent.json`        | Creates and maintains automated test scripts                         | test automation, automated tests         |
| `defect_analyst_agent.json`         | Analyzes defects, performs root cause analysis                       | defect, bug analysis, root cause         |
| `api_tester_agent.json`             | Tests REST APIs and validates contracts                              | API test, contract testing, endpoint     |
| `performance_tester_agent.json`     | Creates and executes performance and load tests                      | load test, stress test, performance test |
| `test_coverage_analyzer_agent.json` | Analyzes test coverage for epics against Jira/Xray                   | coverage, test coverage, coverage gap    |
| `e2e_test_generator_agent.json`     | Generates Gherkin E2E test scenarios from user stories               | E2E, Gherkin, end-to-end test            |
| `qe_strategy_agent.json`            | Test strategy documents with scope, approach, and risk assessment    | test strategy, QA strategy               |

### ops

| Agent File                      | Description                                                     | Trigger Keywords                           |
|---------------------------------|-----------------------------------------------------------------|--------------------------------------------|
| `ops_orchestrator_agent.json`   | Coordinates ops workflows and delegates to specialized agents   | ops workflow, operations                   |
| `ai_metrics_agent.json`         | Tracks AI-assisted development metrics and updates Jira         | AI metrics, productivity report            |
| `infra_check_agent.json`        | Checks AWS infrastructure status                                | ECS, cluster health, infrastructure        |
| `deployment_agent.json`         | Manages CI/CD pipelines via Harness                             | deploy, pipeline, Harness, CI/CD           |
| `code_quality_agent.json`       | Retrieves code quality metrics from SonarQube                   | SonarQube, quality gate, code quality      |
| `release_manager_agent.json`    | Manages releases — compares tags, generates release notes       | release, tag, release notes                |
| `release_documenter_agent.json` | Documents releases in Confluence with changes and rollback plan | release docs, Confluence release, rollback |

### pm

| Agent File                     | Description                                                      | Trigger Keywords                    |
|--------------------------------|------------------------------------------------------------------|-------------------------------------|
| `pm_orchestrator_agent.json`   | Coordinates PM/Scrum Master workflows                            | PM workflow, scrum master           |
| `sprint_manager_agent.json`    | Manages sprint planning, capacity, backlog grooming              | sprint, capacity, backlog grooming  |
| `standup_agent.json`           | Generates daily standup summaries from Jira activity             | standup, daily summary              |
| `retro_agent.json`             | Facilitates retrospectives with data-driven insights             | retro, retrospective                |
| `risk_tracker_agent.json`      | Identifies blockers, dependencies, and risks                     | risk, blocker, dependency           |
| `delivery_reporter_agent.json` | Generates velocity reports, burndown analysis, release readiness | velocity, burndown, delivery report |

## Delegation template

When delegating, use this pattern:

```
invokeSubAgent(
  name: "general-task-execution",
  prompt: "<content of ~/.kiro/prompts/{prompt_file}>\n\nTask: <user's request>",
  contextFiles: [{ path: "~/.kiro/prompts/{prompt_file}" }]
)
```

If the prompt file is not accessible from the workspace, read it first with `readFile` using
the absolute path `~/.kiro/prompts/{prompt_file}`, then pass its content inline in the prompt.

## Notes

- Always prefer the specialized agent over doing the work yourself when one matches.
- The agent registry is additive — multiple profiles can be installed simultaneously.
- Agents installed via `koda install` or `setup.sh install` land in `~/.kiro/agents/` with
  their prompts in `~/.kiro/prompts/`.
- For the full agent hierarchy and MCP server coverage, see the `AGENTS.md` steering file.
