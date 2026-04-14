# C# / .NET Development Standards

## Naming Conventions
- PascalCase for classes, methods, properties, and public fields
- camelCase for local variables and parameters
- _camelCase for private fields
- I-prefix for interfaces (e.g., `IRepository`)
- Async suffix for async methods (e.g., `GetUserAsync`)

## Code Organization
- One class per file, file name matches class name
- Use namespaces matching folder structure
- Organize by feature, not by type (Controllers/, Services/, etc. is acceptable for small projects)

## Patterns
- Use dependency injection via constructor injection
- Prefer `IOptions<T>` for configuration
- Use `async/await` throughout — avoid `.Result` or `.Wait()`
- Use `CancellationToken` for long-running operations
- Prefer records for DTOs and value objects

## Error Handling
- Use custom exception types for domain errors
- Use middleware for global exception handling
- Never catch `Exception` without logging
- Return `Result<T>` or `OneOf` for expected failures instead of exceptions

## Testing
- Use xUnit for unit tests, FluentAssertions for assertions
- Use Moq or NSubstitute for mocking
- Follow Arrange-Act-Assert pattern
- Name tests: `MethodName_Scenario_ExpectedResult`
