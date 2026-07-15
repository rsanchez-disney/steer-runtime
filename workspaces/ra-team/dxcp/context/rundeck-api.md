# Rundeck API Reference (DXCP)

## Connection

- **URL:** https://rundeck.wdprapps.disney.com
- **API Version:** 52 (vault uses 36)
- **Auth:** `X-Rundeck-Auth-Token` header
- **Token location:** `RUNDECK_API_TOKEN` env or `.rundeck/token.key`

## Available Commands (via scripts/rundeck-api.sh)

| Command | Purpose |
|---------|--------|
| `list-projects [--filter regex]` | List projects, optional regex filter |
| `job-info <job-uuid>` | Get job details (id, name, project, group, enabled, permalink) |
| `verify-project <job-uuid> <project>` | Verify job exists in specified project |
| `execution-status <exec-id>` | Get execution status (id, status, project, dates, permalink) |
| `execution-output <exec-id>` | Get execution log output as text |
| `run-job <job-uuid> [--options-json file]` | Execute a job (REQUIRES user approval) |

## Usage

```bash
# List projects matching a pattern
./scripts/rundeck-api.sh list-projects --filter 'dxcp'

# Check job details
./scripts/rundeck-api.sh job-info <uuid>

# Review execution output
./scripts/rundeck-api.sh execution-status <exec-id>
./scripts/rundeck-api.sh execution-output <exec-id>
```

## Key Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| List projects | GET | /api/52/projects |
| Job detail | GET | /api/52/job/{uuid} |
| Job executions | GET | /api/52/job/{uuid}/executions |
| Execution status | GET | /api/52/execution/{id} |
| Execution output | GET | /api/52/execution/{id}/output |
| Run job | POST | /api/52/job/{uuid}/run |

## Safety Rules

1. **Read-only by default** — `run-job` requires explicit user approval before execution
2. Token is never printed or logged
3. Job verification should precede execution (verify-project before run-job)
