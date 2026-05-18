# Payment Demo

> Extends [app-team](../app-team/) — inherits dev-core, qa, shared rules and context.

Demo applications and payment infrastructure for E2E payment flow testing across web, Android, and iOS.

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
koda mcp-install
```

## Key Flows

```
Web:     Demo UI → Demo API → Payment Sheet API → Session Service
Android: TestPage → Demo API (or Identity SDK V5) → Payment Sheet API → Session Service
iOS:     Demo UI → Demo API (or Identity SDK V5) → Payment Sheet API → Session Service
```

## Identity V5

- Web: Identity Web SDK (browser-side, cdn-qa.disneyaccount.com/v5/sdk.js)
- Android: Identity SDK Android 5.x (native, from Artifactory)
- iOS: Identity SDK iOS 5.x (native, via SPM)
- B2B tokens: Unchanged (AuthZ, server-to-server only)

See [deployments.md](../deployments.md) for environment URLs and version checks.
