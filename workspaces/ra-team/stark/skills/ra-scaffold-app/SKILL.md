---
name: ra-scaffold-app
description: Scaffolds WDPR Reference Architecture applications — UI-only (Angular/Astro), WebAPI-only (NestJS), or fullstack (UI + WebAPI wired together with auth, CORS, and SSE streaming). Supports all RA generator flags, multiple auth modes, and leaves everything ready to run.
---

# RA Scaffold App

## Purpose

Scaffold any combination of WDPR Reference Architecture applications:
- **UI only** — Angular SPA, Marketplace SPA, or Astro
- **WebAPI only** — NestJS with auth, streaming, Docker
- **Fullstack** — UI + WebAPI wired together (auth, CORS, SSE chatbot)

## When to use

- Starting a new project from scratch (any tier)
- Need a frontend without a backend
- Need a backend without a frontend
- Need both wired together with chatbot/SSE streaming
- Need cast-member, guest-login, or B2B authentication

---

## Step 1 — Ask what the user needs

Determine the scope of the scaffold:

| User wants | Mode | References to follow |
|---|---|---|
| Only an Angular/Marketplace SPA | `ui-only` | [ui-angular.md](references/ui-angular.md) |
| Only an Astro app | `ui-only` | [ui-astro.md](references/ui-astro.md) |
| Only a NestJS WebAPI | `webapi-only` | [webapi-nest.md](references/webapi-nest.md) |
| Angular + NestJS (fullstack) | `fullstack` | [webapi-nest.md](references/webapi-nest.md) + [fullstack-angular.md](references/fullstack-angular.md) |
| Astro + NestJS (fullstack) | `fullstack` | [webapi-nest.md](references/webapi-nest.md) + [fullstack-astro.md](references/fullstack-astro.md) |

Ask: **"What do you need — just a UI, just a WebAPI, or both wired together (fullstack)?"**

If fullstack, also ask: **"Which UI framework — Angular, Marketplace SPA, or Astro?"**

---

## Step 2 — Gather information

Based on the mode, gather the relevant information.

### Always ask

| # | Question | Options | Default |
|---|----------|---------|---------|
| 1 | Target path | filesystem path | `~/Code/<name>` |
| 2 | App name | string | — |
| 3 | Authentication type | `cast-member` / `guest-login` / `b2b` / `none` | `cast-member` |
| 4 | AUTH_CLIENT_ID / FEATURE | credential string | — (skip if auth=none) |

> ⚠️ **Auth credential naming:**
> - `cast-member` → `AUTH_CLIENT_ID` (UI) / `OIDC_CLIENT_ID` (WebAPI)
> - `guest-login` → `FEATURE` (UI) — no WebAPI auth variable
> - `b2b` / `none` → no client ID needed

### If mode includes UI

| # | Question | Options | Default |
|---|----------|---------|---------|
| 5 | UI framework | `angular` / `marketplace` / `astro` | — |
| 6 | Enable chatbot/SSE? | Yes/No | Yes |
| 7 | Enable feature flags (LaunchDarkly)? | Yes/No | No |
| 8 | Enable Playwright E2E? | Yes/No | Yes |

Plus framework-specific questions — see the relevant reference file.

### If mode includes WebAPI

| # | Question | Options | Default |
|---|----------|---------|---------|
| 9 | App version | number string | `1` |
| 10 | Auth environment | `Production` / `Non-Production` | `Production` |
| 11 | Custom OIDC discovery URL? | URL or blank | default |
| 12 | Create initial resource? | name or blank | blank |

> If fullstack with `guest-login` UI → WebAPI auth should be `none` (see auth matrix below).

---

## Step 3 — Execute

Follow the reference file(s) determined in Step 1:

### UI-only mode
1. Read the relevant UI reference ([ui-angular.md](references/ui-angular.md) or [ui-astro.md](references/ui-astro.md))
2. Generate the UI app
3. Configure `.env`
4. Verify build/lint/test

### WebAPI-only mode
1. Read [webapi-nest.md](references/webapi-nest.md)
2. Generate the WebAPI
3. Configure `.env`
4. Verify build/lint/test

### Fullstack mode
1. Validate ports 8625 and 8626 are free
2. Read [webapi-nest.md](references/webapi-nest.md) → generate and configure WebAPI
3. Read the fullstack wiring reference ([fullstack-angular.md](references/fullstack-angular.md) or [fullstack-astro.md](references/fullstack-astro.md)) → generate UI + wire to WebAPI
4. Verify build/lint/test for both apps
5. Final port cleanup

