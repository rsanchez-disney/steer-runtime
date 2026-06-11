# SBC — CA Requirement Solutioning

Source: [Package Transformation — Requirement Analysis and Solutioning][ra-sol] (Confluence DLPPTP2)

Last synced: 2026-05-22

## How to Update

Ask Kiro:

> Fetch the latest versions of the SBC solutioning pages from Confluence DLPPTP2 (pages 1431044504, 1585741695, 1743393310, 1743033728, 1862492516, 1800800150) and update workspaces/sbc-dlp/sbc-pt-team/context/ca-solutioning.md with any changes since the versions listed below.

| Page                                                  |     ID     | Version at last sync |
|-------------------------------------------------------|:----------:|:--------------------:|
| SBC - Requirement Solutioning - All Room Types        | 1431044504 |         211          |
| SBC - Requirements Solutioning - Offer Search & LOS   | 1585741695 |         198          |
| SBC Quote - Requirement Solutioning                   | 1743393310 |          81          |
| SBC Freeze - Requirement Solutioning                  | 1743033728 |         292          |
| SBC - Requirements Solutioning - Booking Modification | 1862492516 |          76          |
| SBC Reservation Cancellation - Requirement Solutioning| 1800800150 |         124          |

---

## All Room Types — Solutioning

Source: [SBC - Requirement Solutioning - All Room Types][sol-art] (Page 1431044504)

### Step 1: Display Quick Book Offer List (Travel Plan Screen)

- SBC calls Core API Eligibility API passing Guest Context & Search criteria
- Core API calls PAT/DPS Eligibility API
- PAT returns: eligible Marketing Offers/Packages, Package Name/Description, eligible Hotels & Rooms, Room Occupancy Details

### Step 2: Select Quick Book Offer to Get Offer Result

- SBC calls Core API Offer Search with user context + Quick Book Offer + Party Mix
- Room Categories (Standard, Suites, Club) and Accessible flag NOT passed in Offer Request — filtering happens at UI layer
- Any SBC screen action triggers Search / Quote / Freeze / Validate Freeze calls

### Modification Scenarios (Edit Accommodation)

| Action                    | Core API Action     | Expected Result                                                              |
|---------------------------|---------------------|------------------------------------------------------------------------------|
| Modify Resort             | GetOffers           | All rooms for resorts at best price across marketing offers (no duplicates)  |
| Modify Room               | ValidateOffer       | All rooms for initially booked resort at best price (no duplicates)          |
| Modify Offer              | ValidateOffer       | All rooms for selected OfferGroupCode or OfferType                           |
| Modify Resort+Room+Offer  | GetOffers           | All unique best price rooms for selected offer across all hotels             |
| Modify Number of Rooms    | ValidateOffer       | Per-room offer calls with party mix split; GOT/WANT inventory handling       |

Multi-room pricing: DPS sends prices for min-to-max room counts in initial search so SBC can display without additional quote calls when user changes room count dropdown.

### Refine Scenarios

| From Screen        | Target   | Action                    | Behavior                                                                |
|--------------------|----------|---------------------------|-------------------------------------------------------------------------|
| Offer Screen       | Resort   | findFacilitiesForOfferType/Group | All resorts restricted by selected individual/group offer        |
| Offer Screen       | Room     | Disabled                  | All rooms already displayed in results                                  |
| Offer Screen       | Package  | RefineWithoutPrice        | All Quick offers (individual + group) restricted by hotel, no prices    |
| Reservation Screen | Resort   | Disabled                  | Not applicable                                                          |
| Reservation Screen | Room     | ValidateOffer             | All room types with prices, restricted by offer/package/hotel           |
| Reservation Screen | Package  | RefineOffer               | All individual Quick offers with prices, restricted by hotel/room type  |

### Key SBC Behaviors

