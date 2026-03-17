# Kiro Agents Reference

Complete reference for all agents across profiles.

---

## Profile: dev (19 agents)

Development agents for backend, webapi, UI, mobile, testing, security, and code review.

### Orchestrator (1)

#### orchestrator
**File:** `.kiro-dev/agents/orchestrator.json`  
**Purpose:** SDLC orchestrator with automatic multi-agent delegation  
**Use for:** Implementing Jira stories end-to-end, coordinating multi-repo features

**Workflow:**
1. Fetch & validate Jira story
2. Explore codebase
3. Review architecture
4. Create implementation plan
5. Coordinate implementation across repos
6. Run quality checks
7. Create pull request

---

### Config Studio Specialists (3)

#### backend
**File:** `.kiro-dev/agents/backend.json`  
**Purpose:** Java services specialist for wdpr-config-services  
**Use for:** Backend API development, database changes, Java services

#### webapi
**File:** `.kiro-dev/agents/webapi.json`  
**Purpose:** Node.js/TypeScript specialist for wdpr-payment-controls-api  
**Use for:** API layer, BFF logic, TypeScript interfaces

#### ui
**File:** `.kiro-dev/agents/ui.json`  
**Purpose:** Angular specialist for wdpr-payment-controls-client  
**Use for:** Frontend development, components, services, routing

---

### Mobile Development (3)

#### flutter
**File:** `.kiro-dev/agents/flutter.json`  
**Purpose:** Dart/Flutter cross-platform development  
**Use for:** Flutter widgets, state management, platform channels

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

#### story_analyzer_agent
**File:** `.kiro-dev/agents/story_analyzer_agent.json`  
**Purpose:** Jira story analysis and requirements extraction  
**Use for:** Analyzing Jira stories, extracting requirements
**MCP Servers:** jira, confluence, mywiki, github (local Node.js), mcp-atlassian (Docker, disabled fallback)

#### architecture_agent
**File:** `.kiro-dev/agents/architecture_agent.json`  
**Purpose:** Architecture review and design validation  
**Use for:** Reviewing architecture decisions, design patterns

#### codebase_explorer_agent
**File:** `.kiro-dev/agents/codebase_explorer_agent.json`  
**Purpose:** Code exploration and navigation  
**Use for:** Finding relevant code, understanding structure

---

### Quality & Security (5)

#### code_review_agent
**File:** `.kiro-dev/agents/code_review_agent.json`  
**Purpose:** Code review and quality checks  
**Use for:** Reviewing code changes, identifying issues

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

---

### Workflow (2)

#### pr_creator_agent
**File:** `.kiro-dev/agents/pr_creator_agent.json`  
**Purpose:** Pull request creation and management  
**Use for:** Creating PRs, formatting descriptions

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

**Example:**
```bash
kiro-cli chat --agent technical_writer_agent
> "Review and improve the README for wdpr-payment-svc"
```

---

## Profile: ba (4 agents)

Business Analyst and Product Owner agents for requirements, scope, and feature definition.

### BA Orchestrator (1)

#### ba_orchestrator_agent
**File:** `.kiro-ba/agents/ba_orchestrator_agent.json`  
**Purpose:** Coordinates BA/PO tasks and delegates to specialized agents  
**Use for:** Complex BA workflows requiring multiple steps

**Capabilities:**
- Requirements gathering
- Scope definition
- Feature specification
- Stakeholder coordination
- Documentation management

**Delegates to:**
- scope_definer_agent
- feature_writer_agent
- requirements_analyst_agent

---

### BA Specialists (3)

#### scope_definer_agent
**File:** `.kiro-ba/agents/scope_definer_agent.json`  
**Purpose:** Defines project and feature scope, boundaries, and constraints  
**Use for:** 
- Starting new projects
- Clarifying scope boundaries
- Documenting assumptions and dependencies
- Identifying risks and constraints

**Example:**
```bash
kiro-cli chat --agent scope_definer_agent
> "Define scope for epic DPAY-500 including in/out of scope and dependencies"
```

#### feature_writer_agent
**File:** `.kiro-ba/agents/feature_writer_agent.json`  
**Purpose:** Creates user stories, acceptance criteria, and feature specifications  
**Use for:**
- Writing user stories
- Breaking down epics
- Creating acceptance criteria
- Refining backlog items

**Example:**
```bash
kiro-cli chat --agent feature_writer_agent
> "Create user stories for payment validation with acceptance criteria"
```

