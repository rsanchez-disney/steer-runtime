# UCM1 — Applications Contexts

## wdpr-ecommerce-uc-spa

### Purpose
Angular SPA driving the Unified Checkout experience for Disney guests. Handles purchase, modification, and upgrade flows for all supported product types. Runs standalone and embedded in Disney native iOS/Android apps via `DisneyRAWebView`.

### Stack
- **Framework**: Angular 15
- **Language**: TypeScript ~4.9
- **Reactive**: RxJS ~7.8
- **Web Components**: Polymer 3 via `com-uc-ui-components` (consumed via `CUSTOM_ELEMENTS_SCHEMA`)
- **Native Bridge**: `wdpr-ra-javascript-native-bridge`, `@wdpr/ra-angular-native-bridge`

### Commands
```bash
npm run start:proxy:dev    # Local Development
npm run test                   # Unit tests
npm run lint               # Lint
```

### Native Bridge Key Methods
- `ucConfirmationLoaded` — signals confirmation page ready
- `paymentSheetFinish` — signals payment sheet complete
- `initApplePayWidget` — initializes Apple Pay
- `readyForRequestItems` — signals readiness to receive order items

### Directory Layout
```
src/
└── app/
    ├── app.module.ts            # Root module; registers CUSTOM_ELEMENTS_SCHEMA for Polymer
    ├── app-routing.module.ts    # Route definitions
    ├── components/              # Page-level and shared Angular components
    ├── services/                # Angular services (order, auth, payment, analytics, bridge)
    ├── models/                  # TypeScript interfaces for all API shapes
    ├── constants/               # API_CONSTANTS — all UC API endpoint paths live here
    └── store/                   # State management
```

### Component Architecture
```
Angular SPA (wdpr-ecommerce-uc-spa)
  └─► com-uc-ui-components (Polymer 3 — via CUSTOM_ELEMENTS_SCHEMA)
        └─► @com/* packages (Disney shared Polymer base library)
```

### Source Repository
- Org: `wdpr-unified-checkout`
- Repo: `wdpr-ecommerce-uc-spa`
- Host: `github.disney.com`
- Base branch: `develop`

