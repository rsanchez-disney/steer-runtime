<!-- owner: @disney-payments-core -->
<!-- last-updated: 2026-04-08 -->
# Config Services — Endpoints

## Endpoint Details

### `GET /api/v1/configs`
- **Description:** List all payment configurations with optional filtering
- **Query params:** `status`, `type`, `page`, `size`
- **Response:** Paginated list of configuration objects
- **Error codes:** 401 (unauthorized), 500 (internal error)

### `POST /api/v1/configs`
- **Description:** Create a new payment configuration
- **Request body:** Configuration object with `name`, `type`, `rules`, `status`
- **Response:** Created configuration with generated `id`
- **Error codes:** 400 (validation), 409 (duplicate name)

### `POST /api/v1/rules/evaluate`
- **Description:** Evaluate business rules against a transaction payload
- **Request body:** Transaction object with `amount`, `currency`, `channel`, `paymentMethod`
- **Response:** Evaluation result with `allowed`, `appliedRules`, `reason`
- **Error codes:** 400 (invalid payload), 422 (rule evaluation failure)
