# Business Rules — DLP Entitlement Product Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (supports TMS) | Lambda invocation metrics |
| Response time (p95) | Monitored via CloudWatch | Lambda duration metrics |
| Error rate | Monitored via Splunk | index=wdpr_dlp_cme |

## Business Logic

- Single endpoint: product finder (`/api/product-finder`)
- Retrieves PLU/Product information using SKU as parameter
- Returns: product category, product name, guest access type, etc.
- Node.js Lambda triggered by API Gateway
- Provides product data to TMS (BAPP0201208)

## Dependencies

- **TMS (BAPP0201208)** — primary consumer
- **API Gateway** — trigger/entry point
- **Tridion (CME - Surqual)** — product data source

## Impact Classification

- **Full outage:** Guests lose access to product information, disrupting product-ticket association
- **Degraded:** Slow Lambda responses impacting TMS performance
