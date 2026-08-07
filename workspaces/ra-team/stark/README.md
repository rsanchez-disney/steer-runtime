# Stark

> Extends [ra-team](../) — inherits dev-core, dev-python, ops, dev-web, shared rules and context.

Studio Stark owns the WDPR Reference Architecture UI libraries and Yeoman generators. The team publishes Angular-specific (`@wdpr/ra-angular-*`) and framework-agnostic (`@wdpr/ra-ui-*`) RA-Blocks, plus the scaffolding tools that bootstrap new WDPR applications.

- **Team**: Studio Stark
- **Jira project**: `GEW-` (github.disney.com)
- **Profiles**: `dev-core`, `dev-ui`, `dev-web`

## Sub-Workspaces

| Workspace | Command | Repos | Focus |
|-----------|---------|-------|-------|
| [ra-angular-blocks](ra-angular-blocks/) | `koda workspace apply ra-angular-blocks` | 14 | Angular-specific RA-Block libraries (`@wdpr/ra-angular-*`) |
| [ra-ui-blocks](ra-ui-blocks/) | `koda workspace apply ra-ui-blocks` | 11 | Framework-agnostic RA-Block libraries (`@wdpr/ra-ui-*`) |
| [ra-generators](ra-generators/) | `koda workspace apply ra-generators` | 4 | Yeoman generators and Angular schematics |

## Setup

```bash
# Apply the parent stark workspace (general Stark work)
koda workspace apply stark
koda mcp-install

# Or apply a focused sub-workspace directly
koda workspace apply ra-angular-blocks
koda workspace apply ra-ui-blocks
koda workspace apply ra-generators
```

## Inheritance

```
ra-team  (dev-core · dev-python · ops · dev-web · 10 rules)
└── stark  (dev-core · dev-ui · dev-web · GEW- Jira)
    ├── ra-angular-blocks   (14 repos)
    ├── ra-ui-blocks        (11 repos)
    └── ra-generators       (4 repos)
```

## Workspace Path

```
${WORKSPACE_ROOT}/reference-architecture/stark
```
