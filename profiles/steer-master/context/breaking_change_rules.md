# Breaking Change Rules

## What Constitutes a Breaking Change

### steer-runtime
| Change | Breaking? | Why |
|---|---|---|
| Remove a required field from agent JSON | YES | Existing agents fail to load |
| Rename an agent JSON file | YES | Koda agent references break |
| Remove a context file referenced in `resources` | YES | Agent loads fail |
| Remove a hook script referenced in agent JSON | YES | Hook execution fails |
| Rename a profile directory | YES | `koda install` breaks |
| Remove a prompt section that orchestrators depend on | YES | Workflow breaks |
| Add a new optional field to agent JSON | NO | Backward compatible |
| Add a new context file | NO | No existing references break |
| Add a new profile | NO | Existing installs unaffected |
| Add a new hook | NO | Only affects agents that reference it |
| Modify prompt wording (same sections) | NO | Behavioral change, not structural |

### Koda
| Change | Breaking? | Why |
|---|---|---|
| Remove a field from `Workspace` model | YES | Existing workspace.json files break |
| Rename a JSON tag in model | YES | Deserialization fails |
| Remove a CLI command | YES | Scripts and docs break |
| Change CLI flag name | YES | Existing usage breaks |
| Add a new `omitempty` field to model | NO | Old configs still parse |
| Add a new CLI command | NO | Existing usage unaffected |
| Add a new TUI screen | NO | Existing flows unaffected |

## Review Checklist
When reviewing a PR, check:
1. Are any agent JSON files renamed or deleted?
2. Are any required fields removed from agent JSON?
3. Are any context files removed that are referenced in `resources`?
4. Are any hook scripts removed that are referenced in agent JSON?
5. Are any Koda model fields removed or renamed?
6. Are any CLI commands or flags removed or renamed?
