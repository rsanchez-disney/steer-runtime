# Forge evaluator

Agent evaluation framework for measuring delegation accuracy, output quality, and SDLC compliance.

## Quick start

```bash
cd evals/evaluator
uv run forge-eval run                    # Full evaluation
uv run forge-eval run -c config/fast.yaml  # Quick smoke test
uv run forge-eval list-cases             # Show available test cases
```

## Scoring dimensions

| Dimension | Weight | What it measures |
|-----------|:------:|-----------------|
| delegation_accuracy | 25% | Correct agent selected for task |
| phase_compliance | 20% | Correct SDLC phases followed |
| gate_adherence | 15% | Gates not skipped |
| output_quality | 20% | Actionable, complete, no hallucinations |
| context_efficiency | 10% | Tokens used vs minimum needed |
| tool_discipline | 10% | No forbidden tools called |

## Adding test cases

Create a JSON file in the appropriate `test_cases/` subdirectory:

```json
{
  "prompt": "The prompt to send to the agent",
  "expected_agent": "backend",
  "expected_pattern": "regex to match in output",
  "category": "delegation_accuracy",
  "metadata": { "description": "What this tests" }
}
```

## Configuration

Edit `config/default.yaml` to adjust:

- Timeout and retry settings
- Scoring weights and thresholds
- Report format and output directory

## Architecture

```text
packages/
├── __init__.py       → CLI (click-based)
├── execution/        → Runs agent sessions against test cases
├── scoring/          → Scores results by dimension
└── reporting/        → Generates markdown/JSON reports
```

## Status

Scaffold — execution runner currently returns stub results. Full implementation requires ACP protocol integration for running actual agent sessions.
