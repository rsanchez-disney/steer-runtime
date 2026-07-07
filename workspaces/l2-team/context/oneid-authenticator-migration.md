# OneID JWT — Authenticator Universal JS Migration

## Overview

Config Studio pre-sales apps migrated from the legacy `nav-ui` component-based login flow to the `authenticator-universal-js` library for OneID JWT authentication. This replaces the old pattern of loading a `nav-ui` web component that handled login and JWT v4 token retrieval with a direct library integration. The new library handles login logic internally and can issue JWT v4 or v5 tokens depending on configuration — from the app side, no token version logic is needed.

This migration affected Angular SPAs, a Polymer 3 SPA, and a Lambda function. Each had different considerations.

## Status

**Completed.** All required apps have been updated. This document serves as reference for:
- Troubleshooting bugs related to authentication in migrated apps
- Onboarding new SPAs to the same pattern
- **Protecting these changes from regressions** — understand why the changes exist before modifying auth-related code

## Reference Links

**Search via MCP tools if links become stale:**

- **Authenticator Universal JS wiki:** search Confluence Cloud (space: `gamprofile`) for "Authenticator Universal JS"
- **Library README:** search GitHub Enterprise for `profile-vertical/authenticator-universal-js`

## What Changed

### Before (Legacy Pattern — nav-ui)

The app loaded a `nav-ui` web component that:
1. Rendered the login UI
2. Loaded the OneID authentication library internally
3. Handled the login flow and token retrieval
4. Provided a JWT v4 token to the app via events or properties

Problems: app had to wait for `nav-ui` to load, token version locked to v4, extra bundle size, coupling between navigation UI and authentication logic.

### After (New Pattern — authenticator-universal-js)

The app loads the `authenticator-universal-js` library directly:
1. The app imports and initializes the library
2. The library handles the login flow (redirect, token exchange, session management)
3. The library provides JWT tokens (v4 or v5 depending on configuration)
4. No `nav-ui` component needed for authentication — navigation UI is decoupled

The app does NOT need to manage token version logic, load any web component for auth, or handle OAuth redirects manually.

---

## Apps Migrated — Detailed History

### 1. DLR Tix Sales SPA (Angular)

**Jira:** `COM-168301` — search Jira for this ticket
**Repo:** `cgs-wdw/tixcart/dlr-tix-sales-spa` on GitLab
**PR:** GitLab MR #1239 — **this is the canonical reference PR** for Angular SPA migrations

This was the first app migrated and serves as the template for all other Angular SPAs. The PR shows the full set of changes: library install, nav-ui auth removal, auth service rewrite, interceptor update, guard update.

**No issues reported after this migration.**

---

### 2. DLR Tix Mods SPA (Angular)

**Jira:** `COM-168300` — search Jira for this ticket
**Repo:** `cgs-wdw/dlrtixmods/dlrtixmods-spa` on GitLab
**Migration PR:** GitLab MR #601

**⚠️ Post-migration bug:** `COM-174992` — search Jira for this ticket
**Fix PR:** GitLab MR #612

