# Astro UI Generator Reference

## Login types

| CLI value | Template set | Key dependency |
|-----------|--------------|----------------|
| `castMember` (default with `--defaults`) | `constants.CAST_MEMBERS_TEMPLATES` | `@wdpr/ra-ui-myid-login` |
| `guestLogin` | `constants.GUEST_LOGIN_TEMPLATES` | `@wdpr/profile-authenticator-universal` |
| `none` | Neither auth template set | — |

### Cast Member specifics

- Auth pages under `src/pages/authenticator/`
- `.env-EXAMPLE`: `AUTH_CLIENT_ID`, MyID/OIDC vars
- E2E: `e2e/auth.setup.ts`, `e2e/specs/authenticated.spec.ts`

### Guest Login specifics

- Guest auth flow via `@wdpr/profile-authenticator-universal`
- `.env-EXAMPLE`: `FEATURE`, syndicated header vars
- Simpler auth page structure than cast member

## Creating test apps

**Do not run `yo @wdpr/ra-ui` directly from this workflow.** When a new app is needed, follow [ra-scaffold-app](../ra-scaffold-app/SKILL.md) in `ui-only` / `astro` mode after linking the local generator:

```bash
cd /Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-ui-generator
npm install && npm link
```

Flag reference and auth setup: [ui-astro.md](../ra-scaffold-app/references/ui-astro.md).

## Validation matrix

Run for **each login type** affected by the change:

| Check | Command |
|-------|---------|
| Lint | `npm run lint` |
| Unit tests | `npm run test` |
| Build | `npm run build` |
| Dev server | `npm run start:dev` |
| NGINX entry | `nginx -c $(pwd)/nginx.conf` → http://localhost:8000 |
| E2E | `npm run test:e2e` (when Playwright enabled) |
| Docker | per README in generated app |

### SSR / chatbot validation

Scaffold with `--ssr --chatbot` via ra-scaffold-app, then verify:
- SSR routes render server-side
- Chatbot panel connects to WebAPI at `API_BASE_URL=http://localhost:8625`
- SSE streaming works through NGINX proxy

### LaunchDarkly validation

Scaffold with `--launch-darkly`, then verify: `FeatureFlagService` in `src/utils/`, `launchdarkly-js-client-sdk` in deps, client ID in `.env-EXAMPLE`.

### E2E per login type

**Cast Member:** run full Playwright suite including auth setup

**Guest Login:** verify guest SSO flow specs

**None:** run base specs only — no auth setup needed

## Incompatibilities

- `--chatbot` without `--ssr` — chatbot requires SSR
- `--flag=false` syntax — Yeoman treats as truthy string; use `--no-<flag>`

## Port prototype → template checklist

When moving a working test-app change into the generator:

1. Identify if change is login-specific or shared (SSR, islands, E2E)
2. Copy file to `generators/app/templates/` with `.ejs` suffix where needed
3. Add template path to the correct constant array in `generators/generator-utils/constants.js` if new
4. Update conditional copy logic in `generators/app/index.js`
5. Replace hardcoded app name with `<%= appName %>`
6. Regenerate both login types and diff against prototype

## Template constants (generators/generator-utils/constants.js)

| Constant | When copied |
|----------|-------------|
| `CAST_MEMBERS_TEMPLATES` | `loginType === 'castMember'` |
| `GUEST_LOGIN_TEMPLATES` | `loginType === 'guestLogin'` |
| `SSR_TEMPLATES` | `ssr === true` |
| `ISLANDS_TEMPLATES` | `islands === true` |
| `LAUNCHDARKLY_TEMPLATES` | `launchDarkly === true` |

## Prerequisites

- Node ≥24.11.0 (or team-agreed LTS)
- Yeoman: `npm install -g yo@5.1.0`
- Generator: linked or `npm install -g @wdpr/generator-ra-ui`
- NGINX installed locally for auth/proxy testing
- Nexus3 registry configured (Disney internal)
- `npm link` from generator repo for local development

## Common pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Auth redirect fails | Accessing 8626 directly | Use NGINX on port 8000 |
| Chatbot broken | SSR disabled | Enable `--ssr` with `--chatbot` |
| Flag ignored | Used `--flag=false` | Use `--no-<flag>` |
| Linked generator stale | npm link not refreshed | `npm unlink && npm link` in generator repo |
| IPv6 bind on macOS | Node binds `[::1]` | Check `nginx.conf` upstream addresses |
