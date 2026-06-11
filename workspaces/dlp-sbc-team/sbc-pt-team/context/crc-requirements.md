# SBC — CRC Epic Requirements

Source: [Package Transformation Home][pt-home] (Confluence DLPPTP2)

Last synced: 2026-05-22

## How to Update

Ask Kiro:

> Fetch the latest versions of the SBC epic requirements pages from Confluence DLPPTP2 (pages 1704075370, 1704075270, 1616301728, 1616303034, 1616306217, 1616303966, 1616303724, 1870091145, 2188819149, 2188819319) and update workspaces/sbc-dlp/sbc-pt-team/context/crc-requirements.md with any changes since the versions listed below.

| Page                                                     | ID         | Version at last sync |
| ----------------------------------------------------------| :----------:| :--------------------:|
| SBC All Room Type - Epic Requirements                    | 1704075370 | 44                   |
| SBC LOS/LOS+1 - Epic Requirements                        | 1704075270 | 50                   |
| SBC Quote - Epic Requirements                            | 1616301728 | 75                   |
| SBC Freeze - Epic Requirements                           | 1616303034 | 54                   |
| SBC Reservation Modification - Epic Requirements         | 1616306217 | 72                   |
| SBC Reservation Cancellation & Rules - Epic Requirements | 1616303966 | 28                   |
| SBC Product Combinability - Epic Requirements            | 1616303724 | 30                   |
| SBC Travel Wish - Epic Requirements                      | 1870091145 | 15                   |
| SBC - Number of Room & Sorting CRs - Epic Requirements   | 2188819149 | 2                    |
| SBC - Standalone Ticket CR - Epic Requirements           | 2188819319 | 1                    |

---

## All Room Types (Page 1704075370)

### US1 — All Room Type Display

As a CRC agent, I want to see all room types for each offer on the Offer screen.

- UAC01.1: Offer screen displays lowest available price per room type (per RMA eligibility)
- UAC01.2: RMA recommendations (Best Match, Showcased) use same labels as website
- UAC01.3: Offer name identifiable for each room type on Offer and Reservation screens
- UAC01.4: Unavailable room types not displayed
- UAC01.5: All results load within max 10 seconds

### US2 — Offer Screen Filters

As a CRC agent, I want room type filters prominently displayed on the Offer screen.

- UAC02.1: Filters displayed: Standard, Suites, ACC, Club. System allows configuration of which room categories fall under each filter

### US3 — Automatic Price Display

As a CRC agent, I want prices of all offers displayed automatically without clicking "Quote".

- UAC03.1: Prices displayed automatically on arrival at Offer screen, within max 10 seconds

### US4 — Default State of Filters

As a CRC agent, I want defaults showing Standard, Club, Suites while hiding ACC rooms.

- UAC04.1: Default filters: Standard, Club, Suite checked; ACC unchecked
- UAC04.2: Default filter settings can be modified later (not date-driven, change applied same day)

### US5 — Accessible Room Filter

- UAC05.1: ACC checked → Accessible rooms displayed alongside non-accessible in selected categories
- UAC05.2: ACC unchecked → All Accessible rooms hidden
- UAC05.3: ACC + category filters → Both accessible and non-accessible in selected categories displayed
- UAC05.4: ACC unchecked after being checked → ACC rooms hidden, other filters maintained

### US6 — Suite Filter

- UAC06.1: SUITES checked → Suites displayed alongside other checked categories
- UAC06.2: SUITES unchecked → All Suite rooms hidden

### US7 — Club Rooms Filter

- UAC07.1: Club checked → Club rooms displayed alongside other checked categories
- UAC07.2: Club unchecked → All Club rooms hidden

### US8 — Standard Filter

- UAC08.1: Standard checked → Standard rooms displayed alongside other checked categories
- UAC08.2: Standard unchecked → All Standard rooms hidden

### US9 — Hide/Unhide Functionality

- UAC09.1: Toggling any filter updates displayed room types immediately without errors

### US10 — CostAdjustment Display

- UAC10.1: "CostAdjustment" column shows price differences between selected offer (parent) and other rooms in same set

### US11 — Modification Flow (Edit Accommodation)

- UAC11.1: "All Room Type" accessible on Offer Screen during modification
- UAC11.2: Room type filters function same as booking flow
- UAC11.3: All prices displayed without clicking "Quote"
- UAC11.4: Offer names clearly readable
- UAC11.5: CostAdjustment column displays price variations
- UAC11.6: "Change offer" dropdown includes offers AND groups of offers

### US12 — Group of Offers & Quick Book

- UAC12.1: Group of offers selected → best offer (lowest price) within group displayed per offer line for all room types
- UAC12.2: Specific offer selected → only rooms under that offer displayed
- UAC12.3: Same behavior applies in modification flow

### US13 — Multiple Room

- UAC13.1: Offer screen displays min rooms required per room type with corresponding prices (e.g., 6 adults → rooms with max 4 priced for 2 rooms)
- UAC13.2: Agent can modify number of rooms per room type to generate updated quote
- UAC13.3: All room types with at least one room available are displayed

### US14 — Refine (Offer Screen)

