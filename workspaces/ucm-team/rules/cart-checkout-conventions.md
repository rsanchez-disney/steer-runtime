# UCM Team — Development Conventions

## Branch Naming
- Branch name = Jira ticket number: `UCM-12345`, `COM-12345`
- Always branch from the repo's base branch (`develop` or `master`)
- Push to your **personal fork** only — never push directly to origin
- PR: `fork/<TICKET>` → `origin/develop` (or `master` for components/lambda)

## Commit Messages
Follow Conventional Commits scoped to the ticket:
```
UCM-12345: add timer TTL calculation to UC API
UCM-12345: bump @com/input to 2.3.1
```

## API Constants
- All UC API endpoint paths must be defined in `API_CONSTANTS` in the UC SPA — never inline strings
- Base path `/uc/api/v1` — do not change without coordinating SPA `API_CONSTANTS` update
- Do not change route signatures without updating both SPA constants and API routes simultaneously

## Cross-Repo Changes
When a change touches multiple repos:
- Implement in dependency order: **components → UC API → SPA** (or **cart API → cart UI**)
- Open one PR per repo, link them all in the Jira ticket
- Do not merge any PR until all linked PRs are approved (and merged in case its a required dependency)

## Timer / TTL Rule
- Order hold expiry (`expiryTime`) must be calculated server-side in the UC API
- Never expose raw timestamps or calculate TTL in the SPA

## Auth State
- Three auth states: `guest`, `private` (logged-in), `anon`
- Auth state transitions must be transparent to the user — no jarring redirects
- All token operations go through the UC API authz resource

## Native Bridge
- All native bridge calls go through the Angular bridge service
- Guard every bridge call — check if running in native context before invoking
- Never call bridge methods directly from Polymer components
- Encapsulate the native context guard inside the bridge service (`wdpr-ra-angular-native-bridge`) — do not duplicate the guard check at each callsite; all components must delegate to the service, which is the single enforcement point

## Security
- Never commit tokens, credentials, or secrets to any repo
- All secrets via env vars — never hardcode: `JWT_SECRET`, `AUTHZ_CLIENT_SECRET`, etc.
- Do not log PII or payment data in any layer
- CORS origins controlled by env vars in each API (`SPA_URL` for UC API, `STATIC_URL` for Cart API)
- CORS origin values must be exact origin strings (e.g. `https://disneyworld.disney.go.com`) — never wildcards (`*`) or partial patterns

## Testing
- UC SPA: `npm test`
- UC API: `npm test`
- Components: `polymer serve`
- Cart API: `npm test`
- Cart UI: `npm test`
- Target ≥80% coverage on new code — this threshold must be enforced in CI (build fails below threshold) for all four repos: UC SPA, UC API, Cart API, and Cart UI

## com-uc-ui-components Conventions
- One directory per component under `src/components/`, prefixed `com-uc-`
- Register every new component in `src/com-uc-ui-components.js`
- Include shared styles in every component: `<style include="com-theme"></style>`
- Never fork or copy `@com` component source — always depend on the package
- Do not add new `@com/*` dependencies without confirming the package exists in the Disney npm registry
- Upgrades to `@com/*` must be tested with WCT before bumping version
- Components communicate with the SPA via custom events and properties only — no direct Angular service access

## UC SPA Conventions
- Strict TypeScript — avoid `any` unless interfacing with untyped external data
- Define interfaces in `src/app/models/` for all API request/response shapes
- Use RxJS operators for async flows; prefer `takeUntilDestroyed` with `DestroyRef` (Angular 15+) for subscription cleanup — use the `async` pipe where possible; fall back to manual `ngOnDestroy` only when neither option applies
- Register Polymer web components via `CUSTOM_ELEMENTS_SCHEMA` in `AppModule`
- All token operations go through the UC API authz resource
- Avoid direct string comparisons against known site or store IDs (e.g. `if (siteId === 'dlr')`, `if (storeId === 'cast')`); use feature flags from the service layer instead. Consider an ESLint `no-restricted-syntax` rule targeting these patterns to enforce this at the linting stage

## Observability
- Use structured logging — not raw `console.error`
- Prefer structured error capture over noisy console output
- Avoid logging sensitive data (PII, payment info, credentials)
