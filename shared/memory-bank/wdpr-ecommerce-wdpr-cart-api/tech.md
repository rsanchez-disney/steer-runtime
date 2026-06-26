# Tech Context — wdpr-ecommerce-wdpr-cart-api

## Stack
- **Runtime:** Node.js
- **Framework:** Restify
- **Language:** JavaScript (ES6+)
- **Test Framework:** Chai + Sinon + Mocha
- **Build/Task Runner:** Grunt
- **Package Manager:** npm

## Project Structure
```
src/
├── routes/               # API route handlers
├── services/             # Business logic
├── middleware/           # Auth, logging, error handling
├── utils/                # Shared utilities
├── config/               # Environment configs
└── index.js              # Entry point
```

## Key Commands
- `npm start` — start server
- `npm test` — run tests (Mocha)
- `grunt` — build tasks
- `npm run lint` — linting

## Conventions
- Routes return promises
- Error handling via middleware
- Config loaded from environment vars + config files
- Service-to-service auth via B2B tokens
