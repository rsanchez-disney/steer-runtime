# Skill: Backend endpoint implementation (Java WebFlux)

Use when adding or modifying REST endpoints in DCL microservices.

## Checklist
1. Add endpoint in `@RestController` with proper `@GetMapping`/`@PostMapping`/`@PutMapping`
2. Return `Mono<T>` or `Flux<T>` — never block
3. Use `@PathVariable`, `@RequestParam`, `@RequestHeader` for inputs
4. Create response DTO with `@Value @Jacksonized @Builder`
5. Add service interface method + implementation
6. Add OpenAPI annotations (`@Operation`, `@ApiResponses`)
7. Add unit test with Mockito + StepVerifier
8. Verify backward compatibility — no breaking changes to existing DTOs
9. Run `mvn clean verify` to confirm build + coverage
