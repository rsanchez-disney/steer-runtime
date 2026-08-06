# UCM1 Context

## Scope
UCM1 owns the full Unified Checkout stack end-to-end for Disneyland (DLR) non-consumer stores: the Angular SPA, Node.js UC API (BFF), Polymer UI components library, Global API Lambda, Cart UI, and Cart API. Changes to the checkout flow are owned here.

## Main Flows
- DLR Lodging Non-Consumer Sales Flows
  Travel Agent          - RO Flow
  TAAP                  - RO Flow
  CAST                  - RO Flow
  Cast-OGB              - RO Flow  
  Travel Agent          - PKG Flow

- DLR Lodging Mods Flows
  Consumer/Cast/OGB     - RO Flow
  Travel Agent/TAAP     - RO Flow
  Consumer              - PKG Flow
  Travel Agent          - PKG Flow

- DLR Lodging Additional Payments Flows
  Consumer
  Travel Agent

- DLR BOLT Bulk

## Wiki References
- [Main](https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391446928/DLR+UC+Modernization)
- [Sequence Diagrams](https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391446930/Sequence+Diagrams)
- [Testing Steps](https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391447153/DLR+UCM+Testing+Steps)
- [Production Readiness](https://disneyexperiences.atlassian.net/wiki/spaces/UC/pages/391447175/DLR+UCM+Production+Readiness)

## High-Level Architecture
```
Browser / Native App (iOS & Android via DisneyRAWebView)
  └─► UC SPA — wdpr-ecommerce-uc-spa (Angular 15)
        └─► UC API — wdpr-ecommerce-uc-api (Node.js/Restify)
              ├─► com-ui-api-lambda  (Global API — services, config, content)
              ├─► wdpr-order-vas     (Order lifecycle backend — Java)
              ├─► Disney Authz       (JWT token issuance)
              └─► ADPMTSM            (Payment session manager)

UI Components (shared across teams)
  com-uc-ui-components (Polymer 3) ◄── consumed by UC SPA via CUSTOM_ELEMENTS_SCHEMA
    └─► @com/* packages (Disney shared Polymer base library)

Cart
  wdpr-ecommerce-wdpr-cart-ui (Angular)
    └─► wdpr-ecommerce-wdpr-cart-api (Node.js BFF)
```

---

## Repositories

| Repo | Role | Base Branch | GitHub Org |
|------|------|-------------|------------|
| `wdpr-ecommerce-uc-spa` | Angular SPA | `develop` | wdpr-unified-checkout |
| `wdpr-ecommerce-uc-api` | UC API (Node.js BFF) | `develop` | wdpr-unified-checkout |
| `com-ui-api-lambda` | Global API Lambda | `master` | GitLab (cgs-wdw/com-ui-api) |
| `com-uc-ui-components` | Polymer 3 UI components | `master` | dprd-web-components-cart |
| `wdpr-ecommerce-wdpr-cart-api` | Cart API (Node.js BFF) | `develop` | wdprd-development |
| `wdpr-ecommerce-wdpr-cart-ui` | Cart UI (Angular) | `develop` | wdprd-development |


## Site Ids and Store Ids

### Overview
The concept of site IDs and store IDs exists across multiple apps, for example: ticket sales > cart > unified checkout. If a user is buying theme park tickets for Disneyland, then the 3 applications: ticket sales, cart+ and unified checkout use the DLR site id.

### Available Site Ids
There are different sites which have different domains
The site ids are: 
- Walt Disney World (WDW) - disneyworld.disney.go.com
- Disneyland Resort (DLR) - disneyland.disney.go.com
- Aulani (DPR) - disneyaulani.com
- Hilton Head (HH) - hiltonhead.disney.go.com
- Vero Beach (VB) - verobeach.disney.go.com
- Disney Vacation Club (DVC) - disneyvacationclub.disney.go.com or dvc-ubi.wdprapps.disney.com, this is the only site that maps to 2 different domains

### Site Ids and Stores Ids
Each site can have different stores. A store represents a variation of the same flow, for example, when buying theme parks tickets on Disneyland (DLR), the user can either be the actual guest coming to the theme park (Consumer Store), or it can be a Travel Agent that is buying on behalf of a guest (Travel Agent Store), or it can be a Disney employee buying tickets for themselves with a discount (Cast Store), among other options. 

For each site we usually have 1 Consumer store (a normal person buying for themselves), and it can have multiple non-consumer stores (travel agent, cast member, etc).

All non-consumer stores their own store id, some examples:
- DLR Travel Agent: dta-packages-std
- DLR Cast store: cast
- Consumer stores: usually the site id is treated as the store id, e.g. dlr or wdw. 

### StoreId specific - URL Syntax
The URLs of non-consumer stores contain the store id as param e.g. /reservations/:storeId/uc/initialize , where storeId is "dta-packages-std". Note: "storeId" only has the actual store without the site id. 

On the code, variables that are named "storeId" usually contain either siteId_storeId, e.g. "dlr_dta-packages-std",  or just the store id "dta-packages-std".

### Coding Rule
On the Unified Checkout project: Avoid adding logic for a specific store or site e.g. if (siteId === 'dlr') or if (storeId === 'cast'). Instead, create a new flag with a name that describes the feature that is desired, and the service will contain logic of which stores should return the flag on the svc response. There can be exceptions to this rule, though when reviewing the code, if you see site or store specific logic, flag that change with a warning.

 