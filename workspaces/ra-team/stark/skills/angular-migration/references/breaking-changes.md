# Breaking Changes per Angular Version

## Angular 5 → 6

- **RxJS 6**: All imports change from `rxjs/Observable` to `rxjs`. Use `rxjs-compat` as bridge.
- **HttpModule** removed → use `HttpClientModule`
- `@angular/http` removed → use `@angular/common/http`
- Animations moved to `@angular/animations` (separate import)
- `ngFor` now uses `trackBy` function signature change

## Angular 6 → 7

- `@angular/core` uses `peerDependencies` for RxJS
- CLI projects use `angular.json` (not `.angular-cli.json`)
- TypeScript 3.1 minimum
- `document.querySelectorAll` typings changed
- `<mat-form-field>` requires `<mat-label>`

## Angular 7 → 8

- **Lazy loading syntax**: `loadChildren: './path#Module'` → `loadChildren: () => import('./path').then(m => m.Module)`
- Differential loading enabled by default (ES5/ES2015 bundles)
- ViewChild/ContentChild require `{ static: true/false }`
- `@angular/platform-webworker` removed
- TypeScript 3.4+

## Angular 8 → 9

- **Ivy renderer** enabled by default (opt-out via `enableIvy: false`)
- ModuleWithProviders requires generic: `ModuleWithProviders<T>`
- `TestBed.get()` deprecated → `TestBed.inject()`
- `@angular/forms` validators changed strictness
- `entryComponents` no longer required (Ivy resolves dynamically)

## Angular 9 → 10

- **Strict mode** available (`ng new --strict`)
- `moduleId` property removed from `@Component`
- CommonJS imports show warnings
- TypeScript 3.9+ (strict null checks more aggressive)
- New date pipe defaults (may change output)

## Angular 10 → 11

- `tslint` → `eslint` (migration schematic available)
- `tsconfig.json` uses `"target": "es2015"` minimum
- HMR support via `ng serve --hmr`
- Removed deprecated `ViewEncapsulation.Native`
- Stricter type checking in pipes

## Angular 11 → 12

- **ViewEngine removed** (Ivy only)
- `enableIvy` compiler option removed (always Ivy)
- Strict mode by default for new projects
- Webpack 5 used by default
- `emitDecoratorMetadata` no longer needed
- Sass `~` imports deprecated → use package-relative paths
- `ng build` defaults to production

## Angular 12 → 13

- **IE11 support dropped**
- **Node 12 support dropped** (minimum Node 14)
- `ViewEngine` libraries no longer supported (must be compiled with Ivy)
- `entryComponents` fully removed
- `TestBed.initTestEnvironment` must use `teardown: { destroyAfterEach: true }`
- Dynamic component creation simplified (no `ComponentFactoryResolver`)
- TypeScript 4.4+

## Angular 13 → 14

- **Standalone components** (developer preview)
- **Typed Reactive Forms**: `FormControl<string>`, `FormGroup`, etc.
- `inject()` function for dependency injection
- `title` property in Route
- Angular CLI autocomplete
- `ng completion` command
- Node 14 minimum (14.15+)

## Angular 14 → 15

- **Standalone APIs stable**
- Directive composition API
- Image directive (`NgOptimizedImage`) stable
- Functional router guards/resolvers
- `RouterModule.forRoot()` → `provideRouter()` (standalone)
- `HttpClientModule` → `provideHttpClient()` (standalone)
- Better stack traces (linked for async)
- `@angular/material` uses MDC by default (visual changes)

## Angular 15 → 16

- **Signals** (developer preview)
- **Required inputs**: `@Input({ required: true })`
- **Self-closing component tags**: `<app-icon />`
- `DestroyRef` for takeUntilDestroyed
- Non-destructive hydration (SSR)
- Jest and Web Test Runner support (experimental)
- Vite/esbuild dev server (developer preview)
- `withFetch()` for HttpClient

## Angular 16 → 17

- **New control flow syntax** (`@if`, `@for`, `@switch`) replaces `*ngIf`, `*ngFor`, `*ngSwitch`
- **Deferrable views** (`@defer`) for lazy loading
- **Signals stable** (signal, computed, effect)
- New build system (esbuild+vite) stable for applications
- `@angular/ssr` package (replaces `@nguniversal/*`)
- View transitions API
- Automatic migration schematic: `ng g @angular/core:control-flow`
- Style/styleUrl as inline strings

## Angular 17 → 18

- **Zoneless** (experimental) — `provideExperimentalZonelessChangeDetection()`
- **Signal inputs** stable: `input()`, `input.required()`
- **Signal queries** stable: `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`
- `output()` function stable
- **New build system** default for all new projects
- `afterRender`/`afterNextRender` hooks
- Route redirect functions
- Firebase App Hosting support
- Material 3 default

## Angular 18 → 19

- **Incremental hydration** for SSR
- `resource()` and `httpResource()` APIs
- **linkedSignal** for derived mutable state
- `effect()` no longer developer preview
- Standalone defaults in `ng generate`
- TypeScript 5.5+
- Karma deprecated (use Jest or Web Test Runner)

## Angular 19 → 20

- **Signals fully stable** (all APIs)
- **Zoneless stable** (`provideZonelessChangeDetection()`)
- `ExperimentalPendingTasks` → `PendingTasks`
- `effect()` `allowSignalWrites` removed (always allowed)
- `toSignal`/`toObservable` refinements
- Strict standalone by default
- `@let` directive stable
- Protected members accessible in templates (strict mode relaxation)

## Angular 20 → 21

- **`effect()` fully stable** (no experimental flags)
- **Linked signals** (`linkedSignal`) stable
- `afterRenderEffect` stable
- Generic type narrowing in templates
- Incremental hydration stable
- Signal-based forms (developer preview)
- `outputFromObservable` → `output()` with `.subscribe()`

## Angular 21 → 22

- **Standalone default everywhere** — NgModules no longer required for bootstrapping
- **No NgModule-based bootstrapping** for new projects (use `bootstrapApplication`)
- Signal-based forms stable
- Full ESM package format (no UMD bundles)
- TypeScript 5.8+
- Node 22+ minimum
- `provideRouter` enhancements (nested lazy routes simplified)
- Template type narrowing improvements
- Deprecated `ComponentFixture.autoDetectChanges()` in favor of zoneless patterns
