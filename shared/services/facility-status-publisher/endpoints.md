<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facility Status Publisher — Endpoints

## Facility Status

### `POST /facility-status/{destination}`

- **Description:** Batch update facility statuses (wait times, operating status) into real-time DB
- **Path Parameters:**
  - `destination` (required) — Market identifier (`wdw`, `dlr`, `hkdl`)
- **Query Parameters:**
  - `exclusive-list` (optional, default: false) — If true, only received facilities remain active
- **Required Headers:** `x-data-source`, `x-conversation-id`
- **Optional Headers:** `x-correlation-id`
- **Request body:** `InputFacilityStatusBatch` — array of facility status objects
- **Response (202 Accepted):** `EntityUpdateReport` with update results
- **Notes:** Accepts batch of status updates; processes all and returns aggregate report

## Dining Facility Status

### `PUT /dining-facility-status/{destination}`

- **Description:** Update dining facility statuses (availability, wait times)
- **Path Parameters:**
  - `destination` (required) — `wdw`, `dlr`
- **Required Headers:** `x-data-source`, `x-data-datetime`, `x-conversation-id`
- **Request body:** `InputDiningFacilityStatusBatch`
- **Response (200 OK):** `EntityUpdateReport`

### `DELETE /dining-facility-status/{destination}/{facilityId}`

- **Description:** Delete a dining facility status entity
- **Path Parameters:**
  - `destination` (required) — `wdw`, `dlr`
  - `facilityId` (required) — Facility identifier
- **Matrix Variables:**
  - `entityType` (required) — Entity type of facility
- **Required Headers:** `x-data-source`, `x-data-datetime`, `x-conversation-id`
- **Response (200 OK):** Success
- **Response (404):** Entity not found
- **Response (409 Conflict):** Sync conflict

## Forecasted Wait Times

### `PUT /forecasted-wait-times/{destination}/facility/{facilityId}`

- **Description:** Insert or update forecasted wait times for a facility
- **Path Parameters:**
  - `destination` (required) — `wdw`, `dlr`, `hkdl`
  - `facilityId` (required) — Facility identifier
- **Required Headers:** `x-data-source`, `x-conversation-id`, `x-correlation-id`, `x-data-datetime`, `content-type`
- **Request body:** `InputForecastedFacility` — forecast data
- **Response (200 OK):** `EntitySingleReport`
- **Response (400):** Validation errors

## Trigger (v1 API)

### `PUT /api/v1/trigger-facility-status`

- **Description:** Trigger status update for a specific facility or entire destination
- **Query Parameters:**
  - `facilityId` (optional) — Specific facility to update
  - `destinationId` (optional) — Destination to update (all facilities)
  - At least one must be provided
- **Required Headers:** `x-data-source`, `x-conversation-id`, `x-correlation-id`
- **Response (202 Accepted):** `EntityUpdateReport`
- **Response (400):** Bad request (missing params or invalid destination)

## Actuator Endpoints

| Path | Description |
|------|-------------|
| `/status` | Application status |
| `/env` | Environment properties |
| `/metrics` | Application metrics |
| `/swagger-ui.html` | API documentation |
