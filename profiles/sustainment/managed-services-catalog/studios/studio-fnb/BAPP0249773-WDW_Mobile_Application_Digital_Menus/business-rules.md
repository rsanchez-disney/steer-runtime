# Business Rules — WDW Mobile Application Digital Menus

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Crash-free rate | > 99.5% | New Relic |
| App responsiveness | < 2s screen load | New Relic |

## Peak Periods

- During meal planning times and at restaurants

## Business Logic

- Native iOS/Android module for viewing digital dining menus in WDW MDX app
- Consumes Dining Menu Service (BAPP0089587) for data
- Displays items, prices, allergens, meal periods

## Dependencies

- Dining Menu Service backend (BAPP0089587)
- MDX app shell (Shield team)

## Impact Classification

- **Full outage:** Guests cannot view menus in WDW app. Minor impact — can use website or physical menus.
- **Degraded:** Slow loading, stale data.
