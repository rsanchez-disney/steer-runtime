# Service Repository Mapping

| Service                   | Repo                              | Host              | Language     | Default Branch | Port  |
|:--------------------------|:----------------------------------|:------------------|:-------------|:---------------|:------|
| dcl-apps-travel-service   | dcl/dcl-apps-travel-service       | github.disney.com | Java 21      | develop        | 8080  |
| dcl-apps-travel-webapi    | dcl/dcl-apps-travel-webapi        | github.disney.com | Node.js 22   | develop        | 9999  |
| dcl-apps-travel-ui        | dcl/dcl-apps-travel-ui            | github.disney.com | Angular 20   | develop        | 8626  |
| dcl-crew-travel-datamodel | dcl/dcl-crew-travel-datamodel     | github.disney.com | SQL (MariaDB)| main           | —     |

## Implementation routing

| Change type | Target repo | Agent | Key dirs |
|:------------|:------------|:------|:---------|
| REST endpoints, business logic, DAO | dcl-apps-travel-service | `backend` | `src/main/java/.../resources/`, `service/`, `repository/` |
| Node.js BFF, middleware, auth, proxy | dcl-apps-travel-webapi | `webapi` | `src/api-server/resources/`, `core/` |
| Angular components, modules, SCSS | dcl-apps-travel-ui | `ui` | `src/app/features/`, `shared/`, `core/` |
| Database schema, migrations | dcl-crew-travel-datamodel | `backend` | `iterations/` |
| Cross-cutting (feature toggles) | webapi + service | `backend` → `webapi` | varies |

## Package structure (Java backend)

```text
com.dcl.cms.travel.service
├── resources/       — JAX-RS REST endpoints (Apache CXF)
├── resources/impl/  — endpoint implementations
├── service/         — business logic interfaces + impls
├── repository/      — DAO (Spring JDBC, RowMappers)
├── entity/          — DB entity POJOs (25 classes)
├── model/           — API DTOs (90+ classes)
├── config/          — Spring @Configuration
├── processor/       — JWT/Keycloak auth
├── util/            — Constants, TravelSQLQueries (raw SQL)
└── exception/       — Custom exceptions + CXF ExceptionMapper
```

## Module structure (Angular UI)

```text
src/app/
├── core/            — singleton services, interfaces (44), constants (11), interceptors
├── shared/          — reusable components (filter-panel, search, pagination, toast, dialog)
├── features/
│   ├── travel/      — main travel module (list, request, details, flight, hotel-stay)
│   ├── hotel/       — hotel management
│   ├── port-hotel/  — port-hotel associations
│   ├── hotel-manifest-master/
│   ├── hotel-count-report/
│   ├── hotelreconciliation/
│   ├── air-reconciliation/
│   ├── profile/
│   └── unauthorized/
└── test-helpers/    — 40 mock files
```

## Resource modules (Node BFF)

Each resource follows: `routes.js` + `action.js` + `*.spec.js`

18 resources: travel-requests, travel-request-details, travel-preference, travel-profile, travel-companion, flight-request, hotel, hotel-stay, hotel-list, hotel-company, hotel-manifest-master, hotel-report, hotel-reconciliation, air-reconciliation, close-air-hotel-reconciliation, port-hotel, work-segment, authz, services

## Test frameworks

| Repo | Framework | Pattern |
|:-----|:----------|:--------|
| travel-service | JUnit 4 + JaCoCo | `src/test/java/` mirrors main |
| travel-webapi | Mocha + Chai + Sinon | Co-located `.spec.js` |
| travel-ui | Karma + Jasmine | Co-located `.spec.ts` |
| datamodel | None (manual rollback scripts) | `iterations/*/rollback.sql` |
