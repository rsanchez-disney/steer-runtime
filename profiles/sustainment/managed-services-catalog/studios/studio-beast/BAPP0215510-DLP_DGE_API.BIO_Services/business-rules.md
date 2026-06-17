# Business Rules — DLP DGE API.BIO Services

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (guest-facing) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | PROD_DLP_PAAP dashboards |
| Error rate | Monitored via Splunk | Per-service dashboards |

## Peak Periods

- Park operating hours — highest traffic for schedules and wait times
- Park opening (guests checking schedules) and peak ride hours (wait times)
- Seasonal events and holidays (increased park attendance)

## Business Logic

### BIO Schedules Provider
- Exposes opening schedules for activities across Disneyland Park and Walt Disney Studios Park
- Covers attractions, shows, shops, book dine restaurants, and Meet & Greet experiences
- Exception: HTC experience is NOT covered by this service

### BIO Wait Times Provider
- Calculates and publishes estimated waiting times for attractions
- **V1 API:** Standard wait times for all guests
- **V2 API:** Preferential wait times for Disney Premiere Access (DPA) guests

### BIO Attractions Downtime Publisher
- Tracks and communicates downtime periods (refurbishment, maintenance, temporary closures)
- Uses a cron job to pull events from EA System
- Organizationally part of DPA ONE BAPP

## Dependencies

- **BIO Database** — shared database for all 3 services (external, occasional connectivity intermittence)
- **BIO GUI Admin** — external admin interface for managing BIO data
- **EA System (Orion Services)** — source of downtime events for the Downtime Publisher

## Impact Classification

- **BIO Schedules down:** Guests cannot see accurate opening hours for parks and activities
- **BIO Wait Times down:** Guests cannot see attraction wait times, causing frustration
- **BIO Downtime down:** Guests may attempt to visit unavailable attractions, wasting time
- **BIO Database intermittence:** All three services may experience degraded performance
