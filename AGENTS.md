# Kiro Agents Reference

Complete reference for all agents across profiles.

---

## Profile: dev (20 agents)

Development agents for backend, webapi, UI, mobile, testing, security, and code review.

### Orchestrator (1)

#### orchestrator
**File:** `.kiro-dev/agents/orchestrator.json`  
**Purpose:** SDLC orchestrator with automatic multi-agent delegation  
**Use for:** Implementing Jira stories end-to-end, coordinating multi-repo features  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context), preToolUse (guard writes), postToolUse (warn destructive)

**Workflow:**
1. Fetch & validate Jira story
2. Explore codebase
3. Review architecture
4. Create implementation plan
5. Approval gate #1 (user reviews plan)
6. Implement tasks (delegate to specialist agents)
7. Run tests (coverage ≥90%)
8. Code review
9. Security scan
10. Quality report & approval gate #2
11. Create pull request
12. Complete (summary & PR URL)

---

### Config Studio Specialists (3)

#### backend
**File:** `.kiro-dev/agents/backend.json`  
**Purpose:** Java services specialist for wdpr-config-services  
**Use for:** Backend API development, database changes, Java services  
**Hooks:** preToolUse (guard writes)

#### webapi
**File:** `.kiro-dev/agents/webapi.json`  
**Purpose:** Node.js/TypeScript specialist for wdpr-payment-controls-api  
**Use for:** API layer, BFF logic, TypeScript interfaces  
**Hooks:** preToolUse (guard writes)

#### ui
**File:** `.kiro-dev/agents/ui.json`  
**Purpose:** Angular specialist for wdpr-payment-controls-client  
**Use for:** Frontend development, components, services, routing  
**Hooks:** preToolUse (guard writes)

---

### Mobile Development (3)

#### flutter
**File:** `.kiro-dev/agents/flutter.json`  
**Purpose:** Dart/Flutter cross-platform development  
**Use for:** Flutter widgets, state management, platform channels  
**Hooks:** preToolUse (guard writes)

#### android_native
**File:** `.kiro-dev/agents/android_native.json`  
**Purpose:** Kotlin/Java platform channels for Android  
**Use for:** Android-specific implementations, native integrations

#### ios_native
**File:** `.kiro-dev/agents/ios_native.json`  
**Purpose:** Swift/Obj-C platform channels for iOS  
**Use for:** iOS-specific implementations, native integrations

---

### Planning & Analysis (4)

#### planner_agent
**File:** `.kiro-dev/agents/planner_agent.json`  
**Purpose:** Task planning and breakdown  
**Use for:** Breaking down complex tasks, creating implementation plans  
**Tools:** `thinking`  
**MCP Servers:** jira, confluence, mywiki

#### story_analyzer_agent
**File:** `.kiro-dev/agents/story_analyzer_agent.json`  
**Purpose:** Jira story analysis and requirements extraction  
**Use for:** Analyzing Jira stories, extracting requirements  
**Tools:** `knowledge`  
**MCP Servers:** jira, confluence, mywiki, github

#### architecture_agent
**File:** `.kiro-dev/agents/architecture_agent.json`  
**Purpose:** Architecture review and design validation  
**Use for:** Reviewing architecture decisions, design patterns  
**Tools:** `thinking`, `knowledge`

#### codebase_explorer_agent
**File:** `.kiro-dev/agents/codebase_explorer_agent.json`  
**Purpose:** Code exploration and navigation  
**Use for:** Finding relevant code, understanding structure

---

### Quality & Security (6)

#### code_review_agent
**File:** `.kiro-dev/agents/code_review_agent.json`  
**Purpose:** Code review and quality checks  
**Use for:** Reviewing code changes, identifying issues  
**MCP Servers:** jira, github

#### security_scanner_agent
**File:** `.kiro-dev/agents/security_scanner_agent.json`  
**Purpose:** Security analysis and vulnerability detection  
**Use for:** Security scans, finding vulnerabilities

