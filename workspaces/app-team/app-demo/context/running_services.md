# Running Services & Data Flow

## Local Development Setup

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | `brew install node` |
| Java | 17 | `brew install openjdk@17` |
| Docker | latest | Docker Desktop |
| NEXUS_USER / NEXUS_PASS | — | Disney Nexus credentials (for Android) |

### Running Each Service

#### wdpr-payment-demo (Web Demo UI) — Port 9000

```bash
cd wdpr-payment-demo
npm install
grunt serve --env=latest
# → http://localhost:9000/payment-sheet
```

#### wdpr-payment-demo-api (Demo API) — Port 8628

```bash
cd wdpr-payment-demo-api
npm install
# Copy env config:
cp config/latest.js config/local.js
# Edit local.js: set IDENTITY_V5_CLIENT_ID if testing V5
node server.js
# → http://localhost:8628
```

Key env vars in config:
- `appSessionHost`: `aws` (uses Payment Sheet API) or `local`
- `IDENTITY_V5_CLIENT_ID`: V5 client ID (e.g., `DCP-DISNEYSTORE.WEB`)
- `authzHost`: AuthZ endpoint for V4 flows

#### wdpr-payment-sheet-api (Payment Sheet API) — Port 3000

```bash
cd wdpr-payment-sheet-api
npm install
npm start
# → http://localhost:3000
```

#### wdpr-payment-session (Session Service) — Port 8080

```bash
cd wdpr-payment-session
mvn spring-boot:run -Dspring.profiles.active=local
# → http://localhost:8080
```

Requires: local MySQL or Docker (`docker-compose up db`)

#### dpay-android-ui (Android Demo)

```bash
cd dpay-android-ui
export NEXUS_USER=<user>
export NEXUS_PASS=<pass>
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
# Install: adb install app/build/outputs/apk/debug/app-debug.apk
```

## Service Integration Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                     │
│  Web Demo (:9000)  │  Android App  │  iOS App                           │
└────────┬───────────┴───────┬───────┴────────┬───────────────────────────┘
         │                   │                │
         │ POST /api/v1/payment-sheet-hash    │
         │ (login creds + brand + identityVersion)
         ▼                   ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEMO API (:8628)                                       │
│                                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐             │
│  │ Auth Router │───▶│ V4: GuestCtl │    │ V5: OIDC/SDK   │             │
│  │             │───▶│ V4: AuthZ    │    │ (bamgrid.net)  │             │
│  │             │───▶│ Guest: C.Cred│    └────────────────┘             │
│  └─────────────┘    └──────────────┘                                    │
│         │                                                                │
│         │ authzToken (opaque JWT)                                        │
│         ▼                                                                │
│  ┌──────────────────────────────────┐                                   │
│  │ HMAC Calculator                   │                                   │
│  │ hmac = SHA256(userAgent + token)  │                                   │
│  └──────────────────────────────────┘                                   │
│         │                                                                │
│         │ POST /session/ (Bearer token)                                  │
│         ▼                                                                │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PAYMENT SHEET API (:3000)                                    │
│                                                                          │
│  ┌─────────────────┐    ┌──────────────────────┐                       │
│  │ AuthZ Filter    │───▶│ Token Validation     │                       │
│  │ (V4 RSA + V5   │    │ - Verify signature   │                       │
│  │  EdDSA)         │    │ - Check issuer       │                       │
│  └─────────────────┘    │ - Check expiry       │                       │
│         │               └──────────────────────┘                       │
│         │ POST /establish-session                                        │
│         ▼                                                                │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PAYMENT SESSION (:8080)                                      │
│                                                                          │
│  ┌──────────────┐    ┌─────────────┐    ┌──────────────┐              │
│  │ Session Mgr  │───▶│ MySQL/Redis │    │ Config Svc   │              │
│  │ - Create     │    │ (persist)   │    │ (client cfg) │              │
│  │ - Validate   │    └─────────────┘    └──────────────┘              │
│  │ - Expire     │                                                       │
│  └──────────────┘                                                       │
│         │                                                                │
│         │ sessionToken                                                   │
│         ▼                                                                │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ Returns to client: { sessionToken, hmac }
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              PAYMENT SHEET UI (iframe)                                    │
│                                                                          │
│  Loaded with: sessionId + clientId + authToken + hmac                   │
│  Renders: card form, wallet options, payment methods                    │
│  Submits: payment to downstream processors                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Complete Payment (Logged-in User)

