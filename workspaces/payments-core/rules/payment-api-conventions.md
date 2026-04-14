# Payment API Conventions

## Endpoint Naming
- Use plural nouns: `/api/v2/payments`, `/api/v2/exports`
- Version prefix required: `/api/v2/`
- No verbs in URLs — use HTTP methods

## Response Format
All API responses must include:
```json
{
  "data": {},
  "meta": { "timestamp": "ISO-8601", "requestId": "uuid" }
}
```

## Error Format
```json
{
  "error": { "code": "PAYMENT_NOT_FOUND", "message": "Human-readable", "details": {} },
  "meta": { "timestamp": "ISO-8601", "requestId": "uuid" }
}
```
