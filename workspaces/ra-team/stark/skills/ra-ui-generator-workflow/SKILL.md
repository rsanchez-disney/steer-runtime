---
name: ra-ui-generator-workflow
description: Implements Jira requirements for the WDPR RA Astro UI generator by prototyping in a test app, validating castMember and guestLogin auth modes, then porting changes to Yeoman templates. Use when working on wdpr-ra-ui-generator, Jira tickets for the Astro generator, yo @wdpr/ra-ui, SSR/chatbot/islands, or test apps under astro-test-apps.
---

# WDPR RA Astro UI Generator Workflow

## Paths

| Purpose | Path |
|---------|------|
| Generator repo | `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-ui-generator` |
| Default test apps folder | `/Users/jhonatan.delgado/Code/temp-apps/astro-test-apps/{test-app}` |

## Related skills

| Skill | When to use |
|-------|-------------|
| [ra-scaffold-app](../ra-scaffold-app/SKILL.md) | **Only when a new Astro test app must be created** — do not read or follow it if the user already provided a valid app path |

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Read Jira ticket — scope, login types, SSR/chatbot/islands flags
- [ ] Step 2: Select test app (existing path) OR create one via ra-scaffold-app
- [ ] Step 3: Prototype changes in the test app
- [ ] Step 4: Validate castMember AND guestLogin (reuse apps or scaffold missing ones)
- [ ] Step 5: Run lint, test, build on generated apps
- [ ] Step 6: Port proven changes to generator templates
- [ ] Step 7: Re-validate from templates (fresh apps via ra-scaffold-app)
- [ ] Step 8: Update CHANGELOG, version, README/PR template if needed
```

### Step 1: Understand the Jira requirement

Identify:
- Which **login types** are affected: `castMember`, `guestLogin`, or both
- Optional flags: `--ssr`, `--chatbot`, `--islands`, `--launch-darkly`, `--setup-playwright`, `--universal-pipeline`
- Whether change is **workspace-level** or **feature-specific** (auth pages, SSR, E2E)

**Always validate both castMember and guestLogin** unless the ticket explicitly scopes to one login type only.

> `--chatbot` requires `--ssr`. Use `--no-<flag>` for boolean negation — never `--flag=false`.

Record these values — they drive app selection and scaffold parameters in later steps.

### Step 2: Select or create a test app

**Do not create an app unless necessary.** Follow this decision order:

#### A. User provided an app path

If the user gives a filesystem path to an existing app:
1. Confirm the directory exists and contains a generated RA Astro app (`package.json`, `astro.config.mjs`, `.env-EXAMPLE`, `nginx.conf`)
2. Confirm it was generated with the **current linked generator** (same branch/version being changed)
3. Use that path as the prototype app — **skip ra-scaffold-app entirely**

#### B. Reuse an existing sandbox (no path given)

Before creating anything, check `/Users/jhonatan.delgado/Code/temp-apps/astro-test-apps/` for a suitable app generated with the current branch/version. Prefer reusing:
- Version baseline apps
- Feature-specific sandboxes (e.g. `ssr-fixes-*`, `chatbot-*`)
- An app named after the Jira key (e.g. `gew-2013`)

If a suitable app exists for the required login type and flags, use it — **skip ra-scaffold-app**.

#### C. Create a new app (only when A and B fail)

When no valid app path exists, **read and follow** [ra-scaffold-app](../ra-scaffold-app/SKILL.md) with these pre-filled constraints — do **not** re-ask questions already answered in Step 1:

| Scaffold input | Value for this workflow |
|----------------|-------------------------|
| Mode | `ui-only` |
| UI framework | `astro` |
| Target path | `/Users/jhonatan.delgado/Code/temp-apps/astro-test-apps` |
| App name | Jira key or short feature name (e.g. `gew-2013`) |
| Login type | From Step 1 (`castMember` / `guestLogin` / `none`) |
| SSR / chatbot / islands / LaunchDarkly / Playwright | From Step 1 flags |
| Generator | **Local linked package** (see below) — not only the published npm package |

**Before scaffolding**, link the local generator:

```bash
cd /Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-ui-generator
npm install && npm link
```

When executing scaffold, use the linked generator with `--defaults` and `--app-name`:

```bash
cd /Users/jhonatan.delgado/Code/temp-apps/astro-test-apps
mkdir <app-name> && cd <app-name>
yo @wdpr/ra-ui --defaults --app-name=<app-name> \
  --login-type=<castMember|guestLogin|none> \
  <flags from Step 1>
