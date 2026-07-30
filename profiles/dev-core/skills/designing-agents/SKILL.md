---
name: designing-agents
description: >-
  Designs and configures AI agents (main agents, subagents, multi-agent systems) with proper
  tool permissions, skill assignments, and coordination patterns. Use when the user needs to
  create an agent config, define subagents, or architect a multi-agent workflow.
---

# Designing Agents

## Purpose

Design production-ready AI agent configurations — main agents, subagents, and multi-agent
systems — with proper tool scoping, skill assignments, clear dispatch descriptions, and
coordination patterns. Produces agent definition files ready for Claude Code (`.claude/agents/`),
Kiro (`.kiro/agents/`), or Agent SDK (`AgentDefinition` in Python).

## When to use

- User wants to create a new agent or subagent definition.
- User asks to architect a multi-agent system or workflow.
- User needs to define tool permissions for an agent.
- User wants to convert a monolithic prompt into an agent with skills.
- User says "create an agent for X", "I need a subagent that does Y", "set up agents".
- User wants to review or improve an existing agent configuration.

## When NOT to use

- User needs to create a skill (use `creating-skills` instead).
- User needs to write the actual code an agent will produce.
- User needs to set up MCP server infrastructure (tool connectivity, not agent design).
- User needs a one-off prompt, not a persistent agent definition.

## Inputs

| Input                           | Required | Notes                                              |
|---------------------------------|:--------:|----------------------------------------------------|
| Agent's purpose / domain        |   Yes    | What the agent is responsible for                  |
| Available tools and MCPs        |    No    | If unknown, skill recommends appropriate tools     |
| Available skills to assign      |    No    | Skill will identify which existing skills apply    |
| Target platform                 |    No    | Claude Code / Kiro / Agent SDK (defaults to Kiro)  |

## Workflow

### Step 1 — Determine agent scope

Answer these questions before writing any config:

- **What domain** does this agent own? (single responsibility)
- **What actions** will it perform? (→ determines tools)
- **What knowledge** does it need? (→ determines skills)
- **Does it work alone** or coordinate with others? (→ subagent pattern)
- **Who triggers it?** Human directly, or dispatched by a parent agent?

**Single responsibility rule:** One agent = one domain. If an agent does 3 unrelated things,
split into 3 agents or 1 orchestrator + 3 subagents.

### Step 2 — Classify the agent type

| Type           | When                                               | Structure                          |
|----------------|----------------------------------------------------|------------------------------------|
| **Solo agent** | Single domain, no delegation needed                | Agent config + skills              |
| **Orchestrator** | Coordinates multiple subagents                   | Thin agent + dispatch logic        |
| **Subagent**   | Specialist invoked by a parent for focused tasks   | AgentDefinition with scoped tools  |
| **Pipeline**   | Sequential hand-off (A → B → C)                   | Multiple agents with defined I/O   |

### Step 3 — Design tool permissions (principle of least privilege)

Grant only what the agent needs:

| Permission level | Tools                                       | When to grant                        |
|------------------|---------------------------------------------|--------------------------------------|
| **Read-only**    | read, grep, glob, code                      | Default — always safe                |
| **Knowledge**    | knowledge, web_search, web_fetch            | Research agents                      |
| **Write**        | write                                       | Agents that produce files            |
| **Execute**      | shell, Bash                                 | Build/test agents (careful)          |
| **External**     | MCP tools (`@jira/*`, `@github/*`)          | Integration agents                   |
| **Dangerous**    | shell with no restrictions                  | Almost never — require justification |

**Rules:**
- Start with read-only, add permissions only when justified.
- MCP tools: use wildcards (`@jira-myjira/*`) only for the MCP the agent needs.
- Subagents should have FEWER tools than the parent, not more.
- Document WHY each tool is granted (in comments or design notes).

### Step 4 — Assign skills

**Critical rule:** Subagents do NOT inherit skills from the parent. Each agent must explicitly
list the skills it uses.

| Question                                         | Action                                |
|--------------------------------------------------|---------------------------------------|
| Does the agent need procedural knowledge?        | Assign a skill                        |
| Will it do the same workflow repeatedly?         | Assign a skill                        |
| Does it only need static context?               | Use resources/files, not a skill      |
| Does it need everything the parent knows?        | Reassign skills explicitly            |

