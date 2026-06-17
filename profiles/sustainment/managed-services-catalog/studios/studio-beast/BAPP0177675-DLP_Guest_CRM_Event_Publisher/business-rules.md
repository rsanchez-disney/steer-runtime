# Business Rules — DLP Guest CRM Event Publisher

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Standard (non-guest-facing) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | PROD_DLP_PAAP_GUEST-PROFILE |
| Error rate | Monitored via Splunk | DLP - Guest Profile CRM Event Publisher |

## Peak Periods

- Continuous processing — events arrive 24/7
- Higher volume during park operating hours (account activity, bookings, consent changes)

## Business Logic

- AMQP Listener continuously receives messages from the CRM Event Queue
- Transforms each message into a CRM Event format
- Pushes resulting CRM Events to a special AMQP CRM Queue for Salesforce consumption
- Event types: account creation/update/deletion, consent opt-in/opt-out, package/ticket retrieval

## Event Sources

- **Keyring** — ticket and pass events
- **Guest Extended Profile Provider** — profile and consent events
- **Travelbox** — booking events
- **Google Cloud** — account events (OneID)

## Dependencies

- **RabbitMQ** — primary dependency, message broker for all event processing
- **Salesforce** — downstream consumer of CRM events
- **Keyring (BAPP0177699)** — event source
- **Guest Extended Profile (BAPP0177719)** — event source

## Impact Classification

- **No guest impact** — CRM integration is not guest-facing, won't cause P2s
- **Full outage:** Events not delivered to Salesforce, CRM data becomes stale
- **RabbitMQ down:** All event processing stops
- **Degraded:** Specific event types not processing (depends on upstream source)