### Final output

After all apps are generated and verified, present a summary with ready-to-run commands:

**For UI-only:**
```bash
cd <generated-path> && npm run start:dev
```
→ Open http://localhost:8626

**For WebAPI-only:**
```bash
cd <generated-path> && npm run start:dev
```
→ Open http://localhost:8625

**For Fullstack:**
```bash
# Terminal 1 — WebAPI
cd <webapi-path> && npm run start:dev

# Terminal 2 — UI
cd <ui-path> && npm run start:dev
```
→ WebAPI: http://localhost:8625
→ UI: http://localhost:8626

Always use the **actual generated paths** (not placeholders) so the user can copy-paste directly.

---

## Auth matrix (recommended combinations)

| UI auth | WebAPI auth | Reason |
|---|---|---|
| `cast-member` | `cast-member` | WebAPI validates OIDC tokens via MyID middleware |
| `guest-login` | `none` | Auth is client-side (PEP/SWID); WebAPI only serves streaming |
| `b2b` | `b2b` | WebAPI validates B2B tokens |
| `none` | `none` | No auth anywhere |

> ⚠️ **Guest-login:** The WebAPI does NOT need auth — generate with `auth=none`.

---

## Prerequisites

```bash
# Node.js 24.11.x
nvm use 24

# Yeoman (required for NestJS and Astro generators)
npm install -g yo@5.1.0

# NestJS WebAPI generator
npm install -g @wdpr/generator-ra-nest-webapi@"^24.0.0"

# Angular (if needed)
npm install -g @angular/cli@20.3
npm install -g @wdpr/ra-schematics-angular-spa@"^20.0.0"

# Astro — no global install needed (uses npx or yo)
```

---

## Generator source repos

| Generator | Repo |
|---|---|
| NestJS WebAPI | `WDPR-RA/wdpr-ra-nest-webapi-generator` |
| Angular SPA | `WDPR-RA/wdpr-ra-schematics-angular-spa` |
| Astro UI | `WDPR-RA/wdpr-ra-ui-generator` |

---

## Important notes

- WebAPI port: **8625**. Angular UI port: **8626**. Astro via NGINX: **8000**.
- `API_BASE_PATH` must be `/api` (not `/api/v1`) when streaming is enabled.
- Auth endpoints: `/api/auth/oidc` and `/api/auth/validate` — WITHOUT `/v1/`.
- Streaming endpoint: `GET /api/v1/streaming/chat?message=<text>` — WITH `/v1/`.
- **Angular CLI flags are kebab-case** (`--setup-playwright`, `--device-detection`).
- **Astro generator supports `--defaults` + `--app-name`** + CLI flags (no expect scripts needed).
- **Guest-login** uses `FEATURE` in the UI `.env` (not `AUTH_CLIENT_ID`).
- CORS is enabled by default in dev mode.
- Node engine warnings (`EBADENGINE`) during npm install are expected on Node 22+.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot GET /api/v1/streaming/chat` | Check `API_BASE_PATH=/api` in WebAPI `.env`. Restart. |
| `Invalid token type` on `/auth/oidc` | UI `.env` has wrong URL. Must be `/api/auth/oidc` (no `/v1/`). |
| `EADDRINUSE` on port | Kill the process: `lsof -ti:<port> \| xargs kill -9` |
| `Unknown argument: setupPlaywright` | Use kebab-case: `--setup-playwright`, not `--setupPlaywright`. |
| Yeoman prompts not answering (NestJS) | Use `expect` script (see webapi-nest.md). |
| Yeoman prompts not answering (Astro) | Use `--defaults` + `--app-name` + CLI flags (see ui-astro.md). |
| Boolean flag not working (Astro) | Use `--no-<flag>` syntax (e.g. `--no-setup-playwright`, `--no-ssr`), NOT `--flag=false`. |
| Test `app.spec.ts` fails on `sendMessage` | Generator bug: update assertion to `expect.objectContaining({ messages: expect.any(String) })`. |
| Guest-login: no `AUTH_CLIENT_ID` in `.env` | Expected. Guest-login uses `FEATURE` variable instead. |
| Analytics silently disabled | `--analytics` only works with `--auth=guest-login`. |
| Marketplace + chatbot | Not supported. Marketplace SPAs don't have the chatbot flag. |
