# Skill: Go shared library development

Use when creating or modifying shared Go libraries consumed by multiple services.

## Steps

1. Define the public API (exported types, functions, interfaces)
2. Implement with minimal dependencies
3. Add comprehensive tests (the library is a dependency for many services)
4. Update `go.mod` version if breaking changes (major version bump)
5. Update README with usage examples
6. Tag release following semver

## Checklist

- [ ] Public API is minimal and well-documented (GoDoc comments on all exports)
- [ ] No unnecessary external dependencies
- [ ] Backward compatible (additive changes only for minor/patch)
- [ ] Breaking changes require major version bump (`/v{N}` in module path)
- [ ] Tests cover all exported functions and edge cases
- [ ] README includes usage examples
- [ ] No hardcoded configuration — accept options via functional options or config structs
- [ ] Context propagation supported where applicable
- [ ] `make test && make lint` passes
