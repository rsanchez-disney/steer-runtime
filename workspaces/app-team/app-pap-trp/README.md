# PAP & TRP

> Extends [app-team](../app-team/) — inherits dev-core, qa, shared rules and context.

**PAP** — Batch payment processing (refund, settlement, auth) with submitter/approver workflow.
**TRP** — Transaction lookup, research, and inquiry for support teams.

## Repos

| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-payment-controls-client | Angular (shared monorepo) |
| BFF | wdpr-payment-controls-api | Node.js |
| Backend | wdpr-payment-services | Java/Spring Boot |
| Backend | wdpr-app-inquiry-service | Java/Spring Boot |
| Legacy | dpay-admin-inquiry-webapi | Node.js (being replaced) |

## Setup

```bash
koda workspace apply app-pap-trp
koda mcp-install
```
