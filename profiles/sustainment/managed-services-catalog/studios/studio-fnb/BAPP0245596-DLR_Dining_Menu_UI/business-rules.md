# Business Rules — DLR Dining Menu UI

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch |
| Page load time | < 3s | Synthetic monitoring |

## Peak Periods

- Evening hours when guests plan next-day dining
- Before and during meal times

## Business Logic

- Angular SPA displaying restaurant menus on disneyland.disney.go.com
- Served via S3 + API Gateway + Lambda
- Same codebase as WDW Dining Menu UI deployed to us-west-2
- Consumes Dining Menu Service (BAPP0089587)

## Dependencies

- Dining Menu Service (BAPP0089587)
- S3, API Gateway, Lambda (infrastructure)
- Akamai CDN

## Impact Classification

- **Full outage:** Restaurant menus not visible on DLR website.
- **Degraded:** Slow loading, stale menu data.
