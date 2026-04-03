# Gift Card Platform (GCP) Context

Gift card management — products, promotions, client management, transaction research.

## Repos & Layers
| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-gcp-dgc | Angular — products, promotions, client management |
| Admin UI | wdpr-gcp-admin | Node.js — admin portal |
| Admin API | wdpr-gcp-admin-api | Node.js — admin API gateway |
| Backend | gcp-admin-services | Java/Spring Boot — product/promotion CRUD |
| Backend | gcp-batch | Java/Spring Boot — batch processing |
| Backend | gcp-guest-services | Java/Spring Boot — guest-facing balance, transactions |
| Shared | gcp-common-components | Java — shared utilities and models |

## Key Flows
- Product and promotion lifecycle management
- Gift card activation, balance inquiry, redemption
- Batch processing for bulk operations
- Client management and reporting
