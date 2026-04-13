<!-- owner: @disney-payments-core -->
<!-- last-updated: 2026-04-08 -->
# Config Services — Patterns & Conventions

## Error Handling
Standard Spring Boot error response:
```json
{
  "error": {
    "code": "CONFIG_NOT_FOUND",
    "message": "Configuration with ID {id} not found",
    "timestamp": "2026-04-08T12:00:00Z"
  }
}
```

## Pagination
Spring Data style: `?page=0&size=20&sort=name,asc`

## Idempotency
PUT operations are idempotent by ID. POST uses `X-Idempotency-Key` header for duplicate prevention.

## Common Gotchas
- Configuration names must be unique per type — POST returns 409 on duplicates
- Rule evaluation is stateless — does not persist results
- Soft deletes: DELETE sets `status=INACTIVE`, does not remove records
