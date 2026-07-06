# Studio Anglerfish — iOS Architecture Guide

## Overview

Studio Anglerfish builds and maintains the iOS native layer for guest-facing mobile ordering, dine check-in, and merchandise checkout experiences across Walt Disney World (WDW) and Disneyland Resort (DLR).

## Domain Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    iOS App (Studio Anglerfish)                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Features (studio-anglerfish org)                            │ │
│  │  • Mobile Order — Browse, cart, payment, pickup              │ │
│  │  • Dine Check-in — Check-in reservations (seats, allergies)  │ │
│  │  • Park App — Maps, wait times, park info                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Platform (wdpro-mobile org)                                 │ │
│  │  • Networking layer (MDX API client)                         │ │
│  │  • Authentication (Disney CAS / MyID)                        │ │
│  │  • Analytics (New Relic, Adobe)                              │ │
│  │  • Core utilities and extensions                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services (Studio Lumiere)              │
│  MOO · DiSCO · Arrival Windows · Pay at Table                    │
│  VenueNext · APP (Payments) · MDX                                │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Patterns

Each repo uses a slightly different variant. See `context/repos/` for per-repo details.

| Repo              | Pattern                         | Navigation                       |
|-------------------|---------------------------------|----------------------------------|
| wdpr-dine-opp     | Modified VIPER + MVVM (SwiftUI) | Wireframes                       |
| wdpr-dine-checkin | Flexible VIPER-inspired         | Wireframes + Builders            |
| Scan-and-Go       | MVVM + Wireframe                | Routers (preferred) + Wireframes |
| fnb-shared        | Library (no UI architecture)    | N/A                              |

### Dependency Injection

- **Constructor injection** preferred across all repos
- Protocol-based DI for testability
- Each repo has its own DI container (see repo-specific docs for details)

## Coding Conventions

- **Language**: Swift 5.9+ for new code, Objective-C for legacy interop
- **Min deployment target**: iOS 16.0
- **UI framework**: SwiftUI (new screens), UIKit (existing/complex)
- **Naming**: camelCase properties/methods, PascalCase types
- **Access control**: `private` for implementation details
- **Documentation**: `///` doc comments on all public APIs
- **Error handling**: Typed errors with `enum` conforming to `Error`

## Code Reuse

> **Always check `FNBShared` first** before implementing new utilities, networking, location, logging, or UI helpers. If the functionality exists in `fnb-shared`, use it. If it could benefit multiple apps, add it to `fnb-shared` rather than a single repo.

See `context/repo-fnb-shared.md` for what the library provides.

## Key Dependencies

| Library               | Purpose                                        |
|-----------------------|------------------------------------------------|
| Swift Package Manager | All dependency management (platform + feature) |
| swift-format          | Code formatting                                |
| New Relic             | Performance monitoring                         |
| Adobe Analytics       | User analytics                                 |
| Charles (Mockingbird) | API mocking during development                 |

## Communication

### Slack Channels
- `#dine-mobile-tech-moo` — Mobile dine general discussion
- `#dine-mobile-design` — Creative design reviews
- `#dine-mobile-private` — Private: tech and QA

### Resources
- Mockingbird collections (Charles) for API mocking
- TestFlight for build distribution
- New Relic Dashboard for FNB
- Shared calendar with Studio Proteus

## Jira

- **Project**: FNB (Food & Beverage)
- **Instance**: disneyexperiences.atlassian.net
- **Components**: MOO, Mobile Order, Dine Check-in
- **Sprint board**: FBT board
