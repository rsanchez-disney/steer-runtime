<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Characters Publisher — Endpoints

## Trigger Endpoint

### `GET /characters-publisher/{destinationId}`

- **Description:** Triggers a full character sync for the specified destination (same logic as the scheduled cron)
- **Path Parameters:**
  - `destinationId` (required) — Market identifier (`wdw`, `dlr`)
- **Request body:** None
- **Response (200 OK):** Per-market sync results summary (MarketSyncResult per destination)
- **Response (500):** Unrecoverable failure
- **Authentication:** API Gateway Lambda Authorizer (Cookie-based)
- **Notes:** On-demand trigger; identical behavior to the CloudWatch scheduled event

## Scheduled Trigger

| Trigger | Mechanism | Frequency |
|---------|-----------|-----------|
| Scheduled | CloudWatch Events cron | Every 10 minutes |
| On-demand | API Gateway GET | Manual / ad-hoc |

Both triggers invoke the same Lambda handler (`CharactersPublisherHandler`).
