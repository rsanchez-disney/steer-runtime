# ra-angular-blocks

> Extends [stark](../) → [ra-team](../../) — inherits dev-core, dev-ui, dev-web, shared rules and context.

Angular-specific Reference Architecture libraries (`@wdpr/ra-angular-*`). These blocks are Angular-aware and integrate directly with the Angular DI system, lifecycle hooks, and module/standalone APIs.

- **Team**: Studio Stark
- **Jira project**: `GEW-` (github.disney.com)
- **Profiles**: `dev-core`, `dev-ui`, `dev-web`
- **Org**: `WDPR-RA` on github.disney.com (except native-bridge → `wdpr-ra-mobile`)

## Repositories

| Package | Repo | Description |
|---------|------|-------------|
| `@wdpr/ra-angular-logger` | [wdpr-ra-angular-logger](https://github.disney.com/WDPR-RA/wdpr-ra-angular-logger) | Structured logging service for Angular apps |
| `@wdpr/ra-angular-geolocation` | [wdpr-ra-angular-geolocation](https://github.disney.com/WDPR-RA/wdpr-ra-angular-geolocation) | Geolocation integration block |
| `@wdpr/ra-angular-cdn` | [wdpr-ra-angular-cdn](https://github.disney.com/WDPR-RA/wdpr-ra-angular-cdn) | CDN asset resolution helpers |
| `@wdpr/ra-angular-client-encryption` | [wdpr-ra-angular-client-encryption](https://github.disney.com/WDPR-RA/wdpr-ra-angular-client-encryption) | Client-side field encryption |
| `@wdpr/ra-angular-correlation` | [wdpr-ra-angular-correlation](https://github.disney.com/WDPR-RA/wdpr-ra-angular-correlation) | Correlation ID propagation for HTTP |
| `@wdpr/ra-angular-device-detection` | [wdpr-ra-angular-device-detection](https://github.disney.com/WDPR-RA/wdpr-ra-angular-device-detection) | Device/platform detection service |
| `@wdpr/ra-angular-error-handler` | [wdpr-ra-angular-error-handler](https://github.disney.com/WDPR-RA/wdpr-ra-angular-error-handler) | Global Angular error handler |
| `@wdpr/ra-angular-myid-login` | [wdpr-ra-angular-myid-login](https://github.disney.com/WDPR-RA/wdpr-ra-angular-myid-login) | MyID/OneID login integration |
| `@wdpr/ra-angular-page-key` | [wdpr-ra-angular-page-key](https://github.disney.com/WDPR-RA/wdpr-ra-angular-page-key) | Page key management for analytics |
| `@wdpr/ra-angular-prerender-injector` | [wdpr-ra-angular-prerender-injector](https://github.disney.com/WDPR-RA/wdpr-ra-angular-prerender-injector) | Pre-render/SSR token injection |
| `@wdpr/ra-angular-seo-metadata` | [wdpr-ra-angular-seo-metadata](https://github.disney.com/WDPR-RA/wdpr-ra-angular-seo-metadata) | SEO meta tag management |
| `@wdpr/ra-angular-native-bridge` | [wdpr-ra-angular-native-bridge](https://github.disney.com/wdpr-ra-mobile/wdpr-ra-angular-native-bridge) | Angular bridge to native mobile APIs |
| `@wdpr/ra-angular-inject-oneid-auth-token` | [wdpr-ra-angular-inject-oneid-auth-token](https://github.disney.com/WDPR-RA/wdpr-ra-angular-inject-oneid-auth-token) | OneID auth token HTTP interceptor |
| `@wdpr/ra-angular-cms-content` | [wdpr-ra-angular-cms-content](https://github.disney.com/WDPR-RA/wdpr-ra-angular-cms-content) | CMS content integration block |

## Setup

```bash
koda workspace apply ra-angular-blocks
koda mcp-install
```

## Workspace Path

```
${WORKSPACE_ROOT}/reference-architecture/stark/ra-angular-blocks
```

## Inheritance

```
ra-team  (dev-core · dev-python · ops · dev-web · 10 rules)
└── stark  (dev-core · dev-ui · dev-web · GEW- Jira)
    └── ra-angular-blocks  (14 repos)
```

## Related

- [ra-ui-blocks](../ra-ui-blocks/) — framework-agnostic counterparts for most of these blocks
- [ra-generators](../ra-generators/) — scaffolding tools that wire these blocks into new apps
