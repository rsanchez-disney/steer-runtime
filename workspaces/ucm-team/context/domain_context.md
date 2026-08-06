# UCM Team — Domain Context

## Product Overview

Cart & Checkout is the Disney eCommerce platform for purchasing and modifying theme park tickets, lodging, dining, annual passes, and experiences across Walt Disney World (WDW), Disneyland Resort (DLR), Hilton Head (HH), Vero Beach (VB), and Disney Vacation Club (DVC).

The UC SPA runs as a standalone Angular application and also embedded in Disney native iOS/Android apps via `DisneyRAWebView`. Cart+ SPA runs as a standalone Angular SPA.

## Supported Order Types

| Type | Description |
|------|-------------|
| `SALES` | New purchase |
| `MOD` | Modification of an existing reservation |
| `UPGRADE` | Upgrade of an existing entitlement |

## Supported Product Types

| Type | Description |
|------|-------------|
| `TICKET` | Theme park tickets |
| `AP` | Annual passes |
| `LODGING` | Resort hotel reservations |
| `DINING` | Dining reservations |
| `EA`, `GP`, `SCHEDULED_ACTIVITY` | Experiences and Genie+ |
| `DVC` | Disney Vacation Club |

## Key Flows

1. **Cart** (`/cart`) — product details, pricing, T&C, proceed to checkout
2. **Checkout** (`/`) — guest info → delivery options → contact info → payment sheet → order submit
3. **Confirmation** (`/confirmation`) — post-purchase summary with CTAs
4. **Terms & Conditions** (`/terms-and-conditions`) — standalone T&C page

## Auth States

Three auth states apply across the entire platform:

| State | Description |
|-------|-------------|
| `guest` | Unauthenticated |
| `private` | Logged-in Disney account |
| `anon` | Anonymous session |

Auth state transitions must be transparent to the user — no jarring redirects. All token operations go through the UC API authz resource.

## Monitoring

### Splunk Indexes
- `wdpr_wdw_ordervas` — WDW Order VAS logs
- `wdpr_dlr_ordervas` — WDW Order VAS logs
- `wdw_s0001479 source=*uc-spa*` — UC SPA WDW logs
- `dlr_s0001477 source=*uc-spa*` — UC SPA DLR logs
- `wdw_s0001479 source=*uc-api*` — UC API WDW logs
- `dlr_s0001477 source=*uc-api*` — UC API DLR logs

### Alert Thresholds
- Lowers: 5xx > 10 OR 4xx > 10 in last 15 minutes
- Prod: 5xx > 5 OR 4xx > 5 in last 10 minutes

## Wiki References
- [UC Splunk Dashboards](https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391446602/Splunk+Dashboards)
- [UC Main Wiki](https://disneyexperiences.atlassian.net/wiki/spaces/UC/overview?homepageId=391446530)
- [UC UI](https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391446637/UC+UI)
- [UC Service](https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391446534/UC+Services)
