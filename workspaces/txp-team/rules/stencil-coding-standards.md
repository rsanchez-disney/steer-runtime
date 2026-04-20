# Stencil Coding Standards

Enforceable rules for all TxP Stencil web components. Agents must flag violations.

## Type Safety

1. No `any` type — strict TypeScript required
2. No `as any` casts — import or extend proper types from RA Web Components
3. No `as unknown as X` double casts — fix the interface or use explicit type annotation
4. Index signatures use `unknown`, not `any`
5. Explicit boolean conditions — never truthy/falsy checks on numbers or strings

## Documentation

6. JSDoc on all `@Prop()`, `@State()`, `@Event()`, `@Method()`, and public/private methods
7. JSDoc includes behavioral context (when/why), not just type restating

## Component Rules

8. All components use `scoped: true` (never `shadow: true`)
9. No reserved prop names (`title`, `children`, `class`, `style`)
10. No `shadowRoot` access on RA Web Components
11. Both `label` and `aria-label` on RA components
12. Use `setAttribute()` for HTML global attributes on RA components
13. `render()` returns arrays, not Fragments (Stencil, not React)
14. Silent graceful degradation — no `console.error` for expected failures
15. Multi-line JSX when >3 attributes or long expressions

## State & Data

16. Immutable state updates — always spread operator for `@State()` / `@Prop({ mutable: true })`
17. All constants frozen with `Object.freeze()`
18. Pure functions in utilities — no side effects, no `this`
19. Luxon for all dates — never native `Date`
20. Validate string format before splitting (delimiter guard)

## Styling

21. No `!important` in SCSS — use element-qualified selectors for specificity
22. No hardcoded text, numbers, or colors — use constants, config, SCSS `$variables`
23. Prefer SCSS mixins for repeated patterns (3+ declarations shared by 2+ selectors)
24. No whitespace for visual indentation in rendered text — use CSS padding/margin
25. CSS Grid/Flex z-index: decreasing values by visual position for dropdown overlays

## Error Messages

26. Config-driven error messages — check `config.qqForm.validationErrors[key]` first, then `DEFAULT_ERROR_MESSAGES[key]`
27. Sanitize HTML from config with `sanitizeHtml()` before `innerHTML` rendering

## Events & Lifecycle

28. Debounce window resize (150ms) and scroll (100ms) events
29. Clean up all timers, listeners, subscriptions in `disconnectedCallback()`
30. Extract complex logic (>2 levels nesting) into helper methods with early returns

## Testing

31. Tests follow extracted logic — when logic moves to child, tests move too
32. Test assertions by value/id, not array indices
33. Event spy assertions include `toHaveBeenCalledTimes(n)`
34. No empty `objectContaining({})` — assert at least one property
35. Timer toggles wrapped in `try/finally`
36. Props set via `page.root!` not `page.rootInstance` in tests
37. `jest.useFakeTimers()` called before any `jest.runAllTimers()` usage

## Process

38. All PRs must reference a JIRA ticket in branch name, title, or description
39. Use `npm` for all commands (never `npx`)

## Pre-Commit Checklist

- [ ] No `any` types or `as any` casts
- [ ] JSDoc with behavioral context on all decorated members
- [ ] Immutable state updates
- [ ] Luxon for all dates
- [ ] No hardcoded values — constants, config, SCSS variables
- [ ] Error messages config-driven with fallbacks
- [ ] HTML from config sanitized
- [ ] No `!important` in SCSS
- [ ] Window events debounced with cleanup
- [ ] Tests pass with >90% coverage
- [ ] Build passes with 0 lint errors
- [ ] PR references JIRA ticket
