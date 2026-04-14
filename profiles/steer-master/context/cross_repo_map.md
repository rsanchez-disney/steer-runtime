# Cross-Repo Dependency Map

## steer-runtime → Koda Dependencies

Koda reads these steer-runtime structures:

| steer-runtime Path | Koda Code | What Koda Does |
|---|---|---|
| `profiles/*/agents/*.json` | `ops/profiles.go: InstallProfile` | Copies to `~/.kiro/agents/` |
| `profiles/*/prompts/*.md` | `ops/profiles.go: InstallProfile` | Copies to `~/.kiro/prompts/` |
| `profiles/*/context/*.md` | `ops/profiles.go: InstallProfile` | Copies to `~/.kiro/context/` |
| `shared/hooks/*.sh` | `ops/profiles.go: InstallShared` | Copies to `~/.kiro/hooks/` |
| `shared/context/*.md` | `ops/profiles.go: InstallShared` | Copies to `~/.kiro/context/` |
| `shared/tools/mcp-servers/*/dist/index.cjs` | `ops/profiles.go: InstallShared` | Copies to `~/.kiro/tools/` |
| `shared/services/*/` | `ops/profiles.go: InstallBanks` | Merges into `svc-*.md` |
| `channels/*/` | `ops/profiles.go: InstallBanks` | Merges into `ch-*.md` |
| `workspaces/*/workspace.json` | `ops/workspaces.go: ApplyWorkspace` | Reads and applies config |
| `common/rules/*.md` | `ops/workspaces.go: ApplyWorkspace` | Copies to `~/.kiro/rules/` |
| `common/memory-bank-templates/` | `ops/memory.go: InitMemory` | Seeds project memory banks |

## Koda → steer-runtime Dependencies

Koda model fields that map to workspace.json:

| Koda Model Field | workspace.json Key | Added In |
|---|---|---|
| `Workspace.Name` | `name` | v1 |
| `Workspace.Extends` | `extends` | v1 |
| `Workspace.Description` | `description` | v1 |
| `Workspace.Team` | `team` | v1 |
| `Workspace.Profiles` | `profiles` | v1 |
| `Workspace.DefaultAgent` | `default_agent` | v1 |
| `Workspace.Projects` | `projects` | v1 |
| `Workspace.Rules` | `rules` | v1 |
| `Workspace.EnableTools` | `enable_tools` | v1 |
| `Workspace.JiraPrefix` | `jira_prefix` | v1 |
| `Workspace.Services` | `services` | EMB |
| `Workspace.Channels` | `channels` | EMB |
| `Workspace.WorkspacePath` | `workspace_path` | v1 |

## Impact Rules
- Adding a new profile directory in steer-runtime → Koda auto-discovers it (no Koda change needed)
- Adding a new field to workspace.json → Koda model must add matching field with `omitempty`
- Renaming a profile directory → Koda `ExpandAliases` must be updated if it's aliased
- Adding a new hook script → No Koda change needed (agents reference hooks directly)
- Adding a new MCP server bundle → Koda `knownServers` registry should be updated
