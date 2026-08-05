# NestJS WebAPI Generator Reference

## Auth modes

| CLI / scaffold value | Generator prompts | Template impact |
|----------------------|-------------------|-----------------|
| `none` | Auth=N | No auth module or middleware |
| `cast-member` | Auth=Y → B2B=N → Cast=Y | OIDC controller + MyID middleware |
| `b2b` | Auth=Y → B2B=Y | B2B token validation only |

> Guest-login UIs use a WebAPI with `auth=none`. Only validate guest-login pairing when the ticket explicitly covers UI+WebAPI integration.

## Creating test apps

**Do not run `yo` directly from this workflow.** When a new app is needed, follow [ra-scaffold-app](../ra-scaffold-app/SKILL.md) in `webapi-only` mode after linking the local generator:

```bash
cd /Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-nest-webapi-generator
npm install && npm link
```

Expect script and auth flow: [webapi-nest.md](../ra-scaffold-app/references/webapi-nest.md).

## Validation matrix

Run for **each auth mode** affected by the change:

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Unit tests | `npm run test` |
| Build | `npm run build` |
| Dev server | `npm run start:dev` → http://localhost:8625 |
| Healthcheck | `curl http://localhost:8625/api/healthcheck` |
| Streaming | `curl -N "http://localhost:8625/api/v1/streaming/chat?message=hello"` |
| Docker | `docker build -t my-api . && docker run -it -p 8625:8625 my-api` |

### Streaming validation

When SSE templates changed:
1. Confirm `API_BASE_PATH=/api` in `.env`
2. Confirm auth middleware excludes `v1/streaming/*path` (path-to-regexp v8+ syntax)
3. Verify streaming endpoint returns SSE chunks

### Auth middleware exclusion (cast-member + streaming)

```typescript
.exclude('/auth/oidc', '/auth/validate', '/healthcheck', {
  path: 'v1/streaming/*path',
  method: RequestMethod.ALL,
})
```

## Route mapping

| Controller | URL (with API_BASE_PATH=/api) | Notes |
|------------|-------------------------------|-------|
| `@Controller('auth')` | `/api/auth/oidc`, `/api/auth/validate` | No `/v1/` |
| `@Controller('v1/streaming')` | `/api/v1/streaming/chat` | Has `/v1/` |
| `@Controller('v1/<resource>')` | `/api/v1/<resource>` | Has `/v1/` |
| `@Controller('healthcheck')` | `/api/healthcheck` | No `/v1/` |

## Port prototype → template checklist

When moving a working test-app change into the generator:

1. Identify if change is auth-specific, streaming-specific, or shared
2. Copy file to the correct folder under `generators/templates/`
3. Replace hardcoded app name with `<%= appName %>` or Yeoman EJS conditionals
4. Update `generators/app/index.js` if new prompts, conditional logic, or file copies needed
5. Update `generators/generator-utils/` if shared creation logic changes
6. Regenerate each affected auth mode and diff against prototype

## Prerequisites

- Node ≥24.11.0 (or team-agreed LTS)
- Yeoman: `npm install -g yo@5.1.0`
- Generator: `npm install -g @wdpr/generator-ra-nest-webapi@"^24.0.0"`
- Nexus3 registry configured (Disney internal)
- `npm link` from generator repo for local development

## Common pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Streaming 404 | Wrong `API_BASE_PATH` | Must be `/api`, not `/api/v1` |
| Auth blocks streaming | Missing middleware exclusion | Add `v1/streaming/*path` exclude |
| Old regex in exclude | path-to-regexp v8 migration | Use `*path`, not `(.*)` |
| Linked generator stale | npm link not refreshed | `npm unlink && npm link` in generator repo |
