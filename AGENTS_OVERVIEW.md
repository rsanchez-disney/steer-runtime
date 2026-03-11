# steer-runtime Agents Overview

**Total Agents**: 16  
**Last Updated**: 2026-03-10

## Core Orchestration (2)

### orchestrator_agent
Main workflow coordinator. Manages 14-step SDLC workflow with 2 approval gates.

### orchestrator_multiagent
Alternative orchestrator approach (experimental).

## Story & Planning (5)

### story_analyzer_agent
Fetches Jira stories via MCP. Validates completeness (title, description, ACs, priority).

### codebase_explorer_agent
Explores target project code. Finds relevant files, patterns, dependencies, test locations.

### discussion_agent
Captures user preferences before planning. Asks about layout, interactions, storage, etc.

### architecture_agent
Provides architecture guidance for complex designs. Reviews patterns and trade-offs.

### planner_agent
Creates implementation plans with XML tasks. Includes dependencies, estimates, test strategy.

## Implementation (3)

### backend_agent
Implements Java/Spring changes. Follows existing patterns. Creates atomic commits per task.

### ui_agent
Implements Angular/TypeScript changes. Follows existing patterns. Creates atomic commits per task.

### webapi_agent
Implements Node/Express changes. Follows existing patterns. Creates atomic commits per task.

## Quality & Security (5)

### test_runner_agent
Runs tests and checks coverage ≥90%. Reports failures with details.

### code_review_agent
Reviews code for security, quality, performance, testing issues. Auto-fixes minor issues.

### security_scanner_agent
Scans for vulnerabilities (dependencies, static analysis, secrets). Auto-fixes when possible.

### performance_agent ⭐ NEW
Benchmarks API latency, database queries, bundle size, memory. Flags regressions >15%.

### compliance_agent ⭐ NEW
Checks PII/PCI-DSS/GDPR compliance, accessibility (WCAG 2.1 AA), documentation standards.

## PR Creation (1)

### pr_creator_agent
Creates GitHub PRs via MCP. Includes story details, changes summary, quality report.

---

## Workflow Integration

```
orchestrator_agent
    ├─→ story_analyzer_agent (Step 1)
    ├─→ codebase_explorer_agent (Step 2)
    ├─→ discussion_agent (Step 3, optional)
    ├─→ architecture_agent (Step 4, optional)
    ├─→ planner_agent (Step 5)
    ├─→ [Approval Gate #1]
    ├─→ backend_agent / ui_agent / webapi_agent (Step 7)
    ├─→ test_runner_agent (Step 8)
    ├─→ code_review_agent (Step 9)
    ├─→ security_scanner_agent (Step 10)
    ├─→ performance_agent (Step 11) ⭐
    ├─→ compliance_agent (Step 12) ⭐
    ├─→ [Approval Gate #2]
    └─→ pr_creator_agent (Step 14)
```

## Quality Checks (5)

1. **Tests** - Coverage ≥90%, all tests pass
2. **Code Review** - Security, quality, performance, testing
3. **Security** - Vulnerabilities, secrets, dependencies
4. **Performance** - Latency, throughput, bundle size, memory ⭐
5. **Compliance** - PII/PCI-DSS/GDPR, accessibility, docs ⭐

## Usage

### Standalone Agent
```bash
kiro-cli chat --agent <agent_name>
```

### Full Workflow
```bash
cd ~/my-project
kiro-cli chat --agent orchestrator_agent
> Implement https://jira.disney.com/browse/DPAY-XXXXX
```

---

**Phase**: 2 Complete ✅  
**Next**: Phase 3 (Verification Loop, Wave Execution, Multi-Repo)
