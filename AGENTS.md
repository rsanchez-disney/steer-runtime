# Kiro Agents

Complete list of available agents in the steering runtime.

## Orchestrator Agents

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

## Specialized Agents (Config Studio)

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
**Use for:** API layer, BFF logic, TypeScript interfaces, error handling

### ui
**File:** `.kiro/agents/ui.json`  
**Purpose:** Angular specialist for wdpr-payment-controls-client  
**Tools:** read, write, shell  
**Use for:** Frontend development, Angular components, UI/UX, forms

---

## Mobile Agents

### flutter
**File:** `.kiro/agents/flutter.json`  
**Purpose:** Dart/Flutter specialist for cross-platform mobile development  
**Tools:** read, write, shell  
**Allowed paths:** lib/**, packages/**, test/**, pubspec.yaml  
**Use for:** Flutter widgets, state management (Provider), monorepo packages, platform channel interfaces

### android-native
**File:** `.kiro/agents/android-native.json`  
**Purpose:** Kotlin/Java specialist for Android platform channels and native features  
**Tools:** read, write, shell  
**Allowed paths:** android/**, build.gradle, AndroidManifest.xml  
**Use for:** Android platform channels, native Android APIs, Gradle configuration

### ios-native
**File:** `.kiro/agents/ios-native.json`  
**Purpose:** Swift/Objective-C specialist for iOS platform channels and native features  
**Tools:** read, write, shell  
**Allowed paths:** ios/**, Podfile, Info.plist  
**Use for:** iOS platform channels, native iOS APIs, CocoaPods configuration

---

## Planning & Analysis Agents

### planner_agent
**File:** `.kiro/agents/planner_agent.json`  
**Purpose:** Task planning and breakdown  
**Use for:** Breaking down stories into tasks, creating implementation plans, estimating effort

### story_analyzer_agent
**File:** `.kiro/agents/story_analyzer_agent.json`  
**Purpose:** JIRA story analysis and requirements extraction  
**Use for:** Analyzing stories, extracting acceptance criteria, identifying dependencies

### architecture_agent
**File:** `.kiro/agents/architecture_agent.json`  
**Purpose:** Architecture review and design validation  
**Use for:** Architecture decisions, design patterns, system design review

### codebase_explorer_agent
**File:** `.kiro/agents/codebase_explorer_agent.json`  
**Purpose:** Codebase exploration and discovery  
**Use for:** Understanding code structure, finding components, mapping dependencies

---

## Quality & Security Agents

### code_review_agent
**File:** `.kiro/agents/code_review_agent.json`  
**Purpose:** Code review and quality analysis  
**Use for:** PR reviews, code quality checks, best practices validation

### security_scanner_agent
**File:** `.kiro/agents/security_scanner_agent.json`  
**Purpose:** Security analysis and vulnerability detection  
**Use for:** Security audits, vulnerability scanning, secrets detection

### compliance_agent
**File:** `.kiro/agents/compliance_agent.json`  
**Purpose:** Compliance and standards validation  
**Use for:** Ensuring compliance with standards, policies, and regulations

### test_runner_agent
**File:** `.kiro/agents/test_runner_agent.json`  
**Purpose:** Test execution and analysis  
**Use for:** Running tests, analyzing test results, test coverage

### performance_agent
**File:** `.kiro/agents/performance_agent.json`  
**Purpose:** Performance analysis and optimization  
**Use for:** Performance profiling, optimization recommendations, bottleneck identification

---

## Workflow Agents

### pr_creator_agent
**File:** `.kiro/agents/pr_creator_agent.json`  
**Purpose:** Pull request creation and management  
**Use for:** Creating PRs, generating PR descriptions, linking to stories

### discussion_agent
**File:** `.kiro/agents/discussion_agent.json`  
**Purpose:** Facilitating technical discussions and decisions  
**Use for:** Technical discussions, decision making, consensus building

---

## Legacy/Alternative Agents

### backend_agent
**File:** `.kiro/agents/backend_agent.json`  
**Purpose:** Alternative backend agent configuration  
**Note:** Use `backend` for Config Studio work

### ui_agent
**File:** `.kiro/agents/ui_agent.json`  
**Purpose:** Alternative UI agent configuration  
**Note:** Use `ui` for Config Studio work

### webapi_agent
**File:** `.kiro/agents/webapi_agent.json`  
**Purpose:** Alternative WebAPI agent configuration  
**Note:** Use `webapi` for Config Studio work

---

## Quick Reference

### For Feature Implementation
1. **orchestrator** - Coordinate the work
2. **backend** - Java services changes
3. **webapi** - BFF/API layer changes
4. **ui** - Angular frontend changes

### For Mobile Development
1. **orchestrator** - Coordinate mobile work
2. **flutter** - Dart/Flutter code
3. **android-native** - Android platform channels
4. **ios-native** - iOS platform channels

### For Planning & Review
- **planner_agent** - Break down work
- **architecture_agent** - Review design
- **code_review_agent** - Review code
- **security_scanner_agent** - Security check

### For Testing & Quality
- **test_runner_agent** - Run tests
- **performance_agent** - Performance check
- **compliance_agent** - Compliance check

---

## Agent Configuration

All agents are configured in `.kiro/agents/` and reference:
- Prompts: `.kiro/prompts/`
- Skills: `.kiro/skills/`
- Steering: `.kiro/steering/`
- Context: `.kiro/context/`

See `.kiro/README.md` for complete structure documentation.

---

**Total Agents:** 23  
**Last Updated:** March 12, 2026
