# Business Rules — DLP OLCI

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Healthcheck monitoring |
| Response time (p95) | < 2s | Splunk latency SPL |
| Error rate | < 1% | Splunk error rate |

## Peak Periods

- Days before hotel check-in dates (guests complete forms in advance)
- High hotel occupancy periods (school holidays, peak season)

## Business Logic

### Online Check-In Flow
- Guest fills out registration form via mobile app
- PMS Registration Form Provider obtains reservation package info and manages police registration forms via DocuSign
- For non-French guests: registration form data sent to DocuSign for electronic signature
- DocuSign sends email to adults to complete the registration form
- After confirmation, guest receives confirmation email and can view status in mobile app

### DocuSign Purge Rules
- **Validated signature** (police-form signed in time): Purge all data 6 months after departure date
- **Expired signature** (police-form not signed in time or reset after signature): Purge all data at arrival date

### Opera Business Events
- OLCI Business Event Processor retrieves reservation changes from Opera Business Events
- Resets police forms when needed, feeding data to PMS Registration Form Provider
- Fallback: PMS Registration Form Provider can get reservations directly from Opera or via Package Digital Provider

## Dependencies

### Internal
- **Opera PMS** — reservation data source (via OHIP integration)
- **Package Digital Provider** — alternative reservation data flow

### External
- **DocuSign** — electronic signature service for police registration forms
- **Opera Business Events** — reservation change notifications

## Impact Classification

- **Full outage:** Guests cannot complete online check-in via mobile app. Must check in person at hotel reception, causing long lines and wait times.
- **Degraded (PMS Registration Form Provider):** Police registration errors, outdated reservation info, check-in delays.
- **Degraded (Business Event Processor):** Latest reservation changes not reflected, but PMS can still get data directly from Opera.
- **Degraded (DocuSign Purge Processor):** Completed forms remain visible to guests, online check-in shows as pending, causing confusion.
