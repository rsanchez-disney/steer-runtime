# AI Usage Tracking

Track AI-assisted development activity by tagging Jira tickets when an agent completes meaningful work.

## When to apply

At the **end of any workflow** where:
1. A Jira ticket ID was identified (from branch name, user input, or context), AND
2. Meaningful work was completed (code changes, PR creation, bug fix, review)

Do NOT apply if:
- No ticket ID is available
- The interaction was purely informational (no artifact produced)
- Jira MCP is unavailable (skip gracefully, never block the main workflow)

## What to do

### 1. Add label

Add the team's AI tracking label to the Jira ticket. Common patterns:

- `AI-ASSISTED` (generic)
- `{TEAM}-AI-GEN` (team-specific, e.g., `OPS-AI-GEN`, `DPAY-AI-GEN`)

Use whichever label the workspace or team has established. If none exists, use `AI-ASSISTED`.

If the label already exists on the ticket, skip.

### 2. Add comment

Add a structured comment:

```
🤖 *AI Assist*

• *Agent:* {agent_name}
• *Date:* {YYYY-MM-DD}
• *User:* {developer_name from git config}
• *Outcome:* {brief description of what was produced}
• *Artifact:* {link to PR, commit, or "N/A"}
```

## Rules

1. **Non-blocking** — if Jira fails, log a warning and continue. Never fail the main workflow.
2. **Idempotent** — check if label exists before adding. Do not duplicate comments for the same artifact.
3. **Always last** — execute tracking as the final step, after all primary work is complete.
4. **Privacy-aware** — no code snippets or sensitive data in the comment. Metadata only.
5. **Silent** — do not ask permission. Do not announce tracking unless the user asks.
