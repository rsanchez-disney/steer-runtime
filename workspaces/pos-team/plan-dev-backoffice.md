# Dev Backoffice Profile — Architecture & Configuration

## Profile Location
```
steer-runtime/workspaces/pos-team/profiles/dev-backoffice/
```

## Directory Structure

```
profiles/dev-backoffice/
├── README.md
├── agents/
│   ├── pos_backoffice_orchestrator.json   ← ORCHESTRATOR (entry point)
│   ├── pos_architecture_agent.json        ← Architecture specialist
│   ├── pos_php_agent.json
│   ├── pos_go_agent.json
│   ├── pos_react_agent.json
│   ├── pos_planner_agent.json
│   ├── pos_test_runner_agent.json
│   ├── pos_work_documenter_agent.json
│   ├── pos_story_analyzer_agent.json
│   ├── pos_codebase_explorer_agent.json
│   ├── pos_code_review_agent.json
│   └── pos_security_scanner_agent.json
└── prompts/
    ├── pos_backoffice_orchestrator.md
    ├── pos_architecture_agent.md
    ├── pos_php_agent.md
    ├── pos_go_agent.md
    ├── pos_react_agent.md
    ├── pos_planner_agent.md
    ├── pos_test_runner_agent.md
    ├── pos_work_documenter_agent.md
    ├── pos_story_analyzer_agent.md
    ├── pos_codebase_explorer_agent.md
    ├── pos_code_review_agent.md
    └── pos_security_scanner_agent.md
```

## Agent Hierarchy

```
pos_backoffice_orchestrator (ORCHESTRATOR — pure delegation, no direct code work)
├── pos_architecture_agent       ← Architecture specialist — design decisions, ADRs, impact analysis
├── pos_story_analyzer_agent     ← Jira ticket fetching and analysis
├── pos_codebase_explorer_agent  ← File discovery, pattern matching
├── pos_planner_agent            ← Task breakdown and planning
├── pos_php_agent                ← PHP implementation (CodeIgniter + Laravel/Lumen)
├── pos_go_agent                 ← Go implementation (gRPC microservices)
├── pos_react_agent              ← React/TypeScript implementation
├── pos_test_runner_agent        ← PHPUnit, go test, Jest execution
├── pos_code_review_agent        ← Code quality review
├── pos_security_scanner_agent   ← Security scanning
└── pos_work_documenter_agent    ← Commit messages, PR descriptions
```

**Key distinction:** `pos_backoffice_orchestrator` is the sole orchestrator (delegates all work via `subagent`). `pos_architecture_agent` is a specialist sub-agent that provides architecture guidance, ADRs, and impact analysis when delegated to by the orchestrator — it does NOT orchestrate or delegate work itself.

## Orchestrator Role

The `pos_backoffice_orchestrator`:
- Is a **pure orchestrator** — does NOT implement, review, or test code itself
- Has `subagent` tool with 11 available/trusted agents
- Runs the 7-stage SDLC pipeline for Jira ticket implementations
- Routes quick-action requests to single agents
- Has `@mermaid/*` MCP for diagram generation
- Uses `todo_list` for pipeline state tracking
- Uses `knowledge` tool for retrieving stored context

## Architecture Agent Role

The `pos_architecture_agent`:
- Is a **specialist** (no `subagent` tool, no delegation capabilities)
- Provides architecture guidance, design decisions, ADRs, and impact assessments
- Has `@mermaid/*` MCP for generating architecture diagrams
- Has `knowledge` tool for retrieving system context
- Invoked by the orchestrator during Stage 2 (Explore) when changes touch multiple services or introduce new patterns

## SDLC Pipeline (7 Stages + 2 Gates)

```
Analyze → Explore → Plan → 🚦 Gate 1 → Implement → Test → Review → 🚦 Gate 2 → Document
```

