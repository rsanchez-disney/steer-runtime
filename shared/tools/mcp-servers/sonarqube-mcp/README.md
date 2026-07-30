# SonarQube MCP server

Read-only MCP server for SonarQube — query code quality issues, security hotspots, coverage metrics, and quality gate status.

## Quick start

### 1. Get a token

Generate a user token from your SonarQube instance:
- **SonarCloud:** <https://sonar.cicd.wdprapps.disney.com/account/security>
- **SonarQube Server:** Your Instance > My Account > Security > Generate Token

### 2. Configure credentials

```bash
koda env set SONARQUBE_URL https://sonar.cicd.wdprapps.disney.com    # or your server URL
koda tokens set SONARQUBE_TOKEN
koda env set SONARQUBE_ORG your-org                 # only for SonarCloud
```

### 3. Enable and sync

```bash
koda mcp enable sonarqube
koda sync
```

### 4. Verify

```bash
koda doctor    # should show: ✓ sonarqube
```

### 5. Use it

Ask any agent with `@sonarqube/*` tools:

```text
"What's the quality gate status for my-project?"
"Show me the critical bugs in payment-service"
"What's the test coverage for wdpr-config-services?"
"Find security hotspots in the auth module"
"List all projects in SonarQube"
```

## Available tools

| Tool | Description |
|------|-------------|
| `sq_validate_connection` | Test API connectivity |
| `sq_list_projects` | List projects (with optional name filter) |
| `sq_get_issues` | Search bugs, vulnerabilities, code smells |
| `sq_get_measures` | Get metrics: coverage, bugs, debt, duplication |
| `sq_get_hotspots` | Search security hotspots |
| `sq_get_quality_gate` | Get pass/fail status with condition details |
| `sq_get_source` | View source code lines with annotations |

## Configuration

| Variable | Required | Description |
|----------|:--------:|-------------|
| `SONARQUBE_URL` | Yes | Server URL (default: `https://sonar.cicd.wdprapps.disney.com`) |
| `SONARQUBE_TOKEN` | Yes | User token for authentication |
| `SONARQUBE_ORG` | Cloud only | Organization key for SonarCloud |

## Common metric keys

For `sq_get_measures`, use these metric keys:

| Metric | Description |
|--------|-------------|
| `coverage` | Line coverage % |
| `bugs` | Bug count |
| `vulnerabilities` | Vulnerability count |
| `code_smells` | Code smell count |
| `duplicated_lines_density` | Duplication % |
| `ncloc` | Lines of code |
| `sqale_debt_ratio` | Technical debt ratio |
| `reliability_rating` | A-E reliability rating |
| `security_rating` | A-E security rating |
| `new_coverage` | Coverage on new code |
| `new_bugs` | New bugs since last analysis |

## Development

```bash
cd shared/tools/mcp-servers/sonarqube-mcp
npm install
npm run build
npm run inspector   # interactive testing with MCP Inspector
```

## References

- [SonarQube Web API docs](https://docs.sonarsource.com/sonarqube-server/latest/extension-guide/web-api/)
- [SonarCloud API](https://sonar.cicd.wdprapps.disney.com/web_api)
- [Official SonarQube MCP (Java/Docker)](https://github.com/SonarSource/sonarqube-mcp-server)

<!-- Links -->
[sonarcloud]: https://sonar.cicd.wdprapps.disney.com
[api-docs]: https://docs.sonarsource.com/sonarqube-server/latest/extension-guide/web-api/
