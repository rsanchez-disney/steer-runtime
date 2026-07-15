---
inclusion: auto
description: Repo-specific patterns for all DCL Angular projects. Detect repo by component prefix and apply correct architecture, state management, and tooling patterns.
---

# DCL Repo-Specific Patterns

> Detect the repo by component prefix and apply the correct patterns. When in doubt, check `angular.json` for the project prefix.

## Repo Detection

| Prefix                       | Repo                                | Type       | Pattern                              |
| ---------------------------- | ----------------------------------- | ---------- | ------------------------------------ |
| `dcl-checkout`               | dcl-apps-checkout-ui                | Library    | Standalone + @ngrx/signals + OpenAPI |
| `booking`                    | dcl-apps-cruise-booking-mr          | Host shell | NgModule, lazy-loads library         |
| `myres`                      | dcl-post-booking-mr                 | Library    | NgModule + BehaviorSubject           |
| `online-checkin`             | dcl-apps-online-checkin-spa         | App        | Standalone + @ngrx/signals           |
| `app` (DclPostBookingModule) | dcl-post-booking-ui                 | Host shell | Thin NgModule shell                  |
| `cruise101`                  | dcl-cruise-101-spa                  | App        | Hybrid module+standalone             |
| `dcl-ui-global`              | dcl-ui-global-components-library-v2 | Library    | NgModule, ng-packagr                 |

## Rules by Repo

### dcl-apps-checkout-ui (Booking Library)

- Standalone components, `@Input()` / `@Output()` decorators (NOT signal inputs)
- Default change detection (NOT OnPush)
- @ngrx/signals with composable `signalStoreFeature`
- `BOOKING_STORE` InjectionToken for decoupled store access
- `CUSTOM_ELEMENTS_SCHEMA` for @wdpr/\* web components
- OpenAPI-generated API clients — NEVER modify generated code
- API-driven translations via @ngx-translate (not static JSON)
- Coverage: 80%

### dcl-apps-cruise-booking-mr (Booking Host)

- NgModule shell with `AppModule` bootstrap
- Lazy-loads checkout routes: `loadChildren: () => import('@dcl/dcl-checkout-ui')`
- `LocaleRouteProvider.generateLocaleRoutes()` for i18n routing
- Express server with `deployUrl`
- Coverage: 80%

### dcl-post-booking-mr (PostBooking Library)

- NgModule-declared components (NOT standalone)
- `@Input()` / `@Output()` decorators, constructor injection
- BehaviorSubject services for state (`providedIn: 'root'`)
- `DclPostBookingModule.forRoot(config)` for host integration
- `CUSTOM_ELEMENTS_SCHEMA` for @wdpr/\* web components
- Coverage: 80%

### dcl-apps-online-checkin-spa (PostBooking App)

- Standalone components with `imports: [...]`
- `inject()` function for DI
- @ngrx/signals stores: `signalStore()` with `withState()`, `withMethods()`, `patchState()`
- `effect()` for side effects
- Lazy loading: `loadChildren` for modules, `loadComponent` for standalone
- Functional guards (`LoginGuard`, `TravelAgentGuard`, `unsavedChangesGuard`)
- Coverage: 80%

### dcl-cruise-101-spa (Marketing App)

- Hybrid: NgModule (existing) + standalone (new features)
- New features: standalone + signals + OnPush + `inject()`
- Existing: NgModule + `@Input()`/`@Output()` + constructor injection
- Signal-based state in new features (`FilterStateService` with `signal()`, `computed()`)
- RxJS BehaviorSubject/Subject in existing services
- Feature toggles via LaunchDarkly
- Express SSR server in `src/static/`
- Coverage: 80%

### dcl-ui-global-components-library-v2 (Shared Library)

- NgModule pattern for ALL components (even in Angular 18)
- Each component: `*.component.ts`, `*.component.html`, `*.component.scss`, `*.spec.ts`, `*.module.ts`
- Export component and module from `public-api.ts`
- CSS custom properties for consumer overrides (never `::ng-deep`)
- Each component folder must have a `README.md`
- Coverage: **90%** (statements/lines/functions), 89% branches
- Build: `ng build dcl-ui-global-components-library-v2`
- Local dev: `npm run build:watch:yalc` → apps use `yalc add`

## Angular Tooling (v18)

### Common Commands

```bash
# Dev server with proxy
npm run start:proxy:dev

# Build
npm run build:dev          # Development
npm run build:prod         # Production
ng build -c production --stats-json  # With bundle analysis

# Testing
npm run test               # Unit tests with coverage
ng test --watch=false --browsers=ChromeHeadless --code-coverage
ng test --include=**/my-component.spec.ts  # Specific file

# Linting
npm run lint               # ESLint
npm run lint:styles        # Stylelint
npm run format             # Prettier
```

### Code Generation

```bash
ng g c features/my-feature --standalone --change-detection=OnPush
ng g s shared/services/my-service
ng g d shared/directives/my-directive
ng g p shared/pipes/my-pipe
ng g c features/checkout --dry-run  # Preview
```

### Library Commands

```bash
npm run build              # Build library (ng-packagr)
npm run build:watch        # Build with watch mode
npm run build:watch:yalc   # Build + auto-push to yalc
```

## Path Aliases (typical DCL tsconfig)

```json
{
    "compilerOptions": {
        "paths": {
            "@app/*": ["src/app/*"],
            "@core/*": ["src/app/core/*"],
            "@shared/*": ["src/app/shared/*"],
            "@features/*": ["src/app/features/*"],
            "@services/*": ["src/app/shared/services/*"],
            "@interfaces/*": ["src/app/shared/interfaces/*"],
            "@env/*": ["src/environments/*"],
            "@test-helpers/*": ["src/app/test-helpers/*"]
        }
    }
}
```

## Pre-commit Checklist (enforced by husky)

```bash
npm run test        # Unit tests pass
npm run lint        # No ESLint errors
npm run lint:styles # No Stylelint errors
npm run format      # Code formatted
```

## Library Development (yalc workflow)

```bash
# Terminal 1 — Library (auto-rebuild + push)
cd dcl-ui-global-components-library-v2
npm run build:watch:yalc

# Terminal 2 — Consumer app
cd <app-directory>
yalc add @dcl/dcl-ui-global-components-library-v2
npm start  # with preserveSymlinks: true
```
