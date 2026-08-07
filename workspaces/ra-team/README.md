# RA — Reference Architecture

Parent workspace for all Reference Architecture sub-teams. Provides shared profiles, rules, and team context.

## Sub-Teams

| Workspace | Team | Description | Jira |
|-----------|------|-------------|------|
| [stark](stark/) | Studio Stark | Angular RA-Blocks, UI-agnostic libraries, and Yeoman generators | `GEW-` |
| [app-phoenix](app-phoenix/) | App Phoenix | Application development sub-team | — |
| [dxcp](dxcp/) | DXCP Cloud PaaS | Kubernetes platform engineering and cluster lifecycle management | `IOET-` |

## Quick Start

```bash
# Apply a sub-team workspace (inherits this parent automatically)
koda workspace apply stark
koda workspace apply app-phoenix
koda workspace apply dxcp

koda mcp-install
```

## What's Inherited

All child workspaces get:

- **Profiles**: `dev-core`, `dev-python`, `ops`, `dev-web`
- **Rules**: `conventional_commit`, `general-angular-development`, `general-api-design`, `general-aws`, `general-docker`, `general-java-development`, `general-kubernetes`, `general-node-development`, `general-python-development`, `general-terraform`
- **Default agent**: `orchestrator`
- **Workspace path**: `~/workspace/reference-architecture`

## Inheritance Tree

```
ra-team  (dev-core · dev-python · ops · dev-web · 10 rules)
├── stark            (dev-core · dev-ui · dev-web · GEW- Jira)
│   ├── ra-angular-blocks   (14 Angular RA-Block repos)
│   ├── ra-ui-blocks        (11 UI-agnostic RA-Block repos)
│   └── ra-generators       (4 Yeoman/Schematic generator repos)
├── app-phoenix      (dev-core)
└── dxcp             (+cloudops · +dev-infra · +ops · 15 repos · IOET- Jira)
    ├── dxcp-k8s-platform
    ├── dxcp-dev-tools
    └── dxcp-cluster-deployer
```

See [Team Workspaces Guide](../../docs/reference/TEAM_WORKSPACES.md) for details on hierarchy and inheritance.
