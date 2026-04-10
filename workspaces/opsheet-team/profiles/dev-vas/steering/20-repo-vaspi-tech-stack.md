---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.js", "**/*.spec.ts", "**/*.test.*", "package.json", "tsconfig*.json"]
description: Technology stack, runtime, and build configuration details
---

# Technology Stack & Build

## Runtime

- Node.js 20.4.0 (see `.nvmrc`)
- TypeScript strict mode, target ES2019, lib ES2020
- Module: CommonJS

## Core Framework

- Koa.js 2.x with @koa/router and @koa/bodyparser
- Entry point: `src/server.ts` (Koa server + AWS Lambda handler via serverless-http)

## Build

- esbuild for production bundling (`npm run build`)
- Output: `dist/index.js` (~21MB), platform node, target es2020
- External: dtrace-provider, appdynamics, appd_libagent
- Source maps enabled
- nodemon for development hot-reload (`npm run dev`)

## HTTP Client

- Axios via custom `HttpClient` wrapper (`src/lib/http.ts`)
- Auto-injects Authorization bearer token (cached, auto-refreshed)
- Auto-injects correlation-id, conversation-id, x-date from request context
- Keep-alive enabled, configurable max sockets
- Response interceptor converts errors to `TranslationKeyError`

## Code Quality

- ESLint with `@opsheet/eslint-config-dpep-cgs-typescript` + prettier
- Prettier: 120 char width, single quotes, 2-space indent
- `@typescript-eslint/no-explicit-any`: off
- `import/no-cycle`: error
- Husky + lint-staged for pre-commit hooks

## Key Internal Libraries

- `@dpep-cgs/date-time` — date/time utilities
- `@dpep-cgs/errors` — error handling
- `@dpep-cgs/object-utils` — object manipulation (get, set, merge, omit)
- `@dpep-cgs/url` — URL building with `UrlUtil.buildUrl()`
- `@opsheet/logger` — logging (`new Logger('context-name')`)
- `@opsheet/secrets` — secret management

## Authentication

- `@dpep-cgs/myid` — Disney MyID integration
- `jsonwebtoken` — JWT handling
- Secrets via AWS Secrets Manager (VaultUtils)

## Deployment

- AWS Lambda (Dockerfile with Node 20 runtime)
- ECS (ECS.Dockerfile with custom Disney base image)
- Harness CI/CD pipeline
- Port: 8625

## Common Commands

- `npm run dev` — compile + run + watch
- `npm run build` — esbuild production bundle
- `npm run start` — run built bundle
- `npm run test` — Jest unit tests (sequential)
- `npm run test:parallel` — Jest unit tests (parallel)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — strict type validation
- `npm run full-check` — tsc + lint + test
