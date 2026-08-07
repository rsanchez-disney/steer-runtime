# ra-ui-blocks

> Extends [stark](../) → [ra-team](../../) — inherits dev-core, dev-ui, dev-web, shared rules and context.

Framework-agnostic Reference Architecture libraries (`@wdpr/ra-ui-*`). These blocks implement core cross-cutting concerns with no Angular dependency, making them consumable from any WDPR UI framework (Angular, React, Astro, etc.).

- **Team**: Studio Stark
- **Jira project**: `GEW-` (github.disney.com)
- **Profiles**: `dev-core`, `dev-ui`, `dev-web`
- **Org**: `WDPR-RA` on github.disney.com (except native-bridge → `wdpr-ra-mobile`)

## Repositories

| Package | Repo | Description |
|---------|------|-------------|
| `@wdpr/ra-ui-http-client` | [wdpr-ra-ui-http-client](https://github.disney.com/WDPR-RA/wdpr-ra-ui-http-client) | Framework-agnostic HTTP client with RA conventions |
| `@wdpr/ra-ui-error-handler` | [wdpr-ra-ui-error-handler](https://github.disney.com/WDPR-RA/wdpr-ra-ui-error-handler) | Shared error handling and reporting |
| `@wdpr/ra-ui-correlation` | [wdpr-ra-ui-correlation](https://github.disney.com/WDPR-RA/wdpr-ra-ui-correlation) | Correlation ID generation and propagation |
| `@wdpr/ra-ui-client-encryption` | [wdpr-ra-ui-client-encryption](https://github.disney.com/WDPR-RA/wdpr-ra-ui-client-encryption) | Client-side field encryption (framework-agnostic) |
| `@wdpr/ra-ui-logger` | [wdpr-ra-ui-logger](https://github.disney.com/WDPR-RA/wdpr-ra-ui-logger) | Structured logging (framework-agnostic) |
| `@wdpr/ra-ui-myid-login` | [wdpr-ra-ui-myid-login](https://github.disney.com/WDPR-RA/wdpr-ra-ui-myid-login) | MyID/OneID authentication (framework-agnostic) |
| `@wdpr/ra-ui-page-key` | [wdpr-ra-ui-page-key](https://github.disney.com/WDPR-RA/wdpr-ra-ui-page-key) | Page key management (framework-agnostic) |
| `@wdpr/ra-ui-geolocation` | [wdpr-ra-ui-geolocation](https://github.disney.com/WDPR-RA/wdpr-ra-ui-geolocation) | Geolocation (framework-agnostic) |
| `@wdpr/ra-ui-device-detection` | [wdpr-ra-ui-device-detection](https://github.disney.com/WDPR-RA/wdpr-ra-ui-device-detection) | Device/platform detection (framework-agnostic) |
| `@wdpr/ra-ui-native-bridge` | [wdpr-ra-ui-native-bridge](https://github.disney.com/wdpr-ra-mobile/wdpr-ra-ui-native-bridge) | Native mobile bridge (framework-agnostic) |
| `@wdpr/ra-ui-inject-oneid-auth-token` | [wdpr-ra-ui-inject-oneid-auth-token](https://github.disney.com/WDPR-RA/wdpr-ra-ui-inject-oneid-auth-token) | OneID auth token injection (framework-agnostic) |

## Setup

```bash
koda workspace apply ra-ui-blocks
koda mcp-install
```

## Workspace Path

```
${WORKSPACE_ROOT}/reference-architecture/stark/ra-ui-blocks
```

## Inheritance

```
ra-team  (dev-core · dev-python · ops · dev-web · 10 rules)
└── stark  (dev-core · dev-ui · dev-web · GEW- Jira)
    └── ra-ui-blocks  (11 repos)
```

## Angular counterparts

Most `ra-ui-*` blocks have a corresponding `ra-angular-*` wrapper that wraps them in Angular DI. If you are working on both simultaneously, use the [stark](../) parent workspace to have all repos in context at once.

| ra-ui-* (this workspace) | ra-angular-* counterpart |
|--------------------------|--------------------------|
| `ra-ui-logger` | `ra-angular-logger` |
| `ra-ui-correlation` | `ra-angular-correlation` |
| `ra-ui-client-encryption` | `ra-angular-client-encryption` |
| `ra-ui-error-handler` | `ra-angular-error-handler` |
| `ra-ui-myid-login` | `ra-angular-myid-login` |
| `ra-ui-page-key` | `ra-angular-page-key` |
| `ra-ui-geolocation` | `ra-angular-geolocation` |
| `ra-ui-device-detection` | `ra-angular-device-detection` |
| `ra-ui-native-bridge` | `ra-angular-native-bridge` |
| `ra-ui-inject-oneid-auth-token` | `ra-angular-inject-oneid-auth-token` |

## Related

- [ra-angular-blocks](../ra-angular-blocks/) — Angular wrappers around these blocks
- [ra-generators](../ra-generators/) — scaffolding tools that wire these blocks into new apps
