---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.test.*", "package.json", "tsconfig*.json"]
description: Code patterns, naming conventions, and coding standards for the project
---

# Code Patterns & Conventions

## Naming Conventions

### Files

- Controllers: `{domain}.controller.ts`
- Routes: `{domain}.route.ts`
- Services: `{domain}.service.ts`
- Models: `{domain}.ts`
- Transformers: `{domain}.transformer.ts`
- Processors: `{domain}.processor.ts`
- Tests: `{domain}.{type}.spec.ts` (e.g., `alerts.controller.spec.ts`)

### Classes

- Controllers: `{Domain}Controller`
- Routes: `{Domain}Router extends BaseRouter`
- Services: `{Domain}Service extends RestAPIService`
- Transformers: `{Domain}Transformer` (static methods)
- Processors: `{Domain}Processor`

### Route Names

- Format: `{method}.{domain}.{resource}.{subresource}`
- Example: `get.cle.entity.dispatch-interval`
- Method matches HTTP verb: `get`, `post`, `put`, `delete`
- Note: Legacy routes may use `{domain}.{method}` format, new routes must follow `{method}.{domain}`

## Code Examples

### Route Definition

```typescript
// src/routes/{domain}.route.ts
import { BaseRouter } from './base';
import { DomainController } from '../controllers/{domain}.controller';
import { IRoute, Context, PermissionModules } from '../models';

export class DomainRouter extends BaseRouter {
  private controller: DomainController;

  constructor(controller?: DomainController) {
    super();
    this.controller = controller ?? new DomainController();
    this.init();
  }

  prefix() {
    return 'domain';
  }

  routes(): IRoute[] {
    return [
      {
        name: 'get.domain.resource',
        method: 'GET',
        uri: '/resource/:id',
        platform: 'web', // 'web' | 'mobile' | 'common'
        handler: async (ctx: Context) => {
          const resp = await this.controller.getResource(ctx);
          this.respond(ctx, resp, 200);
        },
        requiresAuth: true,
        modulesAllowedToCallEndpoint: [{ module: PermissionModules.X }],
        validator: (ctx: Context) => {
          /* validation */
        },
      },
    ];
  }
}
```

### Controller Method

```typescript
// src/controllers/{domain}.controller.ts
import { Context } from '../models';
import { DomainService } from '../services/{domain}.service';
import { DomainTransformer } from '../transformers/{domain}.transformer';
import { DomainProcessor } from '../processors/{domain}.processor';

export class DomainController {
  private service: DomainService;
  private domainProcessor: DomainProcessor;

  constructor({
    domainService,
    domainProcessor,
  }: {
    domainService?: DomainService;
    domainProcessor?: DomainProcessor;
  } = {}) {
    this.service = domainService ?? new DomainService();
    this.domainProcessor = domainProcessor ?? new DomainProcessor();
  }

  async getResource(ctx: Context<{ params: { id: string } }>) {
    const {
      params: { id },
      updateUsername,
    } = ctx.context;
    const data = await this.service.getResource(id, updateUsername);
    return DomainTransformer.toResponse(data);
  }

  async getAggregatedResource(ctx: Context<{ params: { entityId: string } }>) {
    const {
      params: { entityId },
      updateUsername,
    } = ctx.context;
    return this.domainProcessor.getAggregatedData(entityId, updateUsername);
  }
}
```

### Service Method

```typescript
// src/services/{domain}.service.ts
import { UrlUtil } from '@dpep-cgs/url';
import { HttpClient } from '../lib/http';
import { RestAPIService } from './rest-api.service';
import { APIUrlUtil } from '../utils/api-url';

export class DomainService extends RestAPIService {
  constructor(http?: HttpClient, baseHref?: string) {
    super(http, baseHref ?? APIUrlUtil.getCoreBaseUrl());
  }

  async getResource(id: string, user: string) {
    const resp = await this.http.get<ResourceResponse>(
      UrlUtil.buildUrl({
        baseUrl: this.baseHref,
        path: `/v1/resources/${id}`,
      }),
      { headers: { 'x-auth-user': user } },
    );
    return resp.data;
  }
}
```

### Transformer

```typescript
// src/transformers/{domain}.transformer.ts
export class DomainTransformer {
  static toResponse(raw: RawResource): Resource {
    return {
      /* mapping */
    };
  }
}
```

### Model

```typescript
// src/models/{domain}.ts
export interface Resource {
  id: string;
  name: string;
  createdAt: string;
}
```

### Processor

Processors contain reusable orchestration logic shared across multiple controllers. They call services only and behave like controllers.

```typescript
// src/processors/{domain}.processor.ts
import { DomainService } from '../services/{domain}.service';
import { DefinitionTableService } from '../services/definition-table.service';

export class DomainProcessor {
  protected domainSvc: DomainService;
  protected definitionTableSvc: DefinitionTableService;

  constructor({
    domainSvc,
    definitionTableSvc,
  }: {
    domainSvc?: DomainService;
    definitionTableSvc?: DefinitionTableService;
  } = {}) {
    this.domainSvc = domainSvc ?? new DomainService();
    this.definitionTableSvc = definitionTableSvc ?? new DefinitionTableService();
  }

  async getAggregatedData(entityId: string, user: string) {
    const [dataA, dataB, definitions] = await Promise.all([
      this.domainSvc.getDataA(entityId, user),
      this.domainSvc.getDataB(entityId, user),
      this.definitionTableSvc.getAllRowsForTable('TABLE_NAME', { active: 'true' }),
    ]);
    return { ...dataA, ...dataB, definitions };
  }
}
```

## Preferred Patterns

- Async/await over callbacks
- Functional programming where possible
- Dependency injection via constructor params with defaults on routers, controllers, and processors — this enables integration testing by allowing mock injection
- Middleware-based request processing
- Transformer pattern for data mapping (static methods)
- Single responsibility: one primary export per file, one domain per controller

## Type Safety

- Avoid `any` — if unavoidable, justify with a comment
- Use context generics in controllers: `Context<{ params: { id: string }; query: { active: string }; body: CreateRequest }>`
- Use response generics in services: `this.http.get<ResourceResponse>()`
- All interfaces must be exported from model files
- Explicit return types on public functions

## Error Handling

- Errors bubble up to middleware — don't catch and swallow errors in controllers or services
- No try/catch in services — let axios errors propagate; the `HttpClient` interceptor automatically converts core backend errors to `TranslationKeyError`
- For new code (validators, new controllers), use `TranslationKeyError` from `src/models/error.ts` — it includes `translationKey` and `details[]` for frontend localization
- Legacy code uses `BadRequestError`, `UnAuthorizedError`, `NotFoundError` from `@dpep-cgs/errors` — acceptable in existing controllers and auth middlewares, but prefer `TranslationKeyError` for new code
- Always provide meaningful error messages

## Authentication & Security

- `requiresAuth: true` on all protected routes
- `modulesAllowedToCallEndpoint` must be configured on routes — omitting it defaults to unrestricted access from any origin (this is tech debt, behavior may change in the future)
- `updateUsername` must be extracted from `ctx.context` and passed to services for the `x-auth-user` header
- No hardcoded credentials — secrets come from AWS Secrets Manager via VaultUtils
