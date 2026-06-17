# Business Rules — DLP DGE API.Magic Mobile Ticket Meal Plan

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | ECS service healthy |
| Response time (p95) | < 2s | MagicPass retrieval endpoints |
| Error rate | < 1% | HTTP 5xx responses |

## Peak Periods

- 7 days before guest arrival — MagicPass becomes available for access
- Park opening hours (08:00–23:00 CET) — guests using QR codes for entry and meals
- Check-in periods — guests retrieving MagicPass for first time

## Business Logic

- Digital MagicPass accessible in DLP app (and Apple Wallet on iPhone) up to 7 days before arrival
- Every person in a Disney Hotel + Ticket booking older than 3 years receives a named MagicPass
- Meal Plan digital card provides QR code for:
  - Restaurant access (pre-configured meal reservation plan)
  - Park parking lot access
  - General park admission
- MagicPass can be blocked/unblocked via Opera (Hotel PMS) by toggling Magic Mobile ON/OFF
- When MagicPass is blocked:
  - Blocked flag displayed on "Your MP" module
  - Pop-in appears when guest taps module or "Discover your MagicPass" CTA
  - Access to MP Detail page is blocked
- When MagicPass is unblocked: page refresh removes fraud flag and restores access
- Executive Floor (EF) flag appears when guest has breakfast meal or special room type (e.g., deluxe suite)
- Walk-over (W/O) indicates hotel change — must be updated via BMACS
- Room Only bookings (Disneyland Pass holders) also get MagicPass

## Dependencies

- **Opera (Hotel PMS)** — Source of truth for MagicPass status (block/unblock), room assignment
- **BMACS** — Booking management for reservation data, hotel changes (W/O)
- **DLP Mobile App** — Frontend consumer displaying MagicPass and Meal Plan cards
- **Apple Wallet** — Integration for iPhone users

## Impact Classification

- **Full outage:** Guests unable to access meal reservation plan, park/parking entry via QR code, or view their MagicPass. Must resort to physical alternatives at hotel desk.
- **Degraded:** Slow MagicPass retrieval, delayed status updates after hotel changes, stale block/unblock state.
