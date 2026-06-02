# Travel Wishes – Architecture & Functionality

## Overview

Travel Wishes (TW) is a feature in SBC-DLP that allows agents to save a guest's desired travel configuration (accommodation, transport, add-ons) as a persistent record. This record can later be retrieved, quoted, and converted into a full reservation. Travel Wishes serve as a "save for later" mechanism and also support marketing info requests.

---

## Lifecycle & State Machine

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                                                             │
   Agent creates    │         DLPaaP message            Message fails             │
   Travel Wish      ▼         succeeds                                            │
┌──────────┐    ┌────────┐    ┌────────┐           ┌─────────┐                   │
│  Create  │───▶│ VALID  │    │ VALID  │           │ TRANSIT │◀──── Recovery ─────┘
│  (save)  │    │        │◀───│        │           │         │      retries
└──────────┘    └────────┘    └────────┘           └─────────┘
                    │                                     │
                    │ Agent retrieves &                   │ Admin recovery
                    │ confirms quote                      │ resends message
                    ▼                                     ▼
               ┌─────────┐                          ┌────────┐
               │ BOOKED  │                          │ VALID  │ (if retry succeeds)
               │         │                          └────────┘
               └─────────┘
                    │
                    │ Cleanup agent
                    ▼
               ┌──────────┐
               │ REMOVED  │ (deleted from DB)
               └──────────┘
```

### States

| State | Meaning | Next Transition |
|-------|---------|-----------------|
| `VALID` | Active TW, message sent successfully to DLPaaP | Retrieved → BOOKED, or Expired → REMOVED |
| `TRANSIT` | TW created in DB but DLPaaP message failed | Admin recovery → VALID, or stays TRANSIT |
| `BOOKED` | TW converted to a confirmed reservation | Cleanup agent → REMOVED |

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                             SBC-DLP Application                                     │
│                                                                                    │
│  ┌─────────────────┐     ┌──────────┐     ┌─────────────────┐                     │
│  │ TravelWishAction │────▶│  TWUtil  │────▶│ TPSS-Client     │──────▶ SBC Database │
│  │ (Struts Action)  │     │ (Logic)  │     │ (Persistence)   │       (TOS tables)  │
│  └─────────────────┘     └──────────┘     └─────────────────┘                     │
│          │                     │                                                    │
│          │                     ▼                                                    │
│          │            ┌──────────────────┐     ┌──────────────────┐                │
│          │            │TravelWishAdaptor  │────▶│ TravelWishRQXml  │                │
│          │            │(EAI Messaging)   │     │ (XML Builder)    │                │
│          │            └──────────────────┘     └──────────────────┘                │
│          │                     │                                                    │
│          │                     ▼                                                    │
│          │            ┌──────────────────┐                                          │
│          │            │   EAI Message    │──────────▶ DLPaaP Microservice           │
│          │            │   Infrastructure │◀──────────  (External)                   │
│          │            └──────────────────┘                                          │
│          │                                                                          │
│          ▼                                                                          │
│  ┌─────────────────┐                                                               │
│  │  PCS Client     │──────▶ Product Combinability Service                           │
│  │  (Validation)   │        (validates on TW retrieval)                             │
│  └─────────────────┘                                                               │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. TravelWishAction (`com.dd.actions.TravelWishAction`)

The main Struts action handling all Travel Wish user interactions. Responds with JSON for Vue3 frontend.

**Modes (URL parameter `mode`):**

| Mode | Purpose | Response |
|------|---------|----------|
| `add` | Initialize TW creation form (type: createTravelWish) | JSON: `TravelWishDataDTO` with pre-filled guest/form data |
| `infoRequest` | Initialize info request form (type: infoRequest) | JSON: `TravelWishDataDTO` |
| `save` | Save TW to database + send to DLPaaP | JSON: `{travelWishID, twSavedDays}` |
| `don't save` / `cancel` | Cancel TW and navigate away | Forward to appropriate page |
| `twSearch` | Initialize search form | JSON: boolean (isTemplateIdSet) |
| `twSearchResult` | Execute search by name/email/TW number | JSON: array of `TravelWishDataDTO` |
| `twQuote` | Get pricing for a selected TW | JSON: `TravelWishDataDTO` with `componentsData` |
| `goDiscovery` | Load TW into session for discovery flow | Sets itinerary in session |
| `twConfirmQuote` | Confirm TW and move to reservations | JSON: `{data: "continue"}` or PCS alerts |

