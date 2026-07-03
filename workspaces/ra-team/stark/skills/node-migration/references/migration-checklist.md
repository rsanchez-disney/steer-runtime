# Migration Checklist — Per-file changes

## Files to modify (every project)

### `.nvmrc`
```
<TARGET_VERSION>
```

### `package.json` (root)
```json
"engines": {
  "node": ">=<TARGET_VERSION>",
  "npm": ">=<TARGET_NPM_VERSION>"
}
```

Add to `devDependencies` if missing:
```json
"@types/node": "~<MAJOR>.0.0",
"jest-environment-jsdom": "~29.7.0"
```

### `package.json` (library — `projects/<lib>/package.json`)
Ensure `version` matches root `package.json`.

### `tsconfig.json`
Replace deprecated `angularCompilerOptions`:

| Deprecated | Replacement | Since |
|-----------|-------------|-------|
| `fullTemplateTypeCheck` | `strictTemplates` | Angular 13+ |
| `enableIvy` | remove entirely | Angular 12+ |
| `skipMetadataEmit` | remove entirely | Angular 13+ |

Verify `paths` point to source, not `dist/`:
```json
"paths": {
  "@wdpr/ra-angular-<name>": [
    "projects/ra-angular-<name>/src/public-api.ts",
    "projects/ra-angular-<name>/src/*"
  ]
}
```

### `.husky/commit-msg` (and other hooks)
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

npx --no -- commitlint --edit $1
```

### `projects/demo/src/static/server.ts`
Fix namespace imports for packages that switched export style:
```typescript
// ❌ breaks with packages using ESM-compatible default exports
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';

// ✅ correct
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
```

Keep namespace imports for Node built-ins:
```typescript
// ✅ these stay as-is
import * as fs from 'fs';
import * as path from 'path';
```

Remove type-cast hacks:
```typescript
// ❌ remove
const app = (express as any)();
// ✅ replace with
const app = express();
```

### `projects/demo/src/static/tsconfig.server.json` (create new)
```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "target": "ES2022",
    "esModuleInterop": true,
    "outDir": "../../../../dist/demo/static",
    "sourceMap": true,
    "types": ["node", "express"],
    "lib": ["ES2022"]
  },
  "include": ["server.ts"]
}
```

If the project compiles multiple server files:
```json
"include": ["config.ts", "server.ts", "vip.ts"]
```

### `package.json` scripts
Update compile script to use the new tsconfig:
```json
"compile-server": "tsc -p projects/demo/src/static/tsconfig.server.json"
```
Or for projects using a combined `compile` script:
```json
"compile": "tsc -p projects/demo/src/static/tsconfig.server.json && npm run copy"
```

### `CHANGELOG.md`
```markdown
## <version> (<YYYY-MM-DD>)

- [<TICKET>](<jira-url>): Migrate to Node.js <version> — <short description>
```

---

## Per-project execution checklist (copy and fill)

```
### <PROJECT_NAME> — Node.js <TARGET> Migration

- [ ] `.nvmrc` updated
- [ ] `engines.node` and `engines.npm` set
- [ ] `@types/node` updated
- [ ] Deprecated tsconfig options replaced
- [ ] Server imports fixed (namespace → default)
- [ ] `tsconfig.server.json` created/updated
- [ ] Compile script updated
- [ ] `jest-environment-jsdom` added
- [ ] Husky hooks have nvm loader
- [ ] Peer deps resolved
- [ ] Missing @types added
- [ ] `npm install` — no errors
- [ ] `npm run lint` — passes
- [ ] `npm run build` — passes
- [ ] `npm run test` — passes
- [ ] `npm run demo` — loads correctly
- [ ] CHANGELOG updated
- [ ] PR created and merged
- [ ] Tracking page updated
```
