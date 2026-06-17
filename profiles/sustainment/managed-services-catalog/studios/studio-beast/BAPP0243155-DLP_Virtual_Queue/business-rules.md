# Business Rules — DLP Virtual Queue

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Standard (single activity) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | operations-virtual-queue-provider |
| Error rate | Monitored via Splunk | VQ ERRORS + BOOKING_ERRORS dashboards |

## Pre-conditions

- Guest must have a ticket linked to their account
- Ticket must have **inPark** status to join a VQ
- Only available in the Mobile App
- Dated ticket with arrival date matching validation date

## Business Rules

- Max 5 reservations per day with the same ticket
- Each booking is linked to the guest's entry-park ticket
- Guest selects HTC activity → picks a character (queue) → selects time slot (wave)
- VQ creates a booking for that time slot
- Booking can be cancelled

## Capabilities

- Get all available queues and waves per queue
- Book a wave inside a specific queue
- Get all bookings per guest
- Get a specific booking per guest
- Cancel the booking of a guest

## Dependencies

### Beast Scope (Internal)
- **Tickets Linking Service (BAPP0203964)** — retrieves park entry tickets per SWID
- **Guest Extended Profile (BAPP0177719)** — stores Lineberty userId for each SWID

### External
- **Lineberty** — external SAAS that issues and manages passes for virtual queues
- **Airship** — external SAAS for sending notifications
- **In-Park** — validates guest is physically in the park

## Impact Classification

- **Full outage:** Guests cannot access HTC activity (impact limited to this activity only)
- **Lineberty down:** Cannot issue/manage VQ passes
- **TLS certificate issue:** Lineberty cannot communicate with /notifications endpoint
