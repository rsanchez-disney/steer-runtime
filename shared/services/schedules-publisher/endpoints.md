<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Schedules Publisher — Endpoints

## Sync Endpoint

### `POST /sync-all/{destinationId}`

- **Description:** Triggers a full schedule sync for the specified destination — syncs schedules, blockouts, and closed restaurants
- **Path Parameters:**
  - `destinationId` (required) — Market identifier (`wdw`, `dlr`, `hkdl`)
- **Request body:** None
- **Response (200 OK):** Map of `DatabaseType` → List of `Report` objects with sync results
- **Response (404):** Destination not found
- **Response (409 Conflict):** Concurrency errors detected during sync
- **Response (500):** Unhandled exception
- **Authentication:** API key
- **Notes:** Syncs three data types in sequence: closed restaurants → schedules → blockouts. Results are aggregated per database type.

## Scheduled Trigger

The publisher also runs on a configured schedule via Spring's `@Scheduled` / `TaskScheduledConfig`, invoking the same sync logic automatically.

## Actuator Endpoints

| Path | Description |
|------|-------------|
| `/status` | Application status |
| `/env` | Environment properties |
| `/metrics` | Application metrics |
| `/swagger-ui.html` | API documentation |