#### compliance_agent
**File:** `.kiro-dev/agents/compliance_agent.json`  
**Purpose:** Compliance validation (golden rules, standards)  
**Use for:** Checking compliance with coding standards

#### test_runner_agent
**File:** `.kiro-dev/agents/test_runner_agent.json`  
**Purpose:** Test execution and coverage analysis  
**Use for:** Running tests, checking coverage

#### performance_agent
**File:** `.kiro-dev/agents/performance_agent.json`  
**Purpose:** Performance optimization and analysis  
**Use for:** Performance profiling, optimization suggestions

#### ux_specialist_agent
**File:** `.kiro-dev/agents/ux_specialist_agent.json`  
**Purpose:** Accessibility (WCAG 2.1 AA) and UX pattern review  
**Use for:** Accessibility audits, usability reviews, focus management, ARIA compliance

---

### Workflow (2)

#### pr_creator_agent
**File:** `.kiro-dev/agents/pr_creator_agent.json`  
**Purpose:** Pull request creation and management  
**Use for:** Creating PRs, formatting descriptions  
**MCP Servers:** jira, confluence, mywiki, github

#### discussion_agent
**File:** `.kiro-dev/agents/discussion_agent.json`  
**Purpose:** Technical discussions and decision support  
**Use for:** Technical discussions, architecture decisions

---

### Technical Writing (1)

#### technical_writer_agent
**File:** `.kiro-dev/agents/technical_writer_agent.json`  
**Purpose:** Creates and maintains technical documentation  
**Use for:** READMEs, API docs, architecture guides, runbooks, onboarding materials  
**MCP Servers:** confluence, mywiki, github

---

## Profile: ba (4 agents)

Business Analyst and Product Owner agents for requirements, scope, and feature definition.

### BA Orchestrator (1)

#### ba_orchestrator_agent
**File:** `.kiro-ba/agents/ba_orchestrator_agent.json`  
**Purpose:** Coordinates BA/PO tasks and delegates to specialized agents  
**Use for:** Complex BA workflows requiring multiple steps  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:** scope_definer_agent, feature_writer_agent, requirements_analyst_agent

---

### BA Specialists (3)

#### scope_definer_agent
**File:** `.kiro-ba/agents/scope_definer_agent.json`  
**Purpose:** Defines project and feature scope, boundaries, and constraints  
**Use for:** Starting new projects, clarifying scope, documenting assumptions  
**MCP Servers:** jira, confluence, mywiki, github

#### feature_writer_agent
**File:** `.kiro-ba/agents/feature_writer_agent.json`  
**Purpose:** Creates user stories, acceptance criteria, and feature specifications  
**Use for:** Writing user stories, breaking down epics, refining backlog  
**MCP Servers:** jira, confluence, mywiki, github

#### requirements_analyst_agent
**File:** `.kiro-ba/agents/requirements_analyst_agent.json`  
**Purpose:** Analyzes requirements, identifies gaps, validates completeness  
**Use for:** Reviewing requirements, gap analysis, sprint planning prep  
**Tools:** `knowledge`  
**MCP Servers:** jira, confluence, mywiki, github

---

## Profile: qa (6 agents)

Quality Assurance and Test Automation agents for comprehensive testing.

### QA Orchestrator (1)

#### qa_orchestrator_agent
**File:** `.kiro-qa/agents/qa_orchestrator_agent.json`  
**Purpose:** Orchestrates QA tasks and coordinates specialized testing agents  
**Use for:** Complex QA workflows requiring multiple agents  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:** test_planner_agent, test_automation_agent, defect_analyst_agent, api_tester_agent, performance_tester_agent

---

### QA Specialists (5)

#### test_planner_agent
**File:** `.kiro-qa/agents/test_planner_agent.json`  
**Purpose:** Creates test plans, test cases, and test scenarios from requirements  
**Use for:** Test planning, test case design, coverage analysis  
**Tools:** `knowledge`  
**MCP Servers:** jira, confluence, mywiki, github

