---
name: node-migration
description: Migrate Node.js projects to a new version (major, minor, or patch). Audits dependencies for compatibility, fixes breaking import changes, updates runtime config, resolves peer conflicts, and validates build/test/lint. Use when upgrading Node.js version, bumping engines field, or fixing Node version incompatibilities.
---

# Node.js Version Migration

Systematic procedure for upgrading Node.js projects to a new version. Handles dependency audits, breaking changes, and validation.

## When to use

- User requests: "migrate to Node X", "upgrade Node version", "bump Node to vXX"
- A Jira ticket references a Node.js version migration
- The project's `engines.node` needs updating to a new major/minor/patch

## Required inputs

Before starting, confirm these two values with the user:

1. **Jira ticket ID** — Used for branch name and commit messages (e.g. `GEW-1656`)
2. **Target Node.js version** — If not specified, use the current Active LTS from https://nodejs.org/en/about/previous-releases. To check programmatically:
   ```bash
   curl -s https://nodejs.org/dist/index.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); const lts=d.find(x=>x.lts); console.log(lts.version, '(LTS:', lts.lts + ')');"
   ```

## Migration workflow

### Phase 0 — Create feature branch from develop

Always start from the latest `develop` branch:

```bash
git checkout develop
git pull origin develop
git checkout -b feat/<JIRA-TICKET>-upgrade-node-version-to-<MAJOR>-<MINOR>
```

**Branch naming convention:** `feat/<JIRA-TICKET>-upgrade-node-version-to-<MAJOR>-<MINOR>`
Example: `feat/GEW-1656-upgrade-node-version-to-24-11`


### Phase 1 — Audit

1. Read the project's current `engines.node`, `.nvmrc`, and `@types/node` to identify the source version
2. Scan for deprecated Node.js APIs (see `references/deprecated-apis.md`)
3. Run `npm install --dry-run` to detect peer dependency conflicts
4. Classify each dependency's risk level:
   - **Low:** Pure JS/TS packages
   - **Medium:** Packages using Node APIs (fs, http, crypto, streams)
   - **High:** Native addons, very old packages (node-gyp, nan), or packages known to break across majors
5. Check framework compatibility (Angular version matrix, etc.)

### Phase 2 — Apply changes

Apply in this order. Refer to `references/migration-checklist.md` for detailed steps per file.

1. **Version bump:** Increment the patch version in both root and library `package.json` files (e.g. `20.0.0` → `20.0.1`)
2. **Runtime pinning:** `.nvmrc`, `engines.node`, `engines.npm` — update all three. To find the npm version bundled with a specific Node.js version:
   ```bash
   curl -s https://nodejs.org/dist/index.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); const v=d.find(x=>x.version==='v<TARGET>'); console.log(v.npm);"
   ```
   Common Node.js → npm mapping:
   | Node | npm |
   |------|-----|
   | 18.x | 10.8.x |
   | 20.x | 10.8.x |
   | 22.x | 10.9.x |
   | 24.x | 11.x |
3. **Type alignment:** `@types/node` → match target major (e.g. `~24.0.0`)
4. **Deprecated compiler options:** Replace any deprecated tsconfig/angular options (e.g. `fullTemplateTypeCheck` → `strictTemplates`)
5. **Import fixes:** `import * as pkg from 'pkg'` → `import pkg from 'pkg'` for packages that switched to ESM-compatible exports (express, body-parser, cookie-parser, compression, lusca, etc.). Keep namespace imports for Node built-ins (fs, path, url, crypto, https).
6. **Server compilation isolation:** Create `tsconfig.server.json` with `"types": ["node", "express"]` to avoid @types pollution from test frameworks
7. **Test environment:** Add `jest-environment-jsdom` if tests use DOM APIs
8. **Git hooks:** Add nvm loader to `.husky/commit-msg` and other hooks that invoke node/npm
9. **Peer dependency resolution:** Bump conflicting versions. Never use `--force` or `--legacy-peer-deps`
10. **Library package.json:** Update `engines.node`, `engines.npm`, and all `@wdpr/*` peerDependencies in the library's own `package.json` (under `projects/*/package.json`). These are what consumers see on npm.
11. **Internal dependencies:** Bump `@wdpr/ra-node-*` to matching major if available on Nexus. Bump `@wdpr/ra-angular-*` to latest published version.
12. **CI pipeline:** Update `NODE_VERSION` in `.harness/pipeline.yaml` to the target major version
13. **Missing @types:** Add type packages for dependencies whose imports changed

### Phase 3 — Validate

Run for every project. All must pass:

```bash
rm -rf node_modules package-lock.json
npm install --include=optional
npm run lint
npm run build
npm run test
npm run demo  # if applicable
```

If `npm install` fails with Nexus 503, retry (Nexus lazily caches). Never switch registry to npmjs.org.

