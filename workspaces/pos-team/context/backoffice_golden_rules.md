# Golden Rules — POS Platform

These rules MUST be followed for all code changes across Connect, microservices, and connect-frontend.

## 1. Backward Compatibility

All API changes must be additive. ActivateX (Android) cannot be force-updated — breaking changes strand devices in the field.

- ✅ Add new optional field
- ✅ Add new endpoint
- ✅ Add new gRPC method
- ❌ Remove or rename field
- ❌ Change field type
- ❌ Remove endpoint or gRPC method

## 2. Feature Flags

All new features must be behind an Unleash flag with a planned migration path. Flags are not long-lived.

- Register flags with a feature set (e.g., `FeatureSets::PLATFORM_V21X`)
- Document the flag name and expected removal date
- Never ship a feature without a flag unless it's purely internal

## 3. Null Guards on Partial Updates

When a request only sends a subset of fields, never overwrite stored values with null. Guard every setter:

```php
if (!is_null($request->field)) {
    $entity->setField($request->field);
}
```

## 4. No Shared Database

Services own their data. No direct SQL across service boundaries.

- Communicate via gRPC or REST
- If you need data from another service, call its API
- No shared tables between Connect and microservices

## 5. API Contracts Are Additive (gRPC and REST)

Proto and JSON response changes must be backward compatible. Fields are never removed or renamed.

- gRPC: new fields get the next available number, deprecated fields are `reserved`
- REST: new fields are optional, removed fields break mobile clients
- Both client and server must handle missing optional fields gracefully

## 6. DependencyInjection

Never instantiate services directly. Use the DI container:

```php
$service = DependencyInjection::getInstance()->resolveClass(MyService::class);
```

## 7. Test Coverage

Unit tests required before merge. No PR without tests for new/changed logic.

- PHPUnit 9 + Mockery for PHP
- Jest for React
- `go test` for Go
- Cover the specific behavior, not just line count

## 8. No Secrets in Code

Never commit tokens, credentials, or API keys. Use environment variables.

- `.env` files are git-ignored
- Hard-coded secrets are treated as critical defects
- Reference secrets by key name in documentation, never by value

## 9. Structured Logging

Use structured JSON logging. No raw `echo`, `print_r`, or `var_dump` in production code.

- Include context (userId, ticketId, action)
- Use appropriate levels (DEBUG, INFO, WARN, ERROR)
- Never log sensitive data (tokens, passwords, PII)

## 10. Minimal Diff

One story = one PR. Change only what's necessary.

- Don't refactor unrelated code in the same PR
- Don't reformat entire files
- All changes must map to acceptance criteria
