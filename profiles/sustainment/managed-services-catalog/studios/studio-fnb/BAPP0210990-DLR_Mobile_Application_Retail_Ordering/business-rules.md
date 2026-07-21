# Business Rules — DLR Mobile Application Retail Ordering

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free rate | > 99.5% | New Relic |
| App responsiveness | < 2s screen load | New Relic |

## Peak Periods

- DLR park hours, weekends, merchandise release events

## Business Logic

- Native iOS/Android module within the Disneyland app for merchandise mobile checkout
- Guest-facing interface for scanning items, viewing cart, completing purchase
- Communicates with ROO backend (BAPP0205283)

## Dependencies

- ROO backend service (BAPP0205283)
- DLR app shell (Shield team)

## Impact Classification

- **Full outage:** Guests cannot use mobile merchandise checkout at DLR. Must use physical registers.
- **Degraded:** Slow loading, scanning issues.
