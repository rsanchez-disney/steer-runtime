# API Standards

## Naming Conventions
- URLs: kebab-case (`/cart-items`, not `/cartItems`)
- JSON fields: camelCase
- Query params: camelCase

## Versioning
- URL path versioning: `/v1/`, `/v2/`
- Breaking changes require a new version

## Error Response Format
```json
{
  "error": {
    "code": "CART_NOT_FOUND",
    "message": "Cart with ID {id} not found",
    "details": []
  }
}
```

## HTTP Status Codes
| Code | Usage |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 429 | Rate limited |
| 500 | Internal server error |
| 503 | Service unavailable |

## Pagination
Use cursor-based pagination for large result sets:
```
GET /items?cursor={token}&limit=50
```
