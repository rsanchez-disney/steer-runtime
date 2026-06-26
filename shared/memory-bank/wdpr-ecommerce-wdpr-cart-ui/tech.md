# Tech Context — wdpr-ecommerce-wdpr-cart-ui

## Stack
- **Framework:** Angular 15+
- **Language:** TypeScript
- **Test Framework:** Karma + Jasmine
- **Build:** Angular CLI / Webpack
- **Package Manager:** npm

## Project Structure
```
src/
├── app/
│   ├── features/          # Feature modules (cart, checkout, etc.)
│   ├── shared/            # Shared components, services, pipes
│   ├── core/              # Core services (auth, config, analytics)
│   └── app.module.ts
├── assets/
├── environments/
└── styles/
```

## Key Commands
- `npm start` — local dev server
- `npm test` — run unit tests (Karma)
- `npm run build` — production build
- `npm run lint` — ESLint

## Conventions
- Feature modules are lazy-loaded
- Services use dependency injection
- Components follow smart/dumb pattern
- State managed via services (no NgRx)
