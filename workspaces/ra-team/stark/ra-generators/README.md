# ra-generators

> Extends [stark](../) → [ra-team](../../) — inherits dev-core, dev-ui, dev-web, shared rules and context.

Yeoman generators and Angular schematics that scaffold new WDPR applications and Node.js WebAPIs pre-wired with RA-Blocks, authentication, and platform conventions.

- **Team**: Studio Stark
- **Jira project**: `GEW-` (github.disney.com)
- **Profiles**: `dev-core`, `dev-ui`, `dev-web`
- **Org**: `WDPR-RA` on github.disney.com

## Repositories

| Package | Repo | Type | Description |
|---------|------|------|-------------|
| `@wdpr/schematics-angular-spa` | [wdpr-schematics-angular-spa](https://github.disney.com/WDPR-RA/wdpr-schematics-angular-spa) | Angular Schematics | Angular SPA schematic — scaffolds a new Angular app with RA-Blocks pre-configured |
| `@wdpr/ra-ui-generator` | [wdpr-ra-wdpr-ra-ui-generator](https://github.disney.com/WDPR-RA/wdpr-ra-wdpr-ra-ui-generator) | Yeoman | UI generator — framework-agnostic front-end scaffolding with ra-ui-blocks |
| `@wdpr/ra-node-webapi-generator` | [wdpr-ra-node-webapi-generator](https://github.disney.com/WDPR-RA/wdpr-ra-node-webapi-generator) | Yeoman | Node.js/Express WebAPI generator (Restify-based RA WebAPI) |
| `@wdpr/ra-nest-webapi-generator` | [wdpr-ra-nest-webapi-generator](https://github.disney.com/WDPR-RA/wdpr-ra-nest-webapi-generator) | Yeoman | NestJS WebAPI generator — next-gen RA WebAPI scaffold |

## Setup

```bash
koda workspace apply ra-generators
koda mcp-install
```

## Workspace Path

```
${WORKSPACE_ROOT}/reference-architecture/stark
```

## Inheritance

```
ra-team  (dev-core · dev-python · ops · dev-web · 10 rules)
└── stark  (dev-core · dev-ui · dev-web · GEW- Jira)
    └── ra-generators  (4 repos)
```

## Related

- [ra-angular-blocks](../ra-angular-blocks/) — Angular RA-Blocks wired by the Angular SPA schematic
- [ra-ui-blocks](../ra-ui-blocks/) — framework-agnostic blocks wired by the UI generator