### Local Setup
1. Node Dependency: Node 20.19.1
2. Run `npm install`
3. Adjust .env file (See https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391446571/UC+UI+Developer+Setup#Installing-the-SPA)
4. Run `npm run start:proxy:dev`

---

## com-uc-ui-components

### Purpose
Polymer 3 web components library providing all UI building blocks for the checkout and confirmation flows — guest info forms, order summary, payment display, confirmation screens, modals, and utility components.

### Published As
`@com/uc-ui-components`

### Consumed By
`wdpr-ecommerce-uc-spa` — imported via `CUSTOM_ELEMENTS_SCHEMA` in Angular's `AppModule`

### Key @com/* Base Packages
| Package | Purpose |
|---------|---------|
| `@com/input` | Text input fields |
| `@com/select` | Dropdown selects |
| `@com/button` | Button elements |
| `@com/modal` | Base modal/dialog |
| `@com/messages` | Inline error/info messages |
| `@com/loading` | Loading spinners |
| `@com/error-panel` | Error display panel |
| `@com/icon` | Icon elements |
| `@com/theme-pep` | PEP design theme/styles |
| `@com/price` | Price display formatting |
| `@com/lottie` | Lottie animation player |

### Component Categories
- Guest info: `com-uc-guest-info`, `com-uc-guest-name`, `com-uc-guests-selection`, `com-uc-contact-info`
- Order summary: `com-uc-order-summary`, `com-uc-price-summary`, `com-uc-product-component-details`
- Payment: `com-uc-payment-description`, `com-uc-confirmation-payment`
- Confirmation: `com-uc-confirmation-header`, `com-uc-confirmation-barcode`, `com-uc-confirmation-contact-us`
- Modals: `com-uc-dynamic-modal`, `com-uc-options-modal`, `com-uc-terms-and-conditions-modal`, `com-uc-pricing-modal`
- Utilities: `com-uc-stepper`, `com-uc-timer`, `com-uc-expand-collapse`, `com-uc-section-readback`

### Directory Layout
```
src/
├── com-uc-ui-components.js      # Entry — registers all components
├── components/
│   └── com-uc-*/                # One directory per component, prefixed com-uc-
└── style/                       # Shared styles
```

### Source Repository
- Org: `dprd-web-components-cart`
- Repo: `com-uc-ui-components`
- Host: `github.disney.com`
- Base branch: `master`

### Local Setup
- Node Version: 16.17.1
- Run `npm install`
- Run `polymer serve`
---

## wdpr-ecommerce-uc-api

### Purpose
Node.js Unified Checkout API (UC API). Acts as the secure intermediary between the Angular SPA and upstream services. Handles auth token management, request proxying, order type normalization, and server-side TTL calculation.

### Stack
- **Runtime**: Node.js
- **Framework**: Restify ~4.1
- **Module system**: CommonJS
- **Config**: dotenv
- **Entry point**: `src/api-server/server.js`
- **Base path**: `/uc/api/v1` (env: `API_BASE_PATH`)

### Key Responsibilities
- Proxy requests to `wdpr-order-vas` with B2B auth
- Inject HMAC version and payment token into order create responses
- Calculate order timer TTL server-side from `expiryTime` — never expose raw timestamps to SPA
- Strip/transform headers before forwarding (content-length, cookies, ETag)
- Support mock flow via `X-Disney-Internal-Commerce-Use-Mock` header passthrough
- Handle MOD/UPGRADE order types via `orderType` field
- Strip `entitlementIds` from `partyMix` on SALES requests
- Normalize `storeId: 'mobile'` → `{destinationId}_mobile`

### Directory Layout
```
src/
└── api-server/
    ├── server.js                # Entry point — Restify server setup
    ├── core/
    │   └── config.js            # All env vars loaded here via dotenv
    └── resources/
        ├── authz/               # authz.routes.js + authz.actions.js
        ├── order/               # order.routes.js + order.actions.js
        ├── payment/             # payment.routes.js + payment.actions.js
        ├── config/
        ├── get-translations/
        ├── dirty-words/
        ├── managed-guests/
        ├── analytics/
        └── log/
```

### API Resources
| Resource | Key Routes |
|----------|-----------|
| `authz` | GET /authz/token, POST /authz/public, /private, /guest, /cast |
| `order` | POST /order/create, /order/checkout, PUT /order/update-order/:orderId, GET /order/terms-and-conditions, POST /order/abandon |
| `payment` | POST /payment/establish |
| `config` | GET /config/ |
| `get-translations` | GET /get-translations/ |
| `dirty-words` | GET /dirty-words/ |
| `managed-guests` | managed guest operations |
| `analytics` | POST /analytics |
| `log` | POST /error/ |

### Upstream Dependencies
- `wdpr-order-vas` — order lifecycle backend (Java)
- `com-ui-api-lambda` — global API for services, config, and content
- Disney Authz service — JWT token issuance
- ADPMTSM — payment session manager

### Auth / Security
- Three authz interceptor configs: standard (`pep_jwt_token`), anon (`__uc`), OneId minted
- CSRF protection via `wdpr-api-security`; whitelist in `config.js`
- All secrets via env vars: `JWT_SECRET`, `AUTHZ_CLIENT_SECRET`
- CORS origins controlled by `SPA_URL` env var

### Request Flow
```
SPA (:8626)
  → UC API (:8625) [/uc/api/v1]
      ├─► com-ui-api-lambda  (config, content, services)
      ├─► wdpr-order-vas     (order lifecycle)
      ├─► Authz service      (JWT tokens)
      └─► ADPMTSM            (payment session)
```

### Source Repository
- Org: `wdpr-unified-checkout`
- Repo: `wdpr-ecommerce-uc-api`
- Host: `github.disney.com`
- Base branch: `develop`

### Local Setup
1. Node Dependency: Node 20.19.1
2. Run `npm install`
3. Adjust .env file (See https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391446571/UC+UI+Developer+Setup#Installing-the-API)
4. Run `npm run start:local`

---

## com-ui-api-lambda

### Purpose
Global API Lambda acting as a unified gateway for the Unified Checkout experience. Provides access to services, configuration, and content — abstracting multiple upstream dependencies behind a single Lambda interface consumed by the UC API.

### Stack
- **Runtime**: Node.js (Lambda)
- **Deployment**: AWS Lambda
- **Source control**: GitLab (`gitlab.disney.com/cgs-wdw/com-ui-api/com-ui-api-lambda`)

### Role in the Stack
```
UC API (wdpr-ecommerce-uc-api)
  └─► com-ui-api-lambda
        ├─► Configuration services
        ├─► Content services
        └─► Other upstream services
```

### Source Repository
- GitLab: `gitlab.disney.com/cgs-wdw/com-ui-api/com-ui-api-lambda`
- Base branch: `master`

### Local Setup
- Node Version: 20.19.1
- Run
  DLR --> nodemon server.js --env=dev --authz_client_secret=<authz-client-secret> --cm_client_secret=<cm_client_secret>--wdpr_cipher_key=<wdpr_cipher_key> --region=us-west-2

  WDW --> nodemon server.js --env=dev --region=us-east-1 --authz_client_secret=<authz_client_secret> --cm_client_secret=<cm_client_secret> --wdpr_cipher_key=<wdpr_cipher_key>
---

## wdpr-ecommerce-wdpr-cart-api

### Purpose
Node.js Cart API (web API / BFF) for the Cart UI. Handles auth token management, cart lifecycle operations, session management, and feature-toggle-driven behavior.

### Stack
- **Runtime**: Node.js (v10.15.0)
- **Framework**: Restify ~4.1
- **Module system**: CommonJS
- **Config**: dotenv (~1.2.0)
- **Cache**: ioredis ^4.16.3
- **Entry point**: `src/api-server/server.js`
- **Base path**: `/api/v1` (env: `API_BASE_PATH`)

### Commands
```bash
grunt serve      # Dev server on :8625
grunt test       # Run tests (Grunt + Mocha/Chai/Sinon)
npm test         # Alias for grunt test
npm run lint     # ESLint
grunt build      # Production build
```

### Key API Resources
| Resource | Purpose |
|----------|---------|
| `authz` | Auth token issuance and validation |
| `create-cart` | Initialize cart session |
| `retrieve-cart` | Fetch cart state |
| `add-to-cart` | Add items to cart |
| `remove-item` / `remove-offer` | Remove item or offer |
| `set-quantity` / `bulk-update` | Update quantities |
| `clear-cart` / `save-cart` | Cart management |
| `create-order` / `checkout` | Order submission |
| `config-service` | Feature config and properties |
| `redis` | Redis cache operations |

### Upstream Dependencies
- Cart backend service — cart persistence and business logic
- Disney Authz service — JWT token issuance (`AUTHZ_HOST_URL`)
- Redis — cart session caching (`ioredis`)
- `wdpr-node-feature-decider` — runtime feature toggles

### Request Flow
```
Cart UI (:8626)
  → Cart API (:8625) [/api/v1]
      ├─► Cart backend service  (cart lifecycle)
      ├─► Authz service         (JWT tokens)
      ├─► Redis                 (session cache)
      └─► config-service        (feature config)
```

### Source Repository
- Org: `wdprd-development`
- Repo: `wdpr-ecommerce-wdpr-cart-api`
- Host: `github.disney.com`
- Base branch: `develop`

---

## wdpr-ecommerce-wdpr-cart-ui

### Purpose
Angular 15 SPA driving the Cart experience. Displays cart contents, allows item management, applies offers/promos, and drives the checkout flow.

### Stack
- **Framework**: Angular 15 (~15.1.0)
- **Language**: TypeScript ~4.9
- **Reactive**: RxJS ~7.8
- **Styling**: SCSS + stylelint
- **Node**: v16.17.x / npm 8.15.x

### Commands
```bash
npm run start:proxy:dev    # Dev server with Cart API proxy on :3000
npm run start:dev          # Dev server standalone on :8626
npm test                   # Unit tests (Karma + Jasmine)
npm run build              # Production build
npm run lint               # ESLint + stylelint
```

### Key Routes
| Path | Purpose |
|------|---------|
| `/` | Main cart view |
| `/cart-modal` | Overlay cart modal |
| `/checkout` | Checkout flow |
| `/login` | Guest login |

### Source Repository
- Org: `wdprd-development`
- Repo: `wdpr-ecommerce-wdpr-cart-ui`
- Host: `github.disney.com`
- Base branch: `develop`
