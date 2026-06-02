# Relationship Between dlp-sbc-ui and dlp-pcs-ui

## Overview

**dlp-sbc-ui** (Sales Booking Center) is the main booking application used by agents to create and manage Disney travel itineraries. **dlp-pcs-ui** (Product Combinability Service) is a backend service that enforces business rules about which products can be sold together within a travel package.

SBC is the **consumer** and PCS is the **provider**. SBC calls PCS via REST API during the sales flow to validate product combinations and discover which products are available to add to an itinerary.

```
┌──────────────────────────────┐          REST/HTTP          ┌─────────────────────────────┐
│        dlp-sbc-ui            │ ─────────────────────────▶  │        dlp-pcs-ui            │
│   (Sales Booking Center)     │                              │ (Product Combinability Svc)  │
│                              │  POST /validateCombinable... │                              │
│   Agent-facing booking UI    │  POST /getCombinable...      │  Rules engine for product    │
│   Struts + Spring MVC        │  GET  /refreshCache          │  compatibility               │
│                              │ ◀─────────────────────────── │                              │
│                              │    ProductResultSet / JSON    │                              │
└──────────────────────────────┘                              └─────────────────────────────┘
```

---

## Communication Pattern

SBC communicates with PCS over **synchronous HTTP/REST** calls. There is no message queue or event-driven communication between the two systems.

| Aspect | Detail |
|--------|--------|
| Protocol | HTTP/HTTPS (REST) |
| Data Format | JSON |
| Authentication | Bearer token via `AuthzUtil.getToken()` |
| Tracing | `conversation-id` header propagated from SBC's ThreadContext |
| Retry | Resilience4j (configurable attempts + wait duration) |
| Timeout | Configurable connection + read timeouts |

---

## API Endpoints Consumed by SBC

### 1. Validate Combinable Products

```
POST {PCS_URL}/ProductCombinabilityWeb/api/validateCombinableProducts
```

**Purpose:** Validates whether the current products in an itinerary are compatible with each other.

