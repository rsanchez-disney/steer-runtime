# steer-runtime — DSE DCL Web Team Workspace

AI agents for the **DSE DCL Webteam** — Angular SPAs, NestJS BFFs, and Java reactive microservices.

3 specialized profiles, 23 repos, one workspace. Standards-aware, stack-aware, ticket-driven.

> Requires an Amazon Q Developer license for Kiro CLI access.

---

## What This Workspace Provides

This is the **DSE DCL Web Team workspace** of steer-runtime. It includes three team-specific agent profiles tailored to DCL's stack:

| Profile               | Agent               | Stack                 | Use For                                                            |
| --------------------- | ------------------- | --------------------- | ------------------------------------------------------------------ |
| **dev-dcl-web**       | `dev-dcl-web`       | Angular 15–18.2       | SPAs, shared component libraries, booking, post-booking, marketing |
| **dev-dcl-node-nest** | `dev-dcl-node-nest` | NestJS 11, Node 20    | BFF/API layers (dcl-post-booking-api, dcl-cruise-101-webapi)       |
| **dev-dcl-java**      | `backend`           | Spring Boot 3 WebFlux | Reactive microservices (dcl-apps-activity-svc)                     |

Each agent auto-detects which repo you're in and applies the correct architecture patterns — no manual config needed per project.

---

## Repos Covered (audited via GitHub API — 2026-07-08)

### Angular SPAs (dev-dcl-web)

| Repo                                | Angular | Last Commit | Status   |
| ----------------------------------- | ------- | ----------- | -------- |
| dcl-amenities-spa                   | 18.2.14 | 2026-07-08  | Active   |
| dcl-apps-admin-spa                  | 18.2.14 | 2026-07-07  | Active   |
| dcl-cruise-101-spa                  | 18.2.14 | 2026-07-08  | Active   |
| dcl-apps-resaddons-spa              | 18.2.13 | 2026-07-08  | Active   |
| dcl-post-booking-mr                 | 18.2.13 | 2026-07-08  | Active   |
| dcl-apps-checkout-ui                | 18.2.0  | 2026-07-08  | Active   |
| dcl-sailing-res-spa                 | 18.2.0  | 2026-07-08  | Active   |
| dcl-apps-cruise-booking-mr          | 18.0.0  | 2026-07-08  | Active   |
| dcl-apps-online-checkin-spa         | 18.0.0  | 2026-07-08  | Active   |
| dcl-apps-productavail-spa           | 18.0.0  | 2026-07-08  | Active   |
| dcl-ui-global-components-library-v2 | 18.0.0  | 2026-07-08  | Active   |
| dcl-apps-activities-spa             | 15.1.0  | 2026-06-22  | Active   |
| dcl-apps-sailingavailability-spa    | 15.1.0  | 2026-06-19  | Active   |
| dcl-ui-components-library           | 15.1.0  | 2026-06-19  | Active   |
| dcl-ui-global-components-library    | 15.1.0  | 2026-06-19  | Active   |
| dcl-apps-explore-spa                | 15.1.0  | 2026-06-05  | Inactive |

### NestJS BFFs (dev-dcl-node-nest)

| Repo                        | NestJS  | Last Commit | Status |
| --------------------------- | ------- | ----------- | ------ |
| dcl-apps-cruise-booking-vas | 11.0.11 | 2026-07-08  | Active |
| dcl-cruise-101-webapi       | 11.0.11 | 2026-07-06  | Active |

### Java Services (dev-dcl-java)