- Displays offer sets in sequence (best offer/lowest price within group)
- Calls Core API Extn `POST: /product-reference/api/v1/roomOccupancy` for occupancy details (not in Offer Response)
- Displays min rooms required & price for each room type
- If `Rooms_Available < Min rooms required`: displays value in RED
- If quoting a room where `Rooms_Available < Min`: sends `Bypass Avail Check = true`
- Implements Room Type Filters (Standard, Suites, ACC, Club) via SBC Admin mapping
- Default filter hides Accessible Room Offers
- Calculates price difference between rooms across all offers (recalculated on filter change)

### System Flow

```text
SBC → Core API → DPS → PAT (eligibility)
                      → DPOS → Room Avail Service
                             → CME (ticket availability)
                             → Ancillary Avail Service
                             → DPE (pricing)
                      → Scoring & Sequencing (RALPH)
DPS → Core API → SBC
```

### DPS Logic

- Calls PAT with 1 Adult party mix to get all rooms (even those not fitting full party)
- Calculates min rooms required per eligible room based on party mix + occupancy
- Passes `LowestPriceRoomTypesByResortAcrossMarketingOffers` filter to DPOS
- DPOS sends Room Quantity = 1 per room to Room Avail Service
- DPOS filters to return lowest price per room type per resort across all marketing offers
- DPS compares rooms available vs min rooms needed; populates `Rooms_Available` if insufficient
- Returns offer sets with min-to-max room counts and prices

---

## Offer Search & LOS/LOS+1 — Solutioning

Source: [SBC - Requirements Solutioning - Offer Search and LOS/LOS+1][sol-los] (Page 1585741695)

### Package Structure Selection Matrix

| Path     | Travel Plan Selection | Offer Screen Filter         | Offers Displayed       |
|----------|----------------------|-----------------------------|------------------------|
| Quick    | LOS Selected         | Disabled, prefilled LOS     | LOS offers             |
| Quick    | LOS+1 Selected       | Disabled, prefilled LOS+1   | LOS+1 offers           |
| Quick    | None, agent picks LOS | Disabled, prefilled "None" | LOS offers             |
| Quick    | None, agent picks LOS+1 | Disabled, prefilled "None" | LOS+1 offers         |
| Quick    | Group offer selected | Selectable                  | Both (RMA recommended) |
| Standard | LOS Selected         | Selectable, prefilled LOS   | LOS offers             |
| Standard | LOS+1 Selected       | Selectable, prefilled LOS+1 | LOS+1 offers          |
| Standard | None Selected        | Selectable, prefilled None  | Both (RMA recommended) |

### SBC Capabilities

- Filters offers using `PackageStructure` attribute from response (LOS / LOS+1 / Room Only)
- If no offers for selected filter: error message + dropdown to change selection
- If no Package Structure and no Quick offer selected: displays RMA recommended offers with clear LOS/LOS+1 visual indicator
- Primary recommended offer displayed + at least one alternate (LOS if primary is LOS+1)
- In Quick Path, if selected offer unavailable: error message + alternate offers (LOS/Flex) displayed

### Core API / DPS Flow

- SBC sends 2-char Source Market (not 3-char)
- Core API defaults `excludeAssumptiveAddon = false`
- DPS calls PAT eligibility with: user context, search criteria, Marketing Offer Code, Room Count, Party Mix per Room, Room Categories, Accessible flag
- PAT returns: SKU IDs, Marketing Offer Code/Name, Package Name/Description, PLU codes for LOS/LOS+1, PackageStructure UDA attribute, Classification, eligible Hotels & Rooms, Assumptive Add-on codes
- DPS sends PLU codes to DPOS per classification (LOS = N days, LOS+1 = N+1 days)
- DPOS calls: Room Avail, CME, Ancillary Avail, DPE
- DPS applies Scoring (RMA), Segmentation (Nice CEA), Sequencing (RALPH)
- Returns offers with: SKU IDs, Offer IDs, Package Name/Description, Plan Type, Package_Structure, Prices

### Modification Scenario

- SBC sends WANT details with Offer code = "NONE" from "Edit Accommodation" screen
- Core API sends old reservation details to DPS (ChildId, ParentId, SubChildId)
- DPS retrieves existing reservation via TBX BasketReadRS
- DPOS receives existing reservation details + Price Token for GOT/WANT pricing