**Request body:** `TravelPlanSegment` (JSON serialization of the itinerary's travel components)

**Response:** `ProductResultSet` — a collection of `ProductResult` objects, each containing:
- `severity` — numeric severity (≥999 indicates a combinability problem)
- `message` — human-readable message to display to the agent
- `resultType` — popup behavior (`POPUP_OK` or `POPUP_CONFIRM`)
- `relevanceType` — which sales event triggers this message
- `autoNoteCode` — automatic note to add to the itinerary
- `codedcomments` — structured coded remarks with priority ordering
- `code` — package code the result applies to

### 2. Get Combinable Products

```
POST {PCS_URL}/ProductCombinabilityWeb/api/getCombinableProducts
```

**Purpose:** Retrieves the list of products that are compatible with the current itinerary configuration.

**Request body:** `CombinableProductsRequest` containing:
- `travelPlanSegment` — current itinerary state
- `category` — target product category (e.g., ADD_ON)
- `family` — target product family (e.g., GROUND_TRANSFER)
- `planType` — plan type filter
- `productResult` — specific product result to expand
- `searchRangeStartDate` / `searchRangeEndDate` — date range filter

**Response:** `ProductSet` — collection of `CombinableProduct` objects, each containing:
- `combinableType` — relationship type (`COMPATIBLE_WITH` or `COMPLEMENTED_BY`)
- `product` — product details (code, category, family, offer index)
- `productresultset` — validation results for this specific product

### 3. Refresh Cache

```
GET {PCS_URL}/ProductCombinabilityWeb/api/refreshCache
```

**Purpose:** Triggers PCS to reload its internal rules cache. Called from SBC's scheduled cache refresh and admin UI.

---

## SBC Integration Architecture

### Client Layer: `PcsClient.java`

Location: `MagicalGatheringBeans/src/main/java/com/dd/pcs/PcsClient.java`

The HTTP client that handles all communication with PCS:
- Constructs REST requests with proper headers (Authorization, Content-Type, Conversation-ID)
- Manages two `RestTemplate` variants:
  - Standard HTTPS for deployed environments
  - SSL-bypassing template for local Docker development (`pcs-dlp:8080`)
- Implements retry logic via Resilience4j for `getCombinableProducts`
- Parses and maps JSON responses to domain objects
- Validates response integrity (severity checks, null handling)

### Business Logic Layer: `PCSUtil.java`

Location: `MagicalGatheringBeans/src/main/java/com/dd/util/PCSUtil.java`

The business logic wrapper that translates between itinerary domain objects and PCS API calls:
- Converts `ItineraryData` → `TravelPlanSegment` for PCS requests
- Filters combinable products by category, family, and combinable type
- Extracts messages, coded comments, and auto-notes from PCS responses
- Manages session-cached `ProductResultSet` to avoid redundant PCS calls
- Writes auto-notes to itineraries based on PCS popup rules

### Sales Flow Integration Points

PCS is called at these key moments in the booking lifecycle:

| Action | Event | Purpose |
|--------|-------|---------|
| `OfferAction` | `OFFER_SELECT` | Validate selected offer; show combinability warnings |
| `ConfirmAllAction` | `CONFIRM_ALL` | Final validation before booking confirmation |
| `AirAvailabilityAction` | `TRANSPORTATION_SELECTION` | Validate air product compatibility |
| `TransportDetailAction` | `TRANSPORTATION_SELECTION` | Check transport combinability |
| `RecapAction` | `RECAP_SUM` | Display combinability messages on recap |
| `MiscDetailAction` | `ADDON_MISC_SELECT` | Validate misc component additions |
| `CarDetailsDRPAction` | `VEHICLE_PACKAGE_OPTION_SELECTION` | Validate car/vehicle options |
| `MoveToReservationsAction` | Various | Validate before moving to reservation |
| `TravelWishAction` | `RETRIEVE_WISH_SELECTION` | Validate retrieved travel wish |

### PCS Sales Events (Relevance Types)

PCS results are filtered by "relevance type" to show appropriate messages at each booking step:

| Constant | Value | When Triggered |
|----------|-------|----------------|
| `ADDONMISC_EVENT` | `ADDON_MISC_SELECT` | Adding misc components |
| `CONFIRMALL_EVENT` | `CONFIRM_ALL` | Final confirmation |
| `OFFERSELECT_EVENT` | `OFFER_SELECT` | Selecting an offer |
| `RECAPSUM_EVENT` | `RECAP_SUM` | Viewing booking recap |
| `STANDALONE_EVENT` | `STANDALONE_SELECT` | Standalone selections |
| `TRANSPORTATIONSELECTION_EVENT` | `TRANSPORTATION_SELECTION` | Transport products |
| `VEHICLEPACKAGEOPTIONSELECTION_EVENT` | `VEHICLE_PACKAGE_OPTION_SELECTION` | Vehicle options |
| `RETRIEVEWISHSELECTION_EVENT` | `RETRIEVE_WISH_SELECTION` | Retrieving saved wishes |
| `TERMSANDCONDITIONS_EVENT` | `TERMS_AND_CONDITIONS` | T&C acceptance |

---

## Data Model (SBC-side)

```
com.dd.pcs/
├── PcsClient.java              # HTTP client
├── CombinableProductsRequest.java  # Request DTO for getCombinableProducts
├── ProductResultSet.java       # Response wrapper (collection of ProductResult)
├── ProductResult.java          # Individual validation result
├── ProductSet.java             # Response wrapper (collection of CombinableProduct)
├── CombinableProduct.java      # A product with its combinability type and results
└── CodedComment.java           # Structured comment with code, type, priority
```

---

## Configuration

### Properties File

`Config/src/main/resources/common/pcs.properties`:

```properties
pcs_url=${PCS_URL}
pcs_validate=validateCombinableProducts
pcs_combinable=getCombinableProducts
pcs_refresh_cache=refreshCache
pcs_api_context=/ProductCombinabilityWeb/api/
pcs_http_timeout=${PCS_HTTP_TIMEOUT}
pcs_read_timeout=${PCS_READ_TIMEOUT}
pcs_retry_attempts=${PCS_RETRY_ATTEMPTS}
pcs_retry_wait_duration=${PCS_RETRY_WAIT_DURATION}
```

### Environment Variables (from Vault)

| Variable | Description | Example |
|----------|-------------|---------|
| `PCS_URL` | Base URL of PCS service | `https://pcs-dlp.wdprapps.disney.com` |
| `PCS_HTTP_TIMEOUT` | Connection timeout (ms) | `2000` |
| `PCS_READ_TIMEOUT` | Read timeout (ms) | `10000` |
| `PCS_RETRY_ATTEMPTS` | Max retry attempts | `2` |
| `PCS_RETRY_WAIT_DURATION` | Wait between retries (seconds) | `10` |

---

## Local Development Setup

### Running SBC + PCS Together

Use `docker-compose-local.yml` to run both services in a shared Docker network:

```yaml
services:
  sbc-dlp:
    container_name: sbc-dlp
    build: .
    ports:
      - "8080:8080"   # SBC application
      - "7041:7041"   # SBC debug
    networks:
      - sbcpcs

  pcs-dlp:
    container_name: pcs-dlp
    image: pcs-image
    ports:
      - "8083:8080"   # PCS application
      - "7043:7043"   # PCS debug
    build:
      context: ../${PCS_FOLDER:-dlp-pcs-ui}/
    env_file:
      - ../${PCS_FOLDER:-dlp-pcs-ui}/.env
    networks:
      - sbcpcs

networks:
  sbcpcs:
    driver: bridge
```

### Steps to Run

1. Set the PCS URL in your local Vault to: `http://pcs-dlp:8080`
   (Uses Docker container hostname within the shared `sbcpcs` network)

2. Build both projects with Maven (`mvn clean install`)

3. Start both services:
```bash
PCS_FOLDER=<relative-path-to-pcs> docker-compose -f docker-compose-local.yml up --build
```

### Directory Layout Examples

```
# Same level (default)
└─ git/
   ├─ dlp-pcs-ui/     ← PCS_FOLDER=dlp-pcs-ui (or omit, it's the default)
   └─ dlp-sbc-ui/

# Different structure
└─ git/
   ├─ pcs-repo/       ← PCS_FOLDER=../pcs-repo
   └─ folder/
      └─ dlp-sbc-ui/
```

### SSL in Local Development

When `PCS_URL` contains `http://pcs-dlp:8080`, the `PcsClient` automatically uses a `RestTemplate` that bypasses SSL certificate verification (via `TrustSelfSignedStrategy`). This is only for local Docker-to-Docker communication.

---

## Cache Coordination

SBC manages PCS cache refresh in two ways:

### 1. Scheduled Refresh (`CacheScheduler`)

A cron job (`CRON_REFRESH_PCS`) periodically calls `PcsClient.refreshCache()` to tell PCS to reload its rules.

### 2. Manual Refresh (Admin UI)

The SBC admin cache management page includes a "Refresh PCS" option that triggers `PcsClient.refreshCache()` on demand via `DELETE /v1/cache/pcs`.

---

## Error Handling

| Scenario | SBC Behavior |
|----------|--------------|
| PCS unreachable | `MGAppException` with `MESSAGING_EXCEPTION` type; logged; agent sees generic error |
| PCS returns severity ≥ 999 | Error logged; message displayed to agent as popup |
| PCS returns HTTP 5xx | Resilience4j retries up to configured max attempts |
| PCS returns empty results | "No combinable products found" message logged |
| PCS timeout | Connection timeout honored; exception propagated |

---

## Observability

| Mechanism | Detail |
|-----------|--------|
| Logging | All PCS requests/responses logged with request bodies on error |
| Conversation ID | Thread-context conversation ID propagated to PCS for distributed tracing |
| Timing | Cache scheduler logs execution time for PCS refresh |
| Error tracking | HTTP status codes, response bodies, and stack traces logged |

---

## Key Design Decisions

1. **Static client methods** — `PcsClient` uses static methods rather than a Spring-managed bean, allowing direct invocation from utility classes without DI
2. **Session-cached results** — `ProductResultSet` is stored in the HTTP session to avoid redundant PCS calls within the same booking step
3. **Event-driven filtering** — PCS returns all applicable messages; SBC filters by `relevanceType` to show only those appropriate for the current sales event
4. **Shared network in Docker** — Both services communicate via container hostname (`pcs-dlp`) on an isolated bridge network
5. **No circuit breaker** — Only retry is implemented; there is no circuit breaker pattern for PCS failures

---

## File Reference

| File | Purpose |
|------|---------|
| `MagicalGatheringBeans/.../pcs/PcsClient.java` | HTTP client for PCS API |
| `MagicalGatheringBeans/.../util/PCSUtil.java` | Business logic wrapper |
| `MagicalGatheringBeans/.../pcs/CombinableProductsRequest.java` | Request DTO |
| `MagicalGatheringBeans/.../pcs/ProductResultSet.java` | Response model |
| `MagicalGatheringBeans/.../pcs/ProductResult.java` | Individual result model |
| `MagicalGatheringBeans/.../pcs/ProductSet.java` | Combinable products response |
| `MagicalGatheringBeans/.../pcs/CombinableProduct.java` | Product with combinability |
| `MagicalGatheringBeans/.../pcs/CodedComment.java` | Coded comment model |
| `Config/.../common/pcs.properties` | PCS property placeholders |
| `docker-compose-local.yml` | Local SBC + PCS Docker setup |
