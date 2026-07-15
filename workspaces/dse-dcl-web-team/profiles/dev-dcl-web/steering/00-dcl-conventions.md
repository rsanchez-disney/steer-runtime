---
inclusion: auto
description: Shared conventions for all DCL Angular projects. Covers Angular 18 API boundaries, file structure, SCSS/theming, ESLint rules, constants pattern, testing, and accessibility.
---

# DCL Shared Conventions

> These conventions apply to ALL DCL Angular projects. Project-specific details live in each repo's `.kiro/steering/` files.

## Angular 18 API Boundaries

### Available

- `signal()`, `computed()`, `effect()`
- `input()`, `input.required()`, `output()`
- `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`
- `toSignal()`, `toObservable()`, `takeUntilDestroyed()`
- `@defer` (basic defer blocks)
- `inject()` function
- `ChangeDetectionStrategy.OnPush`

### NOT Available (v19+)

- `linkedSignal()` — use `computed()` + `signal()` instead
- `resource()` / `rxResource()` — use `toSignal()` with HTTP observables
- `@defer (hydrate on ...)` — incremental hydration not available
- `RenderMode`, `provideServerRoutesConfig` — Angular 19+ only

## File Structure Convention

Every component should have separate files:

- `component-name.component.ts` — Logic only, using `templateUrl` + `styleUrls`
- `component-name.component.html` — Template
- `component-name.component.scss` — Styles
- `component-name.constants.ts` — Constants exported as a single object
- `component-name.component.spec.ts` — Tests (Jasmine/Karma)
- When adding new components or features, reuse existing library/shared components instead of vanilla HTML tags

## ESLint Rules

- `@typescript-eslint/no-magic-numbers` — No inline numeric literals. Extract to named constants in `.constants.ts`.
- `padding-line-between-statements` — Blank line required before: `return`, `if`, `const`/`let` after other statements.
- `no-console` — Suppress with `// eslint-disable-next-line no-console` when intentional.

## Constants Pattern

```ts
// component-name.constants.ts
export const COMPONENT_CONSTANTS = {
    someValue: 42,
    someString: "value",
};
```

Reference in component via `readonly constants = COMPONENT_CONSTANTS;`

## Component Decorator

- Use `standalone: true` for new components
- Use `changeDetection: ChangeDetectionStrategy.OnPush`
- Use `templateUrl` and `styleUrl` (not inline)
- Import `NgClass` from `@angular/common` when using `[ngClass]`

## Signals

> For detailed signal patterns and examples, use `#angular-signals` in chat.

- Use `signal()` for mutable state
- Use `computed()` for derived state
- Use `viewChild.required()` for template refs
- Let TypeScript infer types where possible: `signal(0)` not `signal<number>(0)`

## Inputs & Outputs

- Always use `input()` / `input.required()` instead of `@Input()` decorator
- Always use `output()` instead of `@Output()` + `EventEmitter`
- Mark all inputs and outputs as `readonly`
- Use `input.required<Type>()` when the old decorator used `!` (non-null assertion)
- Use `input(defaultValue)` when the old decorator had a default value
- Let TypeScript infer the type from the default: `input('')` not `input<string>('')`
- Provide explicit generic only for required inputs or when there's no default: `input.required<MyType>()`
- In templates, read input signals with `()`: `selected()` not `selected`
- In component methods, read input signals with `()`: `this.filterId()` not `this.filterId`
- Example:

    ```ts
    import { input, output } from '@angular/core';

    readonly label = input('');
    readonly group = input.required<OptionsGroup>();
    readonly clicked = output<string>();
    ```

## Theme / Dark Mode

- Use `.dark` CSS class on container: `[ngClass]="{ dark: isDarkTheme() }"`
- Default styles = dark mode, override with `&:not(.dark) { ... }` for light mode
- Use CSS custom properties for theming

## SCSS

- Never use `@import` — always use `@use 'base' as *;`
- Use CSS custom properties for theming (not SCSS variables)
- Define CSS variables on `:host` with sensible defaults
- Reference with `var(--...)` in all style rules
- Override variants by reassigning variables, not properties
- Prefer `tablet` breakpoint over `mobile-xl` — only use `mobile-xl` when explicitly required by design
- **Never use `::ng-deep`** — it is deprecated and leaks styles globally. Instead:
    - Expose CSS custom properties from child components (e.g. `--pill-button-font-size`)
    - Override by setting the CSS variable on the parent element
    - If the child component doesn't expose a var, add one to the child first
- Example override pattern:
    ```scss
    .parent__section {
        --filter-pill-group-title-display: none;
        --pill-button-font-size: 0.72rem;
        --expansion-panel-header-text-align: left;
    }
    ```
- Example:
    ```scss
    :host {
        --component-bg: #ffffff;
        --component-text-color: #253b56;
    }
    .element {
        background-color: var(--component-bg);
        color: var(--component-text-color);
    }
    &.dark {
        --component-bg: #1a1a2e;
        --component-text-color: #e8e8e8;
    }
    ```

## Testing (Jasmine/Karma)

- Use `TestBed.configureTestingModule` with `imports: [StandaloneComponent]` for standalone components
- Use `NO_ERRORS_SCHEMA` to ignore child component selectors
- Use `fakeAsync` + `tick` for async operations
- Mock external dependencies via spy objects
- Access private methods via `(component as any).methodName()` when needed
- Follow `describe` > `beforeEach` > `it` structure
- Reset spies in `beforeEach`
- Set signal inputs via `fixture.componentRef.setInput('name', value)` — never assign directly to `component.inputName`
- Use `provideHttpClient()` + `provideHttpClientTesting()` in providers — do NOT use deprecated `HttpClientTestingModule`
- Module-level mutable state (counters, caches) must expose a `reset` function for test isolation:
    ```ts
    /** @internal — test-only */
    export function resetPanelIdCounter(): void {
        panelIdCounter = 0;
    }
    ```

## Type Safety

- Never blindly cast values from library outputs (e.g. `value as SortOption`). Validate first:
    ```ts
    onSortChange(value: string): void {
        if (SORT_OPTIONS.some(opt => opt.value === value)) {
            this.filterState.setSort(value as SortOption);
        }
    }
    ```
- When a library emits `string` but your app uses a union type, guard before casting

## Translation (`@ngx-translate`)

- `translate.instant()` is synchronous and does NOT react to runtime language changes
- This is acceptable in DCL apps because language is set once on page load (no runtime switching)
- When using `translate.instant()` inside `computed()`, add a comment documenting this assumption:
    ```ts
    // NOTE: translate.instant() is intentional — no runtime language switching in this app.
    readonly translatedPills = computed(() => ...);
    ```
- If runtime language switching is ever needed, convert `translate.onLangChange` to a signal dependency

## Code Formatting

- No empty lines between sibling route entries in routing files
- No empty lines between import groups — third-party and local imports should be contiguous (no blank separator line)

## Lifecycle Hooks

- Keep lifecycle methods (`ngOnInit`, `ngOnDestroy`, etc.) as thin callers — extract logic into descriptive private methods
- Example:

    ```ts
    ngOnInit(): void {
        this.initializeFilters();
    }

    private initializeFilters(): void {
        // actual logic here
    }
    ```

## Accessibility

- `tabindex="0"` on interactive non-button elements
- `role="application"` on canvas/interactive containers
- `aria-label` on interactive elements
- `aria-live="polite"` for dynamic announcements
- Visible `:focus` outlines on all focusable elements