### Step 5 — Link scripts and executable code

When an agent needs to run code (builds, validations, data processing, integrations):

#### Option A: Scripts inside a skill (`scripts/`)

Best when the code is part of a reusable workflow:

```
.kiro/skills/validating-data-quality/
├── SKILL.md                    ← references the script, says WHEN and HOW to run it
└── scripts/
    └── validate.py             ← executed by the agent via shell/Bash tool
```

In `SKILL.md`, instruct explicitly:
```markdown
## Workflow
### Step 3 — Run validation
Execute `scripts/validate.py` with the input file path as argument:
\`\`\`bash
python scripts/validate.py --input <file_path> --format json
\`\`\`
Only the output enters the context — the script source code does NOT load into context.
Dependencies: pandas, jsonschema (document in SKILL.md).
```

**Rules for skill scripts:**
- Document dependencies in SKILL.md (what libraries/runtimes are needed).
- State whether the agent should **execute** it or **read it as reference**.
- Script output returns to context; source code does NOT (saves context window).
- Forward slashes in all script paths.

#### Option B: Hooks in agent config

Best for automated triggers (session start, pre-commit, scheduled):

```json
{
  "name": "my-agent",
  "hooks": {
    "agentSpawn": [
      {
        "command": ".kiro/hooks/session-watchlist.sh",
        "timeout_ms": 5000
      }
    ],
    "preCommit": [
      {
        "command": ".kiro/hooks/lint-check.sh",
        "timeout_ms": 10000
      }
    ]
  }
}
```

**Hook types:**
| Hook          | When it runs                         | Use case                              |
|---------------|--------------------------------------|---------------------------------------|
| `agentSpawn`  | Agent session starts                 | Load watchlists, check environment    |
| `preCommit`   | Before committing                    | Linting, format checks, secret scan   |
| `onFileChange`| A watched file is modified           | Auto-validation, sync                 |

**Hook rules:**
- Keep hooks fast (set `timeout_ms` — fail open if too slow).
- Hooks run OUTSIDE the agent's context — they're fire-and-forget or gate-keepers.
- Use for side-effects (notifications, logging, validation gates), not for producing content.

#### Option C: Direct shell commands via tool permission

Best for ad-hoc execution that doesn't need a reusable script:

```json
{
  "allowedTools": ["read", "write", "grep", "glob", "shell"]
}
```

The agent can then run commands directly. Use when:
- Running build commands (`npm test`, `go build`, `pytest`).
- Executing one-off CLI tools.
- The command is simple enough that a script file would be overkill.

**Safety:** Only grant `shell` when justified. Prefer skill scripts (Option A) for complex
or repeated logic — they're auditable, version-controlled, and documented.

#### Decision table: where to put executable code

| Scenario                                       | Where                        | Why                              |
|------------------------------------------------|------------------------------|----------------------------------|
| Repeated validation in a workflow              | `skills/<name>/scripts/`     | Reusable, documented, versioned  |
| Automated trigger (session start, pre-commit)  | `hooks/` in agent config     | Runs automatically, no prompting |
| Simple build/test command                      | Direct via `shell` tool      | One-liner, not worth a file      |
| Complex multi-step automation                  | `skills/<name>/scripts/`     | Needs documentation + deps       |
| External integration (API call, webhook)       | MCP server or `scripts/`     | Depends on reuse frequency       |

### Step 6 — Write the description (dispatch routing)

The `description` field determines WHEN this agent gets invoked. Same rules as skill descriptions:

- Single sentence explaining **what it does + when to invoke it**.
- Include routing keywords that a parent agent would match.
- Be specific enough to avoid false dispatches.

**Test:** "If a parent agent received prompt X, would this description cause correct dispatch?"

### Step 7 — Write the agent definition

Produce the config in the target platform format (see templates below).

### Step 8 — Validate

Check against the agent quality checklist before delivering.

## Output

### For Kiro (`.kiro/agents/<name>.json`)

