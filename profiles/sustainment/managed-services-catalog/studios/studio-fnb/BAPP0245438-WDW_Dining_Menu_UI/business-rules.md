# Business Rules — WDW Dining Menu UI

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch |
| Page load time | < 3s | Synthetic monitoring |

## Peak Periods

- Evening hours when guests plan next-day dining
- Before and during meal times

## Business Logic

- Angular SPA displaying restaurant menus on disneyworld.disney.go.com
- Served via S3 + API Gateway + Lambda
- Consumes Dining Menu Service (BAPP0089587) for data
- SEO-important: menus indexed by search engines

## Dependencies

- Dining Menu Service (BAPP0089587)
- S3, API Gateway, Lambda (infrastructure)
- Akamai CDN

## Impact Classification

- **Full outage:** Restaurant menus not visible on WDW website. Guests cannot browse menus before visiting.
- **Degraded:** Slow loading, stale menu data. Minor discovery impact.
