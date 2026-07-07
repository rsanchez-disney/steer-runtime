# DLR TEP3 - Cart & Checkout domain context

TEP3 is the next-generation ticket commerce platform for Disneyland Resort (DLR). The Cart & Checkout team owns the purchase and modification flows for standalone tickets and resort package tickets.

## Business flows

### Standalone tickets

- **Digital sales** — guest purchases admission tickets (with optional Lightning Lane Multi Pass and parking) through the DLR website or mobile app
- **Digital mods** — guest modifies an existing ticket (date change, upgrade from 1-day to multi-day, add-ons)
- **UAD sales** — unassisted device (kiosk) ticket purchases
- **TTC sales** — ticket transaction counter (cast member assisted)
- **Bolt bulk/delegate** — group and bulk ticket orders via Bolt admin

### Package tickets

- **Digital sales** — guest purchases a resort package (room + tickets + add-ons)
- **Digital mods** — guest modifies tickets within an existing package reservation
- **Lodging mods** — room-level modifications that may affect ticket pricing

### Order lifecycle

```text
Add to Cart → View Cart → Create Order → Update Order → Submit Order
```

- **Create order** — initializes the order in PEOS, locks inventory via CME
- **Update order** — applies price tokens and inventory reference IDs, handles price change modals
- **Submit order** — finalizes payment and fulfillment through DTI/Galaxy

## TEP3 product structure

TEP3 products use a **bundled component** model:

- Products are identified by the presence of `bundleComponents` (ticket + LLMP) in requests
- Park reservations are no longer included in requests/responses (handled internally)
- Separate supplements are replaced by `bundleComponents`
- Each item has `itemId`, `priceSummary`, `priceTokens`, and `inventoryReferenceIds`
- A `variablePrice` feature flag identifies TEP3 dynamic pricing products
- TEP3 uses entirely new Product IDs (not shared with legacy)

## Service dependencies

| Service                      | Purpose                                                    | Base URL (latest)                                                        |
|------------------------------|------------------------------------------------------------|--------------------------------------------------------------------|
| PEOS (Ticket Handler)        | Order orchestration (create, update, submit)               | `https://latest.peos-dlr.wdprapps.disney.com`                      |
| DTI                          | Ticket fulfillment (reservation-sale, query-reservation)   | `https://latest.dti.wdprapps.disney.com`                           |
| Galaxy                       | Ticket inventory system (accessed via DTI, not directly)   | `https://latest.egalaxysales.wdprapps.disney.com`                  |
| CME Availability             | Date-specific inventory availability checks                | `https://origin.latest.cme-avail-dlr.wdprapps.disney.com`          |
| CME Reservation              | Inventory reservation creation                             | `https://origin.latest.cme-res-dlr.wdprapps.disney.com`            |
| EC3                          | Entitlement cost of change calculator (mods pricing)       | `https://latest.ec3.wdprapps.disney.com`                           |
| LexVAS                       | Product data and bundle component information              | `https://latest.lexvas.int.dlr.wdpro.disney.com`                   |
| Bolt Svc                     | Bulk/group orders and comp tickets                         | `https://latest.bolt-service.wdprapps.disney.com`                  |
| Package Order Service (POS)  | Resort package order management                            | `https://latest.package-order-svc.dlr.wdprapps.disney.com`         |
| Disney Package Service (DPS) | Package offer search and quote                             | `https://latest2.dps-core-quote-dlr.wdprapps.disney.com`           |
| RPVA                         | Resort package view assembler (ticket package data)        | `https://latest.resort-package-va.dlr.wdprapps.disney.com`         |
| Mock Svc                     | Wiremock-based service mocks for all dependencies          | `https://latest.mock-svc.wdprapps.disney.com`                      |

## UI applications

| Application         | Description                                                  |
|---------------------|--------------------------------------------------------------|
| UC SPA              | Unified Checkout — handles order creation through submission |
| Cart Plus SPA       | Cart management UI for DLR mobile and web                    |
| Resort Details UI   | Package cart client (room selection)                          |
| Resort Add-Ons UI   | Package cart client (ticket/add-on selection)                 |

## Team repositories

