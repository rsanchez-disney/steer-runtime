# Java Conventions

## Code Style

- Follow Google Java Style Guide or project-specific style guide
- Organize code into packages by feature or layer (`service`, `resource`, `repository`)
- Prefer immutability and thread safety
- Document public APIs with Javadoc
- Format with `mvn formatter:format`

## Method Contracts

- Methods should not return `null` unless specifically useful — use exceptions, `Optional`, empty collections, or static objects instead
- If `null` is accepted as a parameter or returned, document its meaning in Javadoc
- Variables assigned from multiple execution paths should not be pre-initialized (let the compiler enforce assignment)

## Null Checks

Perform null checks only when a value could reasonably be null:
- Input from external systems (file/network I/O, API entry points)
- Methods that explicitly allow null returns

Do not add defensive null checks on internal method calls that should never return null.

## Exception Handling

- Wrap checked exceptions in a runtime exception specific to the higher-level operation
- When catching an exception, pass it as the `cause` of another exception or into a logger to preserve debug info
- Handle runtime exceptions at high-level components that control execution
- Avoid anonymous functions when they are complex enough to warrant a unit test

## Logging

- Use Log4j2 with `LogManager.getLogger()`
- Logging libraries are split into API and implementation — only one implementation should be active
- For APIs other than Log4j2 (SLF4J, JCL), add the appropriate bridge jar to route to Log4j2

## Dependency Management

- Use Maven (`pom.xml`) with semantic versioning
- Prefer BOMs in `dependencyManagement` when possible
- Run `mvn clean verify` after updating dependencies
- Remove unused dependencies

## Testing

- Use JUnit for unit and integration tests
- Test files use `*ImplTest.java` suffix
- Mock dependencies with Mockito
- Prefer `assertThat` over other assertions for better failure messages
- Cover both happy path and failure scenarios
- Aim for ≥80% coverage
