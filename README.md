# steer-runtime (Kiro-Native)

**Automated SDLC Orchestration through Kiro Agents**

Transform a Jira story link into a production-ready GitHub PR using pure Kiro agent orchestration - no Python scripts required.

---

## Quick Start

### 1. Clone steer-runtime

```bash
git clone <repo-url> ~/steer-runtime
```

### 2. Setup Kiro Agents

```bash
cd ~/steer-runtime
./setup-kiro.sh
```

This copies all agents to `~/.kiro/` without overwriting existing content.

**To update agents later**:
```bash
./setup-kiro.sh --sync
```

### 3. Navigate to Your Project

```bash
cd ~/my-project  # Your actual project directory
```

### 4. Start Orchestrator

```bash
kiro-cli chat --agent orchestrator_agent
```

### 5. Provide Jira Link

```
> Implement https://jira.disney.com/browse/DPAY-14337
```

### 6. Approve Plan

The orchestrator will analyze the story, explore your codebase, discuss preferences, create a plan, and ask for approval.

```
Do you approve this plan? (yes/no/modify)
> yes
```

### 7. Watch It Work

The orchestrator delegates to specialized agents:
- `story_analyzer_agent` - Fetches Jira story
- `codebase_explorer_agent` - Explores your code
- `discussion_agent` - Captures your preferences
- `planner_agent` - Creates implementation plan
- `backend_agent`, `ui_agent`, `webapi_agent` - Implement changes
- `test_runner_agent` - Runs tests
- `pr_creator_agent` - Creates GitHub PR

---

## How It Works

```
User: "Implement https://jira.disney.com/browse/DPAY-14337"
    ↓
orchestrator_agent
    ├─→ story_analyzer_agent (fetch Jira story)
    ├─→ codebase_explorer_agent (explore code)
    ├─→ discussion_agent (capture preferences)
    ├─→ planner_agent (create plan)
    ├─→ [User Approval Gate]
    ├─→ backend_agent (implement backend)
    ├─→ ui_agent (implement UI)
    ├─→ webapi_agent (implement WebAPI)
    ├─→ test_runner_agent (run tests)
    └─→ pr_creator_agent (create PR)
```

---

## Agents

### orchestrator_agent
Main coordinator. Delegates to specialized agents and manages approval gates.

### story_analyzer_agent
Fetches Jira stories via MCP. Extracts scope, ACs, type, priority, components.

### codebase_explorer_agent
Explores your codebase. Finds relevant files, patterns, dependencies, test locations.

### discussion_agent
Captures your preferences before planning. Asks about layout, interactions, storage, etc.

### planner_agent
Creates implementation plans. Breaks down into tasks with dependencies and estimates.

### backend_agent, ui_agent, webapi_agent
Implement code changes. Follow patterns from codebase exploration.

### test_runner_agent
Runs tests and checks coverage ≥90%.

### pr_creator_agent
Creates GitHub PRs via MCP with proper description and labels.

---

## Example Session

