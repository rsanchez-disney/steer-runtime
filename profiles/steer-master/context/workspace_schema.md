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
| `jira_prefix` | string \| string[] | Jira project prefix(es). Single string (e.g., `"DPAY-"`) or array for multi-prefix teams (e.g., `["AEXP-", "IEXP-", "COREEXP-"]`) |
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

## Recommended Context Files

When creating a new workspace, include these context files under `context/` for agent enrichment:

| File | Purpose | Used by |
|---|---|---|
| `team_context.md` | Team name, members, Jira project, board IDs | All agents |
| `splunk_services.md` | Team's Splunk service catalog (index, cluster, task definitions) | `splunk_query_agent` |
| `jira_query_context.md` | Team's Jira custom fields, pod IDs, JQL patterns | `story_analyzer_agent` |
| `service_repo_mapping.md` | Service → GitHub repo → language → deploy target | `codebase_explorer_agent` |

The `splunk_services.md` should follow this format per service:
```
| Service Name | Index | Task Definition | ECS Cluster | Pattern |
|---|---|---|---|---|
| My Service | wdpr-ecommerce | my-svc | my-cluster-S001 | ECS |
```
