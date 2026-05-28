# Payment Controls Platform Context

Unified workspace for Config Studio, GCP Admin, and Inquiry — all served through the Payment Controls UI.

## Domains

### Config Studio
Search, compare, export, and promote payment configurations across environments.

### GCP Admin (Gift Card)
Product/promotion lifecycle, client management, activation, balance inquiry.

### Inquiry
Transaction research, search, and timeline visualization for payment operations.

## Repos & Layers

| Layer | Repo | Tech | Domain |
|-------|------|------|--------|
| UI | wdpr-payment-controls-client | Angular | Config Studio + Inquiry (new) |
| WebAPI | wdpr-payment-controls-api | Node.js | Config Studio BFF |
| Backend | wdpr-config-services | Java/Spring Boot | Config Studio |
| WebAPI | wdpr-gcp-admin-api | Node.js | GCP Admin BFF |
| Legacy UI | wdpr-gcp-admin | Node.js | GCP Admin (being replaced) |
| Backend | gcp-guest-services | Java/Spring Boot | GCP guest services |
| Legacy UI | dpay-admin-inquiry-ui-client | Angular | Inquiry (legacy, being replaced) |
| WebAPI | dpay-admin-inquiry-webapi | Node.js | Inquiry BFF |
| Backend | wdpr-app-inquiry-service | Java/Spring Boot | Inquiry backend |

## Key Notes
- `wdpr-payment-controls-client` is the consolidated UI replacing both `wdpr-gcp-admin` and `dpay-admin-inquiry-ui-client`
- GCP and Inquiry bugs often touch the shared UI + their respective WebAPIs and backends
- Jira projects: DPAY (myjira.disney.com), GCP (myjira.disney.com)
