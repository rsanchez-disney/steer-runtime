# Skill: Backend bugfix triage (Java WebFlux)

Use when triaging and fixing bugs in DCL microservices.

## Workflow
1. Reproduce — identify endpoint, request params, and upstream dependencies
2. Check logs — look for correlation ID, error messages, circuit breaker state
3. Check Resilience4j — is a circuit breaker open? Is retry exhausted?
4. Check MongoDB — is the data correct? Index performance?
5. Identify root cause in controller/service/DAO layer
6. Fix with minimal diff
7. Add or update test covering the bug scenario (StepVerifier)
8. Run `mvn clean verify` to confirm build + coverage
