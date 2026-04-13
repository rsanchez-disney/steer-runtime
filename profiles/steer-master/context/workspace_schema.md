# Workspace JSON Schema

## Required Fields
| Field | Type | Description |
|---|---|---|
| `name` | string | Unique workspace identifier |
| `description` | string | Human-readable description |
| `team` | string | Team name |
| `profiles` | string[] | Profile IDs to install (e.g., `["dev-core", "dev-web"]`) |
| `default_agent` | string | Agent to use by default in chat |

## Optional Fields
| Field | Type | Description |
|---|---|---|
| `extends` | string | Parent workspace name for inheritance |
| `projects` | object[] | Repository entries (`name`, `path`, `repo`, `memory_bank`) |
| `rules` | string[] | Rule file names from `common/rules/` |
| `enable_tools` | boolean | Enable thinking, todo, knowledge tools |
| `jira_prefix` | string | Jira project prefix (e.g., `"DPAY-"`) |
| `services` | string[] | Service bank names from `shared/services/` |
| `channels` | string[] | Channel bank names from `channels/` |
| `workspace_path` | string | Base path for project resolution |

## Valid Profile IDs
`dev-core`, `dev-web`, `dev-mobile`, `dev-python`, `dev-infra`, `ba`, `qa`, `ops`, `pm`, `steer-master`

Alias: `dev` expands to `dev-core` + `dev-web` + `dev-mobile` + `dev-python` + `dev-infra`

## Breaking Changes
- Removing a required field
- Renaming a field (old configs stop working)
- Changing field type
- Removing a valid profile ID
