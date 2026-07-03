---
name: angular-migration
description: Migrate Angular applications between any major versions (5 through 22). Handles incremental upgrades using ng update, resolves breaking changes per version, migrates RxJS, updates module system to standalone, adopts signals and new control flow. Use when upgrading Angular version, running ng update, or fixing Angular version incompatibilities.
---

# Angular Major Version Migration

Migrate Angular applications incrementally from any version (5–22) to any higher target version. Angular requires sequential major version upgrades — you cannot skip versions.

## When to use

- User requests: "migrate Angular to v20", "upgrade from Angular 12 to 18", "ng update"
- A Jira ticket references an Angular version upgrade
- The project uses an outdated Angular version and needs modernization

## Critical rules

1. **Never skip major versions.** Migrate one major at a time: 12→13→14→15→...→target.
2. **Always use `ng update`** as the primary migration tool — it runs schematics that auto-fix code.
3. **Commit after each major version** before proceeding to the next.
4. **Check Node.js compatibility** for each Angular version (see `references/version-matrix.md`).
5. **Run tests after each version bump** to catch regressions early.
6. **Version prefix convention in package.json:** `@wdpr/*` packages MUST use caret (`^`) — e.g. `"@wdpr/ra-angular-logger": "^20.0.4"`. All other dependencies MUST use tilde (`~`) — e.g. `"@angular/platform-browser-dynamic": "~20.3.10"`. Validate this after every `npm install` or version bump.
7. **Read the breaking changes** for each version hop (see `references/breaking-changes.md`).

## Migration workflow

### Step 0 — Create feature branch from develop

Always start from the latest `develop` branch:

```bash
git checkout develop
git pull origin develop
git checkout -b feat/<TICKET>-<short-description>
```

**Branch naming convention:** `feat/<JIRA-TICKET>-<short-description>`
Example: `feat/GEW-1752-upgrade-angular-to-v20`


### Step 1 — Identify source and target versions

```bash
ng version  # or check package.json @angular/core version
```

Determine the upgrade path. Example: Angular 12 → 20 requires: 12→13→14→15→16→17→18→19→20.

### Step 2 — Verify Node.js version per Angular version

Each Angular version requires a specific Node.js range. Switch Node versions as you migrate. See `references/version-matrix.md` for the full matrix.

```bash
nvm use <required-node-version>
```

### Step 3 — Migrate one version at a time

For each version hop, run:

```bash
# Update Angular core + CLI
ng update @angular/core@<next> @angular/cli@<next>

# Update Angular CDK/Material if used
ng update @angular/cdk@<next> @angular/material@<next>

# Update any other @angular/* packages
ng update @angular/animations@<next> @angular/platform-browser@<next>
```

If `ng update` fails with peer dependency errors:
```bash
ng update @angular/core@<next> @angular/cli@<next> --force
```

After each version hop:
1. Fix any remaining compilation errors
2. Run `npm run build` to verify
3. Run `npm run test` to verify
4. Commit the changes before proceeding

### Step 4 — Handle version-specific breaking changes

Each version hop has specific migrations. See `references/breaking-changes.md` for the complete list. Key milestones:

| Version | Major change |
|---------|-------------|
| 6 | RxJS 6 (pipeable operators) |
| 8 | Differential loading, lazy route syntax change |
| 9 | Ivy default renderer |
| 10 | Strict mode, `moduleId` removal |
| 12 | Ivy-only (ViewEngine removed), strict by default |
| 13 | IE11 dropped, Node 12 dropped |
| 14 | Standalone components, typed forms |
| 15 | Standalone APIs stable, directive composition |
| 16 | Signals (developer preview), required inputs |
| 17 | New control flow (`@if`, `@for`, `@switch`), deferrable views |
| 18 | Zoneless (experimental), signals stable, new build system (esbuild) |
| 19 | Incremental hydration, resource/httpResource APIs |
| 20 | Signals fully stable, zoneless stable |
| 21 | `effect()` stable, linked signals |
| 22 | Standalone default everywhere, no NgModules required |

### Step 5 — Post-migration modernization (optional)

