# Koda stats — usage and metrics guide

Track AI-assisted development metrics and runtime usage statistics.

## Usage statistics

### View your usage

```bash
koda stats usage              # last 30 days
koda stats usage --days 7     # last week
koda stats usage --days 90    # last quarter
```

Output:

```text
📊 Usage Report (last 30 days)
Total sessions: 148 (avg 23s per session)

By runtime:
  kiro       │████████████████████  62%  (92)
  geai       │████████████          25%  (37)
  claude     │████                  10%  (15)
  cursor     │██                     3%  (4)

By workspace (top 5):
  steer-platform       │████████████  40%  (59)
  default              │████████      28%  (41)
  payments             │████          15%  (22)

By agent (top 5):
  orchestrator         │██████████    35%  (52)
  story_analyzer       │██████        20%  (30)
  backend              │████          12%  (18)
```

### How it works

- Every `koda chat` session automatically records an event
- Data stored locally at `~/.kiro/telemetry/usage.jsonl`
- Fields: timestamp, runtime (target), workspace, agent, duration, headless flag
- No network calls, no PII, never leaves your machine

## AI development metrics

### Submit a session

After completing work on a Jira ticket:

```bash
koda stats submit --ticket DPAY-1234
```

This records:
- Ticket ID
- Time spent
- Files changed (auto-detected from git)
- Lines added/removed
- PR URL (if available)

### With explicit values

```bash
koda stats submit \
  --ticket DPAY-1234 \
  --type coding \
  --duration 45 \
  --pr https://github.disney.com/DisneyPaymentsOrg/payment-service/pull/123
```

### Work types

| Type | When to use |
|------|-------------|
| `coding` | Feature implementation, bug fixes |
| `analysis` | Investigation, research, ticket analysis |
| `unit_testing` | Writing or fixing tests |
| `documentation` | READMEs, docs, comments |
| `code_review` | Reviewing PRs |
| `planning` | Breaking down stories, sprint planning |

### View metrics summary

```bash
koda stats                    # last 7 days
koda stats --days 30          # last month
```

## Automatic tracking

The steer platform can auto-track metrics during your sessions. When enabled via the `ai-metrics-tracking` steering rule:

1. Starts tracking when you begin working on a feature branch
2. Records actions (coding, testing, documentation) as you go
3. Submits automatically when you create a PR or switch branches

To enable, ensure `35-ai-metrics-tracking.md` is in your steering directory.

## Privacy

- All usage data is local (never transmitted)
- AI metrics (when submitted) go to your team's tracking system
- No keystrokes, prompts, or responses are recorded
- Only metadata: which tool, how long, which ticket
