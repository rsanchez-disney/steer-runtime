# Business Rules — WDW Mobile Application Retail Ordering

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free rate | > 99.5% | New Relic |
| App responsiveness | < 2s screen load | New Relic |

## Peak Periods

- WDW park hours, especially evenings and merchandise release events

## Business Logic

- Native iOS/Android module within the MDX app for merchandise mobile checkout
- Guest-facing interface for scanning items, viewing cart, and completing purchase
- Communicates with ROO backend (BAPP0205130)

## Dependencies

- ROO backend service (BAPP0205130)
- MDX app shell (Shield team)

## Impact Classification

- **Full outage:** Guests cannot use mobile merchandise checkout at WDW. Must use physical registers.
- **Degraded:** Slow loading, scanning issues.
