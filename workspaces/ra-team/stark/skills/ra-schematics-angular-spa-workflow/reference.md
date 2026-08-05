# Schematics Reference

## Auth modes

| CLI value | Template folder | Key dependency |
|-----------|-----------------|----------------|
| `cast-member` (default) | `application/cast-member-files/` | `@wdpr/ra-angular-myid-login` |
| `guest-login` | `application/guest-login-files/` | `@wdpr/profile-authenticator-universal` |
| `none` | (no auth templates) | — |

### Cast Member specifics

- Full shell: `wdpr-application-header`, avatar/profile dropdown, left nav, ACME badge
- Services: `AuthService`, `ClaimsService`, `AuthHttpInterceptor`, `WindowRefService`
- `.env-EXAMPLE`: MyID vars (`AUTH_CLIENT_ID`, OIDC endpoints, WebAPI paths)
- E2E: redirects to `sso.myid.disney.com`, uses system Chrome

### Guest Login specifics

- Simpler layout — no header/nav shell
- Service: `GuestLoginAuthService`
- `.env-EXAMPLE`: `SYNDICATED_HEADER_URL`, `FEATURE`, E2E credentials
- `--analytics` only enabled for guest-login
- E2E: guest SSO flow + `guest-authenticated.spec.ts`

## Creating test apps

**Do not run `ng new` directly from this workflow.** When a new app is needed, follow [ra-scaffold-app](../ra-scaffold-app/SKILL.md) in `ui-only` / `angular` mode with the local collection:

```bash
--collection=/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-schematics-angular-spa
```

Flag reference and auth setup: [ui-angular.md](../ra-scaffold-app/references/ui-angular.md).

Direct schematics CLI (advanced, from schematics repo root):

```bash
schematics .:application --name=test-app --dry-run=false
```

## Validation matrix

Run for **each auth mode** affected by the change:

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Unit tests | `npm run test` |
| Dev build | `npm run build:dev` |
| Prod build | `npm run build` |
| Dev server | `npm run start:dev` → http://localhost:8626 |
| Proxy | `npm run start:proxy:mac` → port 8000 |
| E2E | `npm run test:e2e` (requires app + proxy + WebAPI on 8625) |
| Docker | `docker build -t my-app . && docker run -it -p 8626:8626 my-app` |

### Feature flag validation

Scaffold a fresh app with `--feature-flag` via ra-scaffold-app, then verify: `FeatureFlagService` in `src/app/core/services/feature-flag/`, `launchdarkly-js-client-sdk` in deps, `UI_LAUNCHDARKLY_CLIENT_ID` in `.env-EXAMPLE`, CSP domains, `app.config.ts` init.

### E2E per auth mode

**Cast Member:** app + proxy + WebAPI running, then `npm run test:e2e`

**Guest Login:** same setup; `npx playwright test --project=guest-login` for SSO flow (needs `E2E_GUEST_USERNAME`/`E2E_GUEST_PASSWORD` in `.env`)

**None:** `npm run test:e2e` only — no proxy needed

## Incompatibilities (generator throws)

- `--marketplace` + `--auth=guest-login`
- `--marketplace` + `--chatbot`
- `--analytics` with non-guest-login → disabled with warning

## Port prototype → template checklist

When moving a working test-app change into schematics:

1. Identify if change is auth-specific or shared
2. Copy file to correct template folder (add `.template` suffix if needed)
3. Replace hardcoded app name with `<%= name %>` or EJS conditionals
4. Update `application/index.js` if new files or conditional logic needed
5. Update `schema.json` if new CLI flag
6. Regenerate both auth modes and diff against prototype

## Prerequisites

- Node ≥24.11.0, npm ≥11.6.1
- Angular CLI 20.3 global
- Nexus3 registry configured (Disney internal)
- `npm link` from schematics repo for local development
