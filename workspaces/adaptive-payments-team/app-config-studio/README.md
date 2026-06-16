# Config Studio

> Extends [app-team](../app-team/) — inherits dev-core, qa, shared rules and context.

Client configuration management — manages client configs, metadata, SOR/Site rules, and client creation workflows.

## Repos

| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-payment-controls-client | Angular |
| BFF | wdpr-payment-controls-api | Node.js (Restify) |
| Backend | wdpr-config-services | Java/Spring Boot |
| Shared | wdpr-payments-ref | Java |

## Setup

```bash
koda workspace apply app-config-studio
koda mcp-install
```
