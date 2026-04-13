<!-- owner: @disney-payments-core -->
<!-- last-updated: 2026-04-08 -->
# Config Services — API Contracts

## Overview
Java/Spring Boot backend for the Config Studio payment configuration management platform. Provides CRUD APIs for payment controls, business rules, and configuration management.

## Base URL
| Environment | URL |
|---|---|
| Dev | https://config-services-dev.wdprapps.disney.com |
| Stage | https://config-services-stage.wdprapps.disney.com |
| Prod | https://config-services.wdprapps.disney.com |

## Key Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/configs` | List all payment configurations |
| GET | `/api/v1/configs/{id}` | Get configuration by ID |
| POST | `/api/v1/configs` | Create new configuration |
| PUT | `/api/v1/configs/{id}` | Update configuration |
| DELETE | `/api/v1/configs/{id}` | Delete configuration |
| GET | `/api/v1/rules` | List business rules |
| POST | `/api/v1/rules/evaluate` | Evaluate rules against a transaction |

## Authentication
OAuth2 bearer token via Disney SSO. Service-to-service calls use mTLS.

## Full Spec
Swagger UI: `https://config-services-dev.wdprapps.disney.com/swagger-ui.html`