### 2. TWUtil (`com.dd.util.TWUtil`)

Central utility class for Travel Wish business logic.

**Key methods:**

| Method | Purpose |
|--------|---------|
| `saveTW()` | Creates TPS in database, sends XML to DLPaaP, handles TRANSIT state on failure |
| `getRetrieveTravelWishDataList()` | Searches TWs by ID, first name, last name, or email |
| `convertTWtoBooked()` | Changes TW state to BOOKED, adds reservation external reference |
| `sendTWMessage()` | Resends TW message to DLPaaP (used for recovery) |
| `searchTravelWishByDate()` | Searches TWs by date range and state (admin recovery) |
| `customSearch()` | Flexible search via `SearchCriteria` |
| `getPrimaryGuestOrSurpriser()` | Finds the primary guest or surprise planner from party |

### 3. TravelWishAdaptor (`com.dd.compensation.adaptor.TravelWishAdaptor`)

EAI messaging adaptor that sends the Travel Wish to the DLPaaP microservice.

**Flow:**
1. Builds XML request via `TravelWishRQXml`
2. Sends via `MultipleEventMessage.sendReceiveMessage()`
3. Parses response via `TravelWishRSXml`
4. Reports success/failure (checks for `<Success/>` in response XML)

### 4. TravelWishRQXml (`com.dd.xmlhelper.TravelWishRQXml`)

Builds the XML message to send to DLPaaP. Maps `TravelPlanSegment` data to JAXB-generated message types.

**XML structure built:**
- `MessageHeader` — conversation ID, message ID, timestamp
- `InfoTravelWish` — party count, children ages, TW ID, total price, currency, request/propose hotel details
- `CustomerInfo` — name, address, email, phone, opt-in flag
- `QuestionsInfo` — 5 survey questions with answers
- `GeneralBookingInfo` — SOB, SLM (division), language, call date, agent ID
- `TransactionInfo` — conversation ID, message ID, timestamp
- `ProposeOffer` — hotel offers, add-on offers, transportation offers (with pax info, dates, package codes)

### 5. TPSS-Client Module (Database Layer)

The persistence layer for Travel Wishes using the `TravelPlanSegment` entity.

**Service interfaces:**

| Interface | Operations |
|-----------|-----------|
| `TravelPlanSegmentServiceV1` | `createTravelPlanSegment`, `retrieveTravelPlanSegment`, `saveTravelPlanSegment`, `removeTravelPlanSegment`, `search`, `searchTravelPlanSegmentBetweenDate` |
| `TravelPlanSegmentServiceAgentV1` | `searchTWByState`, `searchTWBeforeCreationDate`, `searchTWBeforeAreaArrivalDate` |

**Spring beans:** `travelPlanSegmentServiceV1Bean`, `travelPlanSegmentServiceAgentV1Bean`

---

## Data Models

### TravelWishData (`com.dd.data.common.TravelWishData`)

Form/session data for TW creation:

| Field | Type | Description |
|-------|------|-------------|
| `emailOptIn` | Boolean | Guest opted in for marketing emails |
| `referenceType` | String | `createTravelWish` or `infoRequest` |
| `travelWishNumber` | String | TW ID (e.g., "TW12345") |
| `guestData` | GuestData | Primary guest information |
| `questions` | ArrayList<ListItem> | 5 survey Q&A pairs |
| `userData` | UserData | Agent who created the TW (for recovery) |
| `isTravelWishRecoveryData` | boolean | Flag for recovery context |

