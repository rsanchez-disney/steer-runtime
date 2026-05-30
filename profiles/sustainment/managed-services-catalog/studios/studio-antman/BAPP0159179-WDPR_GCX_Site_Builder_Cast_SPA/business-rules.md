# Business Rules — GCX Site Builder Cast SPA

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Page load time | < 3s | First contentful paint |
| Error rate | < 0.5% | Client-side errors / page views |

## Peak Periods

- High-traffic periods on Cast Member portals
- Content publishing campaigns (park events, seasonal updates)
- New Cast Member onboarding periods
- Park opening seasons

## Business Logic

- Cast Portals SPA is the frontend web application for the Cast Portals platform
- Part of the D-Scribe/ECM content ecosystem — serves content-driven pages
- Built with Node 20.11.1 and Spring Boot
- Communicates with Cast Portals WebAPI (BAPP0159199) for backend data
- Content sourced from D-Scribe content pipeline (Assembler → Transformer → S3)

## Dependencies

- **Upstream:** Cast Portals WebAPI (BAPP0159199) — backend data source
- **Downstream:** End users (Cast Members)
- **Content:** D-Scribe content from S3 buckets (d-scribe-content-live)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Cast Members cannot access the Cast Portals web application
- **Degraded:** Slow page loads or partial functionality; content may be stale
