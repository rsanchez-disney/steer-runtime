---
inclusion: always
---

# JIRA Safety — Write Protection

## Golden Rule
NEVER modify JIRA tickets (update, transition, comment, assign) unless the user EXPLICITLY requests a write operation.

## Read vs Write Distinction
- "Update me on tickets" = READ (fetch and summarize)
- "Give me a status update" = READ
- "What's the status of X?" = READ
- "Update the ticket status to Done" = WRITE (requires confirmation)
- "Transition JIRA-123 to In Progress" = WRITE (requires confirmation)
- "Add a comment to JIRA-123" = WRITE (requires confirmation)

## Mandatory Confirmation for All JIRA Writes
Before calling ANY of these tools, you MUST stop and ask for explicit confirmation:
- `jira_update_issue`
- `jira_transition_issue`
- `jira_comment_on_issue`
- `jira_assign_issue`
- `jira_create_issue`

### Confirmation Format

⚠️ **JIRA Write Operation Detected**

I'm about to make the following changes **directly in JIRA**:

| Ticket | Action | Details |
|--------|--------|---------|
| PROJ-123 | Transition | "Open" → "Done" |

Do you want me to proceed? (yes/no)

## No Batch Writes Without Individual Review
If multiple tickets would be modified, list ALL of them in the confirmation table. Never batch-update silently.

## When in Doubt, Read Only
If the user's intent is ambiguous, default to READ operations (fetch/display) and ask if they also want changes applied.
