# UI Reference: Angular SPA

Generate a standalone Angular 20.3 SPA using `@wdpr/ra-schematics-angular-spa`.

---

## CLI flags reference

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--auth` | string | `cast-member` | `cast-member` / `guest-login` / `none` |
| `--chatbot` | boolean | `false` | SSE-powered chatbot panel |
| `--feature-flag` | boolean | `false` | LaunchDarkly feature flag support |
| `--setup-playwright` | boolean | `true` | Playwright E2E testing framework |
| `--defaults` | boolean | `false` | Skip all prompts, use defaults |
| `--device-detection` | boolean | `false` | `@wdpr/ra-angular-device-detection` |
| `--geolocation` | boolean | `false` | `@wdpr/ra-angular-geolocation` |
| `--cdn` | boolean | `false` | `@wdpr/ra-angular-cdn` |
| `--prerender` | boolean | `false` | `@wdpr/ra-angular-prerender-injector` |
| `--analytics` | boolean | `false` | Only with `--auth=guest-login` |
| `--oidc-webfinger` | string | prod myid URL | Custom OIDC discovery URL |
| `--marketplace` | boolean | `false` | DX Marketplace SPA |
| `--marketplace-base-url` | string | `https://latest.marketplace.wdprapps.disney.com` | Marketplace API URL |
| `--skip-install` | boolean | `false` | Skip npm install |
| `--skip-git` | boolean | `false` | Skip git init |

> ⚠️ All flags use **kebab-case**. Using camelCase causes `Unknown argument` errors.

---

## Generate

### Standard Angular SPA

```bash
cd <target-path>
ng new <app-name> --collection=@wdpr/ra-schematics-angular-spa \
  --auth=<cast-member|guest-login|none> \
  --chatbot \
  --setup-playwright=false \
  --skip-git
```

### With all defaults (cast-member, playwright, no extras)

```bash
ng new <app-name> --collection=@wdpr/ra-schematics-angular-spa --defaults
```

### Marketplace SPA

```bash
ng new <app-name> --collection=@wdpr/ra-schematics-angular-spa \
  --marketplace \
  --auth=<cast-member|none> \
  --marketplace-base-url="https://latest.marketplace.wdprapps.disney.com"
```

> ⚠️ Marketplace SPAs: no `--chatbot`, no `--auth=guest-login`.

---

## Configure

1. **Copy .env:**
   ```bash
   cd <app-name>
   cp .env-EXAMPLE .env
   ```

2. **Set auth variables** (if auth ≠ none):

   **Cast-member:**
   ```env
   AUTH_CLIENT_ID=<client-id>
   ```

   **Guest-login:**
   ```env
   FEATURE=<app-name>
   ```

3. **Set `API_BASE_URL`** (if chatbot is enabled and you have a WebAPI):
   ```env
   API_BASE_URL=http://localhost:8625
   ```
   > If no WebAPI, leave empty or remove — chatbot will show a config error message.

---

## Ports

| Service | Port | URL |
|---------|------|-----|
| Angular UI (static server) | 8626 | http://localhost:8626 |
| NGINX (optional) | 8000 | http://localhost:8000 |

---

## Start

```bash
cd <app-name>
npm run start:dev
```

→ Open http://localhost:8626

---

## Notes

- `ng new` runs `npm install` automatically.
- The static server (Fastify) serves the bundle + provides `/config` endpoint.
- `--analytics` is silently disabled if auth ≠ `guest-login`.
- `--device-detection`, `--geolocation`, `--cdn`, `--prerender` wire their `@wdpr/ra-angular-*` blocks into `app.config.ts`.
- Auth flow (cast-member): Angular → MyID SSO → callback `/login` → token via `POST /api/auth/oidc` → JWT in localStorage.
- Auth flow (guest-login): Angular → PEP/SWID flow entirely client-side via `@wdpr-profile/authenticator-universal`.
