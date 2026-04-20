# TxP Team Context

## Overview

The TxP (Travel Experience Platform) Web Components team builds and maintains Stencil-based web components for Disney vacation package booking flows. The primary deliverable is `wdpr-quick-quote`, a Vista-compliant replacement for the legacy `lodging-quick-quote` component.

## Repositories

| Repo | Purpose | Branch |
|------|---------|--------|
| `wdpr-quick-quote` | New Stencil component (active development) | `develop` |
| `lodging-quick-quote` | Legacy component (behavioral reference) | `develop` |
| `wdpr-ra-web-components` | Disney's shared RA UI component library | `main` |

## Technology Stack

- **Framework:** Stencil ~4.8.0 (scoped CSS, not shadow DOM)
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS with `@stencil/sass`, mobile-first responsive
- **Dates:** Luxon (never native `Date`)
- **UI Primitives:** `@wdpr/ra-web-components` ^3.0.2
- **Testing:** Jest ~29.7.0, 90%+ coverage required
- **Linting:** ESLint with `@stencil-community/eslint-plugin`
- **Pre-commit:** Husky + lint-staged

## Component Architecture

```
wdpr-quick-quote (orchestrator, scoped CSS)
├── wdpr-config-dropdown (generic config-driven dropdown)
├── wdpr-date-picker-wrapper (date selection)
├── wdpr-party-mix (guest counts + child ages)
├── wdpr-resort-selector (resort dropdown with grouped options)
├── wdpr-error-message (single error display)
└── wdpr-error-messages-container (multiple error display)
```

All components use `scoped: true` for compatibility with RA Web Components.

## Key Patterns

- **Props down, events up** — parent orchestrator holds all form state in `roomFormData`
- **Immutable state** — always spread operator for `@State()` / `@Prop({ mutable: true })`
- **Config-driven constraints** — three-tier fallback: config JSON → destination defaults → generic defaults
- **Config-driven error messages** — locale-specific text from config, constant fallbacks
- **Cookie persistence** — `roomForm_jar` cookie for form state across page loads
- **Form submission** — hidden form POST with CSRF token (WDW/DLR), GET for UK

## Supported Brands & Locales

| Brand | Locales | Submission |
|-------|---------|------------|
| WDW | en_US, en_CA, es_US, fr_CA | POST |
| DLR | en_US, es_US | POST |
| UK | en_GB | GET |
| LACD | es_CL, es_MX, pt_BR | POST |

## Project Management

- **JIRA Project:** ROS
- **GitHub Enterprise:** github.disney.com/wdprd-development
- **RA Components GitHub:** github.disney.com/WDPR-RA-UI-Components
- **Figma:** Vista Design System + Quick Quote design specs

## CLI Preferences

- Always use `npm` (never `npx`)
- `npm test`, `npm run build`, `npm run lint`, `npm install <pkg>`

## Legacy Parity Reference

The legacy `lodging-quick-quote` serves as behavioral reference for:
- Form submission via hidden POST with CSRF token
- Cookie persistence (`roomForm_jar`)
- Dual analytics events on submit (page view + click)
- Resort value `'0'` removal before submission
- Config-driven error messages with HTML "call us" links
- Child param naming (`kid1`/`kid2` for WDW; `child1`/`child2` for DLR)
