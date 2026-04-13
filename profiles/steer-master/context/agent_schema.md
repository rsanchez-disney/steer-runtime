# Agent JSON Schema

## Required Fields
Every agent JSON file MUST contain:

| Field | Type | Description |
|---|---|---|
| `name` | string | Agent display name (e.g., `"story_analyzer_agent"`) |
| `description` | string | One-line purpose description |
| `prompt` | string | Path to prompt markdown file (e.g., `"prompts/story_analyzer_agent.md"`) |
| `tools` | array | Tool identifiers the agent can use |
| `resources` | array | Context file paths loaded into the agent |

## Optional Fields
| Field | Type | Description |
|---|---|---|
| `hooks` | object | Event hooks (`agentSpawn`, `preToolUse`, `postToolUse`) |
| `allowedTools` | array | MCP tool patterns (e.g., `"@jira/*"`, `"@github/*"`) |
| `includeMcpJson` | boolean | Whether to load MCP server config |
| `toolsSettings` | object | Tool-specific configuration |
| `welcomeMessage` | string | Message shown when agent starts |

## Hook Event Types
Valid keys inside `hooks`:
- `agentSpawn` — runs once when the agent session starts
- `preToolUse` — runs before a tool is invoked
- `postToolUse` — runs after a tool completes

Each hook entry must have:
- `command` — path to the hook script
- `description` — what the hook does

## Naming Rules
- Agent JSON filename must match the `name` field (e.g., `story_analyzer_agent.json` → `name: "story_analyzer_agent"`)
- Specialist agents use `_agent` suffix
- Orchestrators use `_orchestrator_agent` suffix or just `orchestrator`
- Prompt file must exist at the path specified in `prompt`
