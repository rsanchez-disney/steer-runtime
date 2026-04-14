# .NET AWS Platform Guidance

AWS usage across supported .NET archetypes should remain:
- explicit
- testable
- mock-friendly
- configuration-driven

Typical patterns:
- S3 through adapter/service abstraction
- queue/topic publishing through interfaces
- explicit request/event models
- no hardcoded credentials
