# DPS — Package Pricing Domain Context

## Business Domain

DPS (Disney Package Service) is the pricing, availability, and offer engine for Disney resort packages. A "package" bundles lodging (hotel room) with tickets, dining plans, and optional ancillary components into a single purchasable offer. DPS handles the full lifecycle: search → score → quote → freeze → confirm/cancel.

## Clients (Who Calls DPS)

| Client | Channel | Protocol | Key Identifiers |
|--------|---------|----------|-----------------|
| **DO (Disney Online)** | Consumer Direct | REST | Party mix, dates, channel map, affiliations |
| **EAI Adapter (DLP SBC)** | DLP B2B | XML → REST transform | OfferQueryRQ/RS XML messages |
| **TravelBox (TBX)** | Travel Agent | REST | tbxPackageCode, tbxHotelCode, tbxRoomTypeCode |
| **DLR UAD/Online** | UAD | REST | domainPackageCode, domainFacCode, domainRoomCode |
| **DLP** | Consumer Direct | REST | PMADomainPackageCode, AccoviaRoomTypeCode |

## Downstream Services

| Service | Abbreviation | Purpose | DPS direct connection |
|---------|-------------|---------|------------------------|
| Product Attribute Tool | PAT | Product eligibility, Product Authoring Service | Yes |
| Disney Product Offers | DPOS | Disney Product Offer and Availability | Yes |
| Room Availability Service | RAS | Room availability by rate plan, resort, room type, dates, party mix | No, via DPOS |
| Ticket Availability Service | TAS | Ticket group availability by admission options, dates, party mix | No, via DPOS |
| Ancillary Availability Service | AAS | Ancillary component availability by details, dates, party mix | No, via DPOS |
| Dynamic Pricing Engine | DPE | Nightly rates (net, tax, total), additional adult charges, total offer price | No, via DPOS |
| Offer Scoring Service | DPS-Scoring | Scoring configuration, candidate scoring and ordering | Yes |
| Room Inventory Service | RIS | Room inventory freeze (returns freeze ID + TTL) | No, via DPOS |


## Core Business Flows

### 1.1 Offer Search Flow (non TBX clients)

```text
Client → DPS: search-offers (party, dates, channel, products)
  DPS → Scoring: Load scoring configuration
  DPS → PAT: Get eligible products + catalog → package details, rate plans, resorts, rooms, tickets, ancillaries
  DPS → DPOS: Process offer candidates
    DPOS → RAS: Check room availability (loop per room component)
    DPOS → TAS: Check ticket availability (loop per ticket component)
    DPOS → AAS: Check ancillary availability (loop per component)
    DPOS → DPE: Price available offers (loop per candidate)
    DPOS → DPOS: Filter offers, persist for price protection
  DPS → CEA: Segmentation + Offer Optimization (optional)
  DPS → CEA: Upsell request (optional)
DPS → Client: Ranked offer response
```

### 1.2 Offer Search Flow (TBX client)

```text
Client → DPS: search-offers (party, dates, channel, products)
  DPS → PAT: Get eligible products + catalog → package details, rate plans, resorts, rooms, tickets, ancillaries
  DPS → DPOS: Process offer candidates
    DPOS → RAS: Check room availability (loop per room component)
    DPOS → TAS: Check ticket availability (loop per ticket component)
    DPOS → AAS: Check ancillary availability (loop per component)
    DPOS → DPE: Price available offers (loop per candidate)
    DPOS → DPOS: Filter offers, persist for price protection
  DPS → CEA: Segmentation + Offer Optimization (optional)
  DPS → CEA: Upsell request (optional)
DPS → Client: Ranked offer response
```

### 2. Offer Quote Flow

```text
Client → DPS: quote-offer (offer ID, party, dates, selections, offer price)
  DPS → PAT: Get package offer product eligibility + catalog
  DPS → DPOS: Process offer candidates
    DPOS → RAS: Check room availability 
    DPOS → TAS: Check ticket availability
    DPOS → AAS: Check ancillary availability
    DPOS → DPE: Price offer (loop per candidate)
DPS → Client: Quote response (old/new price, price change indicator)
```

### 3. Offer Freeze Flow

```text
Client → DPS: freeze request (similar as quote structure)
  DPS → PAT: Get package offer product eligibility + catalog
  DPS → DPOS: Process freeze
    DPOS → RAS: Check room availability 
    DPOS → TAS: Check ticket availability
    DPOS → AAS: Check ancillary availability
    DPOS → DPE: Price offer
    DPOS → RIS: Freeze room inventory → freeze ID + TTL
  DPS → Client: Response with freeze ID and TTL
```

### 4. Reservation Flow (dps-core-resflowmgmt)

```text
Freeze → Freeze Validate → Freeze Confirm → (or) Res Cancel / Cancellation Fee
```

## Product types

### Supported offer types

- Room Only
- Room + Ticket (Disney resort)
- Room + Ticket (GNH resort)
- Room + Ticket + Ancillary components
- Room + Ticket + Ancillary selectable components

## API Contracts

