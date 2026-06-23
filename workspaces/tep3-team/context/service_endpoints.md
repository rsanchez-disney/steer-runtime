# TEP3 — Service Endpoints

## Cart Service (`cart-service-java8`)

| Method | Path | Description | TEP3 |
|--------|------|-------------|------|
| PUT | /scopes/{scope}/carts/{cartId} | Add item to cart | ✅ bundleComponents, sku, pricing |
| GET | /scopes/{scope}/carts/{cartId} | Get cart by ID | ✅ bundleComponents in response |
| PUT | /scopes/{scope}/carts/{cartId}/items/{itemId} | Update item | ✅ ticketPortfolio, bundleComponents |
| PUT | /scopes/{scope}/carts/{cartId}/items/transactional-update-all | Bulk update (PCM) | ✅ pricing only, skips LexVAS/TPAC |
| DELETE | /scopes/{scope}/carts/{cartId} | Delete cart | — |
| GET | /scopes/{scope}/carts?userIdentityType=GUEST&... | Get by SWID | — |

## Order VAS (`ecommerce-order-vas-java-17`)

| Method | Path | Description | TEP3 |
|--------|------|-------------|------|
| POST | /api/v1/orders | Create order | ✅ bundleComponents at item level |
| PUT | /api/v1/orders/{orderId}?ref=submit | Update order | ✅ bundleComponents in partyMix |
| POST | /api/v1/checkout | Submit order | ✅ bundleComponents in partyMix |
| POST | /api/v1/retry-checkout | Retry failed checkout | — |
| POST | /api/v1/orders/abandon | Abandon order | — |
| POST | /api/v1/modification-orders | Create mod order | ✅ bundleComponents, entitlementIds |
| POST | /api/v1/modification-checkout | Submit mod order | ✅ bundleComponents in partyMix |

## Order Service (`order-service`)

### V2 API (Digital Consumer + UAD)
| Method | Path | Description | TEP3 |
|--------|------|-------------|------|
| POST | /api/v2/orders/initializations | Create/initialize order | ✅ bundleComponents, pricingSummary |
| PATCH | /api/v2/orders/initializations/{key} | Update order | ✅ entitlementOrderItems (full), validatePricing |
| POST | /api/v2/orders | Submit order | ✅ bundleComponents, guestRefs |
| DELETE | /api/v2/orders/initializations/{key} | Abandon order (thaw) | — |
| PUT | /api/v2/orders/park-entitlements | Modify entitlements | ✅ bundleComponents, cancelReservationIds |
| POST | /api/v2/orders/cancellations | V2 Cancel (UAD) | ✅ NEW — store.id, orderId/payloadId |

### V3 API (TTC)
| Method | Path | Description | TEP3 |
|--------|------|-------------|------|
| POST | /api/v3/orders | Book order | ✅ id per item, bundleComponents |
| GET | /api/v3/orders/{orderId} | Retrieve order | ✅ bundleComponents in response |
| PUT | /api/v3/orders/{orderId}/cancellations | Cancel order | No TEP3 changes |

### V4 API (UC as Platform)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v4/orders | Create order |
| POST | /api/v4/orders/{orderId}/submit | Submit order |

## PEOS (`wdpr-park-entitlement-order-service`)

| Method | Path | Description | TEP3 |
|--------|------|-------------|------|
| POST | /api/v1/orders/park-entitlements/initializations | Create order | ✅ bundleComponents, pricingModal |
| PUT | /api/v1/orders/park-entitlements/initializations/{orderId} | Update order (NEW) | ✅ inventoryRefIds, priceToken |
| POST | /api/v1/orders/park-entitlements | Submit order | ✅ inventoryOrderRefId, priceToken |
| PUT | /api/v1/orders/park-entitlements | Modify entitlements | ✅ bundleComponents, upgradeDetails |
| PUT | /api/v1/orders/park-entitlements/abandon-session | Abandon session | ✅ inventoryRefId, inventoryOrderRefId |
| PUT | /api/v1/orders/park-entitlements/{orderId}/cancellations | Cancel order | — |
| POST | /api/v1/orders/park-entitlements/bolt-bulk/fulfill-order | Fulfill bolt | ✅ boltAdminId, boltStoreOrderId |
| GET | /api/v1/orders/park-entitlements/{orderId} | Retrieve order | ✅ bundleComponents |

## External Service Dependencies

| Service | Purpose | Base URL (latest) |
|---------|---------|-------------------|
| PEOS (Ticket Handler) | Order orchestration | `https://latest.peos-dlr.wdprapps.disney.com` |
| DTI | Ticket fulfillment | `https://latest.dti.wdprapps.disney.com` |
| Galaxy | Ticket inventory (via DTI) | `https://latest.egalaxysales.wdprapps.disney.com` |
| CME Availability | Inventory availability | `https://origin.latest.cme-avail-dlr.wdprapps.disney.com` |
| CME Reservation | Inventory reservation | `https://origin.latest.cme-res-dlr.wdprapps.disney.com` |
| EC3 | Mods pricing calculator | `https://latest.ec3.wdprapps.disney.com` |
| LexVAS | Product catalog | `https://latest.lexvas.int.dlr.wdpro.disney.com` |
| Bolt Svc | Bulk/group orders | `https://latest.bolt-service.wdprapps.disney.com` |
| Package Order Service | Package order mgmt | `https://latest.package-order-svc.dlr.wdprapps.disney.com` |
| DPS | Package offer search | `https://latest2.dps-core-quote-dlr.wdprapps.disney.com` |
| RPVA | Package view assembler | `https://latest.resort-package-va.dlr.wdprapps.disney.com` |
| Mock Svc | Wiremock dependency mocks | `https://latest.mock-svc.wdprapps.disney.com` |

## Override Headers

| Header | Purpose |
|--------|---------|
| `X-Disney-Internal-Enable-TEP3: true` | Enable TEP3 in CME Admin UI |
| `X-TEP3-ENABLED: true` | Enable TEP3 in RPVA APIs |
| `X-ENV-OVERRIDE: latest\|latest2\|stage2` | Route to specific environment |
| `X-Disney-Internal-Dynamic-Price-Override-Enabled` | Enable dynamic pricing toggle |
| `x-disney-internal-route-overrides-directives` | Mock error simulation (DTI, PEOS) |

## Contract Repository

All TEP3 API contracts: `github.disney.com/commerce/ecommerce-project-tech-documentation`

Path convention: `TEP3/<service>/<flow>/<contract-type>.json`
