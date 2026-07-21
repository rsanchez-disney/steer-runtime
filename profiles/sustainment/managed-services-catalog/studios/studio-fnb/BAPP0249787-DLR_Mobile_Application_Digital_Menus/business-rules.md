# Business Rules — DLR Mobile Application Digital Menus

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free rate | > 99.5% | New Relic |
| App responsiveness | < 2s screen load | New Relic |

## Peak Periods

- During meal planning times and at restaurants

## Business Logic

- Native iOS/Android module for viewing digital dining menus in DLR app
- Consumes Dining Menu Service (BAPP0089587) for data

## Dependencies

- Dining Menu Service backend (BAPP0089587)
- DLR app shell (Shield team)

## Impact Classification

- **Full outage:** Guests cannot view menus in DLR app. Minor impact.
- **Degraded:** Slow loading, stale data.