The initial migration (MR #601) introduced an issue that was caught after deployment. The fix (MR #612) resolved it. When working on this app's auth code, be aware that both PRs together represent the correct final state.

**Key lesson:** Always verify the full auth flow end-to-end after migration, including edge cases that may not surface in local testing.

---

### 3. DLR Entitlement Sales Lambda (Node.js)

**Jira:** `COM-168294` — search Jira for this ticket (DLR Entitlement Sales App / EAS)
**Repo:** `cgs-wdw/entlavail/entlavail-lambda` on GitLab
**PR:** GitLab MR #190

**⚠️ This was NOT a standard wiki-based migration.** The wiki covers SPAs, not Lambdas. In this case, the Lambda was validating incoming JWT tokens. With the new `authenticator-universal-js` library issuing tokens with a new `clientId`, the Lambda's token validation logic had to be updated to accept the new clientId alongside the old one.

**What changed:**
- The Lambda's JWT validation was updated to accept tokens from the new clientId
- Both old and new clientIds are accepted during the transition period
- See the library README for details on the new clientId values

**Key lesson:** When migrating auth on the frontend, check if any backend Lambdas validate the token. If they do, they need to be updated to accept the new clientId. This is easy to miss because the wiki only covers SPA changes.

---

### 4. DLR Claim SPA (Angular)

**Jira:** `COM-168299` — search Jira for this ticket
**Repo:** `cgs-wdw/clmspadlr/clmspadlr-spa` on GitLab
**PR:** GitLab MR #86

Standard Angular SPA migration following the same pattern as dlr-tix-sales-spa (MR #1239).

**No issues reported after this migration.**

---

### 5. CME Res SPA (Polymer 3) — ⚠️ Special Case

**Jira:** `COM-170721` — search Jira for this ticket
**Repo:** `commerce/wdpr-ecommerce-cme-res-spa` on GitHub Enterprise

**⚠️ The wiki does NOT cover Polymer apps.** This required 3 PRs to get right, plus a follow-up fix for a mobile issue.

**⚠️ This app also underwent the ACME/MyID OIDC migration concurrently — the two efforts conflicted. See `acme-myid-migration.md` for that side of the story.**

**⚠️ This repo contains 2 apps with different auth flows:**

| App | Auth Flow | Token Sent to Services | Audience |
|-----|-----------|----------------------|----------|
| `entry-reservation` | OneID (`authenticator-universal-js`) | OneID JWT v4 or v5 | DLR + WDW guests |
| `cast-entry-reservation-tool` | MyID ACME OIDC | MyID token | DLR cast members only |

The OneID migration (this effort) only affects `entry-reservation`. The ACME migration (see `acme-myid-migration.md`) only affects `cast-entry-reservation-tool`. But because they share the same codebase, changes to shared auth utilities or interceptors can break the other app. Always verify which app context you're working in before modifying auth code.

**PR 1 — Initial migration:** GitHub PR #2286
- First attempt at integrating `authenticator-universal-js` into a Polymer 3 app
- The wiki's Angular-specific instructions had to be adapted for Polymer's lifecycle and initialization patterns

**PR 2 — Fix after PR 1:** GitHub PR #2291
- Fixed an issue discovered after the first PR was merged
- Polymer's element lifecycle differs from Angular's — the library initialization timing had to be adjusted

**PR 3 — Remove another issue:** GitHub PR #2299
- Resolved a second issue found during testing
- Final PR that stabilized the Polymer integration

**Post-migration mobile bug:** `CME-33051` — search Jira for this ticket
**Fix PR:** GitHub PR #2308
- A mobile-specific issue surfaced after the Polymer migration was complete
- The fix was specific to how mobile browsers handle the auth redirect flow in the Polymer app

**Key lessons for Polymer apps:**
- The `authenticator-universal-js` wiki assumes Angular — Polymer apps need manual adaptation
- Polymer's `ready()` / `connectedCallback()` lifecycle is different from Angular's `ngOnInit` — library initialization timing matters
- Test on mobile browsers separately — the redirect flow can behave differently
- Expect multiple iterations — the Polymer integration took 3 PRs + 1 fix to stabilize
- If another Polymer app needs this migration, use the CME Res SPA PRs (#2286, #2291, #2299, #2308) as the reference, not the Angular wiki

---

## Migration Steps

### For Angular SPAs (standard path)

Follow the Authenticator Universal JS wiki (search Confluence Cloud, space: `gamprofile`). Reference PR: dlr-tix-sales-spa MR #1239.

1. Install the library
2. Remove nav-ui authentication dependency (nav-ui may still be used for navigation UI)
3. Initialize the library in the app's bootstrap or core service
4. Update auth service to use the library's API
5. Update HTTP interceptors to read token from the new library
6. Update auth guards
7. Test full auth flow end-to-end including edge cases

### For Polymer 3 SPAs (manual adaptation)

The wiki does NOT cover Polymer. Use CME Res SPA PRs (#2286, #2291, #2299, #2308) as reference.

1. Install the library
2. Adapt initialization for Polymer's lifecycle (`ready()` or `connectedCallback()`)
3. Handle auth state via Polymer properties and events (not Angular services)
4. Test on both desktop and mobile browsers — redirect flow differs
5. Expect iteration — Polymer integration is not straightforward

### For Lambda functions (token validation)

The wiki does NOT cover Lambdas. Use entlavail-lambda MR #190 as reference.

1. Check if the Lambda validates incoming JWT tokens
2. If yes, update validation to accept the new clientId from `authenticator-universal-js`
3. Keep accepting the old clientId during the transition period
4. See the library README for the new clientId values

---

## Troubleshooting

### Common Issues — All Apps

**Token not available after login:**
- Check that the library is initialized before any HTTP calls are made
- Verify the app ID and environment config match the OneID registration
- Check browser console for library initialization errors

**API calls failing with 401 after migration:**
- Verify the HTTP interceptor is reading the token from the new library, not the old nav-ui source
- Check if the backend Lambda validates the token — it may need the new clientId (see Lambda section above)
- Check if the API expects v4 or v5 tokens and ensure the library config matches

**Redirect loop after login:**
- Check the callback URL configuration in the library init matches the app's route
- Verify the router isn't interfering with the OAuth redirect

### Angular-Specific Issues

**nav-ui still loading authentication:**
- Ensure all authentication-related bindings on `nav-ui` are removed
- Check that the app isn't double-initializing auth (both nav-ui and the library)

**Post-migration regression (like COM-174992):**
- Check the dlrtixmods fix PR (MR #612) for the pattern — similar issues may surface in other apps

### Polymer-Specific Issues

**Library not initializing in Polymer element:**
- Polymer's `ready()` fires at a different time than Angular's `ngOnInit` — ensure the library is initialized at the right lifecycle point
- Check if the element is in Shadow DOM — the library may need the document-level context

**Mobile auth redirect failing:**
- See CME-33051 and fix PR #2308 — mobile browsers handle redirects differently in Polymer apps
- Test on actual mobile devices, not just browser dev tools mobile emulation

### Lambda-Specific Issues

**Lambda rejecting new tokens:**
- The new library uses a different clientId — the Lambda's token validation must accept it
- Check the library README for the exact clientId values
- Ensure both old and new clientIds are accepted during transition

---

## ⚠️ Regression Protection

These auth changes are critical. When modifying authentication-related code in any of the migrated apps:

1. **Do NOT remove the `authenticator-universal-js` integration** — it replaces nav-ui for auth
2. **Do NOT revert to nav-ui for authentication** — nav-ui may still exist for navigation UI but must not handle auth
3. **Do NOT change the clientId configuration** without checking with the OneID/Profile team
4. **Do NOT remove the new clientId from Lambda token validation** — both old and new must be accepted during transition
5. **Always test the full auth flow** (login → token → API call → logout) after any auth-related change
6. **Test on mobile** if the app is a Polymer SPA — mobile redirect behavior is different
7. **For CME Res SPA specifically:** this app has BOTH OneID JWT and ACME/MyID OIDC auth — changes to one can break the other. See `acme-myid-migration.md` for the ACME side.
