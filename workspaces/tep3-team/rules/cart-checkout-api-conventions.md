# Cart & Checkout API Conventions

## Endpoint Naming
TBD

## Response Format
TBD
```json
{
  "data": {},
  "meta": { "timestamp": "ISO-8601", "requestId": "uuid" }
}
```

## Error Format
```json
{
  "error": { "code": "CART_NOF_FOUND", "message": "Human-readable", "details": {} },
  "meta": { "timestamp": "ISO-8601", "requestId": "uuid" }
}
```
