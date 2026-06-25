# Self-Healing Rules

When a sub-agent delegation fails, follow this recovery protocol before reporting failure to the user.

## Failure Classification

| Error Pattern | Type | Retryable |
|---|---|---|
| "timeout", "timed out", "deadline exceeded" | timeout | ✅ with reduced scope |
| "connection refused", "ECONNREFUSED", "socket hang up" | mcp_connection | ✅ with fallback tool |
| "not found", "unknown agent" | agent_missing | ❌ report to user |
| "permission denied", "403", "unauthorized" | permission | ❌ report to user |
| "context limit", "token limit", "too large" | context_overflow | ✅ with reduced context |
| "rate limit", "429", "too many requests" | rate_limit | ✅ after 30s pause |

## Fallback Chains

When the primary tool source fails, try the fallback:

| Primary | Fallback | Notes |
|---|---|---|
| @jira/* tools (jira-mcp) | Compass `jira_tool_*` | Different auth path |
| @confluence/* tools | Compass `confluence_tool_*` | Different auth path |
| @github/* tools | `execute_bash` + `gh` CLI | Requires gh auth |
| mem_* tools (memory-mcp) | yax_* tools | Different scope but functional |
| Splunk MCP | Compass `splunk_tool_query_splunk` | Same data, different route |

## Recovery Protocol

```
1. DETECT  → Sub-agent returns error or no response after timeout
2. CLASSIFY → Match error text to failure type above
3. DECIDE:
   - If NOT retryable → skip to step 6
   - If retryable → continue to step 4
4. RETRY (max 1 attempt):
   - timeout → re-delegate with simplified instruction ("focus only on X")
   - mcp_connection → re-delegate with fallback tool chain
   - context_overflow → re-delegate with "summarize briefly" instruction
   - rate_limit → wait 30s, then re-delegate identical instruction
5. LOG → yax_save(type=discovery, title="Self-heal: {agent} {failure_type} → {outcome}")
6. REPORT → Tell user clearly:
   - What failed
   - What recovery was attempted (if any)
   - What the user can do manually
```

## Anti-patterns

- ❌ Never retry permission/auth errors (will fail identically)
- ❌ Never retry more than ONCE per failure per session
- ❌ Never silently swallow errors — always inform the user
- ❌ Never retry with identical parameters on timeout (must reduce scope)
- ❌ Never cascade retries (if fallback also fails, stop)

## Examples

### Jira MCP timeout
```
Original: delegate to story_analyzer_agent → "Read DPAY-14500 and extract all details"
Failure: jira-mcp timeout after 30s
Recovery: delegate to story_analyzer_agent → "Read DPAY-14500 — summary and acceptance criteria only (skip comments, history)"
```

### Confluence MCP connection refused
```
Original: delegate to technical_writer_agent → "Read wiki page at confluence.disney.com/x/abc123"
Failure: confluence-mcp ECONNREFUSED
Recovery: delegate to technical_writer_agent → "Use Compass confluence tools to read page ID abc123"
```

### Context overflow on large PR review
```
Original: delegate to code_review_agent → "Review PR #847 (142 files changed)"
Failure: context limit exceeded
Recovery: delegate to code_review_agent → "Review PR #847 — focus on src/main/ changes only, skip test files and configs"
```
