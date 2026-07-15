# Skill: Connector implementation (OpenAPI client wrapper)

Use when integrating with a new external service.

## Checklist
1. Add OpenAPI spec to `openapi/clients/<service>/`
2. Run `npm run openapi:generate` to generate client
3. Create connector class in `src/connectors/` wrapping generated client
4. Use `firstValueFrom()` to convert Observable to Promise
5. Add `throwOnErrors()` for error checking
6. Configure generated module in `app.module.ts` via `forRootAsync`
7. Add path alias in `tsconfig.json` for clean imports
8. Add unit test with mocked generated client
9. Update `moduleNameMapper` in `jest.config.ts` for new alias
