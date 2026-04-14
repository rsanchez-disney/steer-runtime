# Schema Inventory

Current field inventory for all JSON schemas used in steer-runtime and Koda.
Last updated: 2026-04-10

## Agent JSON Schema (v1)

### Required Fields
| Field | Type | Since | Notes |
|---|---|---|---|
| `name` | string | v1 | Must match filename |
| `description` | string | v1 | One-line purpose |
| `prompt` | string | v1 | Path to prompt .md |
| `tools` | string[] | v1 | Tool identifiers |
| `resources` | string[] | v1 | Context file paths |

### Optional Fields
| Field | Type | Since | Notes |
|---|---|---|---|
| `hooks` | object | v1 | agentSpawn, preToolUse, postToolUse |
| `allowedTools` | string[] | v1 | MCP tool patterns |
| `includeMcpJson` | boolean | v1 | Load MCP server config |
| `toolsSettings` | object | v1 | Tool-specific config |
| `welcomeMessage` | string | v1 | Session start message |

### Field Frequency (59 agents)
- name, description, prompt, tools, resources: 59/59 (100%)
- allowedTools, includeMcpJson: 42/59 (71%)
- hooks: 14/59 (24%)
- toolsSettings: 7/59 (12%)
- welcomeMessage: 6/59 (10%)

## Workspace JSON Schema (v1 + EMB)

### Required Fields
| Field | Type | Since | Notes |
|---|---|---|---|
| `name` | string | v1 | Unique identifier |
| `description` | string | v1 | Human-readable |
| `team` | string | v1 | Team name |
| `profiles` | string[] | v1 | Profile IDs |
| `default_agent` | string | v1 | Default chat agent |

### Optional Fields
| Field | Type | Since | Notes |
|---|---|---|---|
| `extends` | string | v1 | Parent workspace |
| `projects` | object[] | v1 | Repo entries |
| `rules` | string[] | v1 | Rule file names |
| `enable_tools` | boolean | v1 | Advanced tools |
| `jira_prefix` | string | v1 | Jira project prefix |
| `workspace_path` | string | v1 | Base path |
| `services` | string[] | EMB | Service bank names |
| `channels` | string[] | EMB | Channel bank names |

## Hook Event Types
| Event | Since | Trigger |
|---|---|---|
| `agentSpawn` | v1 | Session start |
| `preToolUse` | v1 | Before tool invocation |
| `postToolUse` | v1 | After tool completion |

## Valid Profile IDs
dev-core, dev-web, dev-mobile, dev-python, dev-infra, ba, qa, ops, pm, steer-master

Alias: dev → dev-core + dev-web + dev-mobile + dev-python + dev-infra
