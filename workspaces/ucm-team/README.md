# UCM Team Workspace

Multi-team workspace for the Disney eCommerce Cart & Checkout platform — manages purchase and modification flows for theme park tickets, lodging, dining, annual passes, and experiences across WDW and DLR.



## Apply

```bash
# UCM1 team (Unified Checkout — UC SPA, UC API, Cart UI, Cart API, Components, Lambda)
koda workspace apply ucm1
```

---

## What's Included

### UCM1 Projects

| Repo | Role | Tech |
|------|------|------|
| `wdpr-ecommerce-uc-spa` | Unified Checkout SPA | Angular 15 / TypeScript |
| `com-uc-ui-components` | Polymer 3 UI components library | Polymer 3 |
| `wdpr-ecommerce-uc-api` | UC API BFF | Node.js / Restify |
| `com-ui-api-lambda` | Global API Lambda | Node.js / AWS Lambda |
| `wdpr-ecommerce-wdpr-cart-api` | Cart API BFF | Node.js / Restify |
| `wdpr-ecommerce-wdpr-cart-ui` | Cart SPA | Angular 15 |

### Context Files

| File | Location | Content |
|------|----------|---------|
| `domain_context.md` | Parent | Shared architecture, product types, flows, UC SPA and UI components detail, monitoring |
| `cart-checkout-conventions.md` | Parent (rules/) | Shared dev conventions: branches, commits, API constants, TTL, auth, native bridge, security, testing |
| `domain_context.md` | ucm1 | UC API, Lambda, Cart API, Cart UI — deep dive per-repo |
| `team_context.md` | ucm1 | Jira, branch workflow, repos owned |
| `ucm-conventions.md` | ucm1 (rules/) | UCM1 per-application rules |

### Rules

| Rule | Source | Purpose |
|------|--------|---------|
| `cart-checkout-conventions.md` | Parent | Branch naming, commit format, API constants, TTL, auth state, security, testing |
| `conventional_commit` | Common | Conventional commit format |
| `general-node-development` | Common | Node.js best practices |
| `general-angular-development` | Common | Angular best practices |
| `general-aws` | Common | AWS best practices |
| `general-api-design` | Common | REST API design patterns |
| `general-testing-strategies` | Common | Testing strategies |
| `jira-commit-format` | Common | Jira ticket reference in commits |
| `jira-safety` | Common | Jira field safety guardrails |
| `ucm-conventions.md` | ucm1 | UCM1 per-application conventions |

### Profiles

| Profile | Used by | Purpose |
|---------|---------|---------|
| `dev-core` | Both teams | Code review, PRs, architecture, testing, security |
| `dev-web` | Both teams | Angular UI, Node gateway, backend specialists |
| `dev-ui` | UCM1 | Legacy Angular, Polymer, Lambda |

### Jira

| Team | Jira Prefix | Boards |
|------|-------------|--------|
| UCM1 | UCM- · COM- | Unified Checkout |

---

## Structure & Design

```
ucm-team/                                  ← Shared foundation (architecture, flows, shared repos, conventions)
├── ucm1/                                 ← UCM team (UC SPA, UC API, Cart UI, Cart API, Lambda, Components)
    ├── context/
    │   ├── domain_context.md              ← UCM1 repo deep dives (UC API, Cart API, etc.)
    │   └── team_context.md               ← Jira, branch workflow
    └── rules/
        └── ucm-conventions.md            ← Per-application UCM rules
```

### Inheritance Chain

```
ucm-team
│   profiles: [dev-core, dev-web]
│   rules: [conventional_commit, general-*, jira-*, cart-checkout-conventions]
│   context: domain_context.md (shared arch, product types, UC SPA, components, monitoring)
│
├── ucm1 (extends: ucm-team)
    profiles: + [dev-ui]
    jira_prefix: UCM-|COM-
    projects: 6 repos (uc-spa, uc-api, lambda, components, cart-api, cart-ui)
    context: + domain_context.md (UC API, Lambda, Cart API, Cart UI)
            + team_context.md
    rules: + ucm-conventions.md

```

---

## Scaling Guide

### Adding a new team

```bash
mkdir -p ucm-team/new-team/context
```

Create `new-team/workspace.json`:
```json
{
  "name": "new-team",
  "extends": "ucm-team",
  "description": "New team description",
  "team": "New Team",
  "profiles": ["dev-core", "dev-web"],
  "default_agent": "orchestrator",
  "jira_prefix": "XYZ-",
  "projects": [...]
}
```

Add `context/domain_context.md` with team-specific repo details, and `context/team_context.md` for Jira/roster.

---

## Teams

| Team | Role | Workspace | Jira |
|------|------|-----------|------|
| UCM1 | Unified Checkout end-to-end (SPA, API, Cart, Components) | `ucm1` | UCM- / COM- |
