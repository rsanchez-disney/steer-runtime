---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.test.*", "package.json", "tsconfig*.json"]
description: Architecture patterns and code conventions for the OpSheet+ VAS BFF orchestration layer
---

# OpSheet+ VAS - Architecture & Code Patterns

## What is this project?

OpSheet+ VAS (Visual Assembly Service) is a Backend-for-Frontend (BFF) orchestration layer built with Koa.js and TypeScript. It sits between OpSheet client applications (web/mobile) and core backend services. Its responsibilities are:

1. Validate permissions via MyID authentication and route-level module authorization
2. Orchestrate calls to multiple core backend services
3. Transform and enrich responses with additional context and historical metadata for frontend consumption

**No business logic lives here.** This is strictly an orchestration and data-enrichment layer.

## Architectural Layers & Dependency Flow

```
Routes → Middleware (Auth/Permissions) → Controllers ──→ Services → Core Backend APIs
   ↓                                         ↓        ↘     ↑
Validators                              Transformers ← Processors
```

### 1. Routes (`src/routes/`)

- Define HTTP endpoints with method, URI, and handler
- Apply middleware chain: MyID auth → context creator → request parser → route permissions → custom middlewares → restricted resources → pre-validations → post-validations → handler
- Extend `BaseRouter` which builds the middleware chain automatically
- All URIs are prefixed with `/api/vas` and optionally `/{version}/{platform}/{prefix}`
- Use `this.respond(ctx, data, statusCode)` to wrap responses in `{ data }` format

### 2. Controllers (`src/controllers/`)

- Orchestrate the request flow for a domain
- Extract request data from `ctx.context` (params, body, query, updateUsername)
- Call services directly OR call processors for reusable patterns
- Call transformers for response enrichment
- **No business logic** — only coordination

### 3. Processors (`src/processors/`)

- Reusable orchestration logic shared across multiple controllers
- Behave exactly like controllers but are called BY controllers
- Call services only
- **No business logic** — just reusable data aggregation

### 4. Services (`src/services/`)

- HTTP clients for core backend services
- Extend `RestAPIService` which provides `this.http` (HttpClient) and `this.baseHref`
- Make external API calls only, passing `x-auth-user` header
- Use `@dpep-cgs/url` `UrlUtil.buildUrl()` for URL construction
- Depend only on models
- **No business logic** — pure HTTP pass-through

### 5. Transformers (`src/transformers/`)

- Static methods that convert between API formats
- Enrich responses with additional context (history metadata, definition table lookups)
- Format data for frontend consumption
- **No business logic** — pure data transformation

### 6. Models (`src/models/`)

- TypeScript interfaces and type definitions only
- No implementation code
- One file per domain

### Key Rules

- Controllers call: Services (direct) OR Processors (for reusable patterns) + Transformers
- Processors call: Services only
- Services: HTTP calls only, depend only on Models
- Transformers: Pure data transformation, static methods
- **No business logic anywhere**

## Technical Constraints

- Must integrate with Disney's internal authentication (MyID)
- API responses must be fast (<2s for most endpoints)
- Must support multiple park environments (WDW, DLR, etc.)
- Backward compatibility required for existing clients

## Directory Structure

```
src/
├── controllers/     # Request orchestration
├── routes/          # API endpoint definitions with middleware
├── services/        # HTTP clients for external core services
├── models/          # TypeScript interfaces
├── transformers/    # Data enrichment and format conversion
├── processors/      # Reusable orchestration logic
├── middlewares/     # Koa middleware (auth, validation, logging)
├── validators/      # Request validation logic
├── utils/           # Helper functions
├── constants/       # Application constants and enums
├── configs/         # Configuration files and definition tables
├── decorators/      # TypeScript decorators
├── lib/             # Shared libraries (HttpClient)
├── tests/           # Test files
│   ├── domains/     # Feature-specific tests (mirrors domain structure)
│   ├── helpers/     # Test utilities, mocks, factories
│   ├── middlewares/  # Middleware tests
│   ├── processors/  # Processor tests
│   └── utils/       # Utility tests
└── server.ts        # Entry point (Koa + Lambda handler)
```

## Anti-Patterns

### ❌ Business Logic in VAS
```typescript
// WRONG: Business logic in service
async calculateDispatchInterval(data: Data): Promise<number> {
  return data.capacity / data.throughput; // Business logic!
}
```
**Fix**: Move to core backend service, VAS only calls and passes through

### ❌ Data Transformation in Services
```typescript
// WRONG: Transformation in service
async getResource(id: string): Promise<Api> {
  const { data } = await this.http.get<Internal>(url);
  return { id: data.id, name: data.displayName }; // Transform!
}
```
**Fix**: Return raw data, use transformer in controller

### ❌ Service Calls in Transformers
```typescript
// WRONG: Service call in transformer
static async enrich(data: Data): Promise<Enriched> {
  const extra = await someService.getData(); // Service call!
  return { ...data, extra };
}
```
**Fix**: Controller calls service, passes data to transformer

### ❌ Multiple Responsibilities
```typescript
// WRONG: Controller doing too much
async handle(ctx: Context) {
  const data = await this.service.get();
  const validated = this.validate(data); // Validation!
  const transformed = this.transform(validated); // Transform!
  const enriched = await this.enrich(transformed); // More logic!
  return enriched;
}
```
**Fix**: Separate concerns - validator, service, transformer
