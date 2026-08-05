---
name: ra-schematics-angular-spa-workflow
description: Implements Jira requirements for the WDPR RA Angular SPA schematics generator by prototyping in a test app, validating cast-member and guest-login auth modes, then porting changes to templates. Use when working on wdpr-ra-schematics-angular-spa, Jira tickets for the generator, ng new schematics, cast member apps, guest login apps, or test apps under angular-test-apps.
---

# WDPR RA Schematics Workflow

## Paths

| Purpose | Path |
|---------|------|
| Schematics generator | `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-schematics-angular-spa` |
| Default test apps folder | `/Users/jhonatan.delgado/Code/temp-apps/angular-test-apps/{test-app}` |

## Related skills

| Skill | When to use |
|-------|-------------|
| [ra-scaffold-app](../ra-scaffold-app/SKILL.md) | **Only when a new Angular test app must be created** — do not read or follow it if the user already provided a valid app path |

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Read Jira ticket — scope, auth modes affected, optional flags
- [ ] Step 2: Select test app (existing path) OR create one via ra-scaffold-app
- [ ] Step 3: Prototype changes in the test app
- [ ] Step 4: Validate cast-member AND guest-login (reuse apps or scaffold missing ones)
- [ ] Step 5: Run lint, test, build on generated apps
- [ ] Step 6: Port proven changes to schematics templates
- [ ] Step 7: Re-validate from templates (fresh apps via ra-scaffold-app)
- [ ] Step 8: Update CHANGELOG, version, README/PR template if needed
```

### Step 1: Understand the Jira requirement

Identify:
- Which **auth modes** are affected: `cast-member`, `guest-login`, or both
- Optional flags: `--feature-flag`, `--chatbot`, `--analytics`, `--setup-playwright`, `--marketplace`
- Whether change is **workspace-level** or **application-level**

**Always validate both cast-member and guest-login** unless the ticket explicitly scopes to one auth type only.

Record these values — they drive app selection and scaffold parameters in later steps.

### Step 2: Select or create a test app

**Do not create an app unless necessary.** Follow this decision order:

#### A. User provided an app path

If the user gives a filesystem path to an existing app:
1. Confirm the directory exists and contains a generated RA Angular SPA (`package.json`, `angular.json`, `.env-EXAMPLE`)
2. Confirm it was generated with the **current linked schematics** (same branch/version being changed)
3. Use that path as the prototype app — **skip ra-scaffold-app entirely**

#### B. Reuse an existing sandbox (no path given)

Before creating anything, check `/Users/jhonatan.delgado/Code/temp-apps/angular-test-apps/` for a suitable app generated with the current branch/version. Prefer reusing:
- `v-20-3-0` — version baseline apps
- `chat-fixes-*` — feature-specific sandboxes
- An app named after the Jira key (e.g. `gew-1965`)

If a suitable app exists for the required auth mode and flags, use it — **skip ra-scaffold-app**.

#### C. Create a new app (only when A and B fail)

When no valid app path exists, **read and follow** [ra-scaffold-app](../ra-scaffold-app/SKILL.md) with these pre-filled constraints — do **not** re-ask questions already answered in Step 1:

| Scaffold input | Value for this workflow |
|----------------|-------------------------|
| Mode | `ui-only` |
| UI framework | `angular` (or `marketplace` if ticket requires `--marketplace`) |
| Target path | `/Users/jhonatan.delgado/Code/temp-apps/angular-test-apps` |
| App name | Jira key or short feature name (e.g. `gew-1965`) |
| Auth | From Step 1 |
| Chatbot / feature flags / Playwright / analytics | From Step 1 flags |
| Collection | **Local linked schematics** (see below) — not the published npm package |

**Before scaffolding**, link the local schematics:

```bash
cd /Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-schematics-angular-spa
npm install && npm link
```

When executing scaffold, override the collection to the local repo:

```bash
ng new <app-name> \
  --collection=/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-schematics-angular-spa \
  --defaults \
  <flags from Step 1>
