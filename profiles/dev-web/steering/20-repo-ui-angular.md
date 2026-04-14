---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.html", "**/*.scss", "**/*.spec.ts", "angular.json", "package.json"]
---

# UI (Angular) steering — wdpr-payment-controls-client

## Architecture
- Prefer reactive forms; keep components thin.
- Business logic belongs in services/facades; components coordinate.
- Avoid tightly coupling UI to backend fields: tolerate missing fields and default safely.

## Export UX guidance
- Bubble messages should reflect report type and filters (inactive included, etc.).
- Prefer progress indicators derived from server-provided progress when available.
- If no true progress exists: show staged messaging (queued → generating → finalizing).

## Testing
- Update unit tests for new UI logic and contracts.
- Prefer stable selectors and predicate-based request matching in interceptors/tests.

## Do not
- Do not introduce breaking changes to shared API models used across layers.
