# Project Mappings

## DSP Back Office (POS)

**Purpose**: Back-end platform supporting DSP GO front-end terminals, providing enterprise and vendor level configurations.

**Jira Prefix**: `POS-`

**Repositories**:
- **Monolith**: `connect` (deployer_setup/projects/php/connect)
  - Tech: PHP 8.1, CodeIgniter 2/3, Illuminate Migrations, gRPC
  - Entry: `ci/application/connect/` (backoffice), `ci/application/api-v5/` (API)
  - Shared: `appetize_lib/`, `pkg/`
  - Tests: PHPUnit 9 + Mockery (run in k8s pod)

- **Frontend**: `connect-frontend` (repos/connect-frontend)
  - Tech: React 17, TypeScript, Redux/RTK, MUI 5, Jest
  - Entry: `src/`
  - Build: CRA + CRACO, yarn

- **Microservices (PHP)**: `reduction`, `audit`, `corporate-hierarchy`
  - Tech: PHP 8.1, Laravel/Lumen, gRPC
  - Entry: `app/`, `routes/`

- **Microservices (Go)**: `connect-fast-api`, `product_catalog`, `config-service`, `cap-order-stream-manager`, `cart-actions`, `audit-go`, `connect_reports`
  - Tech: Go, gRPC, REST
  - Entry: `cmd/`, `internal/`

- **POS App (front-of-house)**: `activatex` (repos/activatex)
  - Tech: Android, Kotlin, Java, Gradle
  - Also known as: ActivateX, DSP GO
  - Modules: `gc/AppetizeActivateApp` (main POS), `gc/api_grpc` (gRPC client), `gc/api_activate` (REST client), `modules/aa-core`, `modules/aa-framework-payment`
  - Business modes: Merchandise, QSR, Table Service
  - Communicates with Connect via gRPC and REST
  - Tests: JUnit, Jacoco coverage
  - CI: GitLab CI, SonarQube

**Inter-service**: gRPC (via `MicroServiceClient/ConnectorCommon.php` on backend, `gc/api_grpc` on Android), config in `config/micro_services.php`

**Note**: ActivateX is the front-of-house POS app used by vendors/cast members. Connect is the back-office platform for configuration, item management, and reporting.

---

## Usage

When analyzing a Jira story:
1. Extract project prefix (`POS-`)
2. Determine target repo from ticket components, labels, or description
3. Navigate to correct directories

Examples:
- `POS-19542` — Component: Items, PHP → Connect monolith
- `POS-20100` — Component: Frontend, UI → connect-frontend (React SPA)
- `POS-18000` — Component: gRPC, Microservice → Go microservice
