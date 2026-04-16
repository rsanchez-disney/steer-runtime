# .NET Testing Strategy

Defaults:
- xUnit
- Moq
- readable fakes/builders where useful
- deterministic tests

Minimum focus:
- success path
- validation failure
- dependency failure
- mapping behavior
- no live infrastructure in unit tests
