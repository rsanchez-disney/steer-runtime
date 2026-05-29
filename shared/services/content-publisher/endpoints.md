<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Content Publisher (ARTU) — Endpoints

## Public Content

### `PUT /content/{type}/{destination}/{entityId}`
- **Description:** Upsert generic content into the public real-time database
- **Path Parameters:**
  - `type` — Content type with version matrix variable (e.g., `search-suggestions;version=1.0`)
  - `destination` — Target market (wdw, dlr, hkdl, etc.)
  - `entityId` — Entity identifier
- **Required Headers:** `x-data-source`, `x-data-datetime`, `x-conversation-id`, `accept-language`, `content-type`
- **Query Parameters:** `ttl` (optional), `expirationDate` (optional), `timeZone` (optional)
- **Request body:** JSON content to publish
- **Response (200):** EntityUpdateReport with sync result
- **Response (400):** Validation errors

### `GET /content/{type}/{destination}/{entityId}`
- **Description:** Retrieve a generic content entity from the public database
- **Required Headers:** `accept-language`, `x-conversation-id`
- **Response (200):** GenericContent JSON
- **Response (404):** Entity not found

### `POST /content/{type}/{destination}/bulk/get`
- **Description:** Retrieve multiple entities in a single request
- **Request body:** `{ "entityIds": ["id1", "id2", ...] }`
- **Response (200):** BulkGetResponse with found entities
- **Response (503):** Endpoint disabled (feature toggle)

### `DELETE /content/{type}/{destination}/{entityId}`
- **Description:** Delete a generic content entity
- **Required Headers:** `x-data-source`, `x-data-datetime`, `x-conversation-id`, `content-type`, `accept-language`
- **Response (200):** Deletion report

## Guest Content (SWID)

### `PUT /content/SWID/{swid}/{type}/{destination}/{entityId}`
- **Description:** Upsert guest-specific content into the private database
- **Additional params:** `ttl` (required)
- **Response (410 Gone):** If SWID upsert feature is disabled

### `GET /content/SWID/{swid}/{type}/{destination}/{entity-id}`
- **Description:** Retrieve guest-specific content

### `DELETE /content/SWID/{swid}/{type}/{destination}/{entityId}`
- **Description:** Delete guest-specific content

## Anonymous Guest Content (App Instance ID)

### `PUT /content/app-instance-id/{app-instance-id}/{type}/{destination}/{entityId}`
- **Description:** Upsert anonymous guest content into semi-private database
- **Additional params:** `ttl` (required)

### `DELETE /content/app-instance-id/{app-instance-id}/{type}/{destination}/{entityId}`
- **Description:** Delete anonymous guest content

## AREQ (Access Request)

### `PUT /content/areq/{swid}`
- **Description:** Upsert guest access request document into private database
- **Query params:** `platform` (optional, e.g., `PARK`)

## Sandbox (Dev/Test)

### `PUT /dev/content/SWID/{swid}/{type}/{destination}/{entityId}`
- **Description:** Upsert content into sandbox database (priv-mbl) for testing
- **Auth:** MyID authentication

### `PUT /dev/content/areq/{swid}`
- **Description:** Upsert AREQ into sandbox database

## Admin

### `GET /admin/deep-health-check`
- **Description:** Health check of publisher and its dependencies

## Actuator Endpoints

| Path | Description |
|------|-------------|
| `/health` | Basic health check |
| `/env` | Environment properties |
| `/metrics` | Application metrics |
