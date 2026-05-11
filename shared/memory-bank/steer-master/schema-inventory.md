# Schema Inventory

Current field inventory for all JSON schemas used in steer-runtime and Koda.
Last updated: 2026-05-09

## Agent JSON Schema (v1.1)

Formal schema: `common/schemas/agent.schema.json`

### Required fields

| Field         | Type                      | Since | Notes                                  |
|---------------|---------------------------|-------|----------------------------------------|
| `name`        | string                    | v1    | Must match filename                    |
| `description` | string                    | v1    | One-line purpose                       |
| `prompt`      | string                    | v1    | Path to prompt .md                     |
| `tools`       | string[]                  | v1    | Tool identifiers                       |
| `resources`   | (string \| ResourceEntry)[] | v1.1  | Context file paths — string or object  |

### Optional fields

| Field           | Type                    | Since | Notes                                          |
|-----------------|-------------------------|-------|------------------------------------------------|
| `hooks`         | object                  | v1    | 6 events: agentSpawn, preToolUse, postToolUse, agentComplete, agentFailed, agentTimeout |
| `allowedTools`  | string[]                | v1    | MCP tool patterns                              |
| `includeMcpJson`| boolean                 | v1    | Load MCP server config                         |
| `toolsSettings` | object                  | v1    | Tool-specific config                           |
| `welcomeMessage`| string                  | v1    | Session start message                          |
| `mcpServers`    | object                  | v1    | Inline MCP server definitions                  |
| `contextBudget` | object                  | v1.1  | Token budget per category (sum ≤1.0)           |
| `phases`        | object                  | v1.1  | Tool restrictions per execution phase          |

### ResourceEntry object format (v1.1)

| Field      | Type   | Required | Default    | Description                                              |
|------------|--------|:--------:|------------|----------------------------------------------------------|
| `path`     | string |    ✅    |            | file:// URI with optional glob                           |
| `when`     | string |    ❌    | `"always"` | Condition: `always`, `task_contains:<pat>`, `agent_is:<glob>`, `profile_is:<name>` |
| `priority` | string |    ❌    | `"normal"` | Compaction priority: `critical`, `high`, `normal`, `low` |

### Field frequency (124 agents)

- name, description, prompt, tools, resources: 124/124 (100%)
- allowedTools, includeMcpJson: 89/124 (72%)
- hooks: 30/124 (24%)
- mcpServers: 15/124 (12%)
- toolsSettings: 12/124 (10%)
- welcomeMessage: 8/124 (6%)
- contextBudget: 0/124 (0%) — new field
- phases: 0/124 (0%) — new field

## Workspace JSON Schema (v1 + EMB)

### Required fields

| Field           | Type     | Since | Notes              |
|-----------------|----------|-------|--------------------|
| `name`          | string   | v1    | Unique identifier  |
| `description`   | string   | v1    | Human-readable     |
| `team`          | string   | v1    | Team name          |
| `profiles`      | string[] | v1    | Profile IDs        |
| `default_agent` | string   | v1    | Default chat agent |

### Optional fields

| Field            | Type              | Since | Notes                    |
|------------------|-------------------|-------|--------------------------|
| `extends`        | string            | v1    | Parent workspace         |
| `projects`       | object[]          | v1    | Repo entries             |
| `rules`          | string[]          | v1    | Rule file names          |
| `enable_tools`   | boolean           | v1    | Advanced tools           |
| `jira_prefix`    | string \| string[] | v1.1  | Jira project prefix(es)  |
| `workspace_path` | string            | v1    | Base path                |
| `services`       | string[]          | EMB   | Service bank names       |
| `channels`       | string[]          | EMB   | Channel bank names       |

## Hook event types

| Event          | Since | Trigger                  |
|----------------|-------|--------------------------|
| `agentSpawn`   | v1    | Session start            |
| `preToolUse`   | v1    | Before tool invocation   |
| `postToolUse`  | v1    | After tool completion    |
| `agentComplete`| v1.1  | Session ends successfully|
| `agentFailed`  | v1.1  | Session ends with error  |
| `agentTimeout` | v1.1  | Session exceeds timeout  |

## Valid profile IDs

dev-core, dev-web, dev-mobile, dev-python, dev-infra, dev-ai, dev-dotnet, dev-ui, ba, qa, ops, pm, leadership, steer-master, inspector, sustainment, cloudops, design, presales, core

Alias: dev → dev-core + dev-web + dev-mobile + dev-python + dev-infra
