# AI Metrics Tracking

Track AI-assisted development work automatically and generate Google Form-compatible reports at the end of a feature branch.

## How it works

The `ai_metrics_tracker_agent` agent maintains a `.ai-metrics-session.json` file in your project root. This file persists across conversations, context compactions, and interfaces (CLI/IDE) — any tool that reads the project root picks it up.

The tracking is branch-based: one session per feature branch, keyed by branch name.

## Starting a session

### Automatic (recommended)

When you start working on a feature branch, the steering rule detects there's no active session and asks:

> "I can track this work for your AI metrics form — want me to start a session?"

Say yes and tracking begins silently.

### Manual

```
Start an AI metrics tracking session
```

```
Track AI metrics for this branch
```

```
Start AI metrics
```

## During development

No action needed. The steering rule appends to the work log automatically as you work:

- **coding** — file creation/modification
- **analysis** — research, doc reading, ticket analysis
- **unit_testing** — test generation
- **documentation** — PR descriptions, summaries
- **code_review** — review comment responses

## Closing a session

The agent asks you to close when it detects wrap-up signals (PR created + switching tasks). You can also close manually:

```
Close the AI metrics session
```

The close workflow asks 3 questions:

1. How many days would this have taken without AI?
2. How many days did it actually take with AI?
3. Did we do any unit/integration testing?

Then it generates the Google Form output with pre-filled variation percentages inferred from the work log.

## Output

The agent produces:
- A filled metrics form ready to paste into the [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSeqlnsHZjIwxGxtVXmaKXBz584Nv4U7plbeY0UYOkxVp_bYBw/viewform)
- Optional Jira field updates (delegated to `ai_metrics_agent` — requires ops profile)

## AI Tool mapping

Kiro CLI and Kiro IDE map to the corresponding "Amazon Q (Claude \<model\>)" option in the form since they run on Amazon Q infrastructure.

## Tradeoffs vs ai_metrics_agent (ops)

| | ai_metrics_tracker_agent (dev-core) | ai_metrics_agent (ops) |
|---|---|---|
| When | During development | After PR is done |
| Input | Observed work log | Developer recall |
| Setup | Requires active steering rule | Zero setup, invoke on-demand |
| Persistence | Branch-based file on disk | None (single conversation) |
| Best for | Multi-day/multi-session work | Quick one-off reports |

Both produce the same Google Form output and Jira field updates.