#### test_automation_agent
**File:** `.kiro-qa/agents/test_automation_agent.json`  
**Purpose:** Creates and maintains automated test scripts  
**Use for:** UI tests, API tests, integration tests, test frameworks  
**Hooks:** preToolUse (guard writes)

#### defect_analyst_agent
**File:** `.kiro-qa/agents/defect_analyst_agent.json`  
**Purpose:** Analyzes defects, performs root cause analysis  
**Use for:** Bug triage, root cause analysis, detailed bug reports  
**MCP Servers:** jira, confluence, mywiki, github

#### api_tester_agent
**File:** `.kiro-qa/agents/api_tester_agent.json`  
**Purpose:** Tests REST APIs and validates contracts  
**Use for:** API test suites, contract testing, endpoint validation  
**Hooks:** preToolUse (guard writes)

#### performance_tester_agent
**File:** `.kiro-qa/agents/performance_tester_agent.json`  
**Purpose:** Creates and executes performance and load tests  
**Use for:** Load testing, stress testing, performance benchmarks

---

## Profile: ops (5 agents)

Operations agents for AI metrics, infrastructure, deployments, and code quality.

### Ops Orchestrator (1)

#### ops_orchestrator_agent
**File:** `.kiro-ops/agents/ops_orchestrator_agent.json`  
**Purpose:** Coordinates ops workflows and delegates to specialized agents  
**Use for:** Complex ops tasks requiring multiple agents  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:** ai_metrics_agent, infra_check_agent, deployment_agent, code_quality_agent

---

### Ops Specialists (4)

#### ai_metrics_agent
**File:** `.kiro-ops/agents/ai_metrics_agent.json`  
**Purpose:** Tracks AI-assisted development metrics and updates Jira  
**Use for:** AI productivity reports, updating Jira AI custom fields  
**MCP Servers:** jira, confluence, mywiki, github

#### infra_check_agent
**File:** `.kiro-ops/agents/infra_check_agent.json`  
**Purpose:** Checks AWS infrastructure status  
**Use for:** ECS task counts, cluster health, infrastructure reports

#### deployment_agent
**File:** `.kiro-ops/agents/deployment_agent.json`  
**Purpose:** Manages CI/CD pipelines via Harness  
**Use for:** Pipeline status, recent deployments, deployment logs  
**MCP Servers:** harness

#### code_quality_agent
**File:** `.kiro-ops/agents/code_quality_agent.json`  
**Purpose:** Retrieves code quality metrics from SonarQube  
**Use for:** Quality gate status, coverage reports, bug/vulnerability counts  
**MCP Servers:** sonarqube

---

## Profile: pm (6 agents)

Project Manager / Scrum Master agents for sprint execution, ceremonies, risk tracking, and delivery reporting.

### PM Orchestrator (1)

#### pm_orchestrator_agent
**File:** `.kiro-pm/agents/pm_orchestrator_agent.json`  
**Purpose:** Coordinates PM/Scrum Master workflows and delegates to specialists  
**Use for:** Complex PM tasks requiring multiple agents  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:** sprint_manager_agent, standup_agent, retro_agent, risk_tracker_agent, delivery_reporter_agent

---

### PM Specialists (5)

#### sprint_manager_agent
**File:** `.kiro-pm/agents/sprint_manager_agent.json`  
**Purpose:** Manages sprint planning, capacity, backlog grooming, and sprint health  
**Use for:** Sprint planning, capacity analysis, backlog review  
**Tools:** `todo`  
**MCP Servers:** jira, confluence, mywiki

#### standup_agent
**File:** `.kiro-pm/agents/standup_agent.json`  
**Purpose:** Generates daily standup summaries from Jira activity  
**Use for:** Standup prep, stale item detection, blocker alerts  
**MCP Servers:** jira

#### retro_agent
**File:** `.kiro-pm/agents/retro_agent.json`  
**Purpose:** Facilitates retrospectives with data-driven insights and action item tracking  
**Use for:** Sprint retros, trend analysis, action item follow-up  
**MCP Servers:** jira, confluence, mywiki

