# Business Rules — DLR Mobile Application Mobile Order

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free rate | > 99.5% | New Relic |
| App responsiveness | < 2s screen load | New Relic |

## Peak Periods

- Meal times at DLR, weekends, holidays

## Business Logic

- Native iOS/Android module within the Disneyland app
- Guest-facing interface for browsing menus, placing orders, tracking status
- Communicates with MOO backend (BAPP0089046) for order orchestration
- Uses Canopy for feature flags and configurations

## Dependencies

- MOO backend service (BAPP0089046)
- Disneyland app shell (Shield team)
- New Relic (monitoring)

## Impact Classification

- **Full outage:** Guests cannot access Mobile Order feature in DLR app. Must order at physical POS.
- **Degraded:** Slow loading, UI glitches, partial feature availability.
