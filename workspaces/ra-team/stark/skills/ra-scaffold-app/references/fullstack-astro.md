# Fullstack Wiring: Astro + NestJS

This reference covers wiring an Astro app to a NestJS WebAPI.
Prerequisites: WebAPI already generated and configured (see [webapi-nest.md](webapi-nest.md)).

---

## Generate the Astro UI

Follow [ui-astro.md](ui-astro.md) to generate the app. For fullstack, always enable SSR:

```bash
cd <target-path>
mkdir <app-name>-ui && cd <app-name>-ui

yo @wdpr/ra-ui --defaults \
  --app-name=<app-name>-ui \
  --login-type=<castMember|guestLogin|none> \
  --ssr \
  --chatbot \
  --no-setup-playwright \
  --skip-install
```

Then run `npm install`.

---

## Configure for fullstack (wiring to WebAPI)

```bash
cd <app-name>-ui
cp .env-EXAMPLE .env
```

### Cast-member auth

```env
AUTH_CLIENT_ID=<client-id>
REDIRECT_URI="http://localhost:8000/login"
ERROR_URL="http://localhost:8000/error"
TOKEN_VALIDATION_ENDPOINT="http://localhost:8625/api/auth/validate"
WRAPPER_TOKEN_ENDPOINT="http://localhost:8625/api/auth/oidc"
API_BASE_URL=http://localhost:8625
```

> ⚠️ `REDIRECT_URI` and `ERROR_URL` use port **8000** (NGINX), not 8626.
> Auth endpoints are `/api/auth/oidc` and `/api/auth/validate` — WITHOUT `/v1/`.

### Guest-login auth

```env
FEATURE=<app-name>
API_BASE_URL=http://localhost:8625
```

### No auth

```env
API_BASE_URL=http://localhost:8625
```

---

## Configure NGINX

Ensure `nginx.conf` routes API traffic to WebAPI:

```nginx
upstream astro {
    server [::1]:8626;
}
upstream webapi {
    server [::1]:8625;
}

server {
    listen 8000;

    location /api/ {
        proxy_pass http://webapi;
    }

    location / {
        proxy_pass http://astro;
    }
}
```

Start NGINX:
```bash
# macOS
brew install nginx  # if not installed
nginx -c $(pwd)/nginx.conf
```

---

## Ports

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| **NGINX (entry)** | **8000** | http://localhost:8000 | **Always access here** |
| Astro UI (Fastify) | 8626 | — | Do NOT access directly |
| NestJS WebAPI | 8625 | http://localhost:8625 | API backend |

---

## Start (all services)

```bash
# Terminal 1 — WebAPI
cd <target-path>/<app-name>-webapi && npm run start:dev

# Terminal 2 — Astro UI
cd <target-path>/<app-name>-ui && npm run start:dev

# Terminal 3 — NGINX
nginx -c <target-path>/<app-name>-ui/nginx.conf
```

---

## Verify SSE streaming

```bash
curl -N "http://localhost:8625/api/v1/streaming/chat?message=hello"
```

Then open http://localhost:8000 → login → click `?` → send a message.

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
✅ Fullstack app scaffolded! (Astro + NestJS)

| App           | Path                  | Port | URL                  |
|---------------|-----------------------|------|----------------------|
| NGINX (entry) | —                     | 8000 | http://localhost:8000 |
| Astro UI      | <path>/<name>-ui      | 8626 | (via NGINX only)     |
| NestJS WebAPI | <path>/<name>-webapi  | 8625 | http://localhost:8625 |

Auth: <auth-type> | Client ID: <id>
Chatbot/SSE: <✅ | ❌>
Streaming: GET http://localhost:8625/api/v1/streaming/chat?message=<text>
```

---

## Astro fullstack-specific notes

- **NGINX is mandatory** — it proxies `/api/` → WebAPI and `/` → Astro.
- On macOS, use `[::1]` in nginx.conf. On Linux/Windows, use `127.0.0.1`.
- Auth flow: User → `:8000` → NGINX → Astro → MyID SSO → callback `/login` on `:8000` → token via `POST /api/auth/oidc` (proxied to WebAPI).
