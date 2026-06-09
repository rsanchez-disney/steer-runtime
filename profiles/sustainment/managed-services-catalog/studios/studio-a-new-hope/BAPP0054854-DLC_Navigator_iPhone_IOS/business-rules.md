# Business Rules — DLC Navigator iPhone (IOS)

## KPIs & Targets

| Metric | Target | Scope |
|--------|--------|-------|
| Crash Rate | < 0.5% | Total (per platform) |
| Guest Experience Crash | < 1% | Total (per platform) |
| Crash Rate | < 0.5% | At Home |
| Guest Experience Crash | < 1% | At Home |
| Crash Rate | < 0.5% | Onboard |
| Guest Experience Crash | < 1% | Onboard |

**Release Follow-up Dashboard:** https://onenr.io/0LwGr54YzQ6

## Peak Periods

- **Embarkation days** — highest usage as all guests install the app and attempt to log in simultaneously

## Business Logic

- The app operates in 2 modes: **At Home** (pre-cruise) and **Onboard** (during the cruise)
- Content is ship-specific and voyage-specific
- Full feature documentation: https://mywiki.disney.com/pages/viewpage.action?pageId=481990113&spaceKey=DCLMGET&title=DCLM%2BTech%2BRunbooks

## Dependencies

- Full list of backend services: https://mywiki.disney.com/spaces/DCLMGET/pages/1325305850/Onboard+Environments

## Impact Classification

- **Full outage:** Guests cannot access ship information, itineraries, or onboard services
- **Degraded:** Some features unavailable but core navigation works
