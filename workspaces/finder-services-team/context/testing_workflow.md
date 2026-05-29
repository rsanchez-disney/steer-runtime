# Testing Workflow — Finder Services

## How We Test Tickets

When a ticket passes code review and is deployed to `latest`:
1. Read the Jira ticket ACs and understand what the change does
2. Build black-box test cases based on the service context and ticket requirements
3. Execute test cases by calling the service APIs in the `latest` environment
4. Review responses AND logs to verify correctness
5. Generate a test report with pass/fail results

## Key Rules

- Testing is **black-box** — call APIs, check responses and logs
- Do NOT do code reviews — code was already reviewed before merge
- Test cases come from: ticket ACs + service context (endpoints, expected behavior)
- Always test against `latest` environment

## Test Case Generation

For each ticket, generate test cases that cover:
- **Happy path** — expected input → expected output
- **Edge cases** — boundary values, empty inputs, max limits
- **Error cases** — invalid input → proper error response
- **Regression** — existing functionality still works

## Execution

- Use Bruno MCP (`run_request`) with environment `latest` for API calls
- If Bruno collection doesn't have the request, create one or use curl
- Check Splunk/logs for expected log entries when the AC mentions logging
- Validate response schema, status codes, and business logic

## Report Format

After testing, provide:
- Test cases executed (table: case, input, expected, actual, pass/fail)
- Any failures with details
- Logs evidence if relevant
- Recommendation: pass/fail/needs-fix