### Survey Questions

| # | Question |
|---|----------|
| 1 | Have you visited DRP before? |
| 2 | How often do you go away for a short break? |
| 3 | How much do you like the Magical World of Disney? |
| 4 | Number of children in your party? |
| 5 | Do you intend to come to Disneyland Resort Paris in the future? |

### RetrieveTravelWishData (`com.dd.data.drp.RetrieveTravelWishData`)

Data for a retrieved/searched Travel Wish:

| Field | Type | Description |
|-------|------|-------------|
| `travelWishNumber` | String | TW identifier |
| `travelPlanSegment` | TravelPlanSegment | Full TPS from database |
| `itinData` | ItineraryData | Populated itinerary for quoting |
| `componentDataList` | ComponentDataList | Components with pricing |
| `displayLink` | boolean | Whether TW can be converted |
| `clientFile` | String | Guest reference ID |
| Guest fields | String | firstName, lastName, email, dateCreated |

### TravelWishDataDTO (`com.dd.data.drp.TravelWishDataDTO`)

JSON response DTO for Vue3 frontend:

| Field | Description |
|-------|-------------|
| Guest info | title, firstName, lastName, email, country, countryCode |
| Survey answers | visitedDRPAnswer, howMuchYouLikeAnswer, etc. |
| Survey options | visitedDRPList, shortBreakList, childrenList, etc. |
| `componentsData` | List of `ComponentDataDTO` (after quoting) |
| `displayLink` | Whether TW is actionable |
| Metadata | travelWishNumber, clientFile, dateCreated, startDate, endDate |

---

## Database Interaction

### Storage

Travel Wishes are stored as `TravelPlanSegment` records in the SBC TOS (Transaction Operating Store) database via the TPSS-Client module.

**Key TravelPlanSegment fields used for TW:**

| Field | TW Usage |
|-------|----------|
| `id` | Auto-generated database ID |
| `twId` | Travel Wish number (formatted "TW" + id) |
| `state` | VALID, TRANSIT, or BOOKED |
| `type` | TW (Travel Wish) or IR (Info Request) |
| `parties` | Guest list (persons with roles, ages) |
| `selectedtravelcomponents` | Accommodation, transport, misc components |
| `salesofferrequest` | Original search preferences (hotel, dates) |
| `context` | Channel, market, country, language, questions |
| `price` | Total price, currency |
| `areaArrivalDate` | Travel start date |
| `areaDepartureDate` | Travel end date |
| `areaLengthOfStay` | Number of nights |
| `creationDate` | When TW was created |
| `clientFile` | Guest reference ID |
| `affiliation` | Affiliation code + member number |
| `segmentexternalreferences` | Linked booking reference (when BOOKED) |

### Operations

| Operation | Method | Description |
|-----------|--------|-------------|
| Create | `tpss.createTravelPlanSegment(tps)` | Inserts new TPS record, returns ID |
| Retrieve | `tpss.retrieveTravelPlanSegment(id)` | Fetches full TPS by ID |
| Update | `tpss.saveTravelPlanSegment(tps)` | Updates existing TPS (state changes) |
| Delete | `tpss.removeTravelPlanSegment(id)` | Permanently removes TPS |
| Search by criteria | `tpss.search(searchCriteria)` | Searches by name/email/twId |
| Search by date | `tpss.searchTravelPlanSegmentBetweenDate()` | Range search with state filter |
| Search by state | `tpssAgent.searchTWByState(state)` | All TWs in a given state |
| Search before creation | `tpssAgent.searchTWBeforeCreationDate(date)` | Expired TWs |
| Search before arrival | `tpssAgent.searchTWBeforeAreaArrivalDate(date)` | Past-arrival TWs |

---

## Cleanup Agents

### RemoveTWProcess

Scheduled agent that removes expired Travel Wishes.

**Two cleanup strategies:**

1. **Expired by creation date** — Removes TWs older than `RemoveTWAgent_expireAfterNumberDays` days
2. **Past area arrival date** — Removes TWs where `areaArrivalDate` is before today

