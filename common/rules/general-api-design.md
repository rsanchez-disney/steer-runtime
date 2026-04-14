# API Design Standards

## REST Conventions
- Use nouns for resources, verbs for actions: `GET /users`, `POST /users`
- Use plural resource names: `/users` not `/user`
- Use HTTP methods correctly: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- Return appropriate status codes: 200, 201, 204, 400, 401, 403, 404, 409, 500

## Versioning
- Version APIs in the URL path: `/api/v1/users`
- Never break existing versions — add new endpoints or fields

## Request/Response
- Use JSON for request and response bodies
- Use camelCase for JSON field names
- Include pagination for list endpoints: `?page=1&size=20`
- Return consistent error format across all endpoints

## Error Responses
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": "Additional context",
  "timestamp": "2026-03-26T12:00:00Z"
}
```

## Security
- Validate all input — never trust client data
- Use authentication on all non-public endpoints
- Rate limit public endpoints
- Don't expose internal IDs or stack traces in responses
- Use CORS appropriately

## Documentation
- Document all endpoints with OpenAPI/Swagger
- Include request/response examples
- Document error codes and their meanings