Swagger : [DLR DPS Core Offer Swagger](https://dev1.dps-core-offer-dlr.wdprapps.disney.com/dps-dlr/api/api-docs?url=/dps-dlr/api/openapi.json)
Swagger : [DLP DPS Core Offer Swagger](https://dev1.dps-core-offer-dlp.wdprapps.disney.com/dps-dlp/api/api-docs?url=/dps-dlp/api/openapi.json)
Swagger : [DLR DPS Core Quote Swagger](https://dev1.dps-core-quote-dlr.wdprapps.disney.com/dps-dlr/api/api-docs?url=/dps-dlr/api/openapi.json)
Swagger : [DLP DPS Core Quote Swagger](https://dev1.dps-core-quote-dlp.wdprapps.disney.com/dps-dlp/api/api-docs?url=/dps-dlp/api/openapi.json) 
Swagger : [DLR DPS Core ResFlow Swagger (Freeze)](https://dev1.dps-core-resflowmgmt-dlr.wdprapps.disney.com/dps-dlr/api/api-docs?url=/dps-dlr/api/openapi.json)
Swagger : [DLP DPS Core ResFlow Swagger (Freeze)](https://dev1.dps-core-resflowmgmt-dlp.wdprapps.disney.com/dps-dlp/api/api-docs?url=/dps-dlp/api/openapi.json) 


> `{segment}` is the site-specific path segment (e.g., `-dlr`, `-dlp`).

## Key Domain Rules

1. **Price protection** — presented offers are persisted with price state for a configurable TTL, introducing a priceToken object that holds information of the offer context
2. **Offer freeze** — inventory is held via RIS with a freeze ID and TTL
3. **Scoring** — offer candidates are scored and ordered before presentation (configurable schemes)
4. **Personalization** — CEA provides segmentation and upsell recommendations (optional)
5. **Availability is real-time** — RAS, TAS, AAS are checked on every search/quote/freeze
6. **DLR vs DLP** — different product catalogs, code systems, and pipeline configurations
7. **EAI Adapter** — DLP SBC sends XML (OfferQueryRQ), EAI transforms to DPS REST, response transformed back to XML (OfferQueryRS)

## Responsibility Split

### "Disney Packaging" DPS

- Discovers offer candidates, searches eligible products (PAT)
- Scores and organizes candidates (Scoring service)
- Combines packages with add-on products
- Handles product combinability rules
- Personalizes offerings (CEA)
- Integrates with external systems (PVS, TBX) for insurance, car, transfer, add-ons

### "Disney Package Offer" (DPOS layer)

- Checks availability (RAS, TAS, AAS)
- Prices package components (DPE)
- Maintains presented offer and price state (price protection)
- Quotes selected package offer (availability + pricing + price validation)
- Freezes selected package offer (availability + pricing + inventory freeze via RIS)
- Maintains offer freeze IDs and TTL

## Scoring configuration

The Score Scheme Configuration Service manages scoring for offer ranking and selection.

### Domain model

- **Score Scheme** — top-level versioned container (lockable, activatable)
  - **Scoring Dimensions** — bridge preferences to parameters
  - **Rule Sets** — scoring logic (preference value → ranked candidates)
  - **Product Mixes** — execution orchestration (batches, filters, dependency rules)
  - **Sequences** — response grouping definitions
- **Preferences** — guest/system input selections driving scoring
- **Scoring Parameters** — JSON paths to product attributes for evaluation
- **Filters** — output control (deduplication, limits, fallback)

### Scoring flow

1. Guest selects preferences (e.g., "I prefer Grand Californian resort")
1. Active Score Scheme is loaded based on channel/market applicability
1. Scoring Dimensions map preference options to parameter types
1. Rule Sets translate preference values into scored candidate values
1. Product Mixes define batches of offers to evaluate with filters
1. Sequences define how scored offers are grouped in the response

### Versioning pattern

All config resources use semantic versioning (MAJOR.MINOR.PATCH):

- Create → initial version 1.0.0 (active by default)
- Create Version → new snapshot (inactive)
- Activate → makes version current, deactivates previous
- Delete Version → removes specific version (cannot delete active)

## Domain glossary

| Term                | Definition                                                              |
|---------------------|-------------------------------------------------------------------------|
| DPS                 | Disney Package Service                                                  |
| DPOS                | Disney Product Offer Service                                            |
| YMP                 | Yield Management Platform                                               |
| PAT                 | Product and Ticketing (product catalog)                                 |
| TBX                 | TravelBox (legacy system)                                               |
| DLR                 | Disneyland Resort (California)                                          |
| DLP                 | Disneyland Paris                                                        |
| WDW                 | Walt Disney World (Florida)                                             |
| Score Scheme        | Top-level scoring configuration container                               |
| Scoring Dimension   | Maps a preference to parameter types                                    |
| Rule Set            | Scoring logic translating preferences to ranked candidates              |
| Product Mix         | Execution orchestration with batches and filters                        |
| Preference          | Guest/system input driving scoring                                      |
| Scoring Parameter   | JSON path to product attribute for evaluation                           |
| Filter              | Output control (limits, deduplication, fallback)                        |
| Sequence            | Response grouping definition                                            |
| Offer Search        | Core flow: discover, score, price, personalize, return package offers   |
| Offer Freeze        | Hold inventory/pricing for a selected offer                             |
| Offer Quote         | Get final pricing including balance/deposit                             |
| Nimbus              | Disney configuration management system                                  |
| Keystone            | Disney B2B authentication system                                        |
| Harness             | CI/CD platform                                                          |
| Cribl               | Log routing/observability pipeline                                      |
| CSM                 | Configuration/Secrets Management                                        |
| AID                 | Architecture Infrastructure Design                                      |