#### requirements_analyst_agent
**File:** `.kiro-ba/agents/requirements_analyst_agent.json`  
**Purpose:** Analyzes requirements, identifies gaps, validates completeness  
**Use for:**
- Reviewing requirements
- Gap analysis
- Sprint planning prep
- Requirements validation

**Example:**
```bash
kiro-cli chat --agent requirements_analyst_agent
> "Review sprint 23 stories and identify gaps or missing information"
```

---


## Profile: qa (6 agents)

Quality Assurance and Test Automation agents for comprehensive testing.

### QA Orchestrator (1)

#### qa_orchestrator_agent
**File:** `.kiro-qa/agents/qa_orchestrator_agent.json`  
**Purpose:** Orchestrates QA tasks and coordinates specialized testing agents  
**Use for:** Complex QA workflows requiring multiple agents
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:**
- test_planner_agent
- test_automation_agent
- defect_analyst_agent
- api_tester_agent
- performance_tester_agent

---

### QA Specialists (5)

#### test_planner_agent
**File:** `.kiro-qa/agents/test_planner_agent.json`  
**Purpose:** Creates test plans, test cases, and test scenarios from requirements  
**Use for:** Test planning, test case design, coverage analysis
**MCP Servers:** jira, confluence, mywiki, github

**Example:**
```bash
kiro-cli chat --agent test_planner_agent
> "Create test plan for DPAY-14561 payment validation feature"
```

#### test_automation_agent
**File:** `.kiro-qa/agents/test_automation_agent.json`  
**Purpose:** Creates and maintains automated test scripts  
**Use for:** UI tests, API tests, integration tests, test frameworks

**Example:**
```bash
kiro-cli chat --agent test_automation_agent
> "Write Cypress tests for the payment form validation"
```

#### defect_analyst_agent
**File:** `.kiro-qa/agents/defect_analyst_agent.json`  
**Purpose:** Analyzes defects, performs root cause analysis  
**Use for:** Bug triage, root cause analysis, detailed bug reports
**MCP Servers:** jira, confluence, mywiki, github

**Example:**
```bash
kiro-cli chat --agent defect_analyst_agent
> "Analyze DPAY-15000 and identify root cause"
```

#### api_tester_agent
**File:** `.kiro-qa/agents/api_tester_agent.json`  
**Purpose:** Tests REST APIs and validates contracts  
**Use for:** API test suites, contract testing, endpoint validation

**Example:**
```bash
kiro-cli chat --agent api_tester_agent
> "Create API tests for the /payments endpoint"
```

#### performance_tester_agent
**File:** `.kiro-qa/agents/performance_tester_agent.json`  
**Purpose:** Creates and executes performance and load tests  
**Use for:** Load testing, stress testing, performance benchmarks

**Example:**
```bash
kiro-cli chat --agent performance_tester_agent
> "Create k6 load test for the checkout flow"
```

---

### QA Quick Reference
```bash
kiro-cli chat --agent qa_orchestrator_agent   # QA orchestrator
kiro-cli chat --agent test_planner_agent      # Test planning
kiro-cli chat --agent test_automation_agent   # Test automation
kiro-cli chat --agent defect_analyst_agent    # Defect analysis
kiro-cli chat --agent api_tester_agent        # API testing
kiro-cli chat --agent performance_tester_agent # Performance testing
```

---

## Quick Reference

### Development Agents
```bash
kiro-cli chat --agent orchestrator          # Main dev orchestrator
kiro-cli chat --agent backend               # Java backend
kiro-cli chat --agent webapi                # Node.js API
kiro-cli chat --agent ui                    # Angular frontend
kiro-cli chat --agent flutter               # Flutter mobile
kiro-cli chat --agent code_review_agent     # Code review
```

### BA/PO Agents
```bash
kiro-cli chat --agent ba_orchestrator_agent      # BA orchestrator
kiro-cli chat --agent scope_definer_agent        # Define scope
kiro-cli chat --agent feature_writer_agent       # Write stories
kiro-cli chat --agent requirements_analyst_agent # Analyze requirements
```


### QA Agents
```bash
kiro-cli chat --agent qa_orchestrator_agent      # QA orchestrator
kiro-cli chat --agent test_planner_agent         # Test planning
kiro-cli chat --agent test_automation_agent      # Test automation
kiro-cli chat --agent defect_analyst_agent       # Defect analysis
```

---

## Installation

Install specific profiles:
```bash
./setup.sh install dev          # Install dev agents only
./setup.sh install ba           # Install BA agents only
./setup.sh install dev ba       # Install both profiles
```

---

## Documentation

- **Dev agents:** See `docs/PROMPT_GUIDE.md`
- **BA/PO agents:** See `docs/BA_PROMPT_GUIDE.md`
- **Workflows:** See `docs/BA_WORKFLOWS.md`

