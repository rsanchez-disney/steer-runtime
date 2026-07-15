---
inclusion: auto
description: Project-specific context for dcl-ui-global-components-library-v2. Angular 18 component library built with ng-packagr.
---

# DCL UI Global Components Library v2

## Project Facts

- Angular version: **18.0.x**
- Project type: **Angular library** (ng-packagr), NOT an application
- Builder: `@angular-devkit/build-angular:ng-packagr`
- Component prefix: `dcl-ui-global`
- Source root: `projects/dcl-ui-global-components-library-v2/src/`
- Public API: `src/public-api.ts` (all exports go here)
- Styles: SCSS with `@use 'base' as *;`
- i18n: `@ngx-translate/core` + `@ngx-translate/http-loader`
- UI framework: `@angular/material` + `@angular/cdk`
- External deps: `@dcl/comparison-table`, `@dcl/modal`

## Component Pattern Mix

This library has BOTH patterns — check existing component before generating:

- **NgModule-based**: Many older components (accordion, highlight, sidebar, gallery, tile-card, base-modal, split-detail-hero, featured-cruise-tiles, etc.)
- **Standalone**: Newer components (filter-pill-button, filter-pill-group, activities, itinerary, drop-down-popover, etc.)
- When modifying existing components, match their current pattern
- New components should use standalone unless integrating into an existing module

## Component Documentation

- Each component folder must have a `README.md` (see `tabs/README.md` as reference)
- README structure: Table of Contents, Introduction, Quick Start (import + HTML usage), Attributes table, Events table
- Do NOT use large JSDoc comments in `.component.ts` files to document usage/examples — put that in the README instead
- Keep `.component.ts` comments minimal (brief one-liner if needed)

## CSS Custom Properties for Consumer Overrides

- Every visual property that consumers might need to override must be exposed as a CSS custom property
- Define vars on `:host` with sensible defaults so the component works out of the box
- Common patterns to expose: display, font-size, text-align, colors, spacing
- Example:
    ```scss
    :host {
        --filter-pill-group-title-display: block;
        --pill-button-font-size: inherit;
    }
    .title {
        display: var(--filter-pill-group-title-display);
    }
    .pill-button {
        font-size: var(--pill-button-font-size);
    }
    ```
- This allows consuming apps to override styles without `::ng-deep`

## Not Applicable to This Project

- Routing (`provideRouter`, guards, lazy loading) — this is a library
- SSR (`@angular/ssr`, `RenderMode`) — this is a library
- `app.config.ts`, `app.routes.ts` — this is a library
- `ng serve` — use `npm run build:watch` instead

## Learned Rules

### Filter Accordion & Sidebar Reset Pattern

- **`ng-content` projected components are NOT destroyed/recreated** by `@if` structural directives on the host. Projected content lifecycle is tied to the host component, not the template outlet. `ngOnInit` only runs once — you cannot rely on destroy/recreate cycles to reset projected component state.
- **Use `contentChildren()` + a `reset()` method** to programmatically reset projected children. The sidebar uses `contentChildren(FilterAccordionComponent, { descendants: true })` to query projected accordions and calls `reset(expanded)` on each when `isOpen` becomes true.
- **`contentChildren()` only finds components of the exact type queried.** If the consuming app projects a different component, the query returns empty. The consuming app must use the library's accordion component for the reset mechanism to work.
- **Guard against count mismatches** when iterating `contentChildren` against config arrays — use `if (i < resetStates.length)` to avoid undefined access.

### ng-content + ng-template Pattern

- The sidebar template uses `<ng-template #ref><ng-content></ng-content></ng-template>` + `*ngTemplateOutlet` to reuse projected content in both desktop and mobile views. This requires `CommonModule` in imports for `NgTemplateOutlet`.
- This pattern does NOT destroy projected children when the outlet is removed from DOM.

### CSS Conventions

- Use `:host:first-child` (not `:host:not(:first-of-type)` or `:host + :host`) for "border between siblings but not on first" — most reliable with Angular's emulated encapsulation and `@for` comment nodes.
- The `@include btn-link()` mixin sets `border: none` which overrides any `border-top` on the same element. Place borders on `:host` instead of on elements that use `btn-link()`.
- Extract magic number padding/spacing to CSS custom properties on `:host` (e.g., `--accordion-header-padding`) for consumer overridability.
- Override pill-button width constraints via CSS custom properties (`--pill-button-width-mobile`, `--pill-button-width`) on `:host` rather than `width: auto` inside `::ng-deep`.

### Build & Push Workflow

- Library pre-push hook runs: `lint` → `test` (full suite, ~2945 tests). Use `--no-verify` only when pre-existing failures block push.
- Always rebuild library (`npx ng build dcl-ui-global-components-library-v2`) before testing in the consuming SPA.

### OptionsGroup Interface

- Added optional `isExpanded?: boolean` to `OptionsGroup` interface. This drives accordion default state from CMS/mock data rather than hardcoded index checks.
