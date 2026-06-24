# Tech Context — wdpr-ecommerce-uc-api

## Stack
- **Runtime:** Node.js
- **Framework:** Restify
- **Language:** TypeScript + JavaScript (mixed)
- **Test Framework:** Jest + Mocha + NYC (coverage)
- **Build:** TypeScript compiler
- **Package Manager:** npm

## Project Structure
```
src/
├── routes/               # API route handlers (*.actions.ts)
├── services/             # Business logic services
├── middleware/           # Auth (LOW_TRUST, HIGH_TRUST), logging
├── utils/                # Shared utilities (authz, tokens)
├── config/               # ucConfig, feature flags
├── models/               # Request/response models
└── server.ts             # Entry point
```

## Key Commands
- `npm start` — start server
- `npm test` — run tests (Jest + Mocha)
- `npm run coverage` — NYC coverage report
- `npm run lint` — linting

## Key Patterns
- BFF pattern: proxies to OrderVAS backend
- Feature flags from `ucConfig` (e.g. `useAbandonApi`, `ENABLE_ONE_ID_V5`)
- Auth: LOW_TRUST (no auth header needed) vs HIGH_TRUST (requires Bearer)
- B2B tokens for service-to-service calls (`util.getB2bToken`)
- Route files named `*.actions.ts` (e.g. `order.actions.ts`)

## Important Files
- `src/routes/order.actions.ts` — order create, update, abandon
- `src/routes/route-handle.ts` — route initialization
- `src/config/` — feature flags and environment config
