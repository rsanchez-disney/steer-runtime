# Business Rules — WDPR Ant-Man Services (Longshot)

## Service Purpose

D-Scribe Longshot is the content delivery/transformation layer of the ECM (Enterprise Content Management) platform. It serves published content from S3 to consumers, with environment lane routing via the X-Content-Host header.

---

## Content Delivery Flow

1. Content is published by **Assembler** (BAPP0089443) through **Gatekeeper** (BAPP0089473)
2. Published content lands in S3 buckets (`d-scribe-content-live` for prod)
3. **Longshot** serves this content to consumers via REST API
4. Consumers include Cast Portals (SPA/WebAPI), mobile apps, and other downstream systems

---

## Environment Lane Logic

Longshot supports multiple environment lanes within the same infrastructure:
- **prod** — live production content
- **prod-stage** — pre-production validation (uses `d-scribe-content-prod-load` bucket)
- **prod-load** — load testing (uses `d-scribe-content-prod-stage` bucket)
- **prod-latest** — latest deployed code against prod-like data

Lane selection is controlled by the `X-Content-Host` header on requests to api-internal.

---

## Dependencies

| Direction | Service | BAPP | Relationship |
|-----------|---------|------|-------------|
| Upstream | Assembler | BAPP0089443 | Publishes content to S3 |
| Upstream | Gatekeeper | BAPP0089473 | Controls publication flow |
| Downstream | Consumers | Various | Read content via Longshot API |
| Infrastructure | S3 | — | Content storage |
| Monitoring | Watcher | BAPP0142680 | Monitors content state |

---

## Impact Classification

- **Full outage:** All content delivery stops — consumers (parks sites, apps) cannot retrieve content
- **Degraded:** Slow responses or partial failures — some content requests timeout but system partially functional
- **Lane isolation failure:** Wrong environment content served — critical for prod-stage/prod-load testing integrity

---

## Key Business Constraints

- Content must be served with low latency for guest-facing applications
- Lane isolation is critical — prod-stage content must never leak to prod consumers
- URL Friendly IDs must be unique per content item to avoid collision
- Analytics tags must pass through correctly for business reporting
