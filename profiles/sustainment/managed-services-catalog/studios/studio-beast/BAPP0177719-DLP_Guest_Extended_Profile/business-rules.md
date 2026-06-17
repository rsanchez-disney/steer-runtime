# Business Rules — DLP Guest Extended Profile

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (guest-facing API) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | PROD_DLP_BAPP0177719 dashboard |
| Error rate | Monitored via Splunk | wdpr-dlp-is-guest-extended-profile-provider |

## Peak Periods

- Park operating hours — highest API traffic for guest profile data
- OLCI check-in periods — consent extraction spikes
- Daily morning — GEP Consent Cleaner Lambda scheduled execution

## Business Logic

### Extended Profile Provider (ECS)
- Stores guest-specific data NOT managed by OneID IAM
- Exposes: External IDs, Liberty ID, Golden Question, Consent API, Avatar API
- Public API exposed through AWS API Gateway
- Priority: External IDs / Liberty ID → P2

### CI Consent Extractor (Batch)
- Extracts OLCI opt-ins and deleted OneID accounts
- Publishes extracted data to S3 bucket
- Depends on MariaDB and RabbitMQ
- **Known issue:** Files missing or shorter than expected if RabbitMQ cluster is down

### GEP Consent Cleaner (Lambda)
- Scheduled daily (every morning)
- Calls Extended Profile API to find and delete already-processed OLCI opt-ins and deleted accounts
- URL invoker lambda — no business logic, just triggers the purge endpoint

### Guest Purge Extractor (Batch)
- Identifies OneID accounts inactive for more than 2 years
- Marks them for deletion by the Purge Processor
- GDPR compliance requirement

### OID Guest Purge Processor (ECS)
- Internal API that deletes all OneID account data from DLP databases
- Triggered by Purge Extractor results or CNS events
- Uses RabbitMQ for event processing

## Dependencies

- **MariaDB (dlp-profile-mariadb-prod)** — primary database for all profile data
- **RabbitMQ** — message broker for event-driven processing
- **AWS S3** — consent export bucket
- **OneID IAM** — identity source (external)
- **CNS** — event source for purge triggers

## Impact Classification

- **Extended Profile Provider down:** Guests cannot access profile data, External IDs, consents, avatars (P2)
- **CI Consent Extractor failure:** Consent data not exported (compliance risk)
- **GEP Consent Cleaner failure:** Stale consent data accumulates in DB
- **Purge Extractor/Processor failure:** Inactive accounts not purged (GDPR compliance risk)
- **RabbitMQ down:** CI Consent Extractor files missing/short, Purge Processor events not received
