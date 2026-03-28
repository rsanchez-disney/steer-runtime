# API Test Patterns

## REST API Test Checklist

### Per Endpoint
- ✅ Happy path (valid request → expected response)
- ✅ Required field validation (missing → 400)
- ✅ Type validation (wrong type → 400)
- ✅ Auth required (no token → 401)
- ✅ Auth insufficient (wrong role → 403)
- ✅ Not found (invalid ID → 404)
- ✅ Duplicate (conflict → 409)
- ✅ Response schema matches contract
- ✅ Response time within SLA

### Cross-Cutting
- ✅ CORS headers present
- ✅ Rate limiting enforced
- ✅ Pagination defaults and limits
- ✅ Sort/filter parameters
- ✅ Error response format consistent

## Contract Test Pattern

```javascript
describe('GET /api/payments/:id', () => {
  it('returns payment matching schema', async () => {
    const res = await request.get(`/api/payments/${testId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchSchema({
      id: expect.any(String),
      amount: expect.any(Number),
      currency: expect.stringMatching(/^[A-Z]{3}$/),
      status: expect.stringMatching(/^(pending|completed|failed)$/),
      createdAt: expect.any(String),
    });
  });
});
```

## Error Response Format

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Human-readable description",
  "details": [{ "field": "email", "reason": "required" }],
  "timestamp": "2026-03-19T12:00:00Z"
}
```

## HTTP Status Code Reference

| Code | When to Use |
|------|-------------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Validation error |
| 401 | Missing/invalid auth |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limited |
| 500 | Server error |
