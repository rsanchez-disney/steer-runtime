# Business Rules — WDPRD Preference Admin

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate | Not documented in Confluence Cloud | |

## Peak Periods

- Not documented in Confluence Cloud

## Business Logic

- Internal Cast Member tool for managing guest preferences
- Not guest-facing — no direct guest impact if service fails
- Angular 18 frontend application
- Backend powered by Preference Service (BAPP0170520)
- Cast Member authentication via OneID

## Dependencies

- Preference Service (BAPP0170520) — backend for all preference data operations
- OneID — Cast Member authentication

## Impact Classification

- **Full outage:** Cast Members cannot manage guest preferences through the admin tool. No guest-facing impact. LOW severity.
- **Degraded:** Slow loading or partial functionality in the admin interface.