- UAC14.1: "Refine Offer" allows selecting new offer/group and displays prices for all room types
- UAC14.2: "Refine Hotel" allows selecting different hotel while retaining offer, displays all room types

### US15 — Refine (Reservation Screen)

- UAC15.1: "Refine" allows modifying selected room type
- UAC15.2: Multiple rooms: refine allows modifying one room block with different room types
- UAC15.3: "Refine Offer" allows modifying offer/group and displays all room types with prices
- UAC15.4: Multiple rooms: refine offer allows modifying offer for one room block

### US16 — Modification Multiple Room

- UAC16.1: Edit allows modifying offer for one room block, others unchanged
- UAC16.2: Edit allows modifying room type for one room block, others unchanged
- UAC16.3: Adding a room allows selecting new offer/room type distinct from existing

### US17 — Filters Alert Message

- UAC17.1: No filters selected → message inviting user to check one filter
- UAC17.2: Only ACC selected → message inviting user to select at least one room category
- UAC17.3: Filters selected but no matching rooms → message inviting user to modify selection

### US18 — Price with Mandatory Add-ons

- UAC18.1: Price on top of each block includes mandatory add-ons (e.g. local tax)

---

## LOS/LOS+1 (Page 1704075270)

### US1 — Package Structure Identification

As a CRC agent, I want to identify the package structure throughout the booking flow.

- UAC01.1: Offer names throughout booking and Travel Wish flows clearly indicate included components

### US2 — Package Filters (Travel Plan)

As a CRC agent, I want to filter preferred package structure on Travel Plan screen.

- UAC02.1: Dropdown available: "None", "LOS", "LOS+1"
- UAC02.2: Selection filters Quick Book dropdown to matching offers/groups
- UAC02.3: Selection serves as default filter on Offer screen (Standard Path)
- UAC02.4: Only one package structure selectable at a time
- UAC02.5: "None" selected → all offers/groups available in Quick Book dropdown
- UAC02.6: Dropdown activation/deactivation configurable based on context; enabled only when both LOS and LOS+1 offers exist in quickbook list
- UAC02.7: Agent can determine if commercial offer (LOS) is open for sale based on context (satisfied by absence in QB dropdown)
- UAC02.8: Package structure filter not applied when clicking "Stand Alone" for tickets
- UAC02.9: Filter can be toggled on/off (hidden/shown) for a set period

### US3 — Package Filters (Offer Screen)

As a CRC agent, I want to filter package structure on Offer screen without triggering new search.

- UAC03.1: Dropdown (None/LOS/LOS+1) filters displayed offers
- UAC03.2: Non-matching offers hidden, no new search triggered
- UAC03.3: No filter selected → all offers shown regardless of package structure
- UAC03.4: Filter can be changed/removed dynamically without delay
- UAC03.5: No matching offers for filter → configurable message inviting agent to remove filter
- UAC03.6: REMOVED (no longer required per CRC confirmation)
- UAC03.7: Filter can be disabled/enabled on Offer Screen (toggle on/off)

### US4 — Offer Display (Standard Path)

As a CRC agent using standard path without package structure filter, I want to see primary and alternative offers recommended by RMA.

- UAC04.1: Requested offer (Offer 1) and RMA-recommended alternatives displayed and clearly identifiable
- UAC04.2: Main RMA-recommended offer displayed first; at least one alternative (e.g., LOS if primary is LOS+1) shown if available

### US5 — Quick Book Path Search

As a CRC agent, I want to filter offers by package structure using Quick Book Path.

- UAC05.1: Specific offer/group selected → only matching offers displayed
- UAC05.2: Selected offer unavailable → clear error message + alternative offers displayed
- UAC05.3: Specific offer selected → package structure filters disabled on Offer screen
- UAC05.4: Group offer with both LOS/LOS+1 selected → filters remain available
- UAC05.5: Filter activation/deactivation dynamically configurable based on Quick Book selection type

### US6 — Refine Package Structure (Offer Screen)

- UAC06.1: Agent can refine offer to switch between LOS/LOS+1, all room types updated
- UAC06.2: Agent can select offer/group to change current offer, all room types at best price displayed

### US7 — Refine Package Structure (Reservation Screen)

- UAC07.1: Single room: agent can refine LOS↔LOS+1, room types displayed accordingly
- UAC07.2: Agent can select group of offers, all room types at best price displayed
- UAC07.3: Multiple rooms: agent can refine one room while keeping others unchanged
- UAC07.4: Changes reflected in total price and offer details

### US8 — Modification Flow

- UAC08.1: Agent can modify package structure (LOS↔LOS+1) without altering other details
- UAC08.2: Agent can modify package structure AND other elements simultaneously
- UAC08.3: "Edit Accommodation" allows selecting group of offers
- UAC08.4: No specific group selected → all rooms at best offer shown, LOS/LOS+1 filters usable
- UAC08.5: Multiple rooms: each room modifiable individually

---

## Quote (Page 1616301728)

### US1 — Price with Local Tax

- Moved to All Room Type epic (US18)

### US2 — Price Display on Reservation Screen

