# Kiro Agents Reference

Complete reference for all agents across profiles.

---

## Profile: dev (18 agents)

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

**Total Agents:** 22 (dev: 18, ba: 4)  
**Last Updated:** March 12, 2026
