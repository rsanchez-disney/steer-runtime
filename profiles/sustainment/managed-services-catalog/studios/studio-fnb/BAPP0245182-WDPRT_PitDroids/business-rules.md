# Business Rules — WDPRT PitDroids

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.5% | Internal tool — lower SLA than guest-facing |
| Response time (p95) | < 3s | Splunk |
| Error rate | < 2% | Splunk |

## Peak Periods

- During park operating hours when operations teams actively monitor services
- Critical during P1/P2 incidents affecting MOO/ROO/DiSCO

## Business Logic

- Internal tool for Tech/Operations teams (not guest-facing)
- Integrates with MOO, ROO, DiSCO, and VenueNext APIs
- Displays: menu feed status, wait times, printer status, geofences, location open/closed/yellow status
- Flutter mobile app + Java backend orchestration service

## Dependencies

- MOO (BAPP0089046), ROO (BAPP0205130/BAPP0205283), DiSCO (BAPP0170052/BAPP0215442)
- VenueNext APIs
- All upstream FNB services

## Impact Classification

- **Full outage:** Operations team loses visibility into service health. No guest impact but slower incident triage.
- **Degraded:** Partial data shown, some dashboards unavailable. Minor operational inconvenience.
