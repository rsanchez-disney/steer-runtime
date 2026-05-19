---
inclusion: auto
description: Tracks AI productivity sessions and records metrics via koda stats submit
---

# AI Metrics Tracking

## Auto-start

If no `.ai-metrics-session.json` exists AND the current branch is a feature branch (not main/master/develop):

- Ask once: "I can track this work for your AI metrics — want me to start a session?"
- If yes: create `.ai-metrics-session.json` with `{"status": "active", "started": "<ISO timestamp>", "ticket": "<extracted from branch>", "work_log": []}`
- If no: do not ask again in this conversation.

## Active session

If `.ai-metrics-session.json` exists with `"status": "active"`:

1. Append to `work_log` at the end of each user turn. Batch significant actions (coding, analysis, unit_testing, documentation, code_review) into a single entry.
2. If the user creates a PR, switches branches, or signals they're wrapping up — trigger close session.

## Close Session

When closing a session:

1. Read `.ai-metrics-session.json`
2. Calculate duration from started timestamp to now
3. Run:

```bash
koda stats submit --ticket <ticket_id> --type <primary_work_type> --duration <minutes> --pr <pr_url_if_available>
```

4. Set session status to `"closed"` in the JSON file
5. Tell user: "✓ Metrics recorded for <ticket_id>"

The `koda stats submit` command auto-detects files changed and line counts from git.

## Manual submission

If the user says "AI metrics", "submit metrics", or "record metrics" followed by a ticket ID:

```bash
koda stats submit --ticket <TICKET_ID>
```

## Non-interactive operations

For resume/start (read-only summaries), delegation to `ai_metrics_tracker_agent` is fine.
