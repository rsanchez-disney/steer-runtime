# Adaptive Payment Platform (APP) — Team Context

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Angular)                     │
│  payment-controls-client  │  payment-sheet  │  gcp-dgc   │
│  (Config Studio/PAP/TRP)  │  (Guest Payment)│  (Gift Card)│
├─────────────────────────────────────────────────────────┤
│                  BFF Layer (Node.js)                      │
│  payment-controls-api │ payment-sheet-api │ gcp-admin-api│
│  dpay-admin-inquiry-webapi (legacy)                      │
├─────────────────────────────────────────────────────────┤
│               Backend Layer (Java/Spring)                 │
│  config-services │ payment-services │ payment-session    │
│  app-inquiry-service │ gcp-admin-services │ gcp-batch    │
│  gcp-guest-services │ app-admin-service                  │
├─────────────────────────────────────────────────────────┤
│              Shared Libraries (Java)                      │
│  payments-ref │ payments-model │ gcp-common-components   │
│  app-common-keystore │ app-crypto-key-mgmt               │
└─────────────────────────────────────────────────────────┘
```

## Team Standards

### Code Review
- PRs reviewed within 4 business hours
- At least 1 approval required from senior dev

### Branch Naming
- Feature: `feat/DPAY-{ticket}-{short-description}`
- Bugfix: `fix/DPAY-{ticket}-{short-description}`
- Hotfix: `hotfix/DPAY-{ticket}-{short-description}`

### Deployment
- Dev: auto-deploy on merge to `develop`
- Stage: manual trigger via Harness
- Prod: requires 2 approvals + QA sign-off

## Tech Stack
- **UI**: Angular (all frontends share wdpr-payment-controls-client monorepo for Config Studio, PAP, TRP)
- **BFF/WebAPI**: Node.js (Restify)
- **Backend**: Java 17 / Spring Boot
- **Shared Libs**: wdpr-payments-ref (JavaUtil, ObjectMapper, caching, audit), wdpr-payments-model (DTOs, enums)
- **CI/CD**: Harness
- **Source**: GitHub Enterprise (github.disney.com)

## Sub-Teams
- **Config Studio** — Client configuration management (config-services, controls-api, controls-client)
- **Payment Sheet** — Guest-facing payment UI (payment-sheet, payment-sheet-api, payment-session)
- **PAP/TRP** — Batch processing & transaction research (payment-services, inquiry-service)
- **Gift Card** — Gift card platform (gcp-dgc, gcp-admin, gcp-services)
- **Infra** — Shared libraries, stream handlers, key management

## Jira Custom Fields

Field IDs differ per Jira instance. Configure `JIRA_CUSTOM_FIELDS_{instance}` in `tokens.env`:

| Instance | Field | Field ID | tokens.env key |
|----------|-------|----------|----------------|
| myjira | Story Points | `customfield_10003` | `JIRA_CUSTOM_FIELDS_myjira=customfield_10003` |
| jira | Story Points | `customfield_10106` | `JIRA_CUSTOM_FIELDS_jira=customfield_10106` |