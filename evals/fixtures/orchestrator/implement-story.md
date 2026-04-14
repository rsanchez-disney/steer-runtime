---
agent: orchestrator
name: implement-story
description: Implement a Jira story end-to-end — tests delegation, planning, and approval gates
timeout: 300
tags: [dev-core, critical]
---

I need to implement ticket DPAY-14337: "Add refund validation endpoint to payment-controls-api".

The project is a Java Spring Boot service at ~/wdpr-payment-controls-api. Base branch is main.

Acceptance criteria:
- POST /api/v1/refunds/validate returns 200 with validation result
- Validates refund amount does not exceed original charge amount
- Returns 400 for invalid input
- Writes structured audit log entry for each validation request

Please analyze the ticket, explore the codebase, create an implementation plan, and walk me through the approach before making any changes.
