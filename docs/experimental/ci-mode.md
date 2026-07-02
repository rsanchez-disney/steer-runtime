# CI Mode (Headless Execution)

> 🧪 **Status:** Experimental
> **Since:** v0.4.207 (Koda)

Run agent prompts headlessly in CI/CD pipelines without interactive UI. Wraps `kiro-cli --print` for automation workflows.

## Quick start

```bash
koda ci run "analyze the test coverage for DPAY-14500"
koda ci run --agent code_review_agent "review the latest commit"
koda ci run --ws app-payment-controls "generate a sprint report"
```

## How it works

- Executes a single prompt against an agent
- Prints the response to stdout (no TUI, no interactive input)
- Exits with code 0 on success, non-zero on failure
- Designed for pipeline integration (GitHub Actions, Harness, Jenkins)

## Use cases

- **Automated code review** on PR creation
- **Sprint report generation** on schedule
- **Test coverage analysis** as a quality gate
- **Documentation generation** after releases
- **Security scanning** in CI pipelines

## Pipeline example (GitHub Actions)

```yaml
- name: AI Code Review
  run: |
    koda ci run --agent code_review_agent \
      "review changes in this PR against coding standards" \
      > review-output.md

- name: Post review comment
  run: gh pr comment $PR_NUMBER --body-file review-output.md
```

## Flags

| Flag | Description |
|------|-------------|
| `--agent` | Agent to use (default: orchestrator) |
| `--ws` | Workspace context |
| `--project` | Target project directory |

## Limitations

- No interactive tool approval — all tools are auto-trusted
- Single-turn only (no conversation follow-up)
- Output is plain text (model's raw response)
- Requires kiro-cli installed in the CI environment
