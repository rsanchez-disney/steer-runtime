# CPC Technology

## Scope

- Code quality monitoring (SonarQube gates, coverage trends)
- CI/CD pipeline health and failure analysis
- Crash rate monitoring and triage automation
- Architecture decision support
- Dependency and SDK version tracking
- Security vulnerability assessment

## Engineering Standards

### Code Quality
- SonarQube quality gates enforced on all PRs
- Coverage targets defined per repo in project-config.json
- SwiftLint (iOS), Detekt (Android), ESLint (Web)

### CI/CD
- Jenkins pipelines for build, test, deploy
- Automated regression suites per platform
- Stage environment validation before production

### Crash Management
- NewRelic monitored daily for new crash signatures
- Top crashes triaged weekly by Shield POD
- Permanent fixes prioritized over per-release workarounds

### Security
- Dependency scanning via Nexus IQ
- Security vulnerabilities remediated within SLA
- Red Team findings escalated immediately

## Data Sources

- GitHub Enterprise (github.disney.com)
- NewRelic (crash data)
- SonarQube (code quality)
- Jenkins (CI/CD pipelines)