### Step 1: Authentication
```
Client → POST /api/v1/payment-sheet-hash
Body: { client: "TESTPAYUI-SILVER", hmacVersion: "1", login: { username, password, brand: "sd" } }

Demo API:
  1. Routes to auth provider based on brand + identityVersion
  2. V4: POST to Guest Controller or AuthZ password grant
  3. V5: SDK-based (client-side) or 4-step OIDC (server-side)
  4. Receives: accessToken (JWT)
  5. Calculates: hmac = HMAC-SHA256(userAgent + accessToken, secret)

Response: { authzToken: "<JWT>", refreshToken: "<token>", hmac: "<hex>" }
```

### Step 2: Session Establishment
```
Client → POST /session/ (via Demo API proxy)
Headers: Authorization: Bearer <authzToken>
Body: { clientId: "TESTPAYUI-SILVER", ... }

Payment Sheet API:
  1. AuthZ filter validates token (RSA for V4, EdDSA for V5)
  2. Forwards to Payment Session service
  3. Session service creates session in DB
  4. Returns sessionToken

Response: { sessionToken: "<uuid>" }
```

### Step 3: Payment UI
```
Client loads Payment Sheet iframe:
  URL: /payment-sheet?sessionId=<token>&clientId=<id>&authToken=<jwt>&hmac=<hex>

Payment Sheet UI:
  1. Validates HMAC
  2. Renders payment form
  3. User enters card / selects wallet
  4. Submits to payment processor
```

## Environment Configuration

| Environment | Demo App | Demo API | Payment Sheet | Session |
|-------------|----------|----------|---------------|---------|
| Local | :9000 | :8628 | :3000 | :8080 |
| Latest | latest.commerceplatforms.wdprapps.disney.com | same host /api/ | latest.paymentsheet.wdprapps.disney.com | internal |
| Stage | stage.commerceplatforms.wdprapps.disney.com | same host /api/ | stage.paymentsheet.wdprapps.disney.com | internal |

### Pointing Android/iOS at Local Backend

In `PaymentAppConstants.java` (Android) or equivalent (iOS):
```java
// Change from:
public static final String HOST = "latest.commerceplatforms.wdprapps.disney.com";
// To (for local testing):
public static final String HOST = "10.0.2.2:8628"; // Android emulator → host machine
```

## Config Services Integration

`wdpr-config-services` provides client configuration to Payment Session:
- Which payment methods are enabled per client
- Card brand restrictions
- Wallet options (Apple Pay, Google Pay)
- Feature flags per environment

The Session service calls Config Services during session creation to load the client's payment configuration.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `AUTHORIZATION_CREDENTIALS` error | Wrong credentials or brand mismatch | Verify username/password, check brand matches account |
| `ENOTFOUND bamgrid.net` | V5 server-side OIDC Step 1 unreachable | Use browser SDK flow instead, or get VPN access |
| Session 401 | Token expired or invalid signature | Re-authenticate, check token issuer matches filter config |
| HMAC mismatch | User-agent changed between auth and session | Ensure same user-agent string in both requests |
| CSP blocks SDK | `cdn-qa.disneyaccount.com` not in script-src | Add to CSP headers (PR #123) |
| Android build fails | Missing NEXUS_USER/NEXUS_PASS | Set env vars or add to `~/.gradle/gradle.properties` |
| `cyberfend` dependency missing | Nexus thirdparty repo not resolving | Add `wdpr-mobile-all` repo to `allprojects.repositories` |
