# Stack Routing Reference

## Detection Signals

| Signal | Target Stack | Agent |
|--------|-------------|-------|
| Component: Items, Configuration, Reporting | PHP — Connect monolith | pos_php_agent |
| Component: API, Backend | PHP — Connect monolith (api-v5) | pos_php_agent |
| Component: Frontend, UI | React — connect-frontend | pos_react_agent |
| Component: gRPC, Microservice | Go — specific microservice | pos_go_agent |
| Label: `go-service` | Go — specific microservice | pos_go_agent |
| Label: `reduction`, `audit` | PHP — Laravel/Lumen microservice | pos_php_agent |
| Label: `product-catalog`, `cart-actions` | Go — specific microservice | pos_go_agent |
| Multiple components | Cross-stack (plan for each) | pos_architecture_agent routing |

## Repository Map

| Repo | Stack | Entry Points |
|------|-------|-------------|
| connect | PHP 8.1 (CodeIgniter 2/3) | `ci/application/connect/`, `ci/application/api-v5/` |
| connect-frontend | React 17, TypeScript, Redux/RTK | `src/` |
| reduction | PHP 8.1 (Laravel/Lumen) | `app/`, `routes/` |
| audit | PHP 8.1 (Laravel/Lumen) | `app/`, `routes/` |
| product_catalog | Go, gRPC | `cmd/`, `internal/` |
| connect-fast-api | Go, gRPC/REST | `cmd/`, `internal/` |
| connect_reports | Go | `cmd/`, `internal/` |
| cap-order-stream-manager | Go | `cmd/`, `internal/` |

## Test Commands

| Stack | Command | Notes |
|-------|---------|-------|
| PHP (Connect) | `kubectl exec` into k8s pod → `phpunit` | PHPUnit 9 + Mockery |
| PHP (Microservices) | `./vendor/bin/phpunit` | Local or Docker |
| Go | `go test ./... -race` | Race detector enabled |
| React | `yarn test --coverage` | Jest + RTL |

## Inter-Service Communication

```
React SPA → PHP API (REST/JSON)
PHP monolith → Go/PHP services (gRPC via MicroServiceClient/ConnectorCommon.php)
Background jobs → RabbitMQ
Config → micro_services.php
```
