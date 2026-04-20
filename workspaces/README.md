# Team Workspaces

Each subdirectory is a team workspace. Child workspaces are nested inside their parent folder.

## Structure

```
workspaces/
├── app-team/                       # Parent workspace
│   ├── workspace.json
│   ├── context/
│   ├── config-studio/              # Child (extends app-team)
│   │   ├── workspace.json
│   │   └── context/
│   ├── payment-sheet/              # Child
│   ├── pap-trp/                    # Child
│   ├── gift-card/                  # Child
│   └── infra/                      # Child
├── payments-core/                  # Standalone workspace
│   └── workspace.json
└── default/                        # Org-wide baseline
    └── workspace.json
```

## Quick Commands

```bash
koda workspace list                    # Shows hierarchy
koda workspace apply app-config-studio # Resolves inheritance
koda workspace show payments-core      # View details
```

See [Team Workspaces Guide](../docs/reference/TEAM_WORKSPACES.md) for full documentation.
