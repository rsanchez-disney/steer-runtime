# Code Review Checklist by Language

## All Languages (Universal)

- [ ] No business logic in controllers/handlers
- [ ] Repository pattern for data access
- [ ] No direct DB access across service boundaries
- [ ] Feature flags for new user-facing features
- [ ] Backward-compatible API changes
- [ ] Error handling: meaningful messages, no swallowed exceptions
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] Input validation on all external data
- [ ] No sensitive data in logs
- [ ] Test coverage for new code paths

## PHP (Connect / Laravel)

- [ ] CodeIgniter conventions followed (Connect monolith)
- [ ] Models extend correct base classes
- [ ] `appetize_lib/` used for shared code (not duplicated)
- [ ] gRPC client via `MicroServiceClient/ConnectorCommon.php`
- [ ] SQL queries parameterized (no string concatenation)
- [ ] Auth middleware applied to new routes
- [ ] Null coalescing used (`??`) over ternary chains
- [ ] PHPUnit tests with Mockery for mocks

## Go (Microservices)

- [ ] `cmd/` for entry points, `internal/` for business logic
- [ ] Proper error wrapping (`fmt.Errorf` with `%w`)
- [ ] Context propagation through call chain
- [ ] Structured logging (not `fmt.Println`)
- [ ] gRPC proto backward compatibility (no field removal)
- [ ] `defer` for resource cleanup
- [ ] No goroutine leaks (proper context cancellation)
- [ ] Table-driven tests

## React/TypeScript (Frontend)

- [ ] Redux/RTK state management patterns followed
- [ ] MUI 5 component usage (no custom CSS for covered cases)
- [ ] TypeScript strict mode (no `any` types)
- [ ] API calls through service layer (not in components)
- [ ] No `dangerouslySetInnerHTML`
- [ ] Accessibility attributes (aria-* where needed)
- [ ] Memoization where appropriate (React.memo, useMemo)
- [ ] Jest tests with React Testing Library

## Kotlin (Android)

- [ ] MVVM/MVP pattern adherence
- [ ] Domain module independent of Android framework
- [ ] Hilt DI properly scoped
- [ ] No `!!` — safe calls, Elvis operator
- [ ] No hardcoded dispatchers (injectable)
- [ ] All three business models considered
- [ ] Resources for strings/dimensions/colors
- [ ] Complete import statements (no wildcards)
- [ ] MockK-based tests with proper tearDown
