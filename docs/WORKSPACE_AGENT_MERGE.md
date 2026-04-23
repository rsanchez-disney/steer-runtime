# Workspace Agent Merge

When a workspace provides an agent with the same name as a global profile agent, Koda **merges** them instead of replacing. The result is a single agent file that combines the global base with workspace-specific additions.

## How It Works

```
Global profile agent (base)
    +
Workspace agent (additions/overrides)
    =
Merged agent (installed to ~/.kiro/agents/)
```

### Merge Rules

| Field Type | Fields | Behavior |
|-----------|--------|----------|
| **Arrays** | `tools`, `allowedTools`, `resources` | Append unique — workspace items added to global list |
| **Scalars** | `prompt`, `description`, `welcomeMessage` | Workspace wins if non-empty |
| **Objects** | `hooks`, `toolsSettings`, `mcpServers` | Deep merge — workspace keys override, global keys preserved |

### New agents

If the workspace agent name doesn't exist in the global profile, it's installed as a new agent (no merge needed).

## Example

### Global `profiles/dev-core/agents/orchestrator.json`

```json
{
  "name": "orchestrator",
  "description": "SDLC orchestrator with automatic multi-agent delegation",
  "prompt": "orchestrator.md",
  "tools": ["use_subagent", "execute_bash", "grep", "code", "fs_read", "thinking", "todo", "delegate"],
  "resources": ["file://AGENTS.md", "file://.kiro/context/golden_rules.md"],
  "hooks": {
    "agentSpawn": [
      { "command": "$HOME/.kiro/hooks/git-context.sh" },
      { "command": "$HOME/.kiro/hooks/agent-registry.sh" }
    ]
  }
}
```

### Workspace `workspaces/app-team/profiles/dev-core/agents/orchestrator.json`

```json
{
  "name": "orchestrator",
  "tools": ["@jira/*"],
  "resources": [
    "file://.kiro/context/agile_practices.md",
    "file://.kiro/context/team_context.md"
  ]
}
```

### Merged Result (installed to `~/.kiro/agents/orchestrator.json`)

```json
{
  "name": "orchestrator",
  "description": "SDLC orchestrator with automatic multi-agent delegation",
  "prompt": "orchestrator.md",
  "tools": ["use_subagent", "execute_bash", "grep", "code", "fs_read", "thinking", "todo", "delegate", "@jira/*"],
  "resources": [
    "file://AGENTS.md",
    "file://.kiro/context/golden_rules.md",
    "file://.kiro/context/agile_practices.md",
    "file://.kiro/context/team_context.md"
  ],
  "hooks": {
    "agentSpawn": [
      { "command": "$HOME/.kiro/hooks/git-context.sh" },
      { "command": "$HOME/.kiro/hooks/agent-registry.sh" }
    ]
  }
}
```

The orchestrator keeps all its global tools, resources, and hooks — but gains `@jira/*` tools and team-specific context from the workspace.

## Directory Structure

```
workspaces/app-team/
├── profiles/
│   └── dev-core/                    # Overrides for dev-core profile
│       ├── agents/
│       │   ├── orchestrator.json    # Merged with global orchestrator
│       │   └── scrum_master.json    # New agent (no global equivalent)
│       └── prompts/
│           └── scrum_master.md      # Prompt for new agent
├── context/
│   ├── agile_practices.md           # Team-specific context
│   └── team_context.md
└── workspace.json
```

## When to Use

| Scenario | Approach |
|----------|----------|
| Add tools/resources to an existing agent | Workspace agent with same name, only the fields you want to add |
| Override an agent's prompt entirely | Workspace agent with `"prompt": "new_prompt.md"` |
| Add a new team-specific agent | Workspace agent with a unique name |
| Add team context to all agents | Add files to `workspaces/{ws}/context/` (copied to `~/.kiro/context/`) |

## Prompts

Prompts are **not merged** — they're files, not JSON. If the workspace provides a prompt with the same filename, it replaces the global one. If you want to extend a prompt, use a different filename and reference it in the workspace agent's `"prompt"` field.

## Install Order

1. `InstallShared` — hooks, shared context, MCP bundles
2. `InstallProfile` — global profile agents (base)
3. `InstallProfileFrom` — workspace profile agents (merged on top)
4. Context/rules from workspace chain copied
5. Tokens injected, mcp.json regenerated