**Configuration properties (MG_PROPERTIES table):**

| Property | Description |
|----------|-------------|
| `RemoveTWAgent_expireAfterNumberDays` | Days after creation before TW expires |
| `RemoveTWAgent_removeAfterAreaArrivalDatePassed` | Enable removal by arrival date |
| `RemoveTWAgent_isRemoveByDateActive` | Enable/disable date-based removal |

### RemoveBookedTWProcess

Scheduled agent that removes Travel Wishes in `BOOKED` state (already converted to reservations).

**Configuration:**

| Property | Description |
|----------|-------------|
| `RemoveBookedTWAgent_isRemoveBookedActive` | Enable/disable booked TW cleanup |

---

## DLPaaP Integration (External Messaging)

### Flow

```
SBC ──▶ TravelWishRQXml (builds XML) ──▶ EAI Message Layer ──▶ DLPaaP Microservice
SBC ◀── TravelWishRSXml (parses XML)  ◀── EAI Message Layer ◀── DLPaaP Response
```

### Message Content (TravelWishRQ)

The XML message sent to DLPaaP contains:
- **InfoTravelWish**: party composition, TW ID, total price, currency, requested hotel, proposed offers
- **CustomerInfo**: guest name, address, email, phone, opt-in status
- **QuestionsInfo**: 5 survey questions/answers
- **GeneralBookingInfo**: source of business, division code, language, call date, agent ID
- **TransactionInfo**: conversation ID, message ID, timestamp

### Response Handling (TravelWishRSXml)

The response is checked for `<Success/>` tag presence:
- Success → TW stays in VALID state
- Failure → TW transitions to TRANSIT state

### XSD Definition

`JAXB/src/main/xsd/WDWTravelWish.xsd` — Defines the XML schema, compiled via maven-jaxb2-plugin into Java classes in `com.wdw.eai.message.domain.travelwish` package.

---

## PCS Integration (Product Combinability)

When a TW is retrieved and the agent confirms the quote (`twConfirmQuote`), PCS validates the product combination:

- Event: `RETRIEVE_WISH_SELECTION`
- Validates all selected components are combinable
- Returns alert messages if conflicts exist
- Agent can acknowledge alerts and proceed

---

## Admin: Travel Wish Recovery

### Purpose

When DLPaaP message delivery fails (TW in TRANSIT state), admins can search and resend messages.

### Component: `AdminTravelWishRecoveryAction`

| Action | Description |
|--------|-------------|
| `load` | Initialize recovery page with state filters |
| `search` | Search TWs by date range or custom criteria (name/email/ID) |
| `recover` | Resend selected TWs to DLPaaP via `TWUtil.sendTWMessage()` |
| `clear` | Reset search form |

### Recovery Flow

1. Admin searches for TWs in TRANSIT state (or any state)
2. Results show TW summaries with creation/arrival dates
3. Admin selects TWs to recover
4. System resends XML message to DLPaaP for each selected TW
5. Status updates to "Success" or "Failed" per TW

---

## Frontend

### Vue3 Components (Modern UI)

| Component | Purpose |
|-----------|---------|
| `TravelWishModal.vue` | Create/save TW modal |
| `TravelWishCreateModal.vue` | TW creation form |
| `TravelWishQuoteModal.vue` | TW retrieval, search, quote, and confirm flow |
| `TravelWishForm.js` | Form validation for TW creation |
| `TravelWishDataForm.js` | Data form for quote modal |
| `ContactInformation.js` | Contact info sub-form |

### Legacy JSPs

| JSP | Purpose |
|-----|---------|
| `md_TravelWishDRP.jsp` | Create/edit TW (legacy) |
| `md_RetriveTravelWishDRP.jsp` | Search and retrieve TW (legacy) |
| `md_TravelWishQuoteDRP.jsp` | TW quote display (legacy) |
| `admin/swp_TravelWishRecovery.jsp` | Admin recovery page |

