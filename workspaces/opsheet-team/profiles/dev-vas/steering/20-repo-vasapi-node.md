---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.test.*", "package.json", "tsconfig*.json", "jest.config*", ".eslintrc*"]
---

# VasAPI (Koa/TypeScript) steering — opsheet-plus-vas

## Architecture layers
- **Routes:** register paths only; attach validators as middleware before the controller handler.
- **Controllers:** parse `ctx`, delegate to service or processor, set `ctx.body` and `ctx.status`.
- **Services:** single-domain HTTP calls; keep them focused on one external resource.
- **Transformers:** map external responses to internal models; no side effects.
- **Validators:** validate `ctx.query` / `ctx.request.body`; run as middleware before the controller.
- **Processors:** orchestrate 2+ services to produce complex aggregated results. Use `PromiseUtil.allSettled` for parallel calls. Inject dependencies via constructor. Add a processor when a controller would otherwise call more than one service directly.

## Koa conventions
- Use `ctx.throw(status, message)` for error responses — never set `ctx.status` + `ctx.body` manually for errors.
- Middleware order matters: global exception → bodyParser → multipart → logging → logRequest → tracing → gzip → router.
- Route files register paths only; attach validators as middleware before the controller handler.

## Contracts
- Do not break existing route paths or response shapes.
- Prefer additive fields; version endpoints only if a breaking change is unavoidable.
- Downstream consumers depend on stable response models — check `src/models/` before changing shapes.

## Testing
- Test files live in `src/tests/domains/<domain>/`.
- Use `@shopify/jest-koa-mocks` (`createMockContext`) for controller tests.
- Mock `rest-api.service.ts` at the service boundary, not at the HTTP level.
- Add tests for new branches and error conditions.

## Secrets & config
- Secrets come from `@opsheet/secrets` + Vault Lambda Extension — never hardcode or log them.
- Environment config loaded from `env/<environment>.json` via `initEnvironment` in `server.ts`.

## Do not
- Do not add logic to route files beyond middleware registration.
- Do not load full datasets into memory — batch or stream when dealing with large payloads.
- Do not log PII, tokens, or secret values at any log level.
