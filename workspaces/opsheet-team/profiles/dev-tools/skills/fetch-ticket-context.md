---
name: fetch-ticket-context
description: Fetch and cache JIRA ticket context for the current session
skill: true
---

# Fetch Ticket Context

## When to Use

Only when the user explicitly asks to fetch, load, or pull context from a JIRA ticket.

Trigger phrases: "fetch OPS-1234", "load ticket OPS-5678", "pull context for OPS-9999", "get ticket OPS-1234".

Do NOT activate when:
- A ticket ID is merely mentioned in conversation
- A ticket ID appears in a branch name or commit message
- The user references a ticket without asking to fetch it

## Steps

1. Check if `.kiro/context/{TICKET_ID}_context.md` already exists — if it does, read it and skip to step 6
2. Fetch the ticket using `mcp_jira_jira_get_issue` with `ticketId: "{TICKET_ID}"`
   - If the call fails (network error, ticket not found, auth expired), inform the user with the error details and stop — do not create a partial context file
3. Fetch attachment metadata using `mcp_jira_jira_get_attachments` with `ticketId: "{TICKET_ID}"` (list only, do not download)
   - If this call fails, proceed without attachments and note "Attachment fetch failed" in the Attachments section
4. Write `.kiro/context/{TICKET_ID}_context.md` using the format below
5. If any image attachments look relevant to the issue (screenshots, error captures), ask the user if they want them downloaded before proceeding
6. Confirm to the user: context is cached at `.kiro/context/{TICKET_ID}_context.md`

## Referencing Context During the Session

- When you need ticket details mid-task, use `readFile` on `.kiro/context/{TICKET_ID}_context.md`
- Do NOT call JIRA MCP again for the same ticket during the session
- If the user says the ticket was updated and asks to refresh, delete the file and re-run from step 2

## Cleanup

- Context files are temporary and gitignored — they persist across messages but not across sessions
- When a workflow that uses this skill completes (e.g., defect-resolution step 6), delete `.kiro/context/{TICKET_ID}_context.md`
- If the user explicitly says the task is done or starts working on a different ticket, delete the previous context file
- If image attachments were downloaded, remind the user to clean up `.amazonq/external-data/attachments/{TICKET_ID}/`

## Template for `{TICKET_ID}_context.md`

```markdown
# {TICKET_ID}: {Summary}

**Status:** {Status} | **Priority:** {Priority}
**Components:** {Comma-separated, or "None"}
**Labels:** {Comma-separated, or "None"}

## Description

{Full description from ticket, preserving any formatting}

## Acceptance Criteria

{Extracted from description or dedicated field — if absent, write "Not specified in ticket"}

## Attachments

{Bulleted list: filename (type/size), or "None"}

## Session Notes

{Leave empty — use this section to jot observations during the investigation}

---
*Cached on {YYYY-MM-DD}. Delete when task is complete.*
```

## Rules

- The context file lives in `.kiro/context/` which is gitignored — never commit it
- If the ticket description is empty or vague, write that in the context file and flag it to the user immediately
- Keep the context file as a faithful representation of the ticket — do not editorialize in the main sections
- The "Session Notes" section is the only place to add investigation notes during the session
