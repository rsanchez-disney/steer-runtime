# Business Rules — DLP DGE API.MAPS Services

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | ECS service healthy + API Gateway responding |
| Response time (p95) | < 2s | Direction request round-trip (proxy → GCP → response) |
| Error rate | < 1% | HTTP 5xx responses |

## Peak Periods

- Park opening hours (08:00–23:00 CET) — highest wayfinding traffic
- Morning rush (08:00–10:00 CET) — guests navigating to attractions
- Event days (parades, shows) — spike in direction requests

## Business Logic

- Provides interactive park map with GPS-based location relative to attractions, restaurants, and shops
- Displays real-time wait times, show schedules, and nearby services when location services + connectivity enabled
- Users can switch between Map and List views to browse locations visually or as sortable list
- Tapping a location opens its detail page (reservations, show information)
- Preloaded maps work offline; live data (wait times, schedule updates) requires internet
- Location services and internet access (mobile data or Wi-Fi) must be enabled for live updates
- Service acts as API proxy — forwards direction requests to GCP Directions API, preventing direct third-party access to Google API keys
- Previously handled client-side; moved to backend for security (API key protection)

## Dependencies

- **Google Cloud Platform (GCP)** — Directions API providing wayfinding/routing data
- **DLP Mobile App** — Frontend consumer of map/direction data
- **Tridion CMS** — Category configuration (wait times, Single Rider tags, location details)
- **AWS API Gateway** — Fronts the ECS service (prod: vrddtebvrl)

## Impact Classification

- **Full outage:** Guests unable to navigate and see directions from one location to another in the park map.
- **Degraded:** Slow direction responses, stale wait times, map loads without live updates. Preloaded maps still functional.
