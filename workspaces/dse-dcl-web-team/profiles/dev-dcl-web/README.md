# Dev DCL Web Profile

**Angular UI specialist for all DCL Web SPAs and shared component libraries**

Consolidated profile covering Booking, PostBooking, and Marketing domains.

## Agents (1)

### dev-dcl-web

Angular specialist for all DCL Web Angular applications — Booking/Checkout, PostBooking (My Reservations, Online Check-in), Marketing (Cruise 101, Explore), and shared component libraries.

**Repos covered:**

| Domain          | Repo                                | Angular | Pattern                              |
| --------------- | ----------------------------------- | ------- | ------------------------------------ |
| **Booking**     | dcl-apps-checkout-ui                | 18.2    | Standalone + @ngrx/signals + OpenAPI |
| **Booking**     | dcl-apps-cruise-booking-mr          | 18.0    | NgModule host, lazy-loads library    |
| **PostBooking** | dcl-post-booking-ui                 | 18.2    | NgModule host shell                  |
| **PostBooking** | dcl-post-booking-mr                 | 18.2    | NgModule + BehaviorSubject library   |
| **PostBooking** | dcl-apps-online-checkin-spa         | 18.0    | Standalone + @ngrx/signals           |
| **Marketing**   | dcl-cruise-101-spa                  | 18.2    | Hybrid module+standalone, signals    |
| **Marketing**   | dcl-ui-global-components-library-v2 | 18.0    | 80+ components, ng-packagr           |
| **Legacy**      | dcl-apps-productavail-spa           | 15.1    | NgModule                             |
| **Legacy**      | dcl-apps-sailingavailability-spa    | 15.1    | NgModule                             |
| **Legacy**      | dcl-apps-explore-spa                | 15.1    | NgModule                             |
| **Legacy**      | dcl-apps-activities-spa             | 15.1    | NgModule                             |
| **Legacy**      | dcl-ui-components-library           | 15.1    | NgModule                             |

## Quick Start

```bash
koda install dev-dcl-web
kiro-cli chat --agent dev-dcl-web
> "Add a payment method selector with @ngrx/signals composable store feature"
> "Add a new stateroom comparison component to the shared library"
> "Add a guest card component to the online-checkin app"
```

## Design Philosophy

This profile is **generic** — it detects which repo you're working in by component prefix and applies the correct patterns automatically:

- `dcl-checkout` prefix → Checkout UI library patterns
- `booking` prefix → Cruise Booking host shell patterns
- `myres` prefix → PostBooking MR library patterns
- `online-checkin` prefix → Online Check-in standalone patterns
- `cruise101` prefix → Cruise 101 SPA patterns
- `dcl-ui-global` prefix → Shared component library patterns

Repo-specific details (learned rules, project structure, etc.) should live in each repo's `.kiro/` directory, not here.

**Profile Version:** 2.0 | **Agents:** 1 | **Last Updated:** May 5, 2026
