# Stencil Conventions

## Component Style: Scoped CSS

All components use `scoped: true` (not shadow DOM) for compatibility with `@wdpr/ra-web-components`. Use `:host` selector for host element styling.

## Class Organization (Stencil Style Guide Order)

1. Own properties (private, no decorator)
2. `@Element()` host reference
3. `@State()` internal state
4. `@Prop()` public properties (with `@Watch()` immediately after)
5. `@Event()` emitters
6. Lifecycle methods (in natural call order)
7. `@Listen()` handlers
8. `@Method()` public async methods
9. Private methods
10. `render()` — always last

## Data Flow

- Props flow DOWN from parent to child
- Events flow UP from child to parent via `@Event()` / `@Listen()`
- Orchestrator component holds all form state
- Child components emit events, parent handles state updates
- Always create new references for `@State()` objects/arrays (immutable updates)

## Immutable State Updates

```tsx
// CORRECT
this.roomFormData = { ...this.roomFormData, checkInDate: newDate };
this.errors = [...this.errors, newError];

// WRONG — won't trigger re-render
this.roomFormData.checkInDate = newDate;
this.errors.push(newError);
```

## Path Aliases

| Alias | Maps to | Usage |
|-------|---------|-------|
| `@app-types` | `src/types` | `import { QuickQuoteConfig } from '@app-types'` |
| `@utils` | `src/utils` | `import { DEFAULT_LABELS } from '@utils'` |

## Utility Functions

All utilities are pure functions in `src/utils/` with corresponding `__tests__/` spec files. All constants frozen with `Object.freeze()`.

## Config-Driven Constraint Resolution (Three-Tier Fallback)

1. **Tier 1:** `config.constraints[key]` (highest priority)
2. **Tier 2:** `DESTINATION_DEFAULTS[storeID]` based on config
3. **Tier 3:** `PARTY_MIX_DEFAULTS` or `DATE_RANGE_DEFAULTS` (lowest priority)

## Responsive Breakpoints

Mobile-first approach with range-based SCSS mixins:

| Constant | Value |
|----------|-------|
| `BREAKPOINTS.MOBILE` | 0 |
| `BREAKPOINTS.TABLET` | 768 |
| `BREAKPOINTS.DESKTOP` | 1024 |
| `BREAKPOINTS.DESKTOP_XL` | 1880 |

Each breakpoint mixin is isolated (min-width AND max-width) — rules don't cascade across breakpoints.

## SCSS Architecture

```
src/assets/styles/
├── abstracts/
│   ├── variables.scss
│   ├── mixins.scss
│   └── functions.scss
├── abstracts.scss       # Barrel import
└── base/
    └── global.scss
```

Import abstracts in every component: `@import '../../assets/styles/abstracts';`

## RA Web Component Integration

- Never access `shadowRoot` on RA components — use their public API
- Provide both `label` and `aria-label` on RA components for defensive a11y
- Use `setAttribute()` for HTML global attributes (`lang`, `dir`) on RA components
- To close RA overlays, trigger built-in behaviors (e.g., `document.body.click()`)

### RA Component Prop Names

- `wdpr-stepper`: `lowerLimit` / `upperLimit` (not `min` / `max`)
- `wdpr-range-datepicker`: `start` / `end`, `min` / `max`, `format`, `variant`
- `wdpr-dropdown`: `max-viewable-items`, `error`, `label`
- `wdpr-combobox`: `items`, `groups`, `maxViewableItems`

## Event Handling

- Debounce window resize (150ms) and scroll (100ms) events
- Always clean up timeouts/intervals in `disconnectedCallback()`
- Use `@Listen('resize', { target: 'window', passive: true })` for window events

## Render Performance

Cache computed values at the top of `render()`:

```tsx
render() {
  const title = this.getTitle();
  const showResort = this.shouldDisplay('resort');
  return (
    <Host>
      <h2>{title}</h2>
      {showResort && <div>...</div>}
    </Host>
  );
}
```

## Testing Standards

- `newSpecPage()` for component rendering tests
- Direct class instantiation for logic-only tests
- Always `page.waitForChanges()` after state updates
- Set props via `page.root!.propName` (never `page.rootInstance.propName`)
- `@Watch` fires automatically via `page.root!` + `waitForChanges()`
- Wrap `jest.useFakeTimers()` / `jest.useRealTimers()` in `try/finally`
- Assert by value/id, not array indices
- 90%+ statements/lines, 75%+ branches, 100% functions