| Repository                      | Purpose                                          |
|---------------------------------|--------------------------------------------------|
| `cart-service-java8`            | Cart management service (Java 8)                 |
| `ecommerce-order-vas-java-17`  | Order VAS — orchestrates PEOS/DTI calls (Java 17)|
| `wdpr-mock-svc`                | Wiremock service for dependency mocking          |
| `wdpr-ecommerce-uc-spa`        | Unified Checkout SPA (Angular)                   |
| `com-uc-ui-components`          | Shared UC UI component library                   |

## Key API contracts

### PEOS APIs (standalone tickets)

- `POST /api/v1/orders/park-entitlements/initializations` — create order
- `PUT /api/v1/orders/park-entitlements/initializations/{orderId}` — update order
- `POST /api/v1/orders/park-entitlements/submissions` — submit order

### Cart service APIs (package tickets)

- `POST /scopes/{type}/carts` — add to cart (room only, room+ticket, GNH)
- `PUT /scopes/{type}/carts/{cartId}/items/{itemId}` — update cart item
- `GET /scopes/{type}/carts/{cartId}?validatePrices=true` — get cart with price validation
- `PUT /scopes/{type}/carts/{cartId}/bulk-update` — accept new price on PCM

### Package Order Service APIs

- Initialize order, update order, submit order for resort packages
- Returns `freeze.id` and `freeze.ttl` (as timestamp) for room holds
- Price change warning code: `POS6568`

### LexVAS APIs

- `/product-instances/{productInstanceId}?view=web&storeId={storeId}` — product details
- `/product-finder-v2?type=sku&value={sku}&storeId={storeId}` — SKU lookup

### CME APIs

- Availability: `POST /availability`
- Reservation: `POST /v1/orders/{orderId}` (planned)

### EC3 APIs

- `POST /ec3-svc/api/v1/quote/package/upgrade` — mod pricing quote

## Error handling patterns

### Inventory unavailability (error code 510)

UC SPA actively manages cart when inventory becomes unavailable:

1. Order VAS returns error with `itemIds` of unavailable items and `runErrorProcessor` flag
2. UC SPA calls cart service to remove unavailable items in the background
3. If error on create order — guest is redirected back to origin with `510` query param
4. If error on update/submit — error message displayed on UC page with navigation link

### Price change modal (PCM)

When prices change between cart and checkout:

1. `pricingModal` is returned in PEOS/POS response
2. UC displays modal with old vs new pricing
3. Guest accepts or rejects — if accepted, bulk-update with new price tokens

## Monitoring

### Splunk indexes

- `wdpr-ecommerce` — UC and Order VAS logs
- `wdpr_peos` — PEOS ticket handler logs
- `wdpr_dti*` — DTI gateway logs

### Key dashboards

- Unified Checkout Sales Tickets (Lower/Prod)
- DLR Product Reconfig Launch
- DLR Ticket Mods Performance Metrics
- EMVAS/OrderVAS 4xx/5xx error alerts

### Alert thresholds

- Lowers: 5xx > 10 OR 4xx > 10 in last 15 minutes
- Prod: 5xx > 5 OR 4xx > 5 in last 10 minutes

## Override headers

| Header                                          | Purpose                                    |
|-------------------------------------------------|--------------------------------------------|
| `X-Disney-Internal-Enable-TEP3: true`           | Enable TEP3 flow in CME Admin UI           |
| `X-TEP3-ENABLED: true`                          | Enable TEP3 in RPVA APIs                   |
| `X-ENV-OVERRIDE: latest\|latest2\|stage2`       | Route to specific environment              |
| `x-disney-internal-route-overrides-directives`  | Mock error simulation (DTI, PEOS)          |

## Testing approach

- Development uses mocks for all external dependencies (PEOS, DTI, CME, LexVAS, DPS)
- Consumer and non-consumer testing share the same behavior unless explicitly different
- Integration testing phase requires both consumer and non-consumer validation
- Mock service supports error simulation via override headers (`dtiPend`, `dtiFail`, `dtiInvalidPrice`)

## Wiki reference

- [DTCC space][dtcc-wiki]

<!-- Links -->
[dtcc-wiki]: https://disneyexperiences.atlassian.net/wiki/display/DTCC
