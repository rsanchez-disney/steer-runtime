# Team Workspaces

Each subdirectory is a team workspace — a self-contained configuration bundle that new team members can apply with a single command.

```bash
./setup.sh workspace list                    # See available workspaces
./setup.sh workspace show payments-core      # View workspace details
./setup.sh workspace apply payments-core     # Apply team config
./setup.sh workspace create my-team          # Scaffold a new workspace
```

See [Team Workspaces Guide](../docs/TEAM_WORKSPACES.md) for full documentation.
