# Gift Card Platform (GCP)

> Extends [app-team](../app-team/) — inherits dev-core, qa, shared rules and context.

Gift card management — products, promotions, client management, transaction research.

## Repos

| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-gcp-dgc | Angular |
| Admin UI | wdpr-gcp-admin | Node.js |
| Admin API | wdpr-gcp-admin-api | Node.js |
| Backend | gcp-admin-services | Java/Spring Boot |
| Backend | gcp-batch | Java/Spring Boot |
| Backend | gcp-guest-services | Java/Spring Boot |
| Shared | gcp-common-components | Java |

## Setup

```bash
koda workspace apply app-gift-card
koda mcp-install
```
