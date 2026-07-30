# Chat and prompts — quick start guide

How to interact with agents via `koda chat` — interactive, headless, and scripted modes.

## Interactive mode (default)

Start a conversation with an agent:

```bash
koda chat                                    # default agent + workspace
koda chat --agent backend                    # specific agent
koda chat --ws my-team                       # specific workspace
koda chat --ws my-team --agent orchestrator  # both
```

Choose your runtime:

```bash
koda chat --target kiro                      # Kiro CLI (default)
koda chat --target claude                    # Claude Code
koda chat --target geai --model claude-sonnet-4-6  # GEAI
```

## Headless mode (non-interactive)

Send a single prompt, get a response, exit. Useful for scripting, CI/CD, and automation.

```bash
koda chat --headless "What's the status of DPAY-15944?"
```

### With workspace and agent

```bash
koda chat --headless --ws payments --agent story_analyzer_agent "Summarize DPAY-15944"
```

### With a specific runtime

```bash
koda chat --headless --target claude "Explain this error: connection timeout on port 8080"
koda chat --headless --target geai --model claude-sonnet-4-6 "List my open PRs"
```

### Capture output in scripts

```bash
# Store result in a variable
result=$(koda chat --headless --agent backend "What does the retry logic do in payment-service?")

# Pipe to a file
koda chat --headless "Generate a test plan for auth-service" > test-plan.md

# Use in CI pipeline
if koda chat --headless "Are there any critical SonarQube issues in my-project?"; then
  echo "Quality check passed"
fi
```

## Key flags

| Flag | Description |
|------|-------------|
| `--headless` | Non-interactive: send prompt, print response, exit |
| `--target <runtime>` | Runtime: `kiro`, `cursor`, `claude`, `geai` |
| `--agent <name>` | Use a specific agent |
| `--ws <workspace>` | Use a specific workspace |
| `--model <model>` | Model override (GEAI/Claude) |
| `--trust-all` | Skip tool approval prompts |
| `--global` | Use `~/.kiro` only (ignore local `.kiro/`) |

## Headless behavior

- Sends the prompt to the agent
- Agent processes (including MCP tool calls, auto-approved)
- Response prints to stdout
- Process exits with code 0 (success) or non-zero (error)
- All MCP tools available (Jira, Confluence, Compass, SonarQube, etc.)
- Implies `--trust-all` (no interactive approval prompts)

## Limitations

- **Subagent delegation in kiro target:** `--headless` with `--target kiro` doesn't fully support subagent spawning. Use a non-delegating agent (e.g., `story_analyzer_agent`) or `--target claude`/`--target geai`.
- **Context size:** headless mode loads agent prompt + context + steering into a single turn. Very large context may be truncated.

## Examples by use case

### Jira ticket lookup

```bash
koda chat --headless --agent story_analyzer_agent "What's the status of PROJ-1234?"
```

### Code review summary

```bash
koda chat --headless --agent code_review_agent "Review the changes in the last commit of payment-service"
```

### Generate documentation

```bash
koda chat --headless --agent technical_writer_agent "Write a README for the auth-gateway service" > README.md
```

### Sprint planning

```bash
koda chat --headless --agent planner_agent "Break down this feature into tasks: add retry logic to payment processing"
```

### Automated quality check (CI)

```bash
#!/bin/bash
result=$(koda chat --headless --target geai "Check SonarQube quality gate for payment-service. Reply PASS or FAIL only.")
if [ "$result" = "PASS" ]; then
  echo "Quality gate passed"
  exit 0
else
  echo "Quality gate failed: $result"
  exit 1
fi
```

## Runtime comparison for headless

| Runtime | Subagent support | Speed | Cost |
|---------|:----------------:|:-----:|:----:|
| `--target kiro` | ⚠️ Limited | Fast | Free (Kiro license) |
| `--target claude` | ✅ Via `--agents` | Medium | ~$0.05-0.30/turn |
| `--target geai` | ✅ Full | Medium | Free (GEAI API key) |

## See also

- [Supported runtimes](../../README.md#supported-runtimes) — full comparison
- [Atlassian ROVO MCP guide](ATLASSIAN_ROVO_MCP.md) — Jira/Confluence integration
- [Claude Code integration plan](https://github.disney.com/SANCR225/Koda/blob/main/docs/plans/claude-code-integration.md) — architecture details
