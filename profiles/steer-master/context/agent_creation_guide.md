# Agent Creation Guide

## Where to Create Agents

| Scope | Location | When to Use |
|-------|----------|-------------|
| **Global profile** | `profiles/{profile}/agents/` | Agent useful to all teams |
| **Workspace (new)** | `workspaces/{ws}/profiles/{profile}/agents/` | Team-specific agent |
| **Workspace (merge)** | `workspaces/{ws}/profiles/{profile}/agents/` | Extend a global agent for a team |

## Creating a New Global Agent

### Required Files

```
profiles/{profile}/
├── agents/{agent_name}.json     # Agent config (required fields below)
├── prompts/{agent_name}.md      # Agent prompt
└── context/{context_file}.md    # Context files referenced in resources
```

### Agent JSON Template

```json
{
  "name": "{agent_name}",
  "description": "One-line description of what this agent does",
  "prompt": "prompts/{agent_name}.md",
  "tools": [
    "fs_read",
    "fs_write",
    "execute_bash"
  ],
  "resources": [
    "context/{relevant_context}.md"
  ],
  "hooks": {
    "preToolUse": [
      {
        "matcher": "fs_write",
        "command": "$HOME/.kiro/hooks/guard-writes.sh",
        "description": "Block writes to protected dirs"
      },
      {
        "matcher": "fs_write",
        "command": "$HOME/.kiro/hooks/secret-scan.sh",
        "description": "Scan for secrets before writing"
      }
    ]
  },
  "welcomeMessage": "Ready to help with {purpose}."
}
```

### Prompt Template

```markdown
# {Agent Name}

## Identity

- **Name:** {Agent Name}
- **Profile:** {profile}
- **Role:** {one-line role description}

## Rules

- {Rule 1}
- {Rule 2}

## Capabilities

- {Capability 1}
- {Capability 2}

## Workflow

1. {Step 1}
2. {Step 2}

## Output Format

{Expected output structure}
```

### Checklist

- [ ] `name` matches filename (e.g., `my_agent.json` → `"name": "my_agent"`)
- [ ] `prompt` path exists
- [ ] All `resources` paths exist
- [ ] Hook scripts exist at `$HOME/.kiro/hooks/`
- [ ] Agent added to profile orchestrator's routing table (if applicable)
- [ ] AGENTS.md updated (if global agent)

## Creating a Workspace Agent (New)

Same structure but under the workspace:

```
workspaces/{ws}/
├── profiles/{profile}/
│   ├── agents/{agent_name}.json
│   └── prompts/{agent_name}.md
└── context/{team_context}.md
```

The agent is only installed when `koda workspace apply {ws}` is run.

## Extending a Global Agent (Workspace Merge)

Create a workspace agent JSON with **only the fields you want to add**. Koda merges it with the global agent.

### Merge Rules

| Field Type | Behavior |
|-----------|----------|
| `tools`, `allowedTools`, `resources` | Append unique (workspace adds to global) |
| `prompt`, `description`, `welcomeMessage` | Workspace wins if non-empty |
| `hooks`, `toolsSettings` | Deep merge (workspace keys added) |

### Example: Add Jira tools to orchestrator

```
workspaces/app-team/profiles/dev-core/agents/orchestrator.json
```

```json
{
  "name": "orchestrator",
  "tools": ["@jira/*"],
  "allowedTools": ["@jira/*"],
  "resources": [
    "file://.kiro/context/agile_practices.md",
    "file://.kiro/context/team_context.md"
  ]
}
```

Result: global orchestrator + `@jira/*` tools + team context. All global tools, hooks, and resources preserved.

### Example: Add team hooks

```json
{
  "name": "orchestrator",
  "hooks": {
    "agentSpawn": [
      {
        "command": "$HOME/.kiro/hooks/team-context.sh",
        "description": "Inject team-specific context"
      }
    ]
  }
}
```

Result: global hooks preserved + team hook added.

## Adding MCP Tools to an Agent

If the agent needs MCP server access:

1. Add `"includeMcpJson": true` to the agent JSON
2. Add the MCP tool pattern to `tools` and `allowedTools`:

```json
{
  "tools": ["@jira/*", "@confluence/*"],
  "allowedTools": ["@jira/*", "@confluence/*"],
  "includeMcpJson": true
}
```

Available MCP patterns: `@jira/*`, `@confluence/*`, `@confluence-cloud/*`, `@github/*`, `@compass/*`, `@qtest/*`, `@figma/*`

## Registering with an Orchestrator

If the new agent should be delegated to by a profile orchestrator, update the orchestrator's prompt:

1. Add to the routing table in the orchestrator prompt
2. The `agent-registry.sh` hook auto-discovers agents at session start, so the orchestrator will see it automatically
3. But explicit routing in the prompt helps the orchestrator make better decisions
