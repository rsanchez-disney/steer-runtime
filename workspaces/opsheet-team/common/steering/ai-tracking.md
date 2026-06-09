---
inclusion: auto
---

# AI Usage Tracking

## Purpose

Track AI-assisted development activity by tagging Jira tickets whenever an agent or skill completes work related to a ticket. This enables team-level reporting on AI adoption and impact.

---

## When to Apply

At the **end of any workflow** where:
1. A Jira ticket ID was identified (from branch name, user input, or context), AND
2. The agent/skill completed meaningful work (code changes, PR creation, bug fix, review, etc.)

Do NOT apply if:
- No ticket ID is available
- The interaction was purely informational (no code/PR/artifact produced)
- The Jira MCP is unavailable (skip gracefully, do not block the workflow)

---

## What to Do

### 1. Add Label

Add the label `OPS-AI-GEN` to the Jira ticket:

```
Label: OPS-AI-GEN
```

This label is the primary reporting mechanism. Use JQL to query:
- `labels = "OPS-AI-GEN"` — all AI-touched tickets
- `labels = "OPS-AI-GEN" AND project = OPS` — scoped to OpSheet

If the label already exists on the ticket, skip (do not duplicate).

### 2. Add Comment

Add a structured comment to the ticket with the following format:

```
🤖 *AI Assist — {skill_or_agent_name}*

• *Agent:* {agent_name}
• *Skill:* {skill_name} (e.g., opsheet-create-pr, opsheet-ui-bugfix)
• *Date:* {YYYY-MM-DD}
• *User:* {developer_name}
• *Outcome:* {brief description of what was produced}
• *Artifact:* {link to PR, commit, or "N/A"}
```

**Example:**

```
🤖 *AI Assist — opsheet-create-pr*

• *Agent:* dev-web/ui
• *Skill:* opsheet-create-pr
• *Date:* 2026-06-04
• *User:* Ignacio Smirlian
• *Outcome:* PR created with full pre-push validation
• *Artifact:* https://github.disney.com/wdpr-parkops-opsheet-suite/wdpr-payment-controls-client/pull/78
```

---

## Resolution Logic

### Ticket ID Detection

The ticket ID is typically already available from the workflow. Common sources:
1. **Branch name**: `feat/OPS-34523-description` → `OPS-34523`
2. **User input**: explicitly provided by the developer
3. **Jira MCP context**: fetched earlier in the workflow

### Skill Name Detection

Use the skill or agent that was active during the workflow:
- If a named skill was invoked (e.g., `opsheet-create-pr`), use that name
- If running as a general agent (e.g., `ui` agent), use `"{profile}/{agent}"`
- If unclear, use `"{profile}/general"`

### User Detection

Derive the user from:
1. Git config: `git config user.name`
2. The Slack notification user (if Step 6 of PR skill was executed)
3. Ask the user if neither is available

---

## Rules

1. **Non-blocking** — if Jira MCP fails or the ticket doesn't exist, log a warning and continue. Never fail the main workflow for tracking.
2. **Idempotent** — do not add duplicate labels or comments. Check if `OPS-AI-GEN` label already exists before adding.
3. **Minimal overhead** — this should add < 2 seconds to any workflow. One label update + one comment.
4. **Privacy-aware** — do not include code snippets, file contents, or sensitive data in the comment. Keep it to metadata only.
5. **Always last** — execute tracking as the final step, after all primary work is complete (but before Slack notification if both apply).
6. **Skip for pure reads** — if the user only asked a question and no artifact was produced, do not track.

---

## Reporting

Teams can generate reports using JQL:

| Report | JQL |
|--------|-----|
| All AI-assisted tickets | `labels = "OPS-AI-GEN" AND project = OPS` |
| AI-assisted in current sprint | `labels = "OPS-AI-GEN" AND sprint in openSprints()` |
| AI-assisted bugs | `labels = "OPS-AI-GEN" AND issuetype = Bug` |
| AI-assisted features | `labels = "OPS-AI-GEN" AND issuetype = Story` |
| AI adoption over time | `labels = "OPS-AI-GEN" AND created >= -30d` |

For deeper analysis (which skills, frequency per developer), query the ticket comments for the `🤖 AI Assist` pattern.
