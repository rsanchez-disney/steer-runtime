---
inclusion: auto
description: Tracks AI productivity sessions via .ai-metrics-session.json — appends to work_log and triggers close-session workflow when wrapping up
---

# AI Metrics Tracking

## Auto-start

If no `.ai-metrics-session.json` exists AND the current branch is a feature branch (not main/master/develop):

- Ask once: "I can track this work for your AI metrics form — want me to start a session?"
- If yes: delegate to `ai_metrics_tracker_agent` to create the session file.
- If no: do not ask again in this conversation.

## Active session

If `.ai-metrics-session.json` exists in the project root and has `"status": "active"`:

1. Append to its `work_log` at the end of each user turn. Batch all significant actions from the turn (coding, analysis, unit_testing, documentation, code_review) into a single write.
2. If the session has a `pr_url` AND the user starts a new task, switches branches, or signals they're wrapping up — ask: "Ready to close the AI metrics session?"

## Close Session

This workflow is conversational — always execute it directly in the main conversation, never delegate to a subagent. Follow the workflow in the `ai_metrics_tracker_agent` agent prompt:

1. Read the session file
2. Ask the 3 required questions and WAIT for answers
3. Generate the form and present with the Google Form link

## Non-interactive operations

For resume/start (read-only summaries), delegation to `ai_metrics_tracker_agent` is fine.
