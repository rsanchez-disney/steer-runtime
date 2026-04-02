# Payment Sheet

> Extends [app-team](../app-team/) — inherits dev-core, qa, shared rules and context.

Guest-facing payment UI embedded in Disney apps (WDW, DLR, DCL, etc.) — card entry, Apple Pay, saved cards, gift cards.

## Repos

| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-payment-sheet | Angular parcel |
| BFF | wdpr-payment-sheet-api | Node.js |
| Backend | wdpr-payment-session | Java/Spring Boot |
| Backend | wdpr-payment-services | Java/Spring Boot |

## Setup

```bash
koda workspace apply app-payment-sheet
koda mcp-install
```