```

Follow [ui-angular.md](../ra-scaffold-app/references/ui-angular.md) for flag syntax (kebab-case). After scaffold completes, return to this workflow with the generated app path.

### Step 3: Prototype in the test app

Implement and verify the requirement in the generated app first — **not** in schematics templates.

Run the app:
```bash
npm run start:dev          # http://localhost:8626
npm run start:proxy:mac    # port 8000, when auth/proxy needed
```

Use the test app to confirm behavior, edge cases, and both auth layouts before touching templates.

### Step 4: Validate both auth modes

For each affected auth type, use an existing app when possible. **Only invoke ra-scaffold-app for auth modes that lack a suitable app.**

| Situation | Action |
|-----------|--------|
| User provided paths for both auth modes | Use those paths — no scaffold |
| Prototype app covers one auth mode; other missing | Scaffold **only** the missing auth mode via ra-scaffold-app (Step 2C rules) |
| Ticket affects shared behavior | Apply the same logical change to both apps |
| Auth-specific UI/logic | Change only the relevant auth app during prototyping |

Validation commands (run in each app):
```bash
npm run lint
npm run test
npm run build:dev
npm run build
```

See [reference.md](reference.md) for E2E and feature-flag validation per auth mode.

### Step 5: Port changes to schematics

Once the test app proves the change works, translate it into templates:

| Change type | Template location |
|-------------|-------------------|
| All apps | `application/files/` |
| Cast Member only | `application/cast-member-files/` |
| Guest Login only | `application/guest-login-files/` |
| Shared app wiring | `application/other-files/` |
| Feature flags | `application/feature-flag-files/` |
| Chatbot | `application/chatbot-files/` |
| Analytics (guest only) | `application/analytics-files/` |
| E2E | `application/e2e-files/` |
| Workspace (package.json, Dockerfile) | `workspace/files/` |

If adding CLI options, also update `application/schema.json`, `ng-new/schema.json`, and logic in `application/index.js` / `ng-new/index.js`.

Templates use EJS: `<% if (auth === 'cast-member') { %>` and `<%= name %>`.

### Step 6: Re-validate from templates

Regenerate **fresh** apps from the updated templates — do not rely on the prototype app alone.

Use [ra-scaffold-app](../ra-scaffold-app/SKILL.md) to create one app per affected auth mode (Step 2C rules). Suggested names: `final-cast`, `final-guest`, or `{jira-key}-validate-{auth}`.

Run lint, test, build, and manual smoke test on both.

### Step 7: PR readiness

- [ ] Both auth modes pass lint, test, build
- [ ] E2E validated if `--setup-playwright` templates changed
- [ ] Feature flags validated if `--feature-flag` templates changed
- [ ] `CHANGELOG.md` and `package.json` version bumped
- [ ] README updated if user-facing behavior changed

Follow `PULL_REQUEST_TEMPLATE.md` in the schematics repo for the full PR checklist.

## Rules

- **Prototype first, templates second** — never edit schematics before verifying in a test app
- **Both auth modes** — cast-member and guest-login unless ticket says otherwise
- **Prefer existing apps** — ask for a path or reuse sandboxes before scaffolding
- **Scaffold only when needed** — invoke ra-scaffold-app for creation, never for lint/test/build/validation commands
- **No secrets in templates** — use `.env-EXAMPLE` placeholders only
- **Marketplace + guest-login** is invalid — generator throws
- **Analytics** only applies to guest-login
- If linked changes don't appear: `npm unlink && npm link` in the schematics repo

## Additional resources

- Template map and auth differences: [reference.md](reference.md)
- App creation (when needed): [ra-scaffold-app](../ra-scaffold-app/SKILL.md)
- User docs: `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-schematics-angular-spa/README.md`
- PR testing checklist: `/Users/jhonatan.delgado/Code/WDPR-RA/wdpr-ra-schematics-angular-spa/PULL_REQUEST_TEMPLATE.md`
