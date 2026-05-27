# Business Rules — WDPR Mobile Device Notification Optin Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | Not documented in MyWiki |
| Response time (p95) | Not documented in MyWiki | Not documented in MyWiki |
| Error rate | Not documented in MyWiki | Not documented in MyWiki |

## Peak Periods

- Park opening hours when guests enable push notifications on their mobile devices
- Holiday seasons with high park attendance

## Business Logic

- Records guest opt-ins to mobile push notification lists
- Does NOT perform actual push notifications — that is handled by mobile applications' services
- Externally accessible API
- Active-active deployment across US-EAST-1 and US-WEST-2

## Dependencies

- Mobile applications (WDW My Disney Experience, DLR Disneyland app) — Upstream: send opt-in requests
- DynamoDB — Data store for opt-in records
- ALB / ECS Fargate — Infrastructure
- API Gateway — External access

## Impact Classification

- **Full outage:** Push notification opt-in records unavailable. Guests won't receive push notifications, but core app functionality is unaffected.
- **Degraded:** Delayed opt-in processing. Guests may not receive timely push notifications.
