# dev-java Profile

Java + Spring Boot development profile for senior-level engineering.

## Agents

| Agent | Description |
|-------|-------------|
| `java_senior_agent` | Senior Java engineer — Spring Boot 3, Java 8–21, best practices, anti-pattern detection |

## Context Files

| File | Purpose |
|------|---------|
| `java_spring_conventions.md` | Java + Spring Boot coding standards, patterns, and conventions |

## Capabilities

- Spring Boot 3 microservice development
- Anti-pattern detection (God classes, N+1 queries, missing transactions, field injection, etc.)
- Code review with severity-based feedback
- Java version-aware recommendations (8 → 21)
- REST API design following resource-oriented patterns
- JUnit 5 + Mockito test generation

## Usage

Add `dev-java` to your workspace's `profiles` array:

```json
{
  "profiles": ["dev-core", "dev-java"]
}
```
