# Dev Java Profile

**Java Spring Boot WebFlux specialist for DCL reactive microservices**

Requires `dev-core` as a base.

---

## Agents (1)

### backend
Java specialist for Spring Boot 3 WebFlux reactive microservices.

**Use when:**
- REST endpoint development (reactive `Mono`/`Flux`)
- Service layer business logic
- MongoDB reactive data access
- External service integration with WebClient + Resilience4j
- JUnit 5 + Mockito + StepVerifier testing
- Spring configuration and profiles

---

## Tech Stack

- Java 17, Spring Boot 3 WebFlux (Netty)
- Spring Data MongoDB Reactive
- Resilience4j (circuit breaker + time limiter + retry)
- Caffeine caching
- Lombok, Log4j2 (structured JSON)
- JUnit 5 + Mockito + StepVerifier + Instancio
- JaCoCo 84% branch coverage
- Spotless + OpenRewrite formatting
- Maven with Disney parent POM

---

## Quick Start

```bash
koda install dev-core dev-dcl-java

kiro-cli chat --agent backend
> "Add a new reactive endpoint for voyage activities with Resilience4j"
```

---

## Structure

```
profiles/dev-dcl-java/
├── agents/
│   └── backend.json
├── prompts/
│   └── backend.md
├── context/
│   └── java_conventions.md
├── steering/
│   └── 20-repo-backend-java.md
├── skills/
│   ├── backend-endpoint-implementation.md
│   ├── backend-dao-implementation.md
│   ├── backend-reactive-service.md
│   └── backend-bugfix-triage.md
├── powers/              # Reusable power scripts
└── tools/               # Build/test utilities
```

---

**Profile Version:** 3.0
**Agents:** 1
**Last Updated:** April 22, 2026
