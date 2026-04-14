# Skill: Angular standalone component creation

Use when creating a new Angular component following modern patterns.

## Checklist
1. Create component — standalone by default, no `standalone: true` needed
2. List all dependencies in `imports: []` explicitly
3. Use `input()` / `input.required()` for inputs (not `@Input()`)
4. Use `output()` for outputs (not `@Output()`)
5. Use `signal()` / `computed()` for local state
6. Use `inject()` for dependency injection (not constructor injection)
7. Add route with `loadComponent` for lazy loading
8. Write Jest tests with component in `imports` (not `declarations`)
9. Use `overrideComponent` to mock component-level providers
10. Verify ≥80% test coverage
