---
inclusion: on-demand
trigger: "bruno|api test|api collection|REST test|endpoint test|contract test"
description: "Bruno API testing guidelines — loaded when task involves API testing or collections"
---

# API Testing with Bruno MCP

## When to Use Bruno (vs curl)

| Scenario | Use Bruno | Use curl |
|----------|-----------|----------|
| Endpoint requires OAuth/token auth | ✅ Bruno handles token refresh | ❌ Manual token management |
| Team has existing Bruno collection | ✅ Reuse existing requests | ❌ Recreating from scratch |
| Need to test against multiple environments | ✅ Environment configs built-in | ❌ Manual URL/token swapping |
| Quick one-off public endpoint | ❌ Overkill | ✅ Simple and fast |
| CI/CD integration testing | ✅ Repeatable, scriptable | ❌ Not maintainable |

## Workflow: Testing an Authenticated Endpoint

1. **Find the Bruno collection** — ask the agent to locate `.bru` files in your project:
   ```
   Find Bruno collections in this project
   ```

2. **Run a specific request** — use the `run_request` tool with the right environment:
   ```
   Run the GET /explorer/items request from the Bruno collection using the "development" environment
   ```

3. **Override variables if needed** — pass env vars for specific values:
   ```
   Run the request with envVars: { "ITEM_ID": "12345" }
   ```

## Available Bruno MCP Tools

| Tool | Purpose |
|------|---------|
| `run_request` | Execute a single .bru file against an environment |
| `run_collection` | Execute all requests in a collection folder |
| `create_collection` | Create a new Bruno collection structure |
| `create_request` | Generate a .bru request file |
| `create_environment` | Create environment config (URLs, tokens, variables) |
| `add_test_script` | Add assertions/test scripts to a request |
| `create_test_suite` | Generate a full test suite from OpenAPI/Gherkin |
| `list_collections` | Discover collections in a directory |
| `get_collection_stats` | Get request/test counts for a collection |

## Environment Setup

Bruno environments store auth tokens and base URLs. Typical structure:

```
collection/
├── environments/
│   ├── development.bru    # dev tokens, localhost URLs
│   ├── staging.bru        # stage tokens, stage URLs
│   └── production.bru     # prod tokens (read-only)
├── explorer/
│   ├── get-items.bru
│   └── create-item.bru
└── bruno.json
```

## Tips

- Always specify `--env` when running requests that need auth
- If getting 401, check that the environment has a valid token or token-refresh pre-request script
- Use `--insecure` for internal services with self-signed certs
- The agent can read `.bru` files to understand available requests before running them
