---
name: ra-nest-webapi-generator-workflow
description: Implements Jira requirements for the WDPR RA NestJS WebAPI generator by prototyping in a test app, validating affected auth modes (none, cast-member, b2b), then porting changes to Yeoman templates. Use when working on wdpr-ra-nest-webapi-generator, Jira tickets for the Nest generator, yo @wdpr/ra-nest-webapi, streaming/SSE, or test apps under nest-test-apps.
---

# WDPR RA NestJS WebAPI Generator Workflow

## Paths

| Purpose | Path |
|---------|------|
| Generator repo | `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-nest-webapi-generator` |
| Default test apps folder | `/Users/jhonatan.delgado/Code/temp-apps/nest-test-apps/{test-app}` |

## Related skills

| Skill | When to use |
|-------|-------------|
| [ra-scaffold-app](../ra-scaffold-app/SKILL.md) | **Only when a new NestJS test app must be created** — do not read or follow it if the user already provided a valid app path |

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Read Jira ticket — scope, auth mode, streaming, resources
- [ ] Step 2: Select test app (existing path) OR create one via ra-scaffold-app
- [ ] Step 3: Prototype changes in the test app
- [ ] Step 4: Validate affected auth modes (reuse apps or scaffold missing ones)
- [ ] Step 5: Run lint, test, build on generated apps
- [ ] Step 6: Port proven changes to generator templates
- [ ] Step 7: Re-validate from templates (fresh apps via ra-scaffold-app)
- [ ] Step 8: Update CHANGELOG, version, README/PR template if needed
```

### Step 1: Understand the Jira requirement

Identify:
- Which **auth mode** is affected: `none`, `cast-member`, or `b2b`
- Whether **SSE streaming** (`/api/v1/streaming/chat`) is in scope
- Whether an initial **resource** module is involved
- Whether change is **root/workspace-level** or **feature-specific** (auth, streaming, healthcheck)

Validate **each auth mode the ticket affects**. Nest WebAPI does not use guest-login auth — guest-facing UIs pair with `auth=none` WebAPIs.

Record these values — they drive app selection and scaffold parameters in later steps.

### Step 2: Select or create a test app

**Do not create an app unless necessary.** Follow this decision order:

#### A. User provided an app path

If the user gives a filesystem path to an existing app:
1. Confirm the directory exists and contains a generated RA NestJS WebAPI (`package.json`, `src/main.ts`, `.env-EXAMPLE`, `nest-cli.json`)
2. Confirm it was generated with the **current linked generator** (same branch/version being changed)
3. Use that path as the prototype app — **skip ra-scaffold-app entirely**

#### B. Reuse an existing sandbox (no path given)

Before creating anything, check `/Users/jhonatan.delgado/Code/temp-apps/nest-test-apps/` for a suitable app generated with the current branch/version. Prefer reusing:
- Version baseline apps (e.g. `v-24-0-0`)
- Feature-specific sandboxes (e.g. `streaming-fixes-*`)
- An app named after the Jira key (e.g. `gew-2008`)

If a suitable app exists for the required auth mode and flags, use it — **skip ra-scaffold-app**.

#### C. Create a new app (only when A and B fail)

When no valid app path exists, **read and follow** [ra-scaffold-app](../ra-scaffold-app/SKILL.md) with these pre-filled constraints — do **not** re-ask questions already answered in Step 1:

| Scaffold input | Value for this workflow |
|----------------|-------------------------|
| Mode | `webapi-only` |
| Target path | `/Users/jhonatan.delgado/Code/temp-apps/nest-test-apps` |
| App name | Jira key or short feature name (e.g. `gew-2008`) |
| Auth | From Step 1 (`none` / `cast-member` / `b2b`) |
| SSE streaming | From Step 1 |
| Initial resource | From Step 1 (blank if none) |
| Generator | **Local linked package** (see below) — not only the published npm package |

**Before scaffolding**, link the local generator:

```bash
cd /Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-nest-webapi-generator
npm install && npm link
```

Follow [webapi-nest.md](../ra-scaffold-app/references/webapi-nest.md) for the expect script and auth prompt flow. After scaffold completes, return to this workflow with the generated app path.

### Step 3: Prototype in the test app

Implement and verify the requirement in the generated app first — **not** in generator templates.

Run the app:
```bash
npm run start:dev          # http://localhost:8625
```

Test streaming when relevant:
```bash
curl -N "http://localhost:8625/api/v1/streaming/chat?message=hello"
```

Use the test app to confirm behavior and edge cases before touching templates.

### Step 4: Validate affected auth modes

For each auth mode the ticket affects, use an existing app when possible. **Only invoke ra-scaffold-app for modes that lack a suitable app.**

| Situation | Action |
|-----------|--------|
| User provided paths for all required modes | Use those paths — no scaffold |
| Prototype covers one mode; others missing | Scaffold **only** the missing mode via ra-scaffold-app (Step 2C rules) |
| Shared behavior change | Apply the same logical change to each affected auth variant |

Validation commands (run in each app):
```bash
npm run lint
npm run test
npm run build
```

See [reference.md](reference.md) for auth matrix, route mapping, and streaming validation.

### Step 5: Port changes to generator templates

Once the test app proves the change works, translate it into templates under `generators/templates/`:

| Change type | Template location |
|-------------|-------------------|
| Root files (package.json, Dockerfile, husky) | `generators/templates/root/` |
| App source (main, app.module, config) | `generators/templates/src/` |
| Auth module/controller | `generators/templates/resource/auth/` |
| Streaming/SSE | `generators/templates/streaming/` |
| Resource CRUD scaffold | `generators/templates/resource/` |
| Shared utilities | `generators/templates/lib/` |

If adding generator prompts or options, also update `generators/app/index.js` and related utils in `generators/generator-utils/`.

Templates use EJS via Yeoman: `<%= appName %>`, conditionals on `useAuth`, `b2bAuth`, `oidcAuth`, `streaming`.

### Step 6: Re-validate from templates

Regenerate **fresh** apps from the updated templates — do not rely on the prototype app alone.

Use [ra-scaffold-app](../ra-scaffold-app/SKILL.md) to create one app per affected auth mode (Step 2C rules). Suggested names: `final-cast`, `final-none`, `final-b2b`, or `{jira-key}-validate-{auth}`.

Run lint, test, build, and manual smoke test (plus streaming curl when applicable).

### Step 7: PR readiness

- [ ] All affected auth modes pass lint, test, build
- [ ] Streaming validated if streaming templates changed
- [ ] Auth middleware exclusions correct (`path-to-regexp` v8+ syntax)
- [ ] `API_BASE_PATH=/api` preserved in `.env-EXAMPLE` templates
- [ ] `CHANGELOG.md` and `package.json` version bumped
- [ ] README updated if user-facing behavior changed

Follow `PULL_REQUEST_TEMPLATE.md` in the generator repo for the full PR checklist.

## Rules

- **Prototype first, templates second** — never edit generator templates before verifying in a test app
- **Validate each affected auth mode** — none, cast-member, and/or b2b per ticket scope
- **Prefer existing apps** — ask for a path or reuse sandboxes before scaffolding
- **Scaffold only when needed** — invoke ra-scaffold-app for creation, never for lint/test/build/validation commands
- **No secrets in templates** — use `.env-EXAMPLE` placeholders only
- **`API_BASE_PATH=/api`** — never `/api/v1` at the base path level
- **Guest-login UI pairs with `auth=none` WebAPI** — do not scaffold cast-member auth for guest-login tickets
- If linked changes don't appear: `npm unlink && npm link` in the generator repo

## Additional resources

- Template map, auth matrix, routes: [reference.md](reference.md)
- App creation (when needed): [ra-scaffold-app](../ra-scaffold-app/SKILL.md)
- User docs: `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-nest-webapi-generator/README.md`
- PR testing checklist: `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-nest-webapi-generator/PULL_REQUEST_TEMPLATE.md`
