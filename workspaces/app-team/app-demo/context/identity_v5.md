# Identity V5 Integration Context

## Architecture Decision

The correct V5 integration pattern is **client-side SDK**, NOT server-side OIDC:

| Platform | Approach | SDK |
|----------|----------|-----|
| Web | Browser SDK (`cdn-qa.disneyaccount.com/v5/sdk.js`) | `sdk.launchIdentityFlow()` |
| Android | Identity SDK Android 5.x (Artifactory) | `Identity.shared().launchIdentityFlow()` |
| iOS | Identity SDK iOS 5.x (SPM) | `Identity.shared().launchIdentityFlow()` |

The server-side 4-step OIDC flow (PR #58 in wdpr-payment-demo-api) is for B2B/testing only — NOT the primary mobile path.

## V5 Client IDs

| Brand | Web | Android | iOS |
|-------|-----|---------|-----|
| shopDisney | `DCP-DISNEYSTORE.WEB` | `DCP-DISNEYSTORE.AND` | `DCP-DISNEYSTORE.IOS` |
| WDW | `TPR-WDW-LBJS.WEB` | — | — |

## V5 Endpoints

| Endpoint | URL |
|----------|-----|
| OIDC Discovery | `https://login-qa.disney.com/.well-known/openid-configuration` |
| Authorize | `https://login-qa.disney.com/authorize` |
| Token | `https://login-qa.disney.com/token` |
| JWKS | `https://login-qa.disney.com/.well-known/jwks.json` |
| Identity Test Page | `https://client1.disneyaccount.com/index.html?clientId=<CLIENT_ID>&env=qa` |

## V5 Token Characteristics

- Algorithm: EdDSA (not RSA)
- Issuer: `https://login-qa.disney.com`
- Format: Standard JWT (opaque to consuming apps)
- The Android/iOS demo apps treat tokens as opaque strings — no parsing needed

## Known Blockers

- `bamgrid.net` IDP endpoints are internal-only — unreachable from local/deployed environments
- Server-side OIDC Step 1 requires this endpoint — browser SDK flow bypasses it entirely
- CSP must include `cdn-qa.disneyaccount.com` (script-src) and `*.disney.com` (frame-src)

## Android Build Requirements

| Requirement | Value |
|-------------|-------|
| Java | 17 |
| Gradle | 8.11.1 (wrapper) |
| NEXUS_USER / NEXUS_PASS | Required for Disney Nexus repos |
| Android SDK | `~/Library/Android/sdk` |
| Identity SDK | `com.disney.identity:identity-sdk-android:5.x` (Artifactory) |

## Auth Flow (V5 with SDK)

```
Mobile App → Identity SDK → launchIdentityFlow() → login UI → token
Mobile App → Demo API (Bearer token) → establish session
Mobile App → Payment UI (sessionId + HMAC)
```

## Key Files (Android)

| File | Purpose | V5 Impact |
|------|---------|-----------|
| `AuthzInterceptor.java` | Token fetch + refresh | Passes token as opaque string — no change |
| `AuthTokenResponse.java` | Response parsing | Already handles `authzToken` field — no change |
| `EstablishSessionService.java` | Session establishment | Uses interceptor's token — no change |
| `MainActivity.java` | HMAC calculation | Format-agnostic (hashes raw string) — no change |
| `IdentityV5Helper.kt` | V5 SDK integration | New file for SDK init + flow |

## Test Accounts

- Email: `twdc.testaid+InielQuadusk64@disney.com`
- Password: `testing123`
- Works for V4 (Guest Controller) and V5 (Identity SDK)