| Stage | Agent | Purpose |
|-------|-------|---------|
| 1. Analyze | pos_story_analyzer_agent | Fetch Jira ticket, extract requirements |
| 2. Explore | pos_codebase_explorer_agent | Find relevant files, impact surface |
| 3. Plan | pos_planner_agent | Task breakdown, test strategy |
| 🚦 Gate 1 | — | User approves plan before implementation |
| 4. Implement | pos_php/go/react_agent | Code implementation |
| 5. Test | pos_test_runner_agent | Run tests, check coverage |
| 6. Review | pos_code_review + security | Quality + security review |
| 🚦 Gate 2 | — | User approves quality results |
| 7. Document | pos_work_documenter_agent | Commit message, PR description |

**Escalation in Stage 2:** If changes touch multiple services or introduce new patterns, the orchestrator also invokes `pos_architecture_agent` for guidance.

## Quick-Action Routing (non-SDLC)

| Trigger | Agent |
|---------|-------|
| Jira ticket (no "implement") | pos_story_analyzer_agent |
| "review code" | pos_code_review_agent |
| "run tests" | pos_test_runner_agent |
| "security scan" | pos_security_scanner_agent |
| "explore", "find where" | pos_codebase_explorer_agent |
| "create PR", "document" | pos_work_documenter_agent |
| "plan", "break down" | pos_planner_agent |
| "architecture", "design decision", "ADR" | pos_architecture_agent |

## Hooks

### Orchestrator hooks (pos_backoffice_orchestrator)
- `agentSpawn`: git-context.sh (inject branch/status), agent-registry.sh (inject available agents)

### Architecture agent hooks (pos_architecture_agent)
- `agentSpawn`: git-context.sh (inject branch/status)

### Implementation agent hooks (pos_php_agent, pos_go_agent, pos_react_agent)
- `preToolUse[fs_write]`: guard-writes.sh (block vendor/.git), secret-scan.sh (scan for secrets)
- `postToolUse[fs_write]`: lint-on-write.sh (auto-lint after writes)

## Tools by Agent

| Agent | Tools |
|-------|-------|
| pos_backoffice_orchestrator | code, grep, fs_read, execute_bash, thinking, knowledge, todo_list, subagent, @mermaid/* |
| pos_architecture_agent | code, grep, fs_read, execute_bash, thinking, knowledge, @mermaid/* |
| pos_php_agent | fs_read, fs_write, execute_bash, code, grep |
| pos_go_agent | fs_read, fs_write, execute_bash, code, grep |
| pos_react_agent | fs_read, fs_write, execute_bash, code, grep |
| pos_planner_agent | @jira/*, @jira-cloud/*, fs_read, thinking, code, grep |
| pos_test_runner_agent | execute_bash, fs_read, grep, code |
| pos_story_analyzer_agent | @jira/*, @jira-cloud/*, fs_read, grep, web_fetch, knowledge |
| pos_codebase_explorer_agent | code, grep, fs_read, glob |
| pos_code_review_agent | code, fs_read, grep, shell |
| pos_security_scanner_agent | shell, fs_read, grep, code |
| pos_work_documenter_agent | fs_read, write, grep |

## Context Resources

| File | Used By |
|------|---------|
| `context/backoffice_golden_rules.md` | orchestrator, architecture, php, go, react, code_review |
| `context/security_golden_rules.md` | php, go, react, code_review, security_scanner |
| `context/backoffice_sdlc_workflow.md` | planner |
| `context/project_mappings.md` | story_analyzer, codebase_explorer |
| `context/features/*` | orchestrator, architecture |

## Relationship to Other Profiles

- **orchestrator profile**: `pos_team_orchestrator_agent` delegates to `pos_backoffice_orchestrator` for all backend/architecture requests
- **dev-mobile profile**: Independent — handles Android/Kotlin via `android_arch_agent`
- **qa profile**: `qa_validation_agent` is standalone — validates test sets against epics
- **pm profile**: `dsp_bug_report_agent` generates daily DSP release reports
