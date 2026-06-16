# Payment Demo Context

Demo applications for E2E payment flow testing — web, Android, and iOS.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Client Apps                                                  │
├──────────────┬──────────────────┬───────────────────────────┤
│ Web Demo     │ Android Demo     │ iOS Demo                  │
│ (AngularJS)  │ (dpay-android-ui)│ (dpayios)                 │
└──────┬───────┴────────┬─────────┴─────────┬─────────────────┘
       │                │                   │
       ▼                ▼                   ▼
┌──────────────────────────────────────────────────────────────┐
│ Payment Demo API (wdpr-payment-demo-api)                     │
│ Node.js / Restify — auth, HMAC, session orchestration        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Payment Sheet API (wdpr-payment-sheet-api)                   │
│ Node.js — session management, token validation               │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Payment Session (wdpr-payment-session)                        │
│ Java/Spring Boot — session persistence, transaction mgmt     │
└──────────────────────────────────────────────────────────────┘
```

## Repos & Key Files

### wdpr-payment-demo (Web Demo UI)
- Tech: AngularJS, Bower, Grunt
- Key: `payment-sheet.controller.js`, `sessionMgr.factory.js`, `payui-authorization-demo.directive.js`
- V5: Browser SDK flow (PR #121), CSP fix (PR #123)

### wdpr-payment-demo-api (Web Demo API)
- Tech: Node.js, Restify, Bluebird
- Key: `base-request.js` (auth flows), `session-manager.actions.js` (HMAC), config files
- V5: 4-step OIDC (PR #58) — superseded by SDK for mobile, still used for B2B testing

### wdpr-payment-sheet (Payment Sheet UI)
- Tech: Embedded iframe, loaded via `wdpr-payment-sheet.js`
- Token passthrough — doesn't validate, just forwards

### wdpr-payment-sheet-api (Payment Sheet API)
- Tech: Node.js
- Key: `wdpr-authz-filter-node` validates tokens (V4 + V5 EdDSA)
- V5: DPAY-15113 (authz filter updated for EdDSA/new issuer) — done

### dpay-android-ui (Android Demo)
- Tech: Java/Kotlin, Gradle, OkHttp, Dagger
- Key: `TestPage.java`, `AuthzInterceptor.java`, `EstablishSessionService.java`, `IdentityV5Helper.kt`
- V5: Identity SDK Android 5.1.0-beta.1 (PR #912)
- Build: `NEXUS_USER`, `NEXUS_PASS`, Java 17

### dpayios (iOS Demo)
- Tech: Swift, SPM, UIKit
- Key: `AuthZManager.swift`, `LoginViewController.swift`, `SessionServicesHelper.swift`
- V5: Identity SDK iOS 5.0.0 (DPAY-15317, Jeremias)

## Auth Flows

### V4 (current default)
- Web: Demo API → Guest Controller (sd/dgc) or AuthZ password grant (wdw/dlr)
- Android: AuthzInterceptor → Demo API → Guest Controller
- iOS: AuthZManager → Demo API → Guest Controller

### V5 (new, opt-in)
- Web: Identity Web SDK (browser redirect to login-qa.disney.com)
- Android: Identity SDK Android → launchIdentityFlow() → token
- iOS: Identity SDK iOS → launchIdentityFlow() → token

### B2B (unchanged)
- AuthZ client_credentials grant → server-to-server only
- NOT affected by V5 migration

## Environment URLs

See [../deployments.md](../deployments.md) for full endpoint list.

| App | Latest |
|-----|--------|
| Demo App | https://latest.commerceplatforms.wdprapps.disney.com |
| Payment Sheet | https://latest.paymentsheet.wdprapps.disney.com |

## Identity V5 Client IDs

| Brand | Web | Android | iOS |
|-------|-----|---------|-----|
| shopDisney | DCP-DISNEYSTORE.WEB | DCP-DISNEYSTORE.AND | DCP-DISNEYSTORE.IOS |
| WDW | TPR-WDW-LBJS.WEB | — | — |
| DGC | TPR-DISNEYGIFTCARD.WEB | — | — |
