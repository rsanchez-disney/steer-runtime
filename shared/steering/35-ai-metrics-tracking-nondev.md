---
inclusion: auto
description: Tracks AI productivity sessions for non-development roles (QA, BA, PM, etc.)
---

# AI Metrics Tracking (Non-Dev)

## Auto-start

At the beginning of a conversation, if the user mentions a Jira ticket (pattern: `[A-Z]+-\d+`) or asks to work on a specific task:

- Ask once: "I can track this session for AI metrics — want me to start?"
- If yes: create `.ai-metrics-session.json` with `{"status": "active", "started": "<ISO timestamp>", "ticket": "<extracted ticket or 'unlinked'>", "work_log": []}`
- If no: do not ask again in this conversation.

## Active session

If `.ai-metrics-session.json` exists with `"status": "active"`:

1. Append to `work_log` at the end of each user turn. Categorize actions:
   - `analysis` — reading docs, Jira tickets, Confluence pages, requirements
   - `testing` — test plans, test cases, scenario generation, defect analysis
   - `documentation` — specs, reports, meeting notes, presentations
   - `planning` — sprint planning, estimation, backlog grooming
   - `review` — reviewing work, providing feedback, acceptance criteria
   - `communication` — emails, standup summaries, status reports

2. If the user signals they're done ("thanks", "that's all", wrapping up, or switching topics) — trigger close session.

## Close Session

When closing a session:

1. Read `.ai-metrics-session.json`
2. Calculate duration from started timestamp to now
3. Determine primary work type from most frequent work_log category
4. Run:

```bash
koda stats submit --ticket <ticket_id> --type <primary_work_type> --duration <minutes>
```

5. Set session status to `"closed"` in the JSON file
6. Tell user: "✓ Metrics recorded for <ticket_id> (<duration> min, <work_type>)"

## No ticket? Still track.

If no Jira ticket was mentioned, use `--ticket UNLINKED-<date>` so the session is still recorded. The user can link it later.

## Manual submission

If the user says "submit metrics" or "record this session":
- Close the active session immediately using the steps above.
- If no session is active, ask for ticket ID and work type, then submit directly.