---

## Quote — Solutioning

Source: [SBC Quote - Requirement Solutioning][sol-quote] (Page 1743393310)

### Quote vs Freeze

| Action | Trigger                          | API Call                    |
|--------|----------------------------------|-----------------------------|
| Quote  | "Quote" button on Offer Screen   | RoomQuoteRQ (isFreeze=false) |
| Freeze | "Select" button on Offer Screen  | RoomQuoteRQ (isFreeze=true)  |

### Application Capabilities

| System         | Responsibilities                                                                                 |
| ----------------| --------------------------------------------------------------------------------------------------|
| SBC            | Displays total price incl. mandatory add-ons, per-pax pricing, deposit/balance, commission       |
| Core API       | Routes Quote/Freeze to DPS, fetches Agency/Client from TBX, passes party mix + offer identifiers |
| DPS            | Calls PAT eligibility, fetches assumptive add-ons via combinability, orchestrates DPOS calls     |
| PAT            | Returns eligible products, package/SKU details, assumptive add-ons                               |
| DPOS           | Checks/freezes inventory (Room, CME, Ancillary), calls DPE for pricing, builds package response  |
| DPE            | Calculates Room/Ticket/Ancillary prices, tax, commission, discount, deposit/balance              |
| Policy Service | Deposit rules, due dates, cancellation/modification fees                                         |
| TBX            | Agency setup, client group, commission type (Net/Gross/None)                                     |

### DPE Pricing Methods

| Method    | Applies To                |
|-----------|---------------------------|
| PER_NIGHT | Rooms                     |
| PER_DAY   | Tickets, shows            |
| ONE_TIME  | Unitary add-ons           |

---

## Freeze — Solutioning

Source: [SBC Freeze - Requirement Solutioning][sol-freeze] (Page 1743033728)

### Key Concepts

| Concept              | Description                                                              |
|----------------------|--------------------------------------------------------------------------|
| Price Protection TTL | Configurable duration protecting offer prices during a session           |
| Freeze TTL           | Configurable duration freezing price AND inventory after offer selection  |
| ConversationId       | Session identifier owned by SBC                                          |
| OfferCollectionId    | Price protection group identifier managed by DPOS                        |
| FreezeId             | Inventory freeze identifier managed by DPOS                              |
| PriceToken           | Price reference for validate/confirm flows                               |

### Application Scenarios

| Scenario                          | PP Expired | Price Changed | Availability | Backend Behavior                                                    |
|-----------------------------------|:----------:|:-------------:|:------------:|---------------------------------------------------------------------|
| Search (basic)                    | No         | N/A           | Yes          | Returns offers with PP TTL                                          |
| Search (refine, new criteria)     | No         | N/A           | Yes          | New offers added under same TTL                                     |
| Search (partial unavailable)      | No         | N/A           | Partial      | Returns available + unavailable with reason                         |
| Search (PP expired, no change)    | Yes        | No            | Yes          | Returns expired=true, priceChanged=false                            |
| Search (PP expired, price change) | Yes        | Yes           | Yes          | Returns expired=true, priceChanged=true, old/new prices             |
| Quote (successful)                | No         | N/A           | Yes          | Returns offer with PP TTL                                           |
| Quote (unavailable)               | No         | N/A           | No           | Returns unavailable with reason                                     |
| Quote (PP expired, no change)     | Yes        | No            | Yes          | Returns expired=true, priceChanged=false                            |
| Quote (PP expired, price change)  | Yes        | Yes           | Yes          | Returns new offer with new TTL, old/new prices                      |
| Freeze (basic)                    | No         | N/A           | Yes          | Returns freezeId + Freeze TTL                                       |
| Freeze (unavailable)              | No         | N/A           | No           | No freezeId, unavailable with reason                                |
| Freeze (PP expired, no change)    | Yes        | No            | Yes          | Returns freezeId + Freeze TTL, expired=true                         |
| Freeze (PP expired, price change) | Yes        | Yes           | Yes          | No freeze (noFreezeOnPriceChange), returns new offer + new PP TTL   |
| Freeze (refine/new offer)         | No         | No            | Yes          | GOT/WANT inventory handling, returns new freezeId                   |
| Validate (freeze extension)       | N/A        | N/A           | Yes          | New freezeId with extended TTL                                      |
| Validate (freeze extension fail)  | N/A        | N/A           | No           | Error response, no freezeId                                         |
| Confirm                           | N/A        | N/A           | Yes          | Same as validate but confirms booking (no TTL extension)            |

