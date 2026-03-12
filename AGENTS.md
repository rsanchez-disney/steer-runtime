# Kiro Agents

Complete reference for all 20 agents in the steer-runtime system.

---

## Orchestrator Agents (3)

### orchestrator
**File:** `.kiro/agents/orchestrator.json`  
**Purpose:** Routes work to specialized agents (backend, ui, webapi, mobile) and enforces compatibility  
**Tools:** read, shell  
**Use for:** Coordinating multi-repo features, contract validation, cross-layer integration

### orchestrator_agent
**File:** `.kiro/agents/orchestrator_agent.json`  
**Purpose:** Generic orchestration and task delegation  
**Use for:** General multi-agent coordination

### orchestrator_multiagent
**File:** `.kiro/agents/orchestrator_multiagent.json`  
**Purpose:** Advanced multi-agent orchestration patterns  
**Use for:** Complex workflows requiring multiple specialized agents

---

## Config Studio Specialists (3)

### backend
**File:** `.kiro/agents/backend.json`  
**Purpose:** Java services specialist for wdpr-config-services  
**Tools:** read, write, shell  
**Allowed paths:** src/**, pom.xml, build.gradle*, application*.yml  
**Use for:** Backend API development, database changes, Java services

### webapi
**File:** `.kiro/agents/webapi.json`  
**Purpose:** Node.js/TypeScript specialist for wdpr-payment-controls-api (BFF layer)  
**Tools:** read, write, shell  
**Allowed paths:** src/**, package.json, tsconfig.json  
**Use for:** API layer, BFF logic, TypeScript interfaces, error handling

### ui
**File:** `.kiro/agents/ui.json`  
**Purpose:** Angular specialist for wdpr-payment-controls-client  
**Tools:** read, write, shell  
**Allowed paths:** src/**, package.json, angular.json, tsconfig.json  
**Use for:** Frontend development, Angular components, UI/UX, forms

---

## Mobile Development (3)

### flutter
**File:** `.kiro/agents/flutter.json`  
**Purpose:** Flutter/Dart specialist for cross-platform mobile development  
**Tools:** read, write, shell  
**Allowed paths:** lib/**, packages/*/lib/**, test/**, pubspec.yaml  
**Use for:** Flutter UI, state management, platform-agnostic business logic, widget development

### android_native
**File:** `.kiro/agents/android_native.json`  
**Purpose:** Android native specialist (Kotlin/Java) for platform channels  
**Tools:** read, write, shell  
**Allowed paths:** android/**, *.gradle*, AndroidManifest.xml  
**Use for:** Android platform channels, native Android features, Kotlin/Java implementation

### ios_native
**File:** `.kiro/agents/ios_native.json`  
**Purpose:** iOS native specialist (Swift/Objective-C) for platform channels  
**Tools:** read, write, shell  
**Allowed paths:** ios/**, *.xcodeproj/**, *.xcworkspace/**, Podfile  
**Use for:** iOS platform channels, native iOS features, Swift/Objective-C implementation

---

## Planning & Analysis (4)

### planner_agent
**File:** `.kiro/agents/planner_agent.json`  
**Purpose:** Creates detailed implementation plans with tasks, dependencies, and test strategy  
**Tools:** fs_read  
**Use for:** Breaking down features into tasks, planning implementation approach

### story_analyzer_agent
**File:** `.kiro/agents/story_analyzer_agent.json`  
**Purpose:** Fetches and analyzes Jira stories, extracts scope and acceptance criteria  
**Tools:** web_fetch, grep, fs_read, @jira/*, @confluence/*, @github/*  
**MCP Servers:** jira, confluence, github  
**Use for:** Analyzing Jira stories, extracting requirements, understanding scope

### architecture_agent
**File:** `.kiro/agents/architecture_agent.json`  
**Purpose:** Provides architecture guidance, design patterns, and technical decisions  
**Tools:** code, grep, fs_read, execute_bash  
**Use for:** Architecture review, design patterns, technical decision-making

### codebase_explorer_agent
**File:** `.kiro/agents/codebase_explorer_agent.json`  
**Purpose:** Explores and analyzes codebase structure and patterns  
**Tools:** code, grep, fs_read, execute_bash  
**Use for:** Understanding codebase structure, finding patterns, code discovery

---

## Quality & Security (5)

### code_review_agent
**File:** `.kiro/agents/code_review_agent.json`  
**Purpose:** Reviews code for security, quality, performance, and testing issues  
**Tools:** code, grep, fs_read, execute_bash  
**Use for:** Pre-PR code review, quality checks, identifying issues

### security_scanner_agent
**File:** `.kiro/agents/security_scanner_agent.json`  
**Purpose:** Runs automated security scans to detect vulnerabilities and secrets  
**Tools:** execute_bash, fs_read, grep, code  
**Use for:** Security scanning, vulnerability detection, secrets detection

### compliance_agent
**File:** `.kiro/agents/compliance_agent.json`  
**Purpose:** Validates compliance with coding standards and policies  
**Tools:** code, grep, fs_read, execute_bash  
**Use for:** Compliance validation, policy enforcement, standards checking

### test_runner_agent
**File:** `.kiro/agents/test_runner_agent.json`  
**Purpose:** Runs tests and validates coverage requirements  
**Tools:** execute_bash, fs_read, grep  
**Use for:** Running tests, checking coverage, validating test results

### performance_agent
**File:** `.kiro/agents/performance_agent.json`  
**Purpose:** Analyzes and optimizes performance issues  
**Tools:** execute_bash, fs_read, grep, code  
**Use for:** Performance analysis, optimization recommendations, profiling

---

## Workflow (2)

### pr_creator_agent
**File:** `.kiro/agents/pr_creator_agent.json`  
**Purpose:** Creates pull requests with proper formatting and context  
**Tools:** execute_bash, fs_read, grep, @github/*  
**MCP Servers:** github  
**Use for:** Creating PRs, formatting PR descriptions, linking issues

### discussion_agent
**File:** `.kiro/agents/discussion_agent.json`  
**Purpose:** Facilitates technical discussions and decision-making  
**Tools:** fs_read  
**Use for:** Technical discussions, brainstorming, decision documentation

---

## Agent Categories Summary

**Total Agents:** 20

**By Category:**
- Orchestration: 3 agents
- Config Studio: 3 agents
- Mobile: 3 agents
- Planning & Analysis: 4 agents
- Quality & Security: 5 agents
- Workflow: 2 agents

**Naming Convention:**
- Primary domain agents: Simple names (backend, ui, webapi, flutter, android_native, ios_native, orchestrator)
- Utility agents: snake_case with _agent suffix

---

## Usage Examples

### Feature Implementation
```bash
kiro-cli chat --agent orchestrator
> Implement payment method validation across backend, webapi, and ui
```

### Mobile Development
```bash
kiro-cli chat --agent orchestrator
> Add biometric authentication to Flutter app with native platform channels
```

### Code Review
```bash
kiro-cli chat --agent code_review_agent
> Review changes in src/app/features/payment/
```

### Story Analysis
```bash
kiro-cli chat --agent story_analyzer_agent
> Analyze JIRA story DPAY-14561
```

### Architecture Review
```bash
kiro-cli chat --agent architecture_agent
> Review the proposed microservices architecture for payment processing
```

---

## Agent Selection Guide

**For feature implementation:**
- Use `orchestrator` for multi-repo coordination
- Use specific agents (backend, ui, webapi) for single-repo work

**For mobile development:**
- Use `orchestrator` to coordinate flutter + native agents
- Use `flutter` for Dart/Flutter code
- Use `android_native` or `ios_native` for platform-specific code

**For planning:**
- Use `story_analyzer_agent` to understand requirements
- Use `planner_agent` to create implementation plan
- Use `architecture_agent` for design decisions

**For quality:**
- Use `code_review_agent` before creating PR
- Use `security_scanner_agent` for security checks
- Use `test_runner_agent` to validate tests

**For workflow:**
- Use `pr_creator_agent` to create pull requests
- Use `discussion_agent` for technical discussions

---

## Resources

All agents have access to:
- Project context files (`.kiro/context/`)
- Steering documents (`.kiro/steering/`)
- Project README and documentation

Some agents have MCP server integration:
- `story_analyzer_agent`: Jira, Confluence, GitHub
- `pr_creator_agent`: GitHub

---

## See Also

- `README.md` - Quick start guide
- `docs/PROMPT_GUIDE.md` - How to use agents effectively
- `.kiro/prompts/` - Individual agent prompts
- `.kiro/steering/` - Project conventions and guidelines
