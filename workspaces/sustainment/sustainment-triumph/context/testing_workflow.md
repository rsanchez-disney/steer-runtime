# Testing Workflow — Triumph

## How We Test Tickets

When a ticket moves to testing (code already reviewed, merged to latest):
1. Another dev picks it up for verification
2. Testing is **black-box** — call APIs, check responses, verify logs
3. Do NOT do code reviews — that already happened before merge

## Testing Approach

- **Mode:** Black-box API testing against `latest` environment
- **Tool:** Bruno collections (handles auth automatically)
- **What to verify:** Response correctness, expected logs, documentation output

## How to Test

1. Read the ticket's Acceptance Criteria from Jira
2. Identify which endpoint(s) are affected by the change
3. Use Bruno MCP `run_request` with environment `latest`
4. Validate the response matches the ACs
5. If the AC mentions logs, check Splunk for expected log entries

## Important

- If getting 401: use Bruno (not curl) — it handles token refresh
- Do NOT default to code review when asked to "test" a ticket
- All our services have Bruno collections with pre-configured auth
