<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facilities Publisher — Endpoints

## Sync Endpoint

### `POST /facilities/{destination}`

- **Description:** Triggers a full facility sync for the specified destination
- **Path Parameters:**
  - `destination` (required) — Market identifier (`wdw`, `dlr`, `hkdl`)
- **Request body:** None
- **Response (200 OK):** Map of `DatabaseType` → `Report` with sync results
- **Authentication:** API key
- **Notes:** Syncs all facility types (attractions, restaurants, hotels, entertainment, etc.) for the given destination. Writes to both park-platform-pub and txp public buckets.

## Scheduled Trigger

The publisher runs on a configured schedule via Spring's `TaskSchedulerConfig` (`FacilitiesTrigger`), invoking the same sync logic automatically for all configured destinations.

## Actuator Endpoints

| Path | Description |
|------|-------------|
| `/info` | Application info |
| `/metrics` | Application metrics |
| `/swagger-ui.html` | API documentation |
