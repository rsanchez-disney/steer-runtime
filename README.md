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

This validates dependencies and copies all agents to `~/.kiro/`.

**To update agents later**:
```bash
./setup-kiro.sh --sync
```

### 3. Configure MCP Servers

```bash
./setup-mcp-cli.sh
# Edit ~/.kiro/config.json and add your tokens
```

See **MCP_SETUP.md** for detailed instructions.

### 4. Navigate to Your Project

```bash
cd ~/my-project  # Your actual project directory
```

### 5. Start Orchestrator

```bash
kiro-cli chat --agent orchestrator_agent
```

### 6. Provide Jira Link

```
> Implement https://jira.disney.com/browse/DPAY-14337
```

### 7. Approve at Gates

The orchestrator will analyze the story, explore your codebase, discuss preferences, create a plan, and ask for approval.

```
Do you approve this plan? (yes/no/modify)
> yes
```

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
    ├─→ [Approval Gate #1]
    ├─→ backend_agent / ui_agent / webapi_agent (implement)
    ├─→ test_runner_agent (run tests)
    ├─→ code_review_agent (review code)
    ├─→ security_scanner_agent (scan vulnerabilities)
    ├─→ performance_agent (benchmark performance)
    ├─→ compliance_agent (check compliance)
    ├─→ [Approval Gate #2: Quality Report]
    └─→ pr_creator_agent (create PR)
```

---

## Agents (16 Total)

### Core Orchestration
- **orchestrator_agent** - Main coordinator with 14-step workflow

### Story & Planning
- **story_analyzer_agent** - Fetches Jira stories via MCP
- **codebase_explorer_agent** - Explores code structure
- **discussion_agent** - Captures user preferences
- **architecture_agent** - Provides architecture guidance
- **planner_agent** - Creates implementation plans with XML tasks

### Implementation
- **backend_agent** - Java/Spring changes (atomic commits)
- **ui_agent** - Angular/TypeScript changes (atomic commits)
- **webapi_agent** - Node/Express changes (atomic commits)

### Quality & Security
- **test_runner_agent** - Runs tests, checks coverage ≥90%
- **code_review_agent** - Reviews security, quality, performance
- **security_scanner_agent** - Scans vulnerabilities, secrets
- **performance_agent** - Benchmarks API, DB, bundle size
- **compliance_agent** - Checks PII/PCI-DSS/GDPR, accessibility

### PR Creation
- **pr_creator_agent** - Creates GitHub PRs via MCP

See **AGENTS_OVERVIEW.md** for complete reference.

---

## Features

### Phase 1 (Complete)
✅ Core workflow with 16 agents  
✅ Discussion agent for preference capture  
✅ XML task structure in planner  
✅ Jira completeness validation  
✅ Code review automation  
✅ Security scanning  

### Phase 2 (Complete)
✅ Performance benchmarking  
✅ Compliance checking  
✅ Atomic git commits per task  
✅ 5 quality checks (tests, review, security, performance, compliance)  

### Phase 3 (Planned)
- Verification loop (interactive testing with auto-fix)
- Wave execution (parallel task execution)
- Multi-repo orchestration

---

## Requirements

- **Node.js 18+** - For MCP servers
- **npm** - For dependencies
- **kiro-cli** - For running agents
- **git** - For workflow operations
- **Jira & GitHub access** - For MCP servers

The setup script validates and helps install missing dependencies.

---

## Using with Kiro UI

### Setup for UI

In your target project:
```bash
cd ~/my-project
~/steer-runtime/setup-ui.sh
```

This copies all agents to `.kiro-steer/` with UI-compatible paths.

### Usage

1. Open project in Kiro UI
2. Select `orchestrator_agent` from dropdown
3. Provide Jira URL
4. Approve at gates
5. PR created!

See **KIRO_UI_SETUP.md** for detailed instructions.

---

## Distribution

To create a distribution package with MCP servers:

```bash
./create-distribution.sh
```

Creates `dist/steer-runtime-v1.0.0.zip` with:
- All 16 agents
- Custom MCP servers (jira-mcp, github-mcp, etc.)
- Setup scripts
- Complete documentation
- Auto-installer

Recipients just run `./install.sh` after extracting.

See **MCP_DISTRIBUTION.md** for details.

---

## Documentation

- **README.md** - This file (quick start)
- **DESIGN.md** - Architecture and workflow details
- **AGENTS_OVERVIEW.md** - Complete agent reference
- **IMPLEMENTATION_PLAN.md** - Phase 2 & 3 roadmap
- **GSD_ENHANCEMENTS.md** - GSD-inspired improvements
- **JIRA_COMPLETENESS_CRITERIA.md** - Story validation rules
- **KIRO_UI_SETUP.md** - Kiro UI setup guide
- **MCP_SETUP.md** - MCP server configuration
- **MCP_DISTRIBUTION.md** - Distribution packaging guide
- **PHASE2_COMPLETE.md** - Phase 2 implementation summary

---

## Status

**Phase**: 2 Complete ✅  
**Agents**: 16 specialized agents  
**Quality Checks**: 5 (tests, review, security, performance, compliance)  
**Workflow Steps**: 14 with 2 approval gates  

---

**Version**: v1.0.0  
**Last Updated**: 2026-03-10
