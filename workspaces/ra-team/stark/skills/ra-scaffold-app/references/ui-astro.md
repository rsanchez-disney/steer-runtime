# UI Reference: Astro

Generate a standalone Astro application using `@wdpr/generator-ra-ui`.

---

## CLI flags reference

| Flag | Default | Description |
|------|---------|-------------|
| `--defaults` | `false` | Skip all prompts, use default values |
| `--app-name` | current directory name | Application name — skips the project name prompt |
| `--login-type` | `castMember` | `castMember` / `guestLogin` / `none` |
| `--ssr` | `false` | Enable Server-Side Rendering (SSR) |
| `--chatbot` | `false` | SSE-powered chatbot (requires `--ssr`) |
| `--islands` | `false` | Islands of interactivity (React) |
| `--setup-playwright` | `true` | Playwright E2E testing |
| `--universal-pipeline` | `true` | Universal Pipeline (Harness CI/CD) |
| `--launch-darkly` | `false` | LaunchDarkly feature flags |
| `--skip-install` | `false` | Don't run npm install |

### Boolean negation

| You want | Correct | Wrong |
|----------|---------|-------|
| Disable Playwright | `--no-setup-playwright` | `--setup-playwright=false` |
| Disable Universal Pipeline | `--no-universal-pipeline` | `--universal-pipeline=false` |
| Disable SSR (explicit) | `--no-ssr` | `--ssr=false` |
| Disable chatbot (explicit) | `--no-chatbot` | `--chatbot=false` |
| Disable islands (explicit) | `--no-islands` | `--islands=false` |
| Disable LaunchDarkly (explicit) | `--no-launch-darkly` | `--launch-darkly=false` |

> **Important:** Do NOT use `--flag=false` syntax. Yeoman treats it as the string `"false"` (truthy), not a boolean.

---

## Generate

### Option A: Non-interactive with `--defaults` (recommended)

```bash
cd <target-path>
mkdir <app-name> && cd <app-name>

yo @wdpr/ra-ui --defaults --app-name=<app-name>-ui \
  --login-type=<castMember|guestLogin|none> \
  --ssr \
  --chatbot \
  --no-setup-playwright \
  --skip-install
```

> Always pass `--app-name` to set the project name without prompting.

#### Common patterns

**Cast Member + chatbot, no Playwright:**
```bash
yo @wdpr/ra-ui --defaults --app-name=my-app-ui --ssr --chatbot --no-setup-playwright --skip-install
```

**Guest Login, no chatbot, no Playwright:**
```bash
yo @wdpr/ra-ui --defaults --app-name=my-app-ui --login-type=guestLogin --no-setup-playwright --skip-install
```

**No auth, SSR + islands:**
```bash
yo @wdpr/ra-ui --defaults --app-name=my-app-ui --login-type=none --ssr --islands --no-setup-playwright --skip-install
```

**Full defaults (Cast Member, Playwright, Universal Pipeline):**
```bash
yo @wdpr/ra-ui --defaults --app-name=my-app-ui --skip-install
```

**Cast Member + SSR + chatbot + LaunchDarkly, no Playwright:**
```bash
yo @wdpr/ra-ui --defaults --app-name=my-app-ui --login-type=castMember --ssr --chatbot --launch-darkly --no-setup-playwright --no-universal-pipeline --skip-install
```

### Option B: Interactive (manual)

```bash
npx @wdpr/generator-ra-ui
# or
yo @wdpr/ra-ui
```

### Option C: Automated with expect script (if flags aren't enough)

Create `/tmp/yo-astro.exp`:

```expect
#!/usr/bin/expect -f
set timeout 120

cd <target-path>/<app-name>

spawn npx @wdpr/generator-ra-ui

# 1. Project name
expect "Project name"
send "<app-name>\r"

# 2. Login type (list selection)
expect "Login"
send "<\r for castMember | \x1b[B\r for guestLogin | \x1b[B\x1b[B\r for none>\r"

# 3. SSR
expect -re "(SSR|Server-Side|Server Sent)"
send "<Y|N>\r"

# 4. Chatbot (only if SSR = Y)
expect -re "(chatbot|SSE-powered)"
send "<Y|N>\r"

# 5. Islands
expect -re "(islands|interactivity)"
send "<Y|N>\r"

# 6. Playwright
expect -re "(Playwright|E2E)"
send "<Y|N>\r"

# 7. Universal Pipeline
expect -re "(Universal|Pipeline)"
send "<Y|N>\r"

# 8. LaunchDarkly
expect -re "(LaunchDarkly|feature flag)"
send "<Y|N>\r"

expect eof
```

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

3. **Set `API_BASE_URL`** (if chatbot and WebAPI exist):
   ```env
   API_BASE_URL=http://localhost:8625
   ```

---

## Ports

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| **NGINX (entry)** | **8000** | http://localhost:8000 | **Always access here** |
| Astro UI (Fastify) | 8626 | — | Do NOT access directly |

> Astro requires NGINX as the entry point for auth redirects and API proxying.

---

## Start

```bash
cd <app-name>
npm run start:dev

# Start NGINX (separate terminal)
nginx -c $(pwd)/nginx.conf
```

→ Open http://localhost:8000

---

## Notes

- **SSR is required** for chatbot/SSE to work.
- The auth block is `@wdpr/ra-ui-myid-login` (framework-agnostic).
- On macOS, Node.js binds to IPv6 (`[::1]`). Linux/Windows use `127.0.0.1` in `nginx.conf`.
- React islands (`@astrojs/react`) are optional — only if you need interactive React components.
- **Universal Pipeline** changes `start:server` to run from `dist/`. Always `Y` unless custom deployment.
- Port 8624 is a mock API for SSR dev without a real WebAPI — ignore when using real WebAPI.
- `--app-name` sets the project name from CLI and skips the "Project name" prompt. Always pass it in automated/agent flows.
- `yo @wdpr/ra-ui --defaults --app-name=<name>` is the recommended invocation for automation.
- `--no-<flag>` prefix works for any boolean flag, not just those that default to true.
- Flag detection: Each flag is detected by checking `process.argv` tokens directly.
