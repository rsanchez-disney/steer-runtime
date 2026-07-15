# Skill: Reactive service implementation

Use when implementing business logic in service layer.

## Checklist
1. Create service interface with `Mono<T>` / `Flux<T>` return types
2. Create `@Service` implementation with `@RequiredArgsConstructor`
3. Use `Mono.zip()` for parallel DAO calls
4. Use `flatMap()` for sequential dependent calls
5. Use `switchIfEmpty()` for fallback values
6. Handle partial responses: set `isPartialResponse=true` when upstream fails
7. Use mapper classes (static methods) for DAO→DTO transformation
8. Add `@Cacheable` with Caffeine for expensive operations
9. Test with JUnit 5 + Mockito + StepVerifier
10. Verify no `.block()` calls
