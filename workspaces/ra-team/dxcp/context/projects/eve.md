# EVE

## Project Brief

EVE — platform automation and event-driven orchestration for DXCP infrastructure operations.

### Key Features
- Event-driven automation workflows
- Platform operational orchestration
- Automated responses to infrastructure events
- Integration with DXCP monitoring and alerting

### Target Users
- DXCP platform engineers building automation
- SRE team managing operational responses
- Teams needing automated platform actions

### Key Patterns
- Event-driven architecture
- Workflow orchestration
- Automated remediation
- Observable automation (audit trail)

## Technology Stack

### Repository & CI/CD
- Host: github.disney.com
- Org: wd-cp
- Branch strategy: feature branches → main via PR
- Conventional Commits required

### Integration Points
- DXCP monitoring and alerting systems
- Rafay cluster management
- AWS services (EKS, CloudWatch, SNS)
- Rundeck (job execution)
- ServiceNow (incident management)

### Key Constraints
- Automation must be idempotent
- All actions must be auditable
- Fail-safe defaults (no destructive actions without gates)
- Secrets managed externally
