# Skill: NestJS endpoint implementation

Use when adding or modifying endpoints in DCL BFF applications.

## Checklist
1. Add method in controller with `@Get`/`@Post`/`@Put`/`@Delete`
2. Add Swagger decorators: `@ApiOperation`, `@ApiParam`, `@ApiResponse`
3. Add guards: `@UseGuards(RequiredHeadersGuard)` at minimum
4. Create DTO with `class-validator` decorators if needed
5. Implement service method with connector calls
6. Apply exception filter at controller level: `@UseFilters()`
7. Add unit test with `Test.createTestingModule()` + mocked service
8. Add E2E test with `supertest` + `overrideProvider`
9. Verify Swagger docs render correctly at `/api-docs`
10. Run `npm run jest` and `npm run test:e2e`
