---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.e2e-spec.ts", "package.json", "tsconfig*.json", "nest-cli.json", "eslint.config*"]
---

# WebAPI (NestJS) steering — DCL BFF Applications

## Architecture
- BFF pattern: proxy and transform content from external services, no database
- Feature-based module organization
- Guards for auth/header validation, exception filters for error handling
- Connectors wrap OpenAPI-generated clients

## Module patterns
- `@Global()` on config module
- `forRoot()` / `forRootAsync()` for dynamic configuration
- Feature modules import ConnectorsModule for external access

## Contracts
- Do not break downstream UI expectations
- Prefer additive fields and versioned endpoints
- Global ValidationPipe with whitelist: true

## Testing
- Jest + supertest, `*.spec.ts` for unit, `*.e2e-spec.ts` for E2E
- Mock with `jest.fn()` + `Test.createTestingModule()`
- E2E uses `overrideProvider` for connector mocking

## Do not
- Do not add database access — this is a BFF
- Do not expose secrets in responses or logs
- Do not modify generated code in `generated/` — update OpenAPI specs instead
- Do not skip Swagger decorators on new endpoints
