# API standards

- URLs: kebab-case (`/cart-items`). JSON fields: camelCase. Query params: camelCase.
- Versioning: URL path (`/v1/`, `/v2/`). Breaking changes = new version.
- Errors: `{"error": {"code": "CART_NOT_FOUND", "message": "...", "details": []}}`
- Status codes: 200 OK, 201 Created, 400 Bad request, 401 Unauthorized, 403 Forbidden, 404 Not found, 409 Conflict, 429 Rate limited, 500 Internal error, 503 Unavailable
- Pagination: cursor-based `GET /items?cursor={token}&limit=50`
