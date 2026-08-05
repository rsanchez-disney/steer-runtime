# WebAPI Reference: NestJS

Generate a NestJS WebAPI using `@wdpr/generator-ra-nest-webapi`.

---

## Generator info

| Field | Value |
|---|---|
| Package | `@wdpr/generator-ra-nest-webapi` |
| Version | `^24.0.0` |
| Repo | `WDPR-RA/wdpr-ra-nest-webapi-generator` |
| Invocation | `yo @wdpr/ra-nest-webapi` (Yeoman, interactive) |

---

## Generate

The generator is **fully interactive** — piped stdin does NOT work. Use an `expect` script.

```bash
cd <target-path>
mkdir <app-name>-webapi && cd <app-name>-webapi
```

### Expect script

Create `/tmp/yo-nest-webapi.exp`:

```expect
#!/usr/bin/expect -f
set timeout 180

spawn yo @wdpr/ra-nest-webapi --force

# 1. Application name
expect "application name"
send "<app-name>-webapi\r"

# 2. Application version
expect "application version"
send "<version>\r"

# 3. Use auth?
expect -re "(auth|MyID|authentication)"
send "<Y|N>\r"

# --- If auth = Y ---

# 4. B2B? (only if auth=Y)
expect -re "(B2B|b2b)"
send "<Y|N>\r"

# 5. Cast-facing? (only if NOT b2b)
expect -re "(cast|Cast)"
send "<Y|N>\r"

# 6. Auth environment (only if cast-facing=Y)
expect -re "(environment|Environment)"
send "<Production|Non-Production>\r"

# 7. OIDC URL (only if cast-facing=Y)
expect -re "(OIDC|oidc|URL|url|webfinger)"
send "<url or Enter for default>\r"

# --- End auth sub-prompts ---

# 8. Resource name (blank to skip)
expect -re "(resource|Resource)"
send "<name or Enter>\r"

# 9. SSE streaming
expect -re "(SSE|streaming|Streaming)"
send "<Y|N>\r"

expect eof
```

### Auth prompt flow

| User's auth choice | Prompts answered |
|---|---|
| `none` | Auth=N → skip 4-7 |
| `cast-member` | Auth=Y → B2B=N → Cast=Y → Environment → OIDC URL |
| `guest-login` | Auth=N (recommended — WebAPI doesn't need auth for guest) |
| `b2b` | Auth=Y → B2B=Y → skip 5-7 |

Run: `expect /tmp/yo-nest-webapi.exp`

> Generator runs `npm install` automatically.

---

## Configure

1. **Copy .env:**
   ```bash
   cp .env-EXAMPLE .env
   ```

2. **Set `API_BASE_PATH`:**
   ```env
   API_BASE_PATH=/api
   ```
   > ⚠️ Must be `/api` — NOT `/api/v1`. The streaming controller has `v1/` in its own path.

3. **Set `OIDC_CLIENT_ID`** (only if auth = cast-member):
   ```env
   OIDC_CLIENT_ID=<client-id>
   ```

4. **Set CORS origin** (if UI runs on a different port):
   ```env
   CORS_ORIGIN=http://localhost:8626
   ```

5. **Exclude streaming from auth middleware** (only if auth ≠ none AND streaming enabled):

   Edit `src/app.module.ts`:
   ```typescript
   import { MiddlewareConsumer, NestModule, Module, RequestMethod } from '@nestjs/common';

   export class AppModule implements NestModule {
     configure(consumer: MiddlewareConsumer) {
       consumer
         .apply(MyIdAuthFilterMiddleware)
         .exclude('/auth/oidc', '/auth/validate', '/healthcheck', {
           path: 'v1/streaming/*path',
           method: RequestMethod.ALL,
         })
         .forRoutes('*');
     }
   }
   ```
   > ⚠️ Use `path-to-regexp` v8+ syntax (`*path`), NOT the old regex `(.*)`.

   > If auth = `none`, skip this step — no middleware exists.

---

## Ports

| Service | Port |
|---------|------|
| NestJS WebAPI | 8625 |

---

## Start

```bash
cd <app-name>-webapi
npm run start:dev
```

---

## Route mapping

| Controller | URL (with API_BASE_PATH=/api) | Notes |
|---|---|---|
| `@Controller('auth')` | `/api/auth/oidc`, `/api/auth/validate` | No `/v1/` |
| `@Controller('v1/streaming')` | `/api/v1/streaming/chat` | Has `/v1/` |
| `@Controller('v1/<resource>')` | `/api/v1/<resource>` | Has `/v1/` |
| `@Controller('healthcheck')` | `/api/healthcheck` | No `/v1/` |

---

## Auth matrix

| Mode | `useAuth` | `b2bAuth` | `oidcAuth` | What gets generated |
|---|---|---|---|---|
| `none` | N | — | — | No auth module |
| `cast-member` | Y | N | Y | OIDC auth controller + MyID middleware |
| `b2b` | Y | Y | — | B2B token validation only |

---

## Verify

```bash
npm run build   # Should compile without errors
npm run test    # All tests pass
npm run lint    # No errors (except pre-existing streaming.service.ts issues)
```

Test streaming:
```bash
curl -N "http://localhost:8625/api/v1/streaming/chat?message=hello"
```

---

## Notes

- `API_BASE_PATH=/api` is critical — NOT `/api/v1`.
- JEDAI configuration (`JEDAI_KEY`, `JEDAI_HOST`, `JEDAI_MODEL`) required for real LLM responses.
- Without JEDAI config, the chatbot returns a helpful error message explaining setup steps.
- The AppDynamics error (`No access to profile config file`) is harmless in local dev.
- Node engine warnings (`EBADENGINE`) during npm install are expected on Node 22+.
