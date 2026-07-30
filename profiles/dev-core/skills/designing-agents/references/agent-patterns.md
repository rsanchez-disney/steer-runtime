# Agent Coordination Patterns — Detailed Reference

> Detailed multi-agent patterns, real-world examples, and decision trees. Load this file when
> designing a system with 2+ agents or when the user needs help choosing an architecture.

## Contents

1. [Decision tree — choosing your architecture](#decision-tree)
2. [Pattern details with full examples](#pattern-details)
3. [Tool permission matrices by agent type](#tool-permission-matrices)
4. [Subagent design rules](#subagent-design-rules)
5. [Platform-specific considerations](#platform-specific-considerations)
6. [Real-world examples](#real-world-examples)

---

## Decision tree

```text
How many domains does the work span?
├── 1 domain → Solo agent + skills
└── 2+ domains
    ├── Do they need to work in parallel?
    │   ├── Yes → Orchestrator + subagents
    │   └── No  → Are they sequential?
    │       ├── Yes → Pipeline (A → B → C)
    │       └── No  → Independent solo agents (no coordination needed)
    └── Is there a review/approval gate?
        └── Yes → Review loop pattern
```

```text
Does the agent need to delegate?
├── No  → Solo agent (skills handle variety)
└── Yes → What kind of delegation?
    ├── "Do this focused task and return" → Subagent
    ├── "Process this through stages" → Pipeline
    └── "Research in parallel, consolidate" → Orchestrator + parallel subagents
```

---

## Pattern details

### Solo agent + Skills

**When:** One domain, multiple workflows within that domain.

**Structure:**
```json
{
  "name": "backend-engineer",
  "description": "Implements backend features — APIs, services, database migrations, and tests.",
  "resources": [
    "skill://.kiro/skills/scaffolding-api-endpoints.md",
    "skill://.kiro/skills/generating-unit-tests.md",
    "skill://.kiro/skills/migrating-database-schemas.md"
  ],
  "allowedTools": ["read", "write", "grep", "glob", "code", "shell"]
}
```

**Why this works:** The agent doesn't need to delegate because skills handle workflow variety.
Each skill activates based on the user's prompt — no dispatch logic needed.

**Scaling limit:** When you have 10+ skills, routing accuracy drops. Consider splitting into
domain-specific agents at that point.

---

### Orchestrator + Subagents

**When:** Cross-domain work, parallel research, or the main agent needs to stay thin.

**Structure:**
```json
{
  "name": "platform-orchestrator",
  "description": "Routes platform engineering requests to the appropriate specialist agent.",
  "resources": [],
  "allowedTools": ["read", "grep", "glob"],
  "agents": {
    "backend-specialist": "Implements API endpoints, services, and database layers.",
    "frontend-specialist": "Builds UI components, state management, and client-side logic.",
    "infra-specialist": "Manages CI/CD pipelines, IaC, and deployment configurations."
  }
}
```

**Orchestrator rules:**
- Keep it THIN — it routes, it doesn't do heavy work.
- Its tools should be minimal (read-only to inspect, dispatch to delegates).
- Each subagent description must be distinct enough to prevent mis-routing.

---

### Pipeline (Sequential)

**When:** Work must flow through stages with defined I/O.

**Example:** Feature Implementation → Code Review → Deployment Prep

```text
Agent A (Implementer): Produces feature code with tests
  output: code changes + test files
    ↓
Agent B (Reviewer): Evaluates code quality and standards compliance
  output: review verdict (APPROVED / NEEDS_CHANGES + feedback)
    ↓
Agent C (Deployer): Generates PR description, changelog, migration notes
  output: deployment-ready package
```

**Pipeline rules:**
- Define the I/O contract between each stage explicitly.
- Each agent should validate its input before processing.
- If validation fails, return to previous stage with feedback (becomes a review loop).

---

### Review Loop

**When:** Quality gate needed, iterative improvement.

**Example:** Implement → Review → Fix → Re-review

```text
Implementer: produces code/artifact
  → Reviewer: evaluates against checklist
      ├── score ≥ 9/10 → PASS (deliver)
      └── score < 9/10 → NEEDS_CHANGES
          → feedback returned to Implementer
          → Implementer revises
          → back to Reviewer
          (max 3 iterations, then escalate to human)
```

**Loop rules:**
- Always set a max iteration cap (prevent infinite loops).
- Define clear PASS/FAIL criteria (not subjective).
- The reviewer should have fewer tools than the implementer.
- Feedback must be specific (not "try again" but "fix X, Y, Z").

---

## Tool permission matrices

### By agent role

| Role           | Typical tools                                         | Never grant              |
|----------------|-------------------------------------------------------|--------------------------|
| Researcher     | read, grep, glob, web_search, web_fetch, knowledge    | write, shell             |
| Reviewer       | read, grep, glob, code                                | write, shell             |
| Implementer    | read, write, grep, glob, code, shell                  | —                        |
| Publisher      | read, write, MCP (specific)                           | shell                    |
| Orchestrator   | read, grep, glob (dispatch only)                      | write, shell             |

### Escalation path

```text
read-only (default)
  → + write (if produces files)
    → + shell (if runs builds/tests — requires justification)
      → + MCP (if integrates externally — scope to specific server)
```

---

## Subagent design rules

1. **No inheritance** — explicitly assign every skill and tool.
2. **Fewer permissions** than parent — always.
3. **Single purpose** — one clear task per invocation.
4. **Clear description** — parent uses this to decide when to dispatch.
5. **Scoped model** — use cheaper/faster model for simple tasks (`haiku` for formatting).
6. **Defined output** — the parent must know what to expect back.

### Subagent definition checklist

```markdown
- Name: [lowercase-hyphenated]
- Description: [what + when — for parent dispatch]
- Tools: [minimal set needed]
- Skills: [explicitly listed — NONE inherited]
- Model: [inherit / sonnet / haiku — justify if not inherit]
- Expected output: [what the parent will receive back]
```

---

## Platform-specific considerations

### Kiro (`.kiro/agents/<name>.json`)

- JSON format, `resources` array for skills/files.
- `allowedTools` array with tool names.
- MCP tools use `@server-name/*` wildcard format.
- Hooks supported (`agentSpawn`, etc.).

### Claude Code (`.claude/agents/<name>.md`)

- Markdown with YAML frontmatter.
- `tools:` field (comma-separated or list).
- `skills:` field (list of skill names to explicitly load).
- `model:` field (sonnet, haiku, opus, or inherit).
- Body is the system prompt.

### Agent SDK (Python)

- `AgentDefinition(description, prompt, tools)` in code.
- Must include `"Skill"` in main agent's `allowed_tools`.
- Must set `setting_sources=["user", "project"]` for skill discovery.
- MCP servers configured in `mcp_servers` dict.
- No built-in permission prompts — implement safety checks manually.

---

## Real-world examples

### Example 1: Full-stack team — Solo agent with domain skills

```json
{
  "name": "fullstack-engineer",
  "description": "Implements features across backend APIs, frontend components, and database layers.",
  "resources": [
    "skill://.kiro/skills/scaffolding-api-endpoints.md",
    "skill://.kiro/skills/generating-unit-tests.md",
    "skill://.kiro/skills/refactoring-legacy-modules.md"
  ],
  "allowedTools": ["read", "write", "grep", "glob", "code", "shell", "@github/*"]
}
```

**Why solo:** Single domain (feature development), 3 skills cover the variety, no need for delegation.

### Example 2: Platform engineering — Orchestrator + 3 parallel subagents

```json
{
  "name": "platform-orchestrator",
  "description": "Coordinates platform engineering work across backend, frontend, and infrastructure.",
  "resources": [],
  "allowedTools": ["read", "grep", "glob"]
}
```

Subagents:

```python
"backend_agent": AgentDefinition(
    description="Implements API endpoints, services, and database migrations.",
    prompt=load_prompt("backend_agent.md"),
    tools=["Read", "Write", "Grep", "Glob", "Bash"],
)
"frontend_agent": AgentDefinition(
    description="Builds React components, state management, and client-side logic.",
    prompt=load_prompt("frontend_agent.md"),
    tools=["Read", "Write", "Grep", "Glob", "Bash"],
)
"infra_agent": AgentDefinition(
    description="Manages Terraform modules, CI/CD pipelines, and deployment configs.",
    prompt=load_prompt("infra_agent.md"),
    tools=["Read", "Write", "Grep", "Glob", "Bash"],
)
```

**Why orchestrator:** Three distinct domains that benefit from specialized context. Orchestrator stays thin and dispatches based on the request type.

### Example 3: Code delivery — Review loop

```markdown
---
name: code-reviewer
description: Reviews code changes for quality, security, and test coverage. Invoke after implementation.
tools: Read, Grep, Glob, Code
model: sonnet
skills:
  - reviewing-pull-requests
---

# Code Reviewer

Review the provided code changes against the team's standards checklist.

Evaluate:
1. Architecture compliance (proper layering, DI, no circular deps)
2. Security (no hardcoded secrets, input validation, SQL injection)
3. Test coverage (new code has corresponding tests)
4. Performance (no N+1 queries, proper resource cleanup)

If issues found, output: NEEDS_CHANGES followed by specific feedback per file.
If all checks pass, output: APPROVED followed by summary.
```

**Why loop:** Implementer → Reviewer → (fix if needed) → Reviewer again. Max 3 iterations.

### Example 4: CI/CD pipeline — Sequential agents

```text
Agent A (feature-implementer):
  Input: Jira ticket with requirements
  Output: Code changes + unit tests
  Tools: read, write, grep, glob, code, shell, @jira/*

Agent B (integration-tester):
  Input: Changed files from Agent A
  Output: Integration test results + coverage report
  Tools: read, grep, glob, shell

Agent C (pr-creator):
  Input: All changes + test results
  Output: GitHub PR with description, labels, reviewers assigned
  Tools: read, grep, glob, write, @github/*
```

**Why pipeline:** Strict ordering required — can't create a PR before tests pass, can't test before implementation.

### Example 5: Monorepo — Domain-scoped agents

```json
[
  {
    "name": "payments-agent",
    "description": "Handles payment processing domain — transaction services, payment gateways, and reconciliation.",
    "resources": ["skill://.kiro/skills/scaffolding-api-endpoints.md"],
    "allowedTools": ["read", "write", "grep", "glob", "code", "shell"],
    "scope": "packages/payments/**"
  },
  {
    "name": "auth-agent",
    "description": "Handles authentication domain — login flows, token management, and session handling.",
    "resources": ["skill://.kiro/skills/scaffolding-api-endpoints.md"],
    "allowedTools": ["read", "write", "grep", "glob", "code", "shell"],
    "scope": "packages/auth/**"
  },
  {
    "name": "shared-libs-agent",
    "description": "Maintains shared libraries — utilities, common models, and cross-cutting concerns.",
    "resources": ["skill://.kiro/skills/refactoring-legacy-modules.md"],
    "allowedTools": ["read", "write", "grep", "glob", "code"],
    "scope": "packages/shared/**"
  }
]
```

**Why domain-scoped:** Large monorepo benefits from agents that understand their bounded context without loading the entire codebase into context.
