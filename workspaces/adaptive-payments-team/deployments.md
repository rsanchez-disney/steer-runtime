# App Team — Deployment Endpoints & Versions

## How to check deployment status

Run: `scripts/check-deployments.sh [environment]`

Or query endpoints directly per tables below.

## Environments

| Name | Base URL Pattern |
|------|-----------------|
| latest | `https://latest.{app}.wdprapps.disney.com` |
| stage | `https://stage.{app}.wdprapps.disney.com` |
| load | `https://load.{app}.wdprapps.disney.com` |
| prod | `https://{app}.wdprapps.disney.com` |

---

## Payment Services

| App | Alias | Health Endpoint |
|-----|-------|-----------------|
| wdpr-payment-services (CP) | adpmtps | `/healthcheck` |
| wdpr-payment-services (CPPS) | adpmtcpps | `/healthcheck` |
| wdpr-payment-services (GF) | adpmtgfps | `/healthcheck` |
| wdpr-payment-services (OFF) | adpmtoffps | `/healthcheck` |
| wdpr-payment-services (ENT) | adpmtentcpps | `/healthcheck` |
| wdpr-payment-services (DLP) | adpmtdlpps | `/healthcheck` |

## Payment Controls

| App | Repo | Health Endpoint | URL (latest) |
|-----|------|-----------------|--------------|
| Payment Controls UI | wdpr-payment-controls-client | `/healthcheck` | `https://latest.adpmtui.wdprapps.disney.com` |
| Payment Controls API | wdpr-payment-controls-api | `/healthcheck` | `https://latest.adpmtui.wdprapps.disney.com/api` |
| Config Services | wdpr-config-services | `/mgmt/healthcheck` | `https://latest.adpmtconfig.wdprapps.disney.com/mgmt` |

## Payment Demo

| App | Repo | Health Endpoint | URL (latest) |
|-----|------|-----------------|--------------|
| Demo UI (SPA) | wdpr-payment-demo | `/healthcheck` | `https://latest.commerceplatforms.wdprapps.disney.com` |
| Demo API (Node) | wdpr-payment-demo-api | `/api/v1/healthcheck` | `https://latest.commerceplatforms.wdprapps.disney.com/api/v1` |

Demo app with scenario: `https://latest.commerceplatforms.wdprapps.disney.com/payment-sheet?env=stage&theme=none&host=cnp&appSessionHost=aws&integration=embedded`

## Payment Sheet

| App | Repo | Variant | Health Endpoint | URL (latest) |
|-----|------|---------|-----------------|--------------|
| Payment Sheet | wdpr-payment-sheet | Main | `/healthBadge` | `https://latest.paymentsheet.wdprapps.disney.com` |
| Payment Sheet | wdpr-payment-sheet | Internal | `/healthBadge` | `https://latest.paymentsheet-internal.wdprapps.disney.com` |
| Payment Sheet | wdpr-payment-sheet | Enterprise | `/healthBadge` | `https://latest.paymentsheet-ent.wdprapps.disney.com` |
| Payment Sheet | wdpr-payment-sheet | Card Present | `/healthBadge` | `https://latest.paymentsheet-cp.wdprapps.disney.com` |
| Payment Sheet API | wdpr-payment-sheet-api | Main | `/healthBadge` | `https://latest.paymentsheet-api.wdprapps.disney.com` |
| Payment Sheet API | wdpr-payment-sheet-api | Internal | `/healthBadge` | `https://latest.paymentsheet-api-internal.wdprapps.disney.com` |
| Payment Sheet API | wdpr-payment-sheet-api | Enterprise | `/healthBadge` | `https://latest.paymentsheet-api-ent.wdprapps.disney.com` |
| Payment Sheet API | wdpr-payment-sheet-api | Card Present | `/healthBadge` | `https://latest.paymentsheet-api-cp.wdprapps.disney.com` |
| Payment Sheet Frame | wdpr-payment-sheet-frame | — | N/A | N/A |

## DPAY Admin / Inquiry

| App | Repo | Health Endpoint |
|-----|------|-----------------|
| Admin Inquiry UI | dpay-admin-inquiry-ui-client | `/healthcheck` |
| Admin Inquiry WebAPI | dpay-admin-inquiry-webapi | `/healthcheck` |
| Inquiry Service | wdpr-app-inquiry-service | `/healthcheck` |
| Admin Service | wdpr-app-admin-service | Coming soon |

## Card Issuance Platform (CIP)

| App | Repo | Health Endpoint |
|-----|------|-----------------|
| CIP Services | cip-services | `/healthcheck` |
| CIP Bindings | cip-bindings | `/healthcheck` |
| CIP Parent | cip-parent | `/healthcheck` |

## Gift Card Platform (GCP)

| App | Repo | Health Endpoint | URL (latest) |
|-----|------|-----------------|--------------|
| DGC (consumer site) | wdpr-gcp-dgc | `/healthcheck` | `https://latest.disneygiftcard.com` |
| DGC API | wdpr-gcp-dgc-api | `/healthcheck` | `https://latest.disneygiftcard.com/api` |
| GCP Admin | wdpr-gcp-admin | `/healthcheck` | |
| GCP Admin API | wdpr-gcp-admin-api | `/healthcheck` | |
| GCP Promo | wdpr-gcp-promo | `/healthcheck` | |
| GCP Promo API | wdpr-gcp-promo-api | `/healthcheck` | |
| GCP Common Components | gcp-common-components | N/A | N/A |
| GCP Guest Services | gcp-guest-services | `/healthcheck` | |
| GCP Admin Services | gcp-admin-services | `/healthcheck` | |
| GCP Batch | gcp-batch | `/healthcheck` | |

---

## Identity V5 Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| OIDC Discovery | `https://login-qa.disney.com/.well-known/openid-configuration` | V5 OIDC config |
| OIDC Discovery (prod) | `https://login.disney.com/.well-known/openid-configuration` | V5 OIDC config (prod) |
| Identity V5 Web SDK (QA) | `https://cdn-qa.disneyaccount.com/v5/sdk.js` | Browser SDK |
| Identity V5 Web SDK (Prod) | `https://cdn.disneyaccount.com/v5/sdk.js` | Browser SDK (prod) |
| Identity V5 Test Page | `https://client1.disneyaccount.com/index.html?clientId={CLIENT_ID}&env=qa&lang=en-US` | Manual token testing |

## V5 Client IDs

| Brand | Client ID | Platform | Test Page |
|-------|-----------|----------|-----------|
| shopDisney | `DCP-DISNEYSTORE.WEB` | Web | `?clientId=DCP-DISNEYSTORE.WEB&env=qa` |
| shopDisney | `DCP-DISNEYSTORE.AND` | Android | `?clientId=DCP-DISNEYSTORE.AND&env=qa` |
| shopDisney | `DCP-DISNEYSTORE.IOS` | iOS | `?clientId=DCP-DISNEYSTORE.IOS&env=qa` |
| WDW | `TPR-WDW-LBJS.WEB` | Web | `?clientId=TPR-WDW-LBJS.WEB&env=qa` |
| DGC | `TPR-DISNEYGIFTCARD.WEB` | Web | `?clientId=TPR-DISNEYGIFTCARD.WEB&env=qa` |

## CSP Check (V5 SDK)

```bash
curl -sI https://latest.commerceplatforms.wdprapps.disney.com/payment-sheet | grep -i "content-security-policy" | grep "disneyaccount.com"
```

## Confluence Reference

- [Builds and Versions](https://confluence.disney.com/pages/viewpage.action?pageId=1363613110&spaceKey=Payments)
