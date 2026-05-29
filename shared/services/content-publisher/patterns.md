<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Content Publisher (ARTU) — Patterns & Conventions

## Error Handling

Validation errors return HTTP 400 with an `EntityUpdateReport` containing typed errors:

```json
{
  "errors": [
    { "type": "MISSING_PARAM", "message": "X-Data-Source header is required" }
  ]
}
```

Error types: `MISSING_PARAM`, `INVALID_CONTENT`, `NOT_SUPPORTED_TYPE`, `UNKNOWN_ERROR`

## Request Validation

All write endpoints validate:
- Required headers (`x-data-source`, `x-data-datetime`, `x-conversation-id`, `content-type`, `accept-language`)
- Content type not in denylist
- Content type has no reserved characters
- Valid JSON body
- TTL is positive and within max allowed value
- Destination, type, version, entityId are supported (for user content endpoints)

## Content Type Versioning

Content types use matrix variables for versioning:
```
/content/search-suggestions;version=1.0/wdw/entity-123
```

The version is extracted via `@MatrixVariable` on the type path segment.

## Market Resolution

Markets are resolved from `destination` + `accept-language` header using `MarketMapper`. This determines the Couchbase channel/scope for the write.

## Idempotency

- Public content: upsert-based (PUT is idempotent)
- Guest content: supports `If-Match` header for optimistic concurrency (ETag/revision matching)

## TTL & Expiration

- `ttl` — time-to-live in seconds for the document
- `expirationDate` — absolute expiration date (YYYY-MM-DD) with timezone
- Max TTL enforced via configuration (`allowedPathParams.maxSecondsTTL`)

## Feature Toggles

- `bulk.endpoint.enabled` — controls bulk GET availability
- `upsert.swid.endpoint.enabled` — controls SWID upsert (returns 410 when disabled)

## Common Gotchas

- Content type denylist can silently reject valid-looking requests — check `denylistedContentTypes` config
- Matrix variable parsing: type path must include `;version=X.Y` or request fails
- SQS path (`/content/SWID/{swid}/{type}/{destination}/{entityId}`) is routed through queue-consumer, not rest-app
- Sandbox endpoints (`/dev/...`) write to `priv-mbl` bucket, not production private bucket
