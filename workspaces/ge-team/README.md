# GE — Guest Experience

Parent workspace for all Guest Experience sub-teams. Provides shared profiles, rules, and team context.

## Sub-Teams

| Workspace | Description | Extends |
|-----------|-------------|---------|
| [trips](trips/) | Trips sub-team | ge-team |

## Quick Start

```bash
# Apply a sub-team workspace (inherits this parent automatically)
koda workspace apply trips
koda mcp-install
```

## What's Inherited

All child workspaces get:
- **Profiles**: dev-core, dev-infra, dev-python, ops, dev-web
- **Rules**: conventional_commit, general-angular-development, general-api-design, general-aws, general-docker, general-kubernetes, general-node-development, general-python-development, general-terraform
- **Workspace path**: ~/workspace/guest-experience

See [Team Workspaces Guide](../../docs/TEAM_WORKSPACES.md) for details on hierarchy and inheritance.
