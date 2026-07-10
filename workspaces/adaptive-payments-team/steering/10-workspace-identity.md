---
inclusion: always
---

# Workspace identity — adaptive-payments-team

## What this workspace is

The Adaptive Payment Platform (APP) — Disney's payment processing, configuration, and commerce platform serving WDW, DLR, DCL, and DLP digital experiences.

## Architecture layers

```text
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Angular)                     │
│  payment-controls-client  │  payment-sheet  │  gcp-dgc   │
│  (Config Studio/PAP/TRP)  │  (Guest Payment)│  (Gift Card)│
├─────────────────────────────────────────────────────────┤
│                  BFF Layer (Node.js)                      │
│  payment-controls-api │ payment-sheet-api │ gcp-admin-api│
├─────────────────────────────────────────────────────────┤
│               Backend Layer (Java/Spring)                 │
│  config-services │ payment-services │ payment-session    │
│  app-inquiry-service │ gcp-admin-services │ gcp-batch    │
│  gcp-guest-services │ app-admin-service                  │
├─────────────────────────────────────────────────────────┤
│                Mobile (Kotlin / Swift)                    │
│           dpay-android-ui │ dpayios                       │
├─────────────────────────────────────────────────────────┤
│              Shared Libraries (Java)                      │
│  payments-ref │ payments-model │ gcp-common-components   │
│  app-common-keystore │ app-crypto-key-mgmt               │
└─────────────────────────────────────────────────────────┘
```

## Child workspaces

| Workspace              | Scope                                              |
|------------------------|----------------------------------------------------|
| app-config-studio      | Config Studio UI + WebAPI + Backend                |
| app-payment-sheet      | Payment Sheet guest experience + mobile SDKs       |
| app-demo               | Demo apps (web + mobile)                           |
| app-gift-card          | Gift card (GCP) platform                           |
| app-pap-trp            | PAP/TRP payment administration                     |
| app-payment-controls   | Payment Services core + event handlers             |
| app-infra              | Infrastructure, key management, crypto             |

## Conventions

- Jira prefixes: `DPAY-`, `GCP-`
- Branch naming: `feat/DPAY-{ticket}-{description}`, `fix/DPAY-{ticket}-{description}`
- Default branch: `develop` (most repos), `main` (newer repos)
- Deployment: Harness pipelines (dev auto-deploy, stage manual, prod 2 approvals)
- Code review: 4-hour SLA, 1 senior approval minimum

## Working directory

All repos: `~/Workspace/Disney/DisneyPaymentsOrg/`
