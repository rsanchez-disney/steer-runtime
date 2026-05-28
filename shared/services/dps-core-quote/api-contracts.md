# dps-core-quote — API Contracts

## Protocol
- JAX-RS (Apache CXF)
- JSON request/response
- OAuth2 bearer token authentication

## Common Headers
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer token from OAuth2 |
| Content-Type | Yes | application/json |
| X-Correlation-Id | No | Request tracing ID |

## Error Format
```json
{
  "errorCode": "string",
  "errorMessage": "string",
  "details": []
}
```
