# UCM1 — Application-Specific Conventions

> Generic conventions (branch naming, commit format, API constants, timer/TTL, auth state, native bridge, security, testing) are defined at the workspace root level in `cart-checkout-conventions.md`. This file covers UCM1-specific per-application rules.

## wdpr-ecommerce-uc-api

### Config & Secrets
- All env vars loaded in `src/api-server/core/config.js` via dotenv
- Never hardcode URLs, secrets, or tokens
- Key secrets: `JWT_SECRET`, `AUTHZ_CLIENT_SECRET`
- CORS origins controlled by `SPA_URL` env var

### Route Conventions
- Each resource has `*.routes.js` + `*.actions.js`
- Base path `/uc/api/v1` — do not change without coordinating SPA `API_CONSTANTS`
- Support mock flow via `X-Disney-Internal-Commerce-Use-Mock` header passthrough

### Request Proxying
- Strip `content-length`, cookies, and ETag headers before forwarding to Order VAS
- Inject HMAC version and payment token into order create responses
- Calculate `expiryTime` → TTL server-side; never expose raw timestamps to SPA

### Order Type Handling
- `SALES`: strip `entitlementIds` from `partyMix` before forwarding
- `MOD`/`UPGRADE`: pass `orderType` field through to Order VAS
- Normalize `storeId: 'mobile'` → `{destinationId}_mobile`

### Testing
- Grunt + Mocha/Chai/Sinon — spec files co-located (`*.spec.js`)
- Run: `grunt test` or `npm test`

---

## com-ui-api-lambda

### General
- Follow Node.js best practices for Lambda handlers (stateless, fast cold start)
- All config via environment variables — never hardcode URLs, secrets, or tokens
- Use AWS Secrets Manager or env vars for sensitive config

### Source Control
- Base branch: `master`
- Branch naming: `UCM12345` (Jira ticket number)
- Push to personal fork — MRs go to GitLab origin manually (outside MCP scope)

---

## wdpr-ecommerce-wdpr-cart-api

### Config & Secrets
- All env vars loaded in `src/api-server/core/config.js` via dotenv
- Key secrets: `AUTHZ_CLIENT_ID`, `AUTHZ_SECRET`
- CORS origins controlled by `STATIC_URL` env var

### Route Conventions
- Each resource has `*.routes.js` + `*.actions.js`
- Base path `/api/v1` — do not change without coordinating Cart UI constants
- Health check endpoint: `/cart-plus-api/api/v1/healthcheck`

### Caching
- Redis cache toggled via `ENABLE_CACHING` env var
- Use `ioredis` client — never access Redis directly outside the `redis` resource
- Cache keys must be namespaced to avoid collisions across environments — use the format `{env}:{resource}:{id}` (e.g. `dev:cart:abc123`)

### Feature Toggles
- Use `wdpr-node-feature-decider` for runtime toggle checks
- Toggle configs live in `src/feature-toggles-config/`
- Never hardcode feature flags — always go through the decider
- Avoid inline boolean literals that bypass the decider (e.g. hardcoding `true`/`false` where a toggle check is expected); consider an ESLint `no-restricted-syntax` rule to catch this

### Testing
- Grunt + Mocha/Chai/Sinon — spec files co-located (`*.spec.js`)
- Run: `grunt test` or `npm test`
- Target ≥80% coverage (build fails below threshold)

### Observability
- Use structured logging via `wdpr-node-logasaurus`
- AppDynamics instrumentation via `wdpr-ra-appdynamics-node`
- Never log PII or payment data — the following fields must be excluded from all log output: `email`, `firstName`, `lastName`, `paymentToken`, `cardNumber`, and `orderId` when associated with personal data

---

## wdpr-ecommerce-wdpr-cart-ui

### TypeScript
- Strict TypeScript — enable `strict: true` in `tsconfig.json`; avoid `any` unless interfacing with untyped external data
- Define interfaces in `src/app/models/` for all Cart API request/response shapes

### Module & Component Conventions
- Keep feature modules lazy-loaded where possible
- Use Angular services for state, data fetching, and side effects
- Do not access `@com/*` internals directly — use their exposed properties/events

### API Constants
- All Cart API endpoint paths defined in shared constants — never inline strings

### Feature Toggles
- Use `@wdpr/ra-angular-feature-toggle` for all toggle checks
- Never hardcode feature flags in component logic
- Avoid inline boolean literals that bypass the toggle service; consider an ESLint `no-restricted-syntax` rule to catch hardcoded replacements

### Styling
- Use SCSS; follow existing patterns in the project
- Run `npm run lint:styles` to validate SCSS before committing

### Testing
- Karma + Jasmine for unit tests
- Run: `npm test`
- Target ≥80% coverage (build fails below threshold)

### Observability
- Use `@wdpr/ra-angular-logger` for structured logging
- AppDynamics instrumentation via `wdpr-ra-appdynamics-node` (server-side)
- Never log PII or payment data — the following fields must be excluded: `email`, `firstName`, `lastName`, `paymentToken`, `cardNumber`, and `orderId` when associated with personal data

### Dev Proxy
- Use `npm run start:proxy:dev` to connect to a locally running Cart API on `:8625`
- Proxy config lives in `src/static/config/proxy-cfg.js`
