# Team Workspaces

Each subdirectory is a team workspace — a self-contained configuration bundle.

## Structure

```
workspaces/
├── default/                    # Org-wide baseline (all projects & profiles)
│   ├── workspace.json
│   └── projects/               # Memory bank templates for known projects
│       ├── wdpr-config-services/
│       ├── cart-service-java8/
│       └── ...
├── payments-core/              # Team-specific workspace
│   ├── workspace.json
│   ├── context/
│   └── rules/
```

## Commands

```bash
./setup.sh workspace list                    # See available workspaces
./setup.sh workspace show default            # View org-wide baseline
./setup.sh workspace show payments-core      # View team workspace
./setup.sh workspace apply payments-core     # Apply team config
./setup.sh workspace create my-team          # Scaffold a new workspace
```

The `default` workspace contains all 9 project memory banks and all profiles. Team workspaces reference a subset.

See [Team Workspaces Guide](../docs/TEAM_WORKSPACES.md) for full documentation.