- UAC02.1: Correct price displayed after offer selection
- UAC02.2: Correct net/gross prices for travel agency bookings
- UAC02.3: Deposit amount displayed as received from back-end (SBC does not calculate)
- UAC02.4: Individual price per room for multiple rooms
- UAC02.5: Price of newly selected product when refining

### US3 — Detailed Price Per Passenger (Booking)

- UAC03.1: Price per pax column and pop-up shows exact price per product/add-on and proportional amounts

### US4 — Detailed Price Per Passenger (Modification)

- UAC04.1: Total price updated correctly after modification
- UAC04.2: Price per pax details reflect updated prices

### US5 — Price Per Passenger (Cancellation)

- Canceled — covered in Cancellation Rules epic (UAC2.3)

---

## Freeze (Page 1616303034)

### US1 — Price Protection and Freeze TTL Duration

- UAC01.1: PP TTL configurable
- UAC01.2: Freeze TTL configurable
- UAC01.3: PP and Freeze TTLs independent

### US2 — Price Protection During Search (Booking Flow)

- UAC02.1: All offers protected after first search until PP TTL expires or session ends
- UAC02.2: Agent can modify search criteria during TTL
- UAC02.3: New search: existing offers keep protected price; new offers added for remaining TTL
- UAC02.4: Protection continues regardless of actions until TTL expiry or session end

### US3 — Price Protection After TTL Expiration

- UAC03.1: On offer selection after expiry: price changed → agent decides; unchanged → proceed
- UAC03.2: On new search after expiry: message notifies new PP TTL starting

### US4 — Price Protection Multiple Rooms

- UAC04.1: Price protected per room configuration
- UAC04.2: Switching between configurations retains protected prices

### US5 — Price Protection Refine (Offer Screen)

- UAC05.1: Previously priced offers keep protected price; new offers added for remaining TTL
- UAC05.2: Protection maintained across multiple refines

### US6 — Price Protection Refine (Reservation Screen)

- UAC06.1/06.2: Same as US5 on Reservation Screen

### US7 — Start of Freeze

- UAC07.1: "Continue" freezes price + inventory; errors keep agent on Offer Screen; back navigation preserves freeze if no new selection

### US8 — Freeze Multiple Rooms

- UAC08.1: All selected rooms frozen on "Continue"
- UAC08.2: Rooms unavailable → error "only X rooms left"

### US9 — Freeze Refine (Reservation Screen)

- UAC09.1: Old room not released until new room frozen
- UAC09.2: New room unavailable → error message
- UAC09.3: Multiple rooms refined individually, TTLs synchronized

### US10 — Freeze Extension / Booking Confirmation

- UAC10.1: Adding addon extends TTL (nice to have)
- UAC10.2: "Confirm All": TTL valid → extend; expired no change → keep; expired with change → error + accept/reject
- UAC10.3: Booking failure → error, redirect with freeze active

### US11 — Modification Flow

- UAC11.01: PP applies during modification; original not released until confirmed; one room at a time
- UAC11.02: Freeze on "Continue" same as booking
- UAC11.03: Multiple simulations allowed during modification

### US12 — Price and Inventory Thaw

- UAC12.01: "Start New" clears previous
- UAC12.02: Closing page thaws
- UAC12.03: TTL expiry thaws + notifies
- UAC12.04: Refine: freeze new, thaw old
- UAC12.05: Back + new selection: freeze new, thaw old

### US13 — Travel Wish Conversion Flow

- UAC13.01: Travel Wish prices protected
- UAC13.02: "Continue" freezes all components
- UAC13.03: New discovery follows booking flow

---

## Reservation Modification (Page 1616306217)

(72 versions — actively maintained. Key UACs cover hotel/room/offer/dates/party mix/number of rooms changes with GOT/WANT handling.)

---

## Reservation Cancellation & Rules (Page 1616303966)

(28 versions — covers cancellation fees per pax, partial cancellation, reason codes, internal vs external product fee calculation.)

---

## Product Combinability (Page 1616303724)

(30 versions — covers add-on combinability rules, assumptive add-ons, package composition constraints.)

---

## Travel Wish (Page 1870091145)

(15 versions — covers Travel Wish creation, retrieval, conversion to booking, price protection during conversion.)

---

## Change Requests (Draft)

### SBC - Number of Rooms & Sorting CRs (Page 2188819149)

(v2 — Draft)

### SBC - Standalone Ticket CR (Page 2188819319)

(v1 — Draft)

---

## Key Business Rules

- SBC does not calculate any amounts — all prices/deposits come from back-end
- Price Protection and Freeze TTLs are independent and configurable
- Package Structure types: LOS, LOS+1, Room Only
- Applies to all sales channels, affiliations, and hotel types (Disney, VNP, S&A)
- Room type filters (Standard, Suites, ACC, Club) are UI-level filtering on full result set
- Multiple room bookings supported with synchronized freeze TTLs
- Modification flow preserves original booking until new selection confirmed
- Quick Book offers come from PAT eligibility (replacing PVaaS)
- RMA scoring determines offer recommendations and sequencing

<!-- Links -->
[pt-home]: https://confluence.disney.com/spaces/DLPPTP2/pages/968749591/Package+Transformation+Home
