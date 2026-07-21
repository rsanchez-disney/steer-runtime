# Business Rules — WDPR FNB Barcode Generator Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch |
| Response time (p95) | < 500ms | API Gateway metrics |

## Peak Periods

- Aligned with ROO (merchandise checkout) peak periods

## Business Logic

- Generates barcode images for retail ordering receipts
- Serverless: API Gateway + Lambda + S3
- Shared by WDW and DLR retail ordering services
- Barcodes stored in S3 and served via CDN

## Dependencies

- API Gateway, Lambda, S3 (AWS infrastructure)
- ROO services (consumers)

## Impact Classification

- **Full outage:** Retail order receipts generated without barcodes. Orders still process but pickup validation affected.
- **Degraded:** Slow barcode generation, timeouts. Minor impact on receipt delivery.