| Repo                             | Last Commit | Status |
| -------------------------------- | ----------- | ------ |
| dcl-apps-admin-svc               | 2026-07-08  | Active |
| dcl-apps-productavail-vas        | 2026-07-08  | Active |
| dcl-keyring-entitlement-services | 2026-07-08  | Active |
| dcl-sailing-res-svc              | 2026-07-08  | Active |
| dcl-apps-ships-svc               | 2026-07-07  | Active |
| dcl-apps-voyage-svc              | 2026-07-07  | Active |
| dcl-travel-party-svc             | 2026-07-07  | Active |
| dcl-apps-sailingavailability-vas | 2026-07-03  | Active |
| dcl-apps-resaddons-svc           | 2026-07-03  | Active |
| dcl-apps-marketingoffers-svc     | 2026-07-02  | Active |
| dcl-apps-activitybooking-svc     | 2026-06-30  | Active |
| dcl-apps-sailingavail-svc        | 2026-06-30  | Active |
| dcl-apps-admin-vas               | 2026-06-29  | Active |
| dcl-apps-content-cache-svc       | 2026-06-29  | Active |
| dcl-apps-sailingcheckout-vas     | 2026-06-26  | Active |
| dcl-amenities-vas                | 2026-06-26  | Active |
| dcl-payments-svc                 | 2026-06-25  | Active |
| dcl-reservation-service          | 2026-06-24  | Active |
| dcl-amenities-svc                | 2026-06-22  | Active |
| dcl-apps-notifications-svc       | 2026-06-22  | Active |
| dcl-apps-productavail-svc        | 2026-06-22  | Active |
| dcl-apps-resaddons-vas           | 2026-06-22  | Active |
| dcl-apps-swdbaccess-svc          | 2026-06-22  | Active |
| dcl-carts-svc                    | 2026-06-22  | Active |
| dcl-sailing-res-webapi           | 2026-06-22  | Active |
| dcl-session-mgr-svc              | 2026-06-22  | Active |
| dcl-apps-session-manager-library | 2026-05-13  | Active |

### Node.js / Other

| Repo                            | Last Commit | Status   |
| ------------------------------- | ----------- | -------- |
| dcl-apps-online-checkin-wam     | 2026-07-08  | Active   |
| cruise-finder-spa               | 2026-06-23  | Active   |
| dcl-apps-itinerary-spa          | 2026-06-22  | Active   |
| dcl-apps-sales-webapi           | 2026-06-22  | Active   |
| cruise-finder-wam               | 2026-06-19  | Active   |
| dcl-apps-itinerary-wam          | 2026-06-19  | Active   |
| dcl-apps-sailingcheckout-spa    | 2026-06-19  | Active   |
| dcl-ships-svc-lambda-datasource | 2023-06-26  | Inactive |

---

## Reference Links

- [Release and Promotion Process (Confluence)](https://disneyexperiences.atlassian.net/wiki/spaces/DTD/pages/132499296/Release+and+Promotion+Process) — Source of truth for BAPPs, health checks, Splunk indexes, AWS locations, Harness pipelines
- [Version Dashboard](https://latest.disneycruise.disney.go.com/dcl-apps-admin-spa/) — Live version status for all environments

---

## Profile Details

| Profile       | README                                                    |
| ------------- | --------------------------------------------------------- |
| Angular SPAs  | [dev-dcl-web](profiles/dev-dcl-web/README.md)             |
| NestJS BFFs   | [dev-dcl-node-nest](profiles/dev-dcl-node-nest/README.md) |
| Java Services | [dev-dcl-java](profiles/dev-dcl-java/README.md)           |

---

## Prompt Examples

```bash
# Feature implementation with spec
> "Use spec-driven-implementation for DCLCOMSUST-54321"

# Direct implementation
> "Add a payment method selector with @ngrx/signals store to checkout-ui"
> "Create a guest-card component in online-checkin-spa"
> "Add a sort endpoint to dcl-cruise-101-webapi with validation guard"
> "Add a reactive GET /activities/{voyageId} endpoint with Resilience4j"

# Bug fixes
> "Fix the date picker not rendering in dark mode on dcl-post-booking-mr"
> "The amenities API returns 500 when cabinId is null — investigate and fix"

# Refactoring
> "Migrate dcl-apps-explore-spa from NgModule to standalone components"
> "Extract shared booking state into a signals-based service"
```

---

Internal Disney tool — not for external distribution.