After reaching the target version, optionally adopt new patterns:

```bash
# Convert NgModules to standalone (Angular 15+)
ng generate @angular/core:standalone

# Migrate to new control flow syntax (Angular 17+)
ng generate @angular/core:control-flow

# Migrate to signal inputs (Angular 17.1+)
ng generate @angular/core:signal-input

# Migrate to signal queries (Angular 17.2+)
ng generate @angular/core:signal-queries

# Migrate to inject() function (Angular 14+)
ng generate @angular/core:inject
```

### Step 6 — Align internal Node.js library versions

When the Angular block updates its `engines.node` to a new major (e.g. Node 24), internal `@wdpr/ra-node-*` dependencies should also be updated to their corresponding major version if available.

**Process:**

1. Scan `package.json` for all `@wdpr/ra-node-*` dependencies
2. For each one, check Nexus for a version matching the new Node major:
   ```bash
   npm view @wdpr/ra-node-<name> versions --json | grep "<NODE_MAJOR>\\."
   ```
3. If a matching major version exists, update `package.json` to use it (e.g. `^24.0.0`)
4. If no matching version exists, keep the current version and document it as a gap
5. After updating, regenerate the lockfile:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --include=optional
   ```

**Common `@wdpr/ra-node-*` packages to check:**

| Package | Used by |
|---------|--------|
| `@wdpr/ra-node-logasaurus` | All blocks (logging) |
| `@wdpr/ra-node-conversation` | correlation, page-key, seo-metadata |
| `@wdpr/ra-node-device-detection` | device-detection |
| `@wdpr/ra-node-geolocation` | geolocation |
| `@wdpr/ra-node-http-error-handler` | page-key, seo-metadata |
| `@wdpr/ra-node-mpropz` | page-key, seo-metadata |
| `@wdpr/ra-node-authenticator` | myid-login |
| `@wdpr/ra-node-auth-validator` | myid-login |

**Block dependency graph:**

Use this table to determine the correct install/upgrade order. Blocks with no dependencies should be upgraded first.

| Block | Depends on |
|-------|-----------|
| `logger` | — none — |
| `cdn` | logger |
| `client-encryption` | logger |
| `correlation` | logger |
| `device-detection` | logger |
| `error-handler` | logger |
| `geolocation` | — none — |
| `myid-login` | logger |
| `page-key` | logger |
| `prerender-injector` | logger |
| `seo-metadata` | logger, page-key |

**Recommended upgrade order:**
1. `logger`, `geolocation` (no dependencies — upgrade first)
2. `cdn`, `client-encryption`, `correlation`, `device-detection`, `error-handler`, `myid-login`, `page-key`, `prerender-injector` (depend only on logger)
3. `seo-metadata` (depends on logger + page-key — upgrade last)

**Important — CI lockfile troubleshooting:**

If `npm ci` fails in CI (Linux) with errors like:
- `EBADPLATFORM` — unsupported platform for `@esbuild/linux-x64`, `@rollup/rollup-linux-x64-gnu`, etc.
- `Error: Cannot find module @esbuild/linux-x64` at runtime
- Missing optional dependency entries in the lockfile for non-macOS platforms

The root cause is that the `package-lock.json` was generated on macOS without resolving optional platform binaries. Fix locally:

```bash
rm -rf node_modules package-lock.json
npm install --include=optional
```

Then commit the regenerated `package-lock.json`. This ensures the lockfile includes entries for all platforms (darwin, linux, win32).


### Step 7 — Validate

```bash
npm run lint
npm run build
npm run test
npm run demo  # if applicable
```

### Step 8 — Update documentation

1. Update `CHANGELOG.md`
2. Update `package.json` engines if Node version changed
3. Update CI pipeline Angular/Node versions
4. Update Confluence/tracking page

## References

- `references/version-matrix.md` — Angular ↔ Node.js ↔ TypeScript compatibility matrix
- `references/breaking-changes.md` — Breaking changes per version (5→22)
- `references/migration-commands.md` — Exact ng update commands per version hop
- `references/rxjs-migration.md` — RxJS migration guide (v5→v6→v7)
