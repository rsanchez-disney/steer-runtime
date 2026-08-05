# Fullstack Wiring: Angular + NestJS

This reference covers wiring an Angular SPA to a NestJS WebAPI.
Prerequisites: WebAPI already generated and configured (see [webapi-nest.md](webapi-nest.md)).

---

## Generate the Angular UI

Follow [ui-angular.md](ui-angular.md) to generate the app, then come back here for fullstack-specific configuration.

```bash
cd <target-path>
ng new <app-name>-ui --collection=@wdpr/ra-schematics-angular-spa \
  --auth=<cast-member|guest-login|none> \
  --chatbot \
  --setup-playwright=false \
  --skip-git
```

---

## Configure for fullstack (wiring to WebAPI)

After generating, configure the `.env` to point to the WebAPI:

```bash
cd <app-name>-ui
cp .env-EXAMPLE .env
```

### Cast-member auth

```env
AUTH_CLIENT_ID=<client-id>
REDIRECT_URI="http://localhost:8626/login"
ERROR_URL="http://localhost:8626/error"
TOKEN_VALIDATION_ENDPOINT="http://localhost:8625/api/auth/validate"
WRAPPER_TOKEN_ENDPOINT="http://localhost:8625/api/auth/oidc"
API_BASE_URL=http://localhost:8625
```

> ⚠️ Auth endpoints are `/api/auth/oidc` and `/api/auth/validate` — WITHOUT `/v1/`.

### Guest-login auth

```env
FEATURE=<app-name>
API_BASE_URL=http://localhost:8625
```

> No `WRAPPER_TOKEN_ENDPOINT` or `TOKEN_VALIDATION_ENDPOINT` needed — auth is client-side.

### No auth

```env
API_BASE_URL=http://localhost:8625
```

---

## Ports

| Service | Port | URL |
|---------|------|-----|
| Angular UI | 8626 | http://localhost:8626 |
| NestJS WebAPI | 8625 | http://localhost:8625 |

---

## Start (both apps)

```bash
# Terminal 1 — WebAPI
cd <target-path>/<app-name>-webapi && npm run start:dev

# Terminal 2 — Angular UI
cd <target-path>/<app-name>-ui && npm run start:dev
```

---

## Verify SSE streaming

```bash
curl -N "http://localhost:8625/api/v1/streaming/chat?message=hello"
```

Then open http://localhost:8626 → login → click `?` button → send a message.

---

## Route mapping

| Controller | URL | Notes |
|---|---|---|
| `@Controller('auth')` | `/api/auth/oidc`, `/api/auth/validate` | No `/v1/` |
| `@Controller('v1/streaming')` | `/api/v1/streaming/chat` | Has `/v1/` |
| `@Controller('healthcheck')` | `/api/healthcheck` | No `/v1/` |

---

## Summary template

```
✅ Fullstack app scaffolded! (Angular + NestJS)

| App           | Path                  | Port | URL                  |
|---------------|-----------------------|------|----------------------|
| NestJS WebAPI | <path>/<name>-webapi  | 8625 | http://localhost:8625 |
| Angular UI    | <path>/<name>-ui      | 8626 | http://localhost:8626 |

Auth: <auth-type> | Client ID: <id>
Chatbot/SSE: <✅ | ❌>
Streaming: GET http://localhost:8625/api/v1/streaming/chat?message=<text>
```
