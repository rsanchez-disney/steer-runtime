# Common Pitfalls & Solutions

## Symptoms → Diagnosis → Fix

| Symptom | Cause | Fix |
|---------|-------|-----|
| `express is not a function` at runtime | Package switched to ESM default export | `import * as express` → `import express from` |
| `TypeError: bodyParser.json is not a function` | Same as above for body-parser | `import * as bodyParser` → `import bodyParser from` |
| Type errors mixing Jest/Angular types in server.ts | Server compiled with Angular tsconfig picks up @types/jest | Create isolated `tsconfig.server.json` with `"types": ["node"]` |
| `ERESOLVE unable to resolve dependency tree` | Peer dependency version conflict | Bump the lower package to satisfy the peer range |
| `commitlint: command not found` in IDE terminal | Husky hook runs without nvm loaded | Add nvm loader block to `.husky/commit-msg` |
| `ReferenceError: document is not defined` in tests | Jest 28+ removed jsdom from core | Add `jest-environment-jsdom` to devDependencies |
| `Error: Module was compiled against a different Node.js version` | Native addon binary incompatible | `npm rebuild` or update the package to one supporting new Node |
| Runtime errors from `@wdpr/*` packages | Internal library not tested against new Node | Check Nexus for newer version or mock for demo |
| `npm error 503 Repository offline` | Nexus hasn't cached the package yet | Delete lockfile, `npm cache clean --force`, retry |
| Build warning about `fullTemplateTypeCheck` | Deprecated Angular compiler option | Replace with `strictTemplates: true` |
| `const app = (express as any)()` pattern | Type workaround for missing default export types | Remove cast, use `const app = express()` with `@types/express` |
| `npm install` installs but demo crashes | `@types/node` version doesn't match runtime | Update `@types/node` to `~<major>.0.0` matching target |
| `.mjs` server works but `.ts` server doesn't | TypeScript compilation not using `esModuleInterop` | Add `"esModuleInterop": true` to tsconfig.server.json |
| Tests pass locally but fail in CI | CI still on old Node version | Update CI pipeline Node version + add `.nvmrc` |

## Dependency risk classification

When auditing dependencies for a Node upgrade, classify each:

| Risk Level | Characteristics | Example packages | Action |
|-----------|-----------------|------------------|--------|
| **Low** | Pure JS/TS, no Node APIs, no native code | lodash, rxjs, zone.js | Usually safe; just check peer deps |
| **Medium** | Uses Node APIs (http, fs, crypto, streams) | express, compression, loggers | Check release notes, may need version bump |
| **High** | Native addons (node-gyp, nan, napi) | bcrypt, sharp, node-sass | Likely needs rebuild or major version bump |
| **Very high** | Unmaintained + uses deprecated Node APIs | restify@4.x, old native modules | Plan migration to alternative (e.g., restify → express) |

## "Never do" rules

1. **Never use `--force` or `--legacy-peer-deps`** — They install incompatible versions silently
2. **Never switch registry to npmjs.org** — Bypasses corporate security proxy
3. **Never skip the dry-run audit** — Catches 90% of issues before they become cryptic runtime errors
4. **Never ignore `engines` warnings** — They exist to prevent exactly the problems you're about to hit
5. **Never commit `node_modules`** — Delete `package-lock.json` and reinstall from scratch on version changes