#### risk_tracker_agent
**File:** `.kiro-pm/agents/risk_tracker_agent.json`  
**Purpose:** Identifies blockers, dependencies, and risks across sprints and epics  
**Use for:** Risk assessment, blocker tracking, dependency mapping  
**MCP Servers:** jira, confluence, mywiki

#### delivery_reporter_agent
**File:** `.kiro-pm/agents/delivery_reporter_agent.json`  
**Purpose:** Generates velocity reports, burndown analysis, and release readiness assessments  
**Use for:** Sprint reports, velocity trends, release readiness  
**MCP Servers:** jira, confluence, mywiki

---

## Other IDEs

The coding standards, MCP integrations, and workflow guidance from these agents are also available in other IDEs:

| IDE | Format | Setup |
|-----|--------|-------|
| **Cursor** | `.mdc` rule files + shared MCP | [Cursor Setup](docs/CURSOR_SETUP.md) |
| **Amazon Q** | Plain `.md` rule files | [Amazon Q README](.amazonq-templates/README.md) |
| **Kite** | Desktop GUI over Kiro CLI | [Kite repo](https://github.disney.com/SANCR225/Kite) |

---

## Advanced Tools

Some agents use advanced kiro-cli tools that require global settings. Enable with:

```bash
./setup.sh enable-tools
```

| Tool | What it does | Agents |
|------|-------------|--------|
| `thinking` | Step-by-step reasoning for complex decisions | 5 orchestrators, architecture, planner |
| `todo` | Persistent task tracking across sessions | 5 orchestrators, sprint_manager |
| `delegate` | Async non-blocking agent delegation | 5 orchestrators |
| `knowledge` | Long-term semantic memory across conversations | story_analyzer, architecture, test_planner, requirements_analyst |

Agents degrade gracefully when settings are off — tools simply won't appear.

---

## Hooks

Reusable hook scripts in `.kiro/hooks/` provide guardrails and context injection:

| Script | Event | Agents | Behavior |
|--------|-------|:------:|----------|
| `git-context.sh` | agentSpawn | 5 orchestrators | Injects current branch + dirty file count on start |
| `guard-writes.sh` | preToolUse (fs_write) | backend, webapi, ui, flutter, test_automation, api_tester | Blocks writes to `node_modules/`, `dist/`, `.git/` |
| `warn-destructive.sh` | postToolUse (execute_bash) | dev orchestrator | Warns on `rm -rf`, `DROP TABLE`, `--force` |

---

## MCP Server Coverage

Pre-built Node.js MCP bundles in `~/.kiro/tools/mcp-servers/`. Tokens configured via `./setup.sh mcp-install`.

| Profile | Agent | Jira | Confluence | MyWiki | GitHub | Other |
|---------|-------|:----:|:----------:|:------:|:------:|:-----:|
| **dev** | story_analyzer_agent | ✅ | ✅ | ✅ | ✅ | |
| **dev** | pr_creator_agent | ✅ | ✅ | ✅ | ✅ | |
| **dev** | code_review_agent | ✅ | | | ✅ | |
| **dev** | planner_agent | ✅ | ✅ | ✅ | | |
| **dev** | technical_writer_agent | | ✅ | ✅ | ✅ | |
| **ba** | ba_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | |
| **ba** | feature_writer_agent | ✅ | ✅ | ✅ | ✅ | |
| **ba** | requirements_analyst_agent | ✅ | ✅ | ✅ | ✅ | |
| **ba** | scope_definer_agent | ✅ | ✅ | ✅ | ✅ | |
| **qa** | qa_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | |
| **qa** | test_planner_agent | ✅ | ✅ | ✅ | ✅ | |
| **qa** | defect_analyst_agent | ✅ | ✅ | ✅ | ✅ | |
| **ops** | ops_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | |
| **ops** | ai_metrics_agent | ✅ | ✅ | ✅ | ✅ | |
| **ops** | code_quality_agent | | | | | SonarQube |
| **ops** | deployment_agent | | | | | Harness |
| **pm** | pm_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | |
| **pm** | sprint_manager_agent | ✅ | ✅ | ✅ | | |
| **pm** | standup_agent | ✅ | | | | |
| **pm** | retro_agent | ✅ | ✅ | ✅ | | |
| **pm** | risk_tracker_agent | ✅ | ✅ | ✅ | | |
| **pm** | delivery_reporter_agent | ✅ | ✅ | ✅ | | |

---

## Context Files

Shared context loaded via agent `resources`:

| File | Used by |
|------|---------|
| `golden_rules.md` | dev orchestrator, architecture, compliance, security, code_review, pr_creator, pm_orchestrator |
| `project_mappings.md` | dev orchestrator, story_analyzer, planner, codebase_explorer, discussion, test_automation |
| `ba_guidelines.md` | All BA agents |
| `qa_guidelines.md` | All QA agents |
| `ops_guidelines.md` | All ops agents |
| `pm_guidelines.md` | All PM agents |
| `test_templates.md` | qa_orchestrator, test_planner |
| `story_templates.md` | feature_writer |
| `automation_patterns.md` | test_automation |
| `defect_templates.md` | defect_analyst |
| `api_test_patterns.md` | api_tester |
| `performance_patterns.md` | performance_tester |

---

## Quick Reference

```bash
# Dev
kiro-cli chat --agent orchestrator              # Dev orchestrator
kiro-cli chat --agent backend                   # Java backend
kiro-cli chat --agent webapi                    # Node.js API
kiro-cli chat --agent ui                        # Angular frontend
kiro-cli chat --agent flutter                   # Flutter mobile
kiro-cli chat --agent code_review_agent         # Code review
kiro-cli chat --agent technical_writer_agent    # Technical docs
kiro-cli chat --agent ux_specialist_agent       # Accessibility & UX review

# BA/PO
kiro-cli chat --agent ba_orchestrator_agent     # BA orchestrator
kiro-cli chat --agent scope_definer_agent       # Define scope
kiro-cli chat --agent feature_writer_agent      # Write stories
kiro-cli chat --agent requirements_analyst_agent # Analyze requirements

# QA
kiro-cli chat --agent qa_orchestrator_agent     # QA orchestrator
kiro-cli chat --agent test_planner_agent        # Test planning
kiro-cli chat --agent test_automation_agent     # Test automation
kiro-cli chat --agent defect_analyst_agent      # Defect analysis
kiro-cli chat --agent api_tester_agent          # API testing
kiro-cli chat --agent performance_tester_agent  # Performance testing

# Ops
kiro-cli chat --agent ops_orchestrator_agent    # Ops orchestrator
kiro-cli chat --agent ai_metrics_agent          # AI metrics
kiro-cli chat --agent infra_check_agent         # AWS/ECS checks
kiro-cli chat --agent deployment_agent          # Harness CI/CD
kiro-cli chat --agent code_quality_agent        # SonarQube metrics

# PM/Scrum Master
kiro-cli chat --agent pm_orchestrator_agent     # PM orchestrator
kiro-cli chat --agent sprint_manager_agent      # Sprint management
kiro-cli chat --agent standup_agent             # Standup summaries
kiro-cli chat --agent retro_agent               # Retrospectives
kiro-cli chat --agent risk_tracker_agent        # Risk tracking
kiro-cli chat --agent delivery_reporter_agent   # Delivery reports
```

---

## Installation

```bash
./setup.sh install dev          # Install dev agents only
./setup.sh install dev ba qa    # Install multiple profiles
./setup.sh install dev ba qa ops pm  # Install all
./setup.sh enable-tools         # Enable thinking, todo, knowledge
```

---

**Total Agents:** 41 (dev: 20, ba: 4, qa: 6, ops: 5, pm: 6)  
**Last Updated:** March 20, 2026