```json
{
  "name": "<agent-name>",
  "description": "<what + when — dispatch routing>",
  "resources": [
    "skill://.kiro/skills/<skill-name>.md",
    "file://<path-to-context-file>"
  ],
  "allowedTools": [
    "read", "write", "grep", "glob",
    "@mcp-name/*"
  ]
}
```

### For Claude Code (`.claude/agents/<name>.md`)

```markdown
---
name: <agent-name>
description: <what + when — dispatch routing>
tools: Read, Grep, Glob, Write, Bash
model: sonnet
skills:
  - <skill-name-1>
  - <skill-name-2>
---

# <Agent Name>

[System prompt / instructions for the agent]
```

### For Agent SDK (Python)

```python
AgentDefinition(
    description="<what + when — dispatch routing>",
    prompt=load_prompt("<agent-name>.md"),
    tools=["Read", "Grep", "Glob", "Write"],
)
```

## Multi-agent coordination patterns

### Pattern 1: Solo + Skills (most common)

```
User → Agent (with skills A, B, C)
         └── Skills activate on-demand via description matching
```

Best for: single-domain work with multiple workflows.

### Pattern 2: Orchestrator + Subagents

```
User → Orchestrator (thin, dispatches only)
         ├── Subagent A (specialist + scoped tools)
         ├── Subagent B (specialist + scoped tools)
         └── Subagent C (specialist + scoped tools)
```

Best for: cross-domain work, parallel research, review loops.

### Pattern 3: Pipeline (sequential)

```
User → Agent A (produces artifact)
         → Agent B (validates/refines artifact)
             → Agent C (publishes/deploys)
```

Best for: CI/CD-like flows, generate → review → publish.

### Pattern 4: Review loop

```
User → Implementer (produces work)
         → Reviewer (evaluates)
             ├── PASS → deliver
             └── NEEDS_CHANGES → back to Implementer (with feedback)
```

Best for: code review, quality gates, iterative refinement.

## Edge cases and failure modes

| Situation                                       | Action                                                  |
|-------------------------------------------------|---------------------------------------------------------|
| Agent needs all tools                           | Red flag — split into subagents with scoped permissions  |
| Agent does 5 unrelated things                   | Split into orchestrator + specialists                   |
| Subagent description too vague                  | Parent won't dispatch correctly — make it specific      |
| Agent has skills but no `Skill` in allowed_tools (SDK) | Won't load skills — add `Skill` to tools     |
| Agent needs MCP but `setting_sources` missing (SDK) | Won't find skills — add `["user","project"]`       |
| Two subagents with similar descriptions         | Dispatch ambiguity — differentiate descriptions         |
| Subagent expects inherited skills               | Will fail — explicitly assign every skill it needs      |

## Anti-patterns to flag

- ❌ God-agent with every tool and permission (split it)
- ❌ Subagent with more tools than parent (invert the relationship)
- ❌ "General purpose" description → dispatch ambiguity
- ❌ Expecting skill inheritance in subagents (never happens)
- ❌ Putting workflow instructions in description (belongs in prompt/skills)
- ❌ Agent without any skills doing complex repeated workflows (make skills)
- ❌ MCP wildcard granting access to servers the agent doesn't need
- ❌ No `description` on a subagent → parent can't know when to invoke it

## Agent quality checklist

Before delivering any agent definition:

- [ ] Single responsibility — agent owns one clear domain
- [ ] Description is specific enough for correct dispatch routing
- [ ] Tools follow least-privilege (only what's needed, justified)
- [ ] Skills explicitly assigned (not relying on inheritance)
- [ ] Scripts documented with dependencies and execution instructions
- [ ] Hooks are fast (timeout set) and used for side-effects only
- [ ] If subagent: has FEWER permissions than parent
- [ ] If orchestrator: is thin (dispatches, doesn't do heavy work itself)
- [ ] MCP access scoped to only needed servers
- [ ] Platform-correct format (Kiro JSON / Claude Code MD / SDK Python)
- [ ] Would pass a "what could go wrong?" review (no dangerous defaults)

## References (load on demand)

- Read `references/agent-patterns.md` for detailed multi-agent coordination patterns,
  real-world examples across platforms, and decision trees for choosing agent architecture.