```

Follow [ui-astro.md](../ra-scaffold-app/references/ui-astro.md) for flag syntax. After scaffold completes, return to this workflow with the generated app path.

### Step 3: Prototype in the test app

Implement and verify the requirement in the generated app first — **not** in generator templates.

Run the app:
```bash
npm run start:dev          # Fastify on 8626
nginx -c $(pwd)/nginx.conf # entry point on http://localhost:8000
```

Use the test app to confirm behavior, edge cases, and both login layouts before touching templates.

### Step 4: Validate both login types

For each affected login type, use an existing app when possible. **Only invoke ra-scaffold-app for login types that lack a suitable app.**

| Situation | Action |
|-----------|--------|
| User provided paths for both login types | Use those paths — no scaffold |
| Prototype app covers one login type; other missing | Scaffold **only** the missing type via ra-scaffold-app (Step 2C rules) |
| Ticket affects shared behavior | Apply the same logical change to both apps |
| Login-specific UI/logic | Change only the relevant app during prototyping |

Validation commands (run in each app):
```bash
npm run lint
npm run test
npm run build
```

See [reference.md](reference.md) for E2E, SSR/chatbot, and LaunchDarkly validation per login type.

### Step 5: Port changes to generator templates

Once the test app proves the change works, translate it into templates under `generators/app/templates/`:

| Change type | Template location |
|-------------|-------------------|
| Shared source | `generators/app/templates/src/` (excluded paths in `index.js`) |
| Cast Member auth | Templates in `constants.CAST_MEMBERS_TEMPLATES` |
| Guest Login auth | Templates in `constants.GUEST_LOGIN_TEMPLATES` |
| SSR / SSE | Templates in `constants.SSR_TEMPLATES` |
| React islands | Templates in `constants.ISLANDS_TEMPLATES` |
| LaunchDarkly | `constants.LAUNCHDARKLY_TEMPLATES` + conditional in `index.js` |
| E2E (Playwright) | `generators/app/templates/e2e/` |
| Root config | `package.json.ejs`, `astro.config.mjs.ejs`, `nginx.conf.ejs`, etc. |

If adding CLI flags, update flag parsing in `generators/app/index.js` and `generators/generator-utils/constants.js`.

Templates use EJS via Yeoman: `<%= appName %>`, conditionals on `loginType`, `ssr`, `islands`, `setupPlaywright`, `launchDarkly`.

### Step 6: Re-validate from templates

Regenerate **fresh** apps from the updated templates — do not rely on the prototype app alone.

Use [ra-scaffold-app](../ra-scaffold-app/SKILL.md) to create one app per affected login type (Step 2C rules). Suggested names: `final-cast`, `final-guest`, or `{jira-key}-validate-{loginType}`.

Run lint, test, build, NGINX smoke test on both.

### Step 7: PR readiness

- [ ] Both login types pass lint, test, build
- [ ] E2E validated if Playwright templates changed
- [ ] SSR/chatbot validated if SSR or chatbot templates changed
- [ ] LaunchDarkly validated if feature-flag templates changed
- [ ] `CHANGELOG.md` and `package.json` version bumped
- [ ] README updated if user-facing behavior changed

Follow `PULL_REQUEST_TEMPLATE.md` in the generator repo for the full PR checklist.

## Rules

- **Prototype first, templates second** — never edit generator templates before verifying in a test app
- **Both login types** — castMember and guestLogin unless ticket says otherwise
- **Prefer existing apps** — ask for a path or reuse sandboxes before scaffolding
- **Scaffold only when needed** — invoke ra-scaffold-app for creation, never for lint/test/build/validation commands
- **No secrets in templates** — use `.env-EXAMPLE` placeholders only
- **Chatbot requires SSR** — `--chatbot` without `--ssr` is invalid
- **Access via NGINX** — always test at http://localhost:8000, not 8626 directly
- **Boolean flags** — use `--no-<flag>`, never `--flag=false`
- If linked changes don't appear: `npm unlink && npm link` in the generator repo

## Additional resources

- Template map and login differences: [reference.md](reference.md)
- App creation (when needed): [ra-scaffold-app](../ra-scaffold-app/SKILL.md)
- User docs: `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-ui-generator/README.md`
- PR testing checklist: `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-ui-generator/PULL_REQUEST_TEMPLATE.md`
