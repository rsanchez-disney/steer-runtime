# CPC Governance

## Coding Best Practices

- Follow platform-specific style guides (Swift for iOS, Kotlin/Java for Android, Angular for Web)
- All code must pass SonarQube quality gates before merge
- Unit test coverage targets per domain (see project-config.json per repo)
- No hardcoded secrets — use environment variables and secure vaults
- Prefer small, focused PRs over large monolithic changes
- All PRs require at least one peer review + TL approval for critical paths

## Documentation Standards

- Every new feature must include a Jira ticket with acceptance criteria
- Architecture decisions documented as ADRs in the relevant repo
- API changes require updated OpenAPI/Swagger specs
- Release notes maintained per sprint cycle
- Runbooks for operational procedures (incident response, rollback)

## Jira Hygiene Rules

- All work tracked in Jira under the correct project (IEXP, AEXP, COREEXP)
- Use correct issue types: Story for features, Defect/Bug for bugs, Task for engineering work
- Do NOT file engineering tasks (SonarQube, CI/CD, refactors) as Defect/Bug
- Epic Links must be set for all sustainment and feature work
- Sprint assignments updated by Wednesday of sprint planning week
- Status transitions: Open → In Progress → Code Review → Ready for Testing → Closed
- Labels required: domain label, release version, environment

## Review Processes

### Code Review
- All PRs reviewed within 24 hours
- TL or Architect approval required for architecture, security, and schema changes

### Sprint Review
- Demo of completed work every 2 weeks
- Stakeholder sign-off on acceptance criteria

### Release Review
- Release candidate validated in Stage environment
- QA sign-off required before production deployment
- Rollback plan documented for every release

## Operational Expectations

- On-call rotation for critical production issues
- P1 incidents acknowledged within 15 minutes
- Post-incident reviews within 48 hours
- NewRelic crash rate monitored daily
- SLA: 99.9% uptime for core platform services

## Cross-Domain Coordination

- Weekly sync between domain TMs (Tuesday)
- Dependency conflicts escalated to Delivery Manager within 24 hours
- Shared component changes require notification to all consuming domains
- Breaking API changes require 2-sprint deprecation notice

## Capacity Planning

- Capacity reviewed monthly by PM + TM
- Utilization target: 85% (15% buffer for unplanned work)
- New engagements require capacity assessment before commitment
- POD composition changes require 2-week notice
