# Payment Demo

> Extends [app-team](../README.md) — inherits dev-core, qa, shared rules and context.

Demo applications and payment infrastructure for E2E payment flow testing across web, Android, and iOS.

## Architecture

```mermaid
graph TD
    subgraph Clients
        WEB[Web Demo<br/>AngularJS :9000]
        AND[Android Demo<br/>Kotlin/Java]
        IOS[iOS Demo<br/>Swift]
    end

    subgraph Identity
        V4[Guest Controller<br/>authorization.go.com]
        V5[Identity SDK<br/>login-qa.disney.com]
    end

    subgraph Backend
        API[Demo API<br/>Node.js/Restify :8628]
        SHEET_API[Payment Sheet API<br/>Node.js :3000]
        SESSION[Payment Session<br/>Spring Boot :8080]
        CONFIG[Config Services<br/>Spring Boot :8080]
    end

    subgraph Infrastructure
        DB[(MariaDB)]
        REDIS[(Redis)]
        LOCALSTACK[LocalStack<br/>DynamoDB / S3]
    end

    subgraph Payment UI
        SHEET[Payment Sheet<br/>iframe]
    end

    WEB -->|POST /payment-sheet-hash| API
    AND -->|POST /payment-sheet-hash| API
    IOS -->|POST /payment-sheet-hash| API

    API -->|V4 auth| V4
    WEB -.->|V5 browser SDK| V5
    AND -.->|V5 native SDK| V5
    IOS -.->|V5 native SDK| V5

    API -->|Bearer token| SHEET_API
    SHEET_API -->|establish session| SESSION
    SESSION --> CONFIG
    SESSION --> DB
    SESSION --> REDIS
    CONFIG --> DB
    CONFIG --> LOCALSTACK

    API -->|sessionToken + HMAC| WEB
    API -->|sessionToken + HMAC| AND
    API -->|sessionToken + HMAC| IOS

    WEB --> SHEET
    AND --> SHEET
    IOS --> SHEET
```

## Repos

| Layer | Repo | Tech |
|-------|------|------|
| Web Demo UI | wdpr-payment-demo | AngularJS SPA |
| Web Demo API | wdpr-payment-demo-api | Node.js (Restify) |
| Payment Sheet UI | wdpr-payment-sheet | Embedded iframe/fragment |
| Payment Sheet API | wdpr-payment-sheet-api | Node.js |
| Session Service | wdpr-payment-session | Java/Spring Boot |
| Config Services | wdpr-config-services | Java/Spring Boot |
| Shared Lib | wdpr-payments-ref | Java |
| Android Demo | dpay-android-ui | Kotlin/Java (Android) |
| iOS Demo | dpayios | Swift (iOS) |

## Setup

```bash
koda workspace apply app-demo
```

## Key Flows

```
Web:     Demo UI → Demo API → Payment Sheet API → Session Service
Android: TestPage → Demo API → Payment Sheet API → Session Service
iOS:     Demo UI → Demo API → Payment Sheet API → Session Service
```

## Environments

| App | Latest | Stage |
|-----|--------|-------|
| Demo App | https://latest.commerceplatforms.wdprapps.disney.com | https://stage.commerceplatforms.wdprapps.disney.com |
| Payment Sheet | https://latest.paymentsheet.wdprapps.disney.com | https://stage.paymentsheet.wdprapps.disney.com |

## Identity V5

| Platform | SDK | Notes |
|----------|-----|-------|
| Web | Identity Web SDK (cdn-qa.disneyaccount.com/v5/sdk.js) | Browser-side redirect |
| Android | Identity SDK Android 5.x (Artifactory) | Native, `launchIdentityFlow()` |
| iOS | Identity SDK iOS 5.x (SPM) | Native, `launchIdentityFlow()` |
| B2B | AuthZ client_credentials | Unchanged, server-to-server only |

## Jira

- **Prefix:** DPAY-
- **Board:** https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=4498
