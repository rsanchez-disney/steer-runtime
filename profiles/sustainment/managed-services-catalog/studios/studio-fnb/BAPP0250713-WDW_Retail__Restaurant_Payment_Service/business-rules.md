# Business Rules — WDW Retail & Restaurant Payment Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Splunk / CloudWatch |
| Response time (p95) | < 2s | Splunk |
| Error rate | < 1% | Splunk |

## Peak Periods

- Aligned with WDW mobile ordering and merchandise checkout peak times

## Business Logic

- Payment orchestration for WDW retail and restaurant transactions
- Handles: payment authorization, order tracking, refund processing
- ECS service + Lambda batch component
- DynamoDB stores order and refund records

## Dependencies

- Payment gateway (DSP/POS team)
- DynamoDB (order/refund state)
- MOO/ROO (callers)

## Impact Classification

- **Full outage:** WDW mobile payments cannot be processed. Mobile ordering and merchandise checkout blocked.
- **Degraded:** Slow payment processing, intermittent failures.
