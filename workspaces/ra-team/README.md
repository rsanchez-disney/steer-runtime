# RA — Reference Architecture

Parent workspace for all Reference Architecture sub-teams. Provides shared profiles, rules, and team context.

## Sub-Teams

| Workspace | Description | Extends |
|-----------|-------------|---------|
| [phoenix](phoenix/) | Phoenix sub-team | ra-team |

## Quick Start

```bash
# Apply a sub-team workspace (inherits this parent automatically)
koda workspace apply phoenix
koda mcp-install
```

## What's Inherited

All child workspaces get:
- **Profiles**: dev-core, dev-python, ops, dev-web
- **Rules**: conventional_commit, general-angular-development, general-api-design, general-aws, general-docker, general-java-development, general-kubernetes, general-node-development, general-python-development, general-terraform
- **Workspace path**: ~/workspace/reference-architecture

See [Team Workspaces Guide](../../docs/reference/TEAM_WORKSPACES.md) for details on hierarchy and inheritance.
