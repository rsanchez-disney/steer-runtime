<!-- owner: @disney-payments-core -->
<!-- last-updated: 2026-04-08 -->
# Config Studio — Error Handling

## Error Response Format
BFF transforms backend errors into a consistent format for the Angular UI:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "fields": [{"field": "name", "message": "Name is required"}]
  }
}
```

## Common Errors
| Code | Meaning | Resolution |
|---|---|---|
| `AUTH_EXPIRED` | SSO token expired | Redirect to SSO login |
| `FORBIDDEN` | User lacks required role | Contact team lead for access |
| `CONFIG_NOT_FOUND` | Configuration ID invalid | Refresh configuration list |
| `DUPLICATE_NAME` | Configuration name already exists | Choose a different name |
| `RULE_EVAL_FAILED` | Rule evaluation error | Check rule syntax |

## Retry Policy
BFF retries transient 5xx errors from config-services up to 2 times with 500ms backoff. 4xx errors are not retried.
