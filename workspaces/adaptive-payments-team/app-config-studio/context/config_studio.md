# Config Studio Context

Client configuration management system — manages client configs, metadata, SOR/Site rules, and client creation workflows.

## Repos & Layers
| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-payment-controls-client | Angular — client search, create, edit, compare, reports, metadata |
| BFF | wdpr-payment-controls-api | Node.js (Restify) — proxies backend APIs, auth middleware |
| Backend | wdpr-config-services | Java/Spring Boot — client CRUD, config values, staging/workflow, ruleset API |
| Shared | wdpr-payments-ref | Java — shared utilities, models, constants |

## Key Flows
- Client creation V2 workflow (staging → approval → publish)
- SOR/Site rule management
- Config value comparison across environments
- Metadata management and reporting