---

**Total Agents:** 34 (dev: 19, ba: 4, qa: 6, ops: 5)  
**Last Updated:** March 17, 2026

---

## Profile: ops (5 agents)

Operations agents for AI metrics, infrastructure, deployments, and code quality.

### Ops Orchestrator (1)

#### ops_orchestrator_agent
**File:** `.kiro-ops/agents/ops_orchestrator_agent.json`  
**Purpose:** Coordinates ops workflows and delegates to specialized agents  
**Use for:** Complex ops tasks requiring multiple agents

**Delegates to:**
- ai_metrics_agent
- infra_check_agent
- deployment_agent
- code_quality_agent

---

### Ops Specialists (4)

#### ai_metrics_agent
**File:** `.kiro-ops/agents/ai_metrics_agent.json`  
**Purpose:** Tracks AI-assisted development metrics and updates Jira  
**Use for:**
- Generating AI productivity reports
- Updating Jira AI custom fields (AI Assisted Effort, AI Usage Level, AI Tools Used)
- Calculating efficiency gains

**Example:**
```bash
kiro-cli chat --agent ai_metrics_agent
> "Generate AI metrics report for DPAY-14337"
```

#### infra_check_agent
**File:** `.kiro-ops/agents/infra_check_agent.json`  
**Purpose:** Checks AWS infrastructure status  
**Use for:**
- Counting running ECS tasks
- Checking cluster and service health
- Infrastructure status reports

**Example:**
```bash
kiro-cli chat --agent infra_check_agent
> "How many tasks are running in cart-latest cluster?"
```

#### deployment_agent
**File:** `.kiro-ops/agents/deployment_agent.json`  
**Purpose:** Manages CI/CD pipelines via Harness  
**Use for:**
- Checking pipeline execution status
- Listing recent deployments
- Viewing deployment logs

**Example:**
```bash
kiro-cli chat --agent deployment_agent
> "Show recent deployments for payment-service"
```

#### code_quality_agent
**File:** `.kiro-ops/agents/code_quality_agent.json`  
**Purpose:** Retrieves code quality metrics from SonarQube  
**Use for:**
- Quality gate status
- Code coverage reports
- Bug/vulnerability/code smell counts

**Example:**
```bash
kiro-cli chat --agent code_quality_agent
> "Show quality gate status for wdpr-payment-svc"
```

---

### Ops Quick Reference
```bash
kiro-cli chat --agent ops_orchestrator_agent  # Ops orchestrator
kiro-cli chat --agent ai_metrics_agent        # AI metrics
kiro-cli chat --agent infra_check_agent       # AWS/ECS checks
kiro-cli chat --agent deployment_agent        # Harness CI/CD
kiro-cli chat --agent code_quality_agent      # SonarQube metrics
```

---

## MCP Server Coverage

All agents with Jira/Confluence/GitHub access use local Node.js MCP servers (`~/.kiro/tools/mcp-servers/`). Tokens are configured via `./setup.sh mcp-install`.

| Profile | Agent | Jira | Confluence | MyWiki | GitHub |
|---------|-------|:----:|:----------:|:------:|:------:|
| **dev** | story_analyzer_agent | ✅ | ✅ | ✅ | ✅ |
| **dev** | pr_creator_agent | ✅ | ✅ | ✅ | ✅ |
| **dev** | code_review_agent | ✅ | | | ✅ |
| **dev** | planner_agent | ✅ | ✅ | ✅ | |
| **dev** | technical_writer_agent | | ✅ | ✅ | ✅ |
| **ba** | ba_orchestrator_agent | ✅ | ✅ | ✅ | ✅ |
| **ba** | feature_writer_agent | ✅ | ✅ | ✅ | ✅ |
| **ba** | requirements_analyst_agent | ✅ | ✅ | ✅ | ✅ |
| **ba** | scope_definer_agent | ✅ | ✅ | ✅ | ✅ |
| **qa** | qa_orchestrator_agent | ✅ | ✅ | ✅ | ✅ |
| **qa** | test_planner_agent | ✅ | ✅ | ✅ | ✅ |
| **qa** | defect_analyst_agent | ✅ | ✅ | ✅ | ✅ |
| **ops** | ops_orchestrator_agent | ✅ | ✅ | ✅ | ✅ |
| **ops** | ai_metrics_agent | ✅ | ✅ | ✅ | ✅ |
| **ops** | code_quality_agent | | | | | SonarQube |
| **ops** | deployment_agent | | | | | Harness |
