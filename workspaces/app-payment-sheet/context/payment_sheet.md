# Payment Sheet Context

Guest-facing payment UI embedded in Disney apps (WDW, DLR, DCL, etc.).

## Repos & Layers
| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-payment-sheet | Angular parcel — card entry, Apple Pay, saved cards, gift cards |
| BFF | wdpr-payment-sheet-api | Node.js — session management, tokenization proxy |
| Backend | wdpr-payment-session | Java/Spring Boot — session establish, payment method management |
| Backend | wdpr-payment-services | Java/Spring Boot — core payment processing (auth, settlement, refund) |

## Key Flows
- Payment session lifecycle (establish → collect → authorize → settle)
- Card tokenization via payment-sheet-api
- Apple Pay / Google Pay integration
- Saved payment methods and gift card redemption
