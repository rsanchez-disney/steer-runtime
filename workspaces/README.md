# Team Workspaces

Each subdirectory is a team workspace — a self-contained configuration bundle. Workspaces support hierarchical inheritance via the `extends` field.

## Structure

```
workspaces/
├── opsheet-team/               # Parent workspace (shared foundation)
│   ├── workspace.json
│   ├── context/
│   └── rules/
├── opsheet-vas-team/           # Child workspace (extends opsheet-team)
│   ├── workspace.json
│   └── context/
├── payments-core/              # Standalone workspace
│   ├── workspace.json
│   ├── context/
│   └── rules/
└── default/                    # Org-wide baseline
    ├── workspace.json
    └── projects/               # Memory bank templates for known projects
```

## Quick Commands

```bash
# List workspaces (shows hierarchy)
koda workspace list

# Apply a workspace (resolves inheritance)
koda workspace apply payments-core

# Show workspace details
koda workspace show payments-core
```

Creating and editing workspaces is done through the Koda TUI (`koda` → `w`).

See [Team Workspaces Guide](../docs/TEAM_WORKSPACES.md) for full documentation.