### Application Capabilities

| System                    | Capabilities                                                                                          |
|---------------------------|-------------------------------------------------------------------------------------------------------|
| DPOS                      | Maintains independent PP/Freeze TTLs, creates OfferCollectionId, manages FreezeId/PriceToken, batch thaw |
| SBC UI                    | Owns ConversationId, initiates Search/Quote/Freeze/Validate/Cancel, handles PP expiry messaging       |
| Core API                  | Orchestration façade, routes Search/Quote/Freeze/Validate/Cancel, returns consolidated responses      |
| DPS                       | Session cache (ConversationId, OfferCollectionId), calls PAT eligibility, orchestrates DPOS calls     |
| PAT                       | Evaluates offer eligibility, returns product details for all flows                                    |
| Room Avail Service        | Availability checks, bid price validation, GOT/WANT during modify                                    |
| Room Inventory Service    | Freezes/thaws via AIM Freeze API, GOT/WANT logic, batch thaw on TTL expiry                           |
| CME                       | Ticket availability/freeze, supports Cancel and rebook, GOT/WANT                                     |
| Ancillary Service         | Ancillary availability/freeze, GOT/WANT logic                                                        |
| TBX                       | Booking confirmation using freezeIds, persists PriceToken, BasketRead API                            |
| DPE                       | Prices room/ticket/ancillary, evaluates GOT PriceToken during modify/validate                        |

---

## Booking Modification — Solutioning

Source: [SBC - Requirements Solutioning - Booking Modification][sol-mod] (Page 1862492516)

### Flows

1. Search & Retrieve Reservation
2. Modify Guest/TA Client File
3. Modify Party Mix
4. Modify Add-on
5. Modify Reservation (Package Modification)
6. Validate Flow

### API Mapping

| Scenario              | SBC → Core API                          | Core API → TBX                    | Core API → DPS         |
|-----------------------|-----------------------------------------|-----------------------------------|------------------------|
| Search Reservation    | v1/reservations/packages/search         | BookingSearchRQ, ProfileReadRQ    | N/A                    |
| Retrieve Reservation  | v1/reservations/{orderId}/packages      | BasketReadRQ, ProfileReadRQ       | N/A                    |
| Modify Guest/TA       | v1/guests/{guestId}                     | OTAX_ProfileModifyRQ              | N/A                    |
| Modify Party Mix      | v1/orders/{orderId}/guests              | OTAX_BookingPassengerUpdateRQ     | N/A                    |
| Ancillary Load        | getCombinableProducts                   | TBD                               | TBD                    |
| Ancillary Search      | MiscAvailabilityRQ                      | TBD                               | TBD                    |
| Ancillary Quote       | MiscQuoteRQ                             | TBD                               | TBD                    |
| Ancillary Cancel      | CancellationPenaltyQueryRQ / ComponentCancelRQ | OTAX_BookingCancellationFeeRQ | DPS → DPOS → DPE      |
| Change Hotel/Room/Offer/Dates/Party/Rooms | OfferQueryRQ              | Light weight BasketRead           | /sales-offers/packages |

### Modification OfferQueryRQ Parameters

GOT parameters sent in all modification searches:

- PackageCode (GOT Package Code)
- ResortCode, RoomType, ItemQuantity
- Stay StartDate/EndDate, LOS
- ChildId, ParentId, SubChildId
- ReservationEndDate

