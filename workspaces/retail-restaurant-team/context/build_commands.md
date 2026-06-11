# Build Commands — Retail & Restaurant

## Java Services (Maven)

All Java repos use Maven with wrapper. Standard commands:

```bash
./mvnw clean install              # Build + test
./mvnw test                       # Unit tests only
./mvnw verify                     # Unit + integration tests
./mvnw clean package -DskipTests  # Build without tests
```

### Per-repo specifics

| Repo | Java | Notes |
|------|------|-------|
| mobile-ordering-orchestration-service | 21 | `rrtd-spring-webflux-parent` |
| wdpr-mo-batch-svc | 17 | Includes native SQLite for DynamoDB local tests |
| retail-ordering-orchestration-service | 21 | `rrtd-spring-webflux-parent` |
| wdpr-ro-batch-svc | 17 | Includes native SQLite for DynamoDB local tests |
| barcode-gen-svc | 17 | Lambda — no Dockerfile, S3 deploy |
| dine-self-checkin-orchestration-service | 21 | `wdpr-parent` |
| wdpr-sales-dlrarrw-svc | 21 | `rrtd-spring-webflux-parent` |
| wdpr-sales-dlrarrw-batch | 21 | `rrtd-spring-webflux-parent` |
| dlr-commerce2-menu-svc | 17 | `wdpr-parent`, Spring Boot 2.7 |
| fnb-order-service | 21 | `rrtd-spring-webflux-parent` |
| dinetime-reservation-sync | 17 | `wdpr-parent`, Spring Batch |

## Node.js Services (npm)

```bash
npm install                       # Install dependencies
npm test                          # Run tests (Mocha)
npm run build                     # Compile TypeScript (if applicable)
npm run lint                      # ESLint
npm start                         # Start service
```

| Repo | Node | Framework | Test runner |
|------|------|-----------|-------------|
| dine-self-checkin-config-admin-api | 20 | Restify | Mocha + Chai + Sinon |
| dine-self-checkin-config-service | 20 | Restify | Mocha + Chai + Sinon |

## Angular UI (npm)

```bash
npm install
ng serve                          # Dev server
ng test                           # Unit tests (Karma + Jasmine)
ng build --configuration=prod     # Production build
ng lint                           # ESLint / TSLint
```

| Repo | Angular | Notes |
|------|---------|-------|
| dine-self-checkin-config-admin-ui | 18 | Dual: Angular frontend + Express backend |

## Flutter/Dart

```bash
flutter pub get                   # Install dependencies
flutter test                      # Run tests
flutter build web                 # Build for web
flutter analyze                   # Static analysis
```

| Repo | Flutter | Notes |
|------|---------|-------|
| arrwui-spa | 3.2+ | Uses Riverpod, Disney custom pub registry |
