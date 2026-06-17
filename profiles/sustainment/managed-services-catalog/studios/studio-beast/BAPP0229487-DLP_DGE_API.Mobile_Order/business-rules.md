# Business Rules — DLP DGE API.Mobile Order

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (guest-facing) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | PROD_DLP_PAAP dashboard |
| Error rate | Monitored via Splunk | wdpr-dlp-is-sales-iod-food-order-provider_ERRORS |

## Peak Periods

- Lunch hours (11:30–14:00) and dinner hours (18:00–21:00) — highest order volume
- Park peak days (weekends, holidays, special events)

## Business Logic

- Guest can reserve a table up to 2 months in advance (12 months for Disney Hotel Guests)
- Click & Collect pick-up timeslots are for the same day only
- Casa de Coco restaurant has no timeslots — guest has 4 hours to pick up, otherwise order is purged in Agilysys
- Cache TTL is 20 minutes — if guest takes longer to purchase, the session fails
- Guest must click "I am here" CTA (in profile wallet) to trigger kitchen preparation
- Counter value from Agilysys: "Counter [Number] [Restaurant]" — only the number is shown to guest
- OneID screen appears before payment (before guest form), not at start of journey

## Order Flow

1. Entry Points (restaurant selection)
2. Selecting Order (menu browsing)
3. Cart (add/remove items)
4. Checkout (OneID → guest form → payment)
5. Confirmation Screen
6. Confirmation Email
7. Pick-up ("I am here" CTA triggers kitchen preparation)

## Dependencies

- **Agilysys OnDemand** — menus, timeslots, kitchen preparation, order fulfillment
- **MPG / WorldPay** — payment processing (migrated from OnPaie, Dec 2024)
- **Redis** — session/order data cache (20 min TTL)
- **Notification Service** — confirmation emails
- **RabbitMQ** — async payment notification from MPG (~15 min after confirmation)

## Impact Classification

- **Full outage:** Provider down → guests cannot order food via mobile app
- **Degraded:** MPG/WorldPay down → guests cannot complete payment; Agilysys slow → degraded browsing experience
- **Mitigation:** DFM can disable Click & Collect entirely or per-restaurant
