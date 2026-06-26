# TEP3 Package Team — Context

## Scope

The TEP3 Package team owns the resort package ticket flows — purchase and modification of tickets within resort packages (room + tickets + add-ons).

## Jira Filters

- **Board:** TEP3 - Cart & Checkout - Package
- **Assignees:** Alvaro.F.Gonzalez.Debernardi.-ND@disney.com, Lautaro.Luna.-ND@disney.com, Carlos.A.Orozco.-ND@disney.com, David.Medina.-ND@disney.com, Erik.X.Chavez.-ND@disney.com, Felix.Ortiz.-ND@disney.com

## Key Flows Owned

### Package Digital Sales
- Guest purchases a resort package (room + tickets + add-ons)
- Cart service manages room hold (`freeze.id`, `freeze.ttl`) and ticket selection
- Package Order Service (POS) handles order orchestration

### Package Digital Modifications
- Guest modifies tickets within an existing package reservation
- Lodging modifications that affect ticket pricing
- Uses EC3 (`/ec3-svc/api/v1/quote/package/upgrade`) for mod pricing quotes

### Package Cart APIs
- `POST /scopes/{type}/carts` — add to cart (room only, room+ticket, GNH)
- `PUT /scopes/{type}/carts/{cartId}/items/{itemId}` — update cart item
- `GET /scopes/{type}/carts/{cartId}?validatePrices=true` — get cart with price validation
- `PUT /scopes/{type}/carts/{cartId}/bulk-update` — accept new price on PCM

## Service Dependencies (Package-specific)

| Service | Purpose |
|---------|---------|
| Package Order Service (POS) | Resort package order management |
| Disney Package Service (DPS) | Package offer search and quote |
| RPVA | Resort Package View Assembler (ticket package data) |
| EC3 | Entitlement cost of change calculator (mods pricing) |

## UI Applications

| Application | Description |
|-------------|-------------|
| UC SPA (wdpr-ecommerce-uc-spa) | Unified Checkout — order creation through submission |
| Cart Plus SPA | Cart management UI for DLR mobile and web |
| Resort Details UI | Package cart client (room selection) |
| Resort Add-Ons UI | Package cart client (ticket/add-on selection) |

## Package-Specific Patterns

### Price Change Warning (POS6568)
- POS returns warning code `POS6568` when package pricing has changed
- UC SPA displays price change modal for guest confirmation

### Room Hold (freeze)
- POS response includes `freeze.id` and `freeze.ttl` (as timestamp)
- TTL is absolute time — UI displays countdown timer
- If hold expires, guest must re-select room

### TEP3 Header for Packages
- `X-TEP3-ENABLED: true` — required to enable TEP3 flow in RPVA APIs
- `X-Disney-Internal-Enable-TEP3: true` — enables TEP3 in CME Admin UI
