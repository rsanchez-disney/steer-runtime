# TEP3 Standalone Team — Context

## Scope

The TEP3 Standalone team owns the daily-selectable standalone ticket and bolt kit purchase/modification flows across cart-service, order-service, and order-vas.

## Jira Filters

- **Board:** TEP3 - Cart & Checkout
- **Assignees:** Rafael.Sifontes.-ND@disney.com, Diego.Soto.-ND@disney.com, Jonathan.Ramos.-ND@disney.com

## Key Flows Owned

### Standalone Digital Sales
- Guest purchases admission tickets (with optional LLMP and parking)
- Products identified by `bundleComponents` with `dlr-theme-park-bundle` productTypeId
- Cart → Order Create → Order Update (price tokens) → Order Submit

### Bolt Bulk/Delegate Sales
- Group and bulk ticket orders via Bolt admin
- Uses `boltKitComponents[]` with voucher pricing
- `bundlePricing` (combined ticket+voucher) replaces `pricingSummary`
- `priceRequired` flow: $0 on add-to-cart → real price set at PCM update

### Digital Modifications
- Date change, upgrade, add-ons on existing tickets
- Mods flow: no pricing on request → copies from cache (upgradeDetails/priceToken needed)

## Service Ownership

| Service | Responsibility |
|---------|---------------|
| cart-service-java8 | Product resolution, pricing modal, TPAC dispatch, LexVAS enrichment |
| order-service | Order CRUD, PEOS integration, computeTotalPrice, validation |
| ecommerce-order-vas-java-17 | BFF orchestration, error handling, retry logic |

## Current Initiatives

- Daily-selectable products (ticket per day, multiple ledger blocks)
- Park-agnostic components (null parkName, new sort/template logic)
- PricingModal enhancements for bundle and standalone items
- Price suppression on submit response (priceToken removal)
