# Node.js / NestJS Conventions — DCL WebAPI

## Stack
- NestJS 11, Node 20 (pinned via .nvmrc), npm >=10
- TypeScript 5.8, strict null checks
- class-validator + class-transformer for DTOs
- @nestjs/axios for HTTP, @nestjs/swagger for OpenAPI
- helmet + cookie-parser for security
- YAML config with env overlays (js-yaml + deepmerge-ts)
- OpenAPI Generator CLI for auto-generated clients
- Jest 29 + supertest, ESLint 9 flat config, Prettier

## Code Style
- `const` for non-reassigned, `let` for reassigned — never `var`
- Arrow functions for callbacks
- `async/await` over `.then()/.catch()` chains
- Max 2 levels of nesting
- ESLint: `tseslint.configs.strict` + `tseslint.configs.stylistic` + `eslint-plugin-import-x`
- Prettier: 4-space tabs, single quotes, trailing comma: all, CRLF, single attribute per line

## Module Patterns
- `@Global()` on config module for app-wide injection
- `forRoot()` / `forRootAsync()` for dynamic module configuration
- OpenAPI-generated modules configured via `forRootAsync` with factory functions
- Feature modules import `ConnectorsModule` for external service access
- `ConfigurableModuleBuilder` for custom module options

## Controller Patterns
- `@ApiTags`, `@ApiOperation`, `@ApiParam`, `@ApiResponse` for Swagger
- `@UseGuards()` for auth and header validation
- `@UseFilters()` for exception handling at controller level
- Constructor injection for services
- Global `ValidationPipe({ whitelist: true, transform: true })`
- URI versioning enabled

## Guard Patterns
- `RequiredHeadersGuard` — validates required headers (accept-language)
- `KeystoneGuard` — OIDC token validation for restricted pages
- Guards throw `BadRequestException` (400) or `UnauthorizedException` (401)

## Exception Handling
- Custom `@Catch()` exception filter at controller level
- Resolves status from: Content Cache errors, HttpException, plain objects
- Default: 500 for unhandled errors
- Guards throw NestJS built-in exceptions

## Connector Pattern
- Wraps OpenAPI-generated clients with RxJS
- Uses `firstValueFrom()` to convert Observable to Promise
- `throwOnErrors()` checks for error arrays in response data

## Configuration
- Base: `app-config.yml`, overlay: `app-config.{env}.yml`
- Environments: local, latest, stage, load, prod
- `process.env` overrides have highest priority
- `@Global()` AppConfigModule — injectable everywhere
- `.env-EXAMPLE` for documentation, `.env` for local secrets

## Testing
- Jest 29 + ts-jest, preset: ts-jest, testEnvironment: node
- `*.spec.ts` for unit, `*.e2e-spec.ts` for E2E
- Manual mocks: `jest.fn()` + `Test.createTestingModule()`
- E2E: `supertest` + `overrideProvider`
- `moduleNameMapper` for path aliases
- Coverage excludes: `.config.ts`, `.interface.ts`, `.constants.ts`

## OpenAPI Code Generation
- `@openapitools/openapi-generator-cli` v7.12
- Specs in `openapi/clients/`, output to `generated/clients/` (gitignored)
- TypeScript-Axios generator
- Runs during `postinstall` and CI

## Path Aliases
```
@config/* → src/config/*
@<feature>/* → src/<feature>/*
@connectors/* → src/connectors/*
@shared/* → src/shared/*
@content-cache/api → generated/clients/content-cache/api/api
@authz/api → generated/clients/authz/api/api
```

## Build & Deploy
- `nest build` (NestJS CLI)
- nest-cli.json copies static assets and YAML configs to dist
- Docker: multi-stage build on Disney Node 20 base image
- Harness CI/CD pipelines
- Makefile for CI build steps

## Dependency Versioning
- `@wdpr/` scoped: `^` (caret — minor updates)
- All others: `~` (tilde — patch only)
- Run `npm install` after updating package.json
