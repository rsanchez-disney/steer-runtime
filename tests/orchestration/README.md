# Orchestrator Delegation Test Harness

Automated tests to verify orchestrator agents **delegate** to specialists instead of executing tasks directly.

## Usage

```bash
# Run all scenarios
./runner.sh --all

# Dry-run (shows what would execute)
./runner.sh --all --dry-run

# Run a specific scenario
./runner.sh scenarios/orchestrator/01-analyze-story.json
```

## Requirements

- `kiro-cli` installed and accessible
- `python3` for JSON parsing
- A valid kiro-cli session (authenticated)

## How it works

1. Spawns kiro-cli in ACP mode with the target orchestrator agent
2. Sends the scenario prompt via JSON-RPC
3. Captures all tool calls in the response stream
4. Validates:
   - **Delegation happened**: `subagent` tool was called
   - **Correct agent selected**: Expected specialist appears in the output
   - **No direct execution**: Forbidden tools were not called by the orchestrator itself

## Scenario format

```json
{
  "name": "scenario-id",
  "description": "Human-readable description",
  "agent": "orchestrator",
  "prompt": "The task to send",
  "expect": {
    "delegated": true,
    "agents_called": ["exact_agent_name"],
    "agents_called_any": ["one_of_these", "or_these"],
    "forbidden_tools": ["tool_orchestrator_should_not_call_directly"]
  },
  "timeout_seconds": 60
}
```

- `agents_called`: ALL listed agents must be invoked
- `agents_called_any`: AT LEAST ONE must be invoked
- `forbidden_tools`: None should be called directly by the orchestrator (calls via subagent are OK)

## Results

After a run, results are saved to `results/summary.json`:

```json
{
  "results": [
    {"name": "analyze-story", "status": "PASS", "subagent_calls": 2},
    {"name": "triage-incident", "status": "FAIL", "subagent_calls": 0}
  ],
  "total": 6,
  "passed": 5,
  "failed": 1
}
```

Raw ACP output per scenario is saved to `results/{name}.jsonl`.

## Adding scenarios

Create a new `.json` file in `scenarios/{orchestrator_name}/`. The runner discovers all `*.json` files when using `--all`.
