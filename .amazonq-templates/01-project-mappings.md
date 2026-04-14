# Project Mappings

## Config Studio (DPAY-)
- UI: `wdpr-payment-control-client` — Angular, TypeScript (`src/app/`)
- WebAPI: `wdpr-payment-control-api` — Node.js, Express (`src/controllers/`)
- Backend: `wdpr-config-services` — Java, Spring Boot (`src/main/java/`)

## GCP - Gift Card Platform (GCP-)
- UI: `wdpr-payment-control-client` — Angular, TypeScript
- WebAPI: `wdpr-gcp-admin-api` — Node.js, Express
- Backend: `gcp-admin-services` — Java, Spring Boot
- Legacy UI: `wdpr-gcp-admin` — Angular (maintain backward compatibility)

## TRP|PAP - Transaction Research / Payment Admin Portal (DPAY-)
- UI: `wdpr-payment-control-client` — Angular, TypeScript
- WebAPI: `dpay-admin-inquiry-webapi` — Node.js, Express
- Backend: `wdpr-app-inquiry-service` — Java, Spring Boot
- Legacy UI: `dpay-admin-inquiry-ui-client` — Angular (maintain backward compatibility)

## CAP - Content Accounting Platform (TIMON-)
- Backend: `wdpr-cap-rev-rec-svc` — Java, Spring Boot

## SPR - Smart Payment Routing (SPR-)
- Router: `spr-router` — Go (`cmd/`, `internal/`)
- AI Adapter: `spr-ai-adapter` — Java, Spring Boot
- Docs: `spr-docs` — MkDocs, Markdown
- Simulator: `spr-sim` — Python

## Cart Service
- Backend: `cart-service-java8` — Java 8, Spring 3.2, EclipseLink JPA, MariaDB, Redis, RabbitMQ

## Payment Service
- Backend: `wdpr-payment-svc` — Java 8, Spring 3.2, Hibernate JPA, Oracle/MariaDB

## Usage
When analyzing a Jira story, extract the project prefix (DPAY, GCP, TIMON, SPR) to identify which repositories need changes.
