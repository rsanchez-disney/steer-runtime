---
name: dotnet-self-host-api-skill
description: Reusable workflow for building enterprise self-hosted .NET APIs with thin controllers, explicit DI, Swagger documentation, health checks, and testable architecture.
---

# .NET Self-Host API Skill

Use when:
- studio is `dotnet`
- projectArchetype is `self-host-api`

Primary outcomes:
- predictable API structure
- clean separation of concerns
- company common reuse
- mock-friendly external seams
- strong testing coverage for touched logic

Workflow:
1. Read project-config.json
2. Inspect target project, company common library, and reference project
3. Propose a short implementation plan
4. Implement controller, service, options, registration, and adapter changes
5. Add or update tests
6. Summarize run steps and commit note
