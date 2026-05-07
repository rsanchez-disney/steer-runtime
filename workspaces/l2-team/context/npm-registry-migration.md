# NPM Registry Migration — Leaky Packages Security Fix

## Overview

All Config Studio repos migrated from the old NPM registry (`wdpr-ra-npm-group`) to new registries (`wdpr-ra-npm-hosted` and `wdpr-ra-npm-proxy`) due to a security finding related to leaky packages. This migration is **completed across all repos** — all developers and apps should already be using the new registries.

This document exists as troubleshooting reference for when package install issues occur.

## Status

**Completed.** All repos updated. Use this document only when troubleshooting `npm install` failures.

## Reference Links

**Search via MCP tools if links become stale:**

- **Security finding:** search Confluence (space: `DPEPRA`) for "NPM Registry Leaky Packages" or "ACTION REQUIRED NPM Registry"
- **Package mapping wiki:** search Confluence (space: `DPEPRA`) for "Mapping of New RA TypeScript Node.js Blocks to Deprecated RA JavaScript"
- **Reference PR (SPA):** `cgs-wdw/tixcart/dlr-tix-sales-spa` GitLab MR #1200
- **Reference PR (Lambda):** `cgs-wdw/tixcart/dlr-tix-sales-lambda` GitLab MR #192

---

## What Changed

### Before (Vulnerable)

All packages downloaded from a single group registry:

```
registry=https://nexus3.disney.com/repository/wdpr-ra-npm-group
```

This registry had security issues with leaky packages.

### After (Current — Correct)

Two registries, with scoped packages routed to the hosted registry:

```ini
# .npmrc — correct configuration

# Default registry for all unscoped packages
registry=https://nexus3.disney.com/repository/wdpr-ra-npm-proxy

# Scoped packages: @wdpr and @com go to the hosted registry
@wdpr:registry=https://nexus3.disney.com/repository/wdpr-ra-npm-hosted
@com:registry=https://nexus3.disney.com/repository/wdpr-ra-npm-hosted
```

### How Package Resolution Works

| Package Pattern | Registry Used | Example |
|----------------|---------------|---------|
| `@wdpr/*` | `wdpr-ra-npm-hosted` | `@wdpr/ra-node-json-web-token` |
| `@com/*` | `wdpr-ra-npm-hosted` | `@com/some-package` |
| Everything else | `wdpr-ra-npm-proxy` | `lodash`, `rxjs`, `@angular/*` |

The `.npmrc` scoped registry entries (`@wdpr:registry=...`, `@com:registry=...`) tell npm to download those scoped packages from the hosted registry. All other packages go through the proxy registry.

### Package Renames

Some RA packages were renamed from JavaScript to TypeScript equivalents. Search Confluence (space: `DPEPRA`) for "Mapping of New RA TypeScript Node.js Blocks" for the full mapping. When updating dependencies, check if the old package name has a new TypeScript equivalent.

---

## Troubleshooting — Package Install Failures

### When to check this document

- `npm install` fails with 404 for a `@wdpr/*` or `@com/*` package
- `npm install` fails with authentication or registry errors
- A new developer can't install dependencies
- A CI/CD pipeline fails on `npm install`

### Diagnosis Steps

**1. Check `.npmrc` in the project root:**

```bash
cat .npmrc
```

Verify it has:
- `registry=https://nexus3.disney.com/repository/wdpr-ra-npm-proxy` (default)
- `@wdpr:registry=https://nexus3.disney.com/repository/wdpr-ra-npm-hosted`
- `@com:registry=https://nexus3.disney.com/repository/wdpr-ra-npm-hosted`

**2. Check user-level `.npmrc`:**

```bash
cat ~/.npmrc
```

The user-level `.npmrc` should also have the correct registries. A user-level config pointing to the old `wdpr-ra-npm-group` will override the project config.

**3. Check if the package scope is missing:**

If a `@wdpr/*` package fails to install but unscoped packages work:
- The `@wdpr:registry=...` line is likely missing from `.npmrc`
- Add it and retry

If a `@com/*` package fails:
- The `@com:registry=...` line is likely missing
- Add it and retry

**4. Check if the package was renamed:**

Some old RA JavaScript packages were deprecated and replaced with TypeScript equivalents. Search Confluence for the mapping wiki. The old package name may no longer exist in the new registry.

**5. Check if the old registry is still referenced:**

```bash
grep -r "wdpr-ra-npm-group" .npmrc ~/.npmrc
```

If found, replace `wdpr-ra-npm-group` with `wdpr-ra-npm-proxy` (for the default registry) or `wdpr-ra-npm-hosted` (for scoped registries).

### Common Fixes

**404 on `@wdpr/*` package:**
```ini
# Add to .npmrc if missing
@wdpr:registry=https://nexus3.disney.com/repository/wdpr-ra-npm-hosted
```

**404 on `@com/*` package:**
```ini
# Add to .npmrc if missing
@com:registry=https://nexus3.disney.com/repository/wdpr-ra-npm-hosted
```

**Still using old group registry:**
```ini
# WRONG — old registry
registry=https://nexus3.disney.com/repository/wdpr-ra-npm-group

# CORRECT — new proxy registry
registry=https://nexus3.disney.com/repository/wdpr-ra-npm-proxy
```

**Package name changed (deprecated RA JS package):**
- Search Confluence (space: `DPEPRA`) for "Mapping of New RA TypeScript Node.js Blocks"
- Replace the old package name with the new TypeScript equivalent
- Update imports in source code accordingly
