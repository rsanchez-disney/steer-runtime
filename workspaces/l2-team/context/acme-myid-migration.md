# ACME Self Service — MyID OIDC Migration

## Overview

Config Studio pre-sales apps migrated from the legacy SOLO app to ACME Self Service for MyID login logic. Instead of calling the old MyID service, apps now call the ACME OIDC authorization endpoint with new parameters. This affects the OIDC Authorization Code Flow used for employee/cast member authentication.

This effort was done on the CME Res SPA (Polymer 3) — the same app that also underwent the OneID `authenticator-universal-js` migration (see `oneid-authenticator-migration.md`). The two efforts overlapped and caused conflicts.

## Status

**Completed.** The migration is done but required multiple iterations due to conflicts with the concurrent OneID effort. This document serves as reference for troubleshooting and regression protection.

## Reference Links

**Search via MCP tools if links become stale:**

- **Jira ticket:** `COM-160653` — search Jira for "SOLO to ACME" or "ACME self service MyID"
- **MyID OIDC Auth Code Flow wiki:** search Confluence (space: `IDAM`) for "MyID Info OIDC Authorization Auth Code Flow"
- **Securing OIDC Apps wiki:** search Confluence (space: `IDAM`) for "MyID Info Securing OIDC Apps"
- **Repo:** `commerce/wdpr-ecommerce-cme-res-spa` on GitHub Enterprise

---

## What Changed

### Before (SOLO App)

The app called the legacy SOLO MyID service for OIDC authentication. The authorization request used SOLO-specific parameters and endpoints.

### After (ACME Self Service)

The app calls the ACME OIDC authorization endpoint instead. New parameters are sent in the authorization request as specified by the IDAM team's wiki. The OIDC Authorization Code Flow remains the same conceptually, but the service endpoint and required parameters changed.

---

## PR History — CME Res SPA (Polymer 3)

**⚠️ This migration had a rough path.** Multiple PRs were needed, including reverts, due to conflicts with the concurrent OneID effort.

### Timeline (in order):

**PR #2247 — Initial attempt (had issues)**
- First attempt at the ACME migration
- Introduced changes that didn't work correctly
- Was merged before the issues were fully understood

**PR #2269 — Revert + correct implementation**
- Reverted the problematic changes from PR #2247
- Implemented the correct ACME integration with proper parameters
- Check the ticket comments (`COM-160653`) for context on what went wrong with #2247

**PR #2279 — Follow-up fix attempt (didn't work)**
- Attempted to fix an issue found after #2269
- Was merged but didn't resolve the problem

**PR #2280 — Revert of #2279**
- Reverted #2279 because it didn't work

**PR #2281 — Final fix (correct solution)**
- The actual fix for the issue
- This is the final stable state for the ACME migration

---

## ⚠️ Cross-Effort Conflict: ACME + OneID

**This is critical context.** The ACME migration and the OneID `authenticator-universal-js` migration were happening on the same repo (CME Res SPA) around the same time. The two efforts interfered with each other.

**The repo contains 2 apps with completely different auth flows:**

| App | Auth Flow | Token Sent to Services | Audience |
|-----|-----------|----------------------|----------|
| `entry-reservation` | OneID (`authenticator-universal-js`) | OneID JWT v4 or v5 | DLR + WDW guests |
| `cast-entry-reservation-tool` | MyID ACME OIDC | MyID token | DLR cast members only (cast mode) |

- The ACME migration only affects `cast-entry-reservation-tool` (cast mode, DLR only)
- The OneID migration only affects `entry-reservation` (guest mode, DLR + WDW)
- But they share the same codebase — shared auth utilities, interceptors, and service layers

**What went wrong:** When both sets of changes were in the codebase, they caused unexpected issues because changes to shared auth code affected both apps. ACME changes modified OIDC authorization parameters that were also used by the OneID flow path, and vice versa.

**Key lesson:** When working on auth-related changes in CME Res SPA, always identify which app you're modifying:
- If it's `cast-entry-reservation-tool` → you're in ACME/MyID territory (MyID token to services)
- If it's `entry-reservation` → you're in OneID territory (OneID JWT v4/v5 to services)
- If it's shared code (interceptors, auth utilities) → **test BOTH apps** because a change to shared code affects both flows

---

## Migration Steps

For migrating other apps from SOLO to ACME Self Service:

1. Search Confluence (space: `IDAM`) for the latest MyID OIDC documentation
2. Update the OIDC authorization endpoint URL from SOLO to ACME
3. Add the new required parameters as specified in the IDAM wiki
4. Update any callback/redirect URL configurations
5. Test the full OIDC Authorization Code Flow end-to-end
6. **If the app also uses OneID/authenticator-universal-js, test both auth flows**

---

## Troubleshooting

### Common Issues

**OIDC authorization failing after migration:**
- Verify the new ACME endpoint URL is correct
- Check that all required new parameters are being sent
- Verify the app's OIDC client registration is updated for ACME

**Auth working in one flow but not the other:**
- This repo has TWO apps with different auth: `entry-reservation` (OneID JWT) and `cast-entry-reservation-tool` (MyID ACME OIDC)
- A change to shared code (interceptors, auth utilities) affects both apps
- `entry-reservation` sends OneID v4/v5 tokens to services (DLR + WDW guests)
- `cast-entry-reservation-tool` sends MyID tokens to services (DLR cast mode only)
- See `oneid-authenticator-migration.md` for the OneID side

**Regression after merging auth changes:**
- Check if the change touches OIDC parameters (ACME side) or JWT handling (OneID side)
- Review the PR history above — similar issues were caused by mixing the two efforts
- When in doubt, compare against the final stable PRs: #2269 (ACME correct impl) and #2281 (final fix)

---

## ⚠️ Regression Protection

When modifying auth-related code in CME Res SPA or any app with both ACME and OneID:

1. **Do NOT modify ACME OIDC parameters** without checking the IDAM wiki for current requirements
2. **Do NOT assume auth changes are isolated** — ACME and OneID share the auth stack in this app
3. **Always test BOTH auth flows** after any auth-related change
4. **Review PR #2269 and #2281** before making ACME-related changes — they represent the correct final state
5. **Check `oneid-authenticator-migration.md`** for the OneID side of the auth stack