WANT parameters vary by modification type:

| Modify Type    | WANT-specific Parameters                                           |
|----------------|--------------------------------------------------------------------|
| Change Hotel   | GroupCode (PDisneyHotel/PSnAHotel/PVNHotel) + ItemCode             |
| Change Room    | ResortCode + RoomType                                              |
| Change Offer   | GroupCode (DRPOfferType) + ItemCode (PAT code or "NONE")           |
| Change # Rooms | RoomQuantity                                                       |
| Change Dates   | ResortArrivalDate, ResortDepartureDate, ResortLOS                  |
| Change Party   | PartyAgeInfo (AdultFlag, ChildFlag, IsInfant, Age) + Room Quantity |

### Cancellation (Partial)

- PAT/TBX has indicator at product level to distinguish internal vs external products
- Internal products: SBC → Core API → TBX provides cancellation fees
- External products: SBC → Core API → TBX → DPS → DPOS → DPE provides cancellation fees
- Partial cancellation: multiple domain calls with specific package PBP numbers

---

## Cancellation & Cancellation Rules — Solutioning

Source: [SBC Reservation Cancellation & Cancellation Rules - Requirement Solutioning][sol-cancel] (Page 1800800150)

(Detailed solutioning available in Confluence — 124 versions, actively maintained)

---

## Key Systems Reference

| System   | Role                                                         |
|----------|--------------------------------------------------------------|
| SBC      | CRC agent UI — search, filter, quote, freeze, confirm        |
| Core API | Orchestration layer between SBC and DPS/TBX                  |
| DPS      | Dynamic Pricing Service — offer search, scoring, session mgmt |
| DPOS     | Dynamic Pricing Offer Service — availability, pricing, freeze |
| PAT      | Product Authoring Tool — offer eligibility, SKU config        |
| DPE      | Dynamic Pricing Engine — price calculation                    |
| CME      | Capacity Management Engine — ticket availability/freeze       |
| RALPH    | Room sequencing                                              |
| RMA      | Revenue Management Algorithm — offer recommendations         |
| TBX      | Booking system — reservations, profiles, basket              |
| AIM      | Room inventory freeze system                                 |

---

## Related Confluence Pages

| Page                                                    |     ID     |
|---------------------------------------------------------|:----------:|
| SBC - Requirement Solutioning - All Room Types          | 1431044504 |
| SBC - Requirements Solutioning - Offer Search & LOS     | 1585741695 |
| SBC Quote - Requirement Solutioning                     | 1743393310 |
| SBC Freeze - Requirement Solutioning                    | 1743033728 |
| SBC - Requirements Solutioning - Booking Modification   | 1862492516 |
| SBC Reservation Cancellation - Requirement Solutioning  | 1800800150 |
| SBC - UAC Design Mapping - Freeze                       | 1754356264 |
| SBC - UAC Design Mapping - All Room Types               | 1754780690 |
| SBC - UAC Design Mapping - Booking Modification         | 1862492519 |
| SBC - UAC Design Mapping - Offer Search & LOS           | 1770988042 |
| SBC Quote - UAC Design Mapping                          | 1754361353 |
| SBC Reservation Cancellation - UAC Design Mapping       | 1800800152 |

<!-- Links -->
[ra-sol]: https://confluence.disney.com/spaces/DLPPTP2/pages/1651854474/Requirement+Analysis+and+Solutioning
[sol-art]: https://confluence.disney.com/spaces/DLPPTP2/pages/1431044504
[sol-los]: https://confluence.disney.com/spaces/DLPPTP2/pages/1585741695
[sol-quote]: https://confluence.disney.com/spaces/DLPPTP2/pages/1743393310
[sol-freeze]: https://confluence.disney.com/spaces/DLPPTP2/pages/1743033728
[sol-mod]: https://confluence.disney.com/spaces/DLPPTP2/pages/1862492516
[sol-cancel]: https://confluence.disney.com/spaces/DLPPTP2/pages/1800800150