```
User: Implement https://jira.disney.com/browse/DPAY-14337

Orchestrator: 🔍 Analyzing story...
✓ Story analyzed: Add export progress indicator (P1, feature)

Orchestrator: 🔍 Exploring codebase...
✓ Found: ExportService.java, export.component.ts, export.controller.ts

Orchestrator: 💬 Let's discuss implementation preferences...
> How should the progress be displayed?
User: Progress bar at the top of the modal
> Should we use polling or WebSockets?
User: Polling is fine, keep it simple
> Where should we store progress state?
User: Redis cache, it's temporary data
✓ Preferences captured

Orchestrator: 📋 Creating implementation plan...

═══════════════════════════════════════════════════════════
IMPLEMENTATION PLAN FOR DPAY-14337
═══════════════════════════════════════════════════════════

Story: Add export progress indicator
Type: feature | Priority: P1

Tasks:
  Task T1: Add progress tracking to ExportService
    Files: src/service/ExportService.java
    Agent: backend_agent
    Estimated: 2 hours
  
  Task T2: Add progress endpoint to WebAPI
    Files: src/controllers/export.controller.ts
    Agent: webapi_agent
    Dependencies: T1
    Estimated: 1 hour
  
  Task T3: Add progress indicator component
    Files: src/app/export/export.component.ts
    Agent: ui_agent
    Dependencies: T2
    Estimated: 2 hours

Test Strategy:
  - Unit tests for ExportService
  - Integration tests for progress endpoint
  - E2E tests for UI component

Golden Rules Applied:
  ✓ Backward compatibility preserved
  ✓ Test coverage ≥90%
  ✓ No secrets in code

═══════════════════════════════════════════════════════════

Do you approve this plan? (yes/no/modify)

User: yes

Orchestrator: ✅ Plan approved. Starting implementation...

Orchestrator: 🔧 Task T1: Backend implementation
✓ Modified: src/service/ExportService.java
✓ Created: src/test/ExportServiceTest.java

Orchestrator: 🔧 Task T2: WebAPI implementation
✓ Modified: src/controllers/export.controller.ts
✓ Created: src/controllers/export.controller.test.ts

Orchestrator: 🔧 Task T3: UI implementation
✓ Modified: src/app/export/export.component.ts
✓ Created: src/app/export/export.component.spec.ts

Orchestrator: 🧪 Running tests...
✓ Unit tests: 45/45 passed
✓ Integration tests: 12/12 passed
✓ Coverage: 94%

Orchestrator: 📝 Creating PR...
✓ Branch: feature/DPAY-14337-export-progress
✓ PR: https://github.com/disney/config-services/pull/1234

═══════════════════════════════════════════════════════════
✅ WORKFLOW COMPLETED
═══════════════════════════════════════════════════════════

PR: https://github.com/disney/config-services/pull/1234
Duration: 8m 32s
Files changed: 6
Tests added: 3
Coverage: 94%

Ready for review!
```

---

## Benefits

✅ **No Python scripts** - Pure Kiro agents  
✅ **Natural conversation** - Just talk to the orchestrator  
✅ **Kiro manages state** - No custom state management  
✅ **Approval gates built-in** - Agent asks, you respond  
✅ **Subagent delegation** - Kiro's native capability  
✅ **Portable** - Works in any project directory  
✅ **Extensible** - Add new agents easily  

---

## Requirements

- Kiro CLI installed
- MCP servers configured (Jira, GitHub)
- Project with existing codebase

---

## Real-World Example

See a complete example of Kiro in action:

📖 **[Kiro - Engineering Guide](https://confluence.disney.com/pages/viewpage.action?pageId=2068867192&spaceKey=Payments&title=Kiro%2B-%2BEngineering%2BGuide)**

This Confluence page demonstrates a real implementation using Kiro Pack with detailed walkthrough and results.

---

## Directory Structure

```
steer-runtime/
├── .kiro/
│   ├── agents/
│   │   ├── orchestrator_agent.json
│   │   ├── story_analyzer_agent.json
│   │   ├── codebase_explorer_agent.json
│   │   ├── discussion_agent.json
│   │   ├── planner_agent.json
│   │   ├── backend_agent.json
│   │   ├── ui_agent.json
│   │   ├── webapi_agent.json
│   │   ├── test_runner_agent.json
│   │   └── pr_creator_agent.json
│   │
│   ├── prompts/
│   │   └── [Agent prompts]
│   │
│   └── context/
│       └── golden_rules.md
│
├── setup-kiro.sh            (setup script)
├── README.md                (this file)
└── DESIGN.md                (architecture details)
```

---

## Status

**Phase**: Production Ready  
**Agents**: 10 specialized agents  
**Enhancements**: GSD-inspired discussion step and XML task structure  

---

**Version**: Kiro-Native v1.1  
**Last Updated**: 2026-03-02
