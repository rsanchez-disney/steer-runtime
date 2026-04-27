# APP — Adaptive Payment Platform

Parent workspace for all APP sub-teams. Provides shared profiles (`dev-core`, `qa`), rules, and team context.

## Sub-Teams

| Workspace | Description | Profiles |
|-----------|-------------|----------|
| [app-config-studio](../app-config-studio/) | Client configuration management | + dev-web |
| [app-payment-sheet](../app-payment-sheet/) | Guest-facing payment UI | + dev-web |
| [app-pap-trp](../app-pap-trp/) | Batch processing & transaction research | + dev-web |
| [app-gift-card](../app-gift-card/) | Gift Card Platform | + dev-web |
| [app-infra](../app-infra/) | Shared libraries & infrastructure | + ops |

## Quick Start

```bash
# Apply a sub-team workspace (inherits this parent automatically)
koda workspace apply app-config-studio
koda mcp-install
```

## What's Inherited

All child workspaces get:
- **Profiles**: dev-core, qa
- **Rules**: conventional_commit, general-java-development, general-node-development, general-angular-development
- **Context**: Architecture overview, team standards, deployment process

See [Team Workspaces Guide](../../docs/reference/TEAM_WORKSPACES.md) for details on hierarchy and inheritance.
