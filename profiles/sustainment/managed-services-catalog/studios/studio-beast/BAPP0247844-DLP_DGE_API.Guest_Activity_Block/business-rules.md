# Business Rules — DLP DGE API.Guest Activity Block

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | ECS service healthy |
| Response time (p95) | < 500ms | Lock status check endpoint |
| Error rate | < 1% | HTTP 5xx responses |

## Peak Periods

- Ticket purchase/linking spikes (seasonal sales, promotions)
- Park entry hours — guests linking tickets before arrival
- Fraud attack attempts (unpredictable)

## Business Logic

### Blocking Rules — Production
- **Short Block:** 10 failures in 1 hour → blocked for 1 hour
- **Long Block:** 3 short blocks in 1 month → blocked for 3 months

### Blocking Rules — Lower Environments (Stage/Load/Latest)
- **Short Block:** 10 failures in 15 minutes → blocked for 15 minutes
- **Long Block:** 3 short blocks in 1 month → blocked for 20 minutes

### Preconditions
- Guest must be signed in
- Guest must have purchased a ticket or package

### Architecture Flow
1. Client library (integrated in ticket-linking and package-digital providers) uses `OncePerRequestFilter`
2. Filter triggered when guest executes configured endpoints that fail 10+ times
3. Library calls `/lock/status` endpoint to check if guest is already blocked
4. Library publishes activity message to RabbitMQ (exchange: `GPE.GUESTEVENT.DIS.GAB`)
5. Provider consumes RabbitMQ messages and stores in DocumentDB
6. Provider determines when to block guests based on accumulated failure data

### Routing Keys
- `TICKET.LINKING.GUEST.ACTIVITY.BLOCK` — ticket linking failures
- `PACKAGE.PROVIDER.GUEST.ACTIVITY.BLOCK` — package retrieval failures

## Dependencies

- **RabbitMQ** — Event messaging between client library and provider (exchange: GPE.GUESTEVENT.DIS.GAB)
- **AWS DocumentDB** — MongoDB-compatible database storing guest activity records and block status
- **OneID** — Guest identity
- **Ticket Linking Provider** — Consumer of client library
- **Package Digital Provider** — Consumer of client library
- **ARS Team** — Consumer of client library
- **Ecom Website / Accenture** — Source of package events

## Impact Classification

- **Full outage:** Unable to determine if guests exhibit suspicious behavior. Guests may encounter difficulties linking tickets or packages. Fraud protection disabled.
- **Degraded:** Delayed blocking (RabbitMQ backlog), or false positives if DocumentDB returns stale data.
