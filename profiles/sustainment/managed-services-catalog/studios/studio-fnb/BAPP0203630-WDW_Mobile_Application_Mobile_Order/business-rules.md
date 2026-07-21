# Business Rules — WDW Mobile Application Mobile Order

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free rate | > 99.5% | New Relic |
| App responsiveness | < 2s screen load | New Relic |

## Peak Periods

- Meal times at WDW, holidays, special events

## Business Logic

- Native iOS/Android module within the My Disney Experience app
- Guest-facing interface for browsing menus, placing orders, tracking status
- Communicates with MOO backend (BAPP0089046) for order orchestration
- Uses Canopy for feature flags and configurations

## Dependencies

- MOO backend service (BAPP0089046)
- MDX app shell (Shield team)
- New Relic (monitoring)

## Impact Classification

- **Full outage:** Guests cannot access Mobile Order feature in WDW app. Must order at physical POS.
- **Degraded:** Slow loading, UI glitches, partial feature availability.