**CI lockfile troubleshooting:** If `npm ci` fails in CI (Linux) with `EBADPLATFORM` errors for `@esbuild/linux-x64`, `@rollup/rollup-linux-x64-gnu`, or similar missing optional dependencies, the lockfile was generated on macOS without platform binaries. Fix locally:

```bash
rm -rf node_modules package-lock.json
npm install --include=optional
```

Commit the regenerated `package-lock.json` — it will now include entries for all platforms.

### Phase 4 — Document

1. Update library `README.md` with current requirements (Node, npm, Angular, peer deps)
2. Update `PULL_REQUEST_TEMPLATE.md` Node/npm versions in prerequisites (if file exists)
3. Update root `README.md` (supported versions table, install commands)
4. Update `CHANGELOG.md` with migration entry including Jira ticket
5. Verify version parity between root and library `package.json`
6. Update Confluence RA-Blocks page with new version, Node, npm: https://confluence.disney.com/spaces/DPEPRA/pages/1949598965/WDPR+UI+RA-Blocks

## Key rules

- **Always ask for Jira ticket and target Node version** before starting.
- **Always audit dependencies BEFORE installing.** A dry-run catches conflicts early.
- **Never use `--force` or `--legacy-peer-deps`** — they hide real problems.
- **Check internal libraries** (`@wdpr/*`, `@disney/*`) for compatibility with the target Node version. If incompatible, check Nexus for newer versions or contact the maintainer.
- **Namespace imports break when packages add ESM exports.** The fix is always: `import * as X` → `import X from`.
- **Isolate server TypeScript compilation** from Angular/test tsconfigs to prevent @types conflicts.
- **Version prefix convention in package.json:** `@wdpr/*` packages MUST use caret (`^`) — e.g. `"@wdpr/ra-node-logasaurus": "^24.0.0"`. All other dependencies MUST use tilde (`~`) — e.g. `"express": "~4.21.0"`. Validate this after every `npm install` or version bump.
- **Never change the npm registry** from the corporate Nexus proxy.
- **Always use `npm install --include=optional`** to ensure lockfile has all platform binaries.

## Pre-commit checklist

Copy this checklist and verify every item before committing:

```
### <PROJECT_NAME> — Node.js <TARGET> Migration (<JIRA-TICKET>)

Phase 0:
- [ ] Branch created from latest develop: feat/<TICKET>-upgrade-node-version-to-<MAJOR>-<MINOR>

Phase 2 — Apply:
- [ ] Version bumped in root package.json
- [ ] Version bumped in library package.json (must match root)
- [ ] .nvmrc created/updated to target Node version
- [ ] engines.node updated in root package.json
- [ ] engines.npm updated in root package.json (lookup from nodejs.org)
- [ ] Library package.json engines.node updated
- [ ] Library package.json engines.npm updated
- [ ] Library package.json peerDependencies @wdpr/* versions updated
- [ ] @types/node updated to ~<major>.0.0
- [ ] Deprecated tsconfig options replaced
- [ ] Server imports fixed (import * as → import from) for ESM packages
- [ ] tsconfig.server.json created for server compilation isolation
- [ ] Compile script updated to use tsconfig.server.json
- [ ] jest-environment-jsdom added to devDependencies
- [ ] Husky hooks have nvm loader
- [ ] @wdpr/ra-node-* packages bumped to v<major> (check Nexus)
- [ ] @wdpr/ra-angular-* packages bumped to latest available
- [ ] Peer dependency conflicts resolved (no --force, no --legacy-peer-deps)
- [ ] Version prefix convention: @wdpr/* uses ^, all others use ~
- [ ] package-lock.json regenerated with npm install --include=optional
- [ ] .harness/pipeline.yaml NODE_VERSION updated to target major

Phase 3 — Validate:
- [ ] npm run lint — passes
- [ ] npm run build — passes
- [ ] Server compiles (tsc -p tsconfig.server.json)
- [ ] npm run test — passes (or failures are pre-existing)
- [ ] npm run demo — runs (if applicable)

Phase 4 — Document:
- [ ] Library README.md updated (requirements, peer deps versions)
- [ ] PULL_REQUEST_TEMPLATE.md updated with new Node/npm versions (if exists)
- [ ] Root README.md updated (supported versions table, install commands)
- [ ] CHANGELOG.md updated with version, date, and Jira ticket
- [ ] Confluence RA-Blocks page updated (version, Node, npm)
- [ ] Commit message includes Jira key: [<TICKET>] chore: migrate to Node.js X.Y
- [ ] PR created against develop
```

## References

- `references/migration-checklist.md` — Per-file checklist for every change
- `references/deprecated-apis.md` — Common deprecated Node.js APIs by version
- `references/common-pitfalls.md` — Symptoms and solutions table
