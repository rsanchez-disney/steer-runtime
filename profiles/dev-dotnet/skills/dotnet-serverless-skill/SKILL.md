---
name: dotnet-serverless-skill
description: Reusable workflow for building .NET serverless applications with thin handlers, service orchestration, explicit contracts, and testable AWS adapter seams.
---

# .NET Serverless Skill

Use when:
- studio is `dotnet`
- projectArchetype is `serverless`

Primary outcomes:
- clean handler boundaries
- explicit event/request contracts
- company common reuse where appropriate
- mock-friendly AWS integration
- strong testing coverage for touched logic

Workflow:
1. Read project-config.json
2. Inspect target project, company common library, and reference project
3. Propose a short implementation plan
4. Implement handler, service, options, contract, and adapter changes
5. Add or update tests
6. Summarize run steps and commit note