---

## TW Number Format

Travel Wish numbers are formatted as `"TW" + numeric_id`. For example: `TW12345`.

When searching by TW number, the numeric portion is extracted: `Long.valueOf(searchTravelWishId.substring(2))`.

---

## Configuration Properties

| Property | Description |
|----------|-------------|
| `SEND_TW_MESSAGE` | Enable/disable sending TW to DLPaaP (`true`/`false`) |
| `TW_INVALID_MESSAGE` | Custom error message for invalid TW data |
| `RemoveTWAgent_expireAfterNumberDays` | Days until TW expires |
| `RemoveTWAgent_removeAfterAreaArrivalDatePassed` | Remove past-arrival TWs |
| `RemoveTWAgent_isRemoveByDateActive` | Enable date-based removal |
| `RemoveBookedTWAgent_isRemoveBookedActive` | Enable booked TW cleanup |
| `SORT_TW_RESULTS` | Sort recovery results by creation date |
| `MIN_ADULT_AGE` | Age threshold for adult classification in party |

---

## Key Business Rules

1. **Display Link logic** — A retrieved TW is only actionable (`displayLink = true`) if:
   - Arrival date is NOT before today
   - No client file exists OR client file guest belongs to the correct market segment

2. **Info Request vs Travel Wish** — Two reference types:
   - `createTravelWish`: Full TW with itinerary components
   - `infoRequest`: Lightweight; sets area nights to 1 and departure to today

3. **Surprise Planner** — If the itinerary has a surprise planner, the planner's data is used as the TW guest (not the actual traveler)

4. **DEX with Transport** — Special validation: if Disney Express (DEX) is selected without transport, a warning is shown

5. **TW Saved Days** — Calculated as `min(expireAfterNumberDays, daysUntilArrival)` — tells the agent how long the TW will remain valid

6. **Mandatory Products** — After TW confirmation, `MandatoryProductAdder.autoAddMandatoryProducts()` adds required products

7. **Internal Notes** — TW ID is added as a system note to the itinerary: "Travel Wish ID is TWXXXXX"

---

## File Reference

| File | Module | Purpose |
|------|--------|---------|
| `TravelWishAction.java` | Web | Main Struts action controller |
| `TWUtil.java` | Beans | Business logic utility |
| `TravelWishAdaptor.java` | Beans | EAI messaging adaptor |
| `TravelWishRQXml.java` | Beans | XML request builder |
| `TravelWishRSXml.java` | Beans | XML response parser |
| `TravelWishData.java` | Beans | TW creation data model |
| `RetrieveTravelWishData.java` | Beans | TW retrieval data model |
| `TravelWishDataDTO.java` | Beans | JSON response DTO |
| `TravelWishForm.java` | Web | Struts form bean |
| `TravelWishRecoveryForm.java` | Web | Admin recovery form |
| `AdminTravelWishRecoveryAction.java` | Web | Admin recovery action |
| `TravelPlanSegmentServiceV1.java` | TPSS-Client | DB service interface |
| `TravelPlanSegmentServiceAgentV1.java` | TPSS-Client | Agent DB operations |
| `RemoveTWProcess.java` | TPSS-Client | Expired TW cleanup |
| `RemoveBookedTWProcess.java` | TPSS-Client | Booked TW cleanup |
| `TravelPlanSegmentDaoImpl.java` | TPSS-Client | Hibernate DAO |
| `WDWTravelWish.xsd` | JAXB | XML schema definition |
| `TravelWishModal.vue` | Web/Vue | Create TW modal |
| `TravelWishQuoteModal.vue` | Web/Vue | Quote/search TW modal |
| `TravelWishCreateModal.vue` | Web/Vue | TW creation UI |
| `md_TravelWishDRP.jsp` | Web/JSP | Legacy create page |
| `md_RetriveTravelWishDRP.jsp` | Web/JSP | Legacy search page |
| `swp_TravelWishRecovery.jsp` | Web/JSP | Admin recovery page |
