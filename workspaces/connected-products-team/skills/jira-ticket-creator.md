---
name: jira-ticket-creator
description: Creates Jira tickets with structured user stories and descriptions. Asks the user for field values or extracts them from a sample ticket. Use when the user wants to create a new Jira ticket.
---

# Jira Ticket Creator Skill

## Purpose

Create well-structured Jira tickets with a formatted description using colored ADF panels (User Story, Business Rules, Technical Requirements, Assumptions).

## When to Use

- When the user asks to create a new Jira ticket
- When the user provides requirements and wants them turned into a story
- When the user wants to update an existing ticket (e.g., add a missing description, update content)

## Context

- **Jira instance**: disneyexperiences.atlassian.net (Jira Cloud)
- **Projects**: SHOWREADY, SARG
- **Tool for creating tickets**: `cloud_jira_create_issue` (from jira-cloud MCP)
- **Tool for updating fields (description, custom fields)**: `mcp_atlassian_editjiraissue` with `contentFormat: "adf"` (from atlassian MCP)
- **Tool for reading tickets**: `cloud_jira_get_issue` or `mcp_atlassian_getjiraissue`
- **cloudId for Atlassian MCP**: `disneyexperiences.atlassian.net`

### Custom Fields

| Field | ID | Format | Set Via |
|-------|-----|--------|---------|
| User Story | `customfield_10267` | ADF | `mcp_atlassian_editjiraissue` (after creation) |
| Acceptance Criteria | `customfield_10166` | ADF | `mcp_atlassian_editjiraissue` (after creation) |

**Important:** Custom fields cannot be set during `cloud_jira_create_issue`. Create the ticket first, then update with `mcp_atlassian_editjiraissue` using `contentFormat: "adf"`.

## Workflow

### Creating a ticket
1. Gather the ticket content (summary, description, user story, business rules, technical requirements, assumptions)
2. Gather field values (project, priority, labels, story points, epic, etc.)
3. Show the user a preview of the ticket content
4. **⏸ CHECKPOINT — User confirms before creation**
5. Create the ticket via `cloud_jira_create_issue` (summary, project, type, priority, labels)
6. Update the description via `mcp_atlassian_editjiraissue` with `contentFormat: "adf"` using colored panels
7. Report back with the ticket key and link

### Updating a ticket
1. Fetch the existing ticket to understand its current content
2. Identify what's missing or needs updating
3. Generate the content using the ADF panel templates below
4. Show the user a preview and confirm before updating
5. **⏸ CHECKPOINT — User confirms before update**
6. Update via `mcp_atlassian_editjiraissue` with `contentFormat: "adf"`

## Gathering Field Values

### Required fields — always ask or resolve:
- **Project** (SHOWREADY or SARG)
- **Summary** (ticket title)
- **Issue Type** (Story, Task, Bug, Sub-task)
- **Priority** (e.g., 3 - Medium)

### Optional fields — ask if not provided:
- **Labels** (comma-separated)
- **Story Points**
- **Epic Link**
- **Fix Version**
- **Assignee**
- **Components**
- **Sprint**

### Using a sample ticket

The user may say:
- "Use the same values as SHOWREADY-500" → fetch that ticket and copy project, labels, priority, story points, epic, fix version
- "Take the labels from SHOWREADY-500" → fetch only that specific field

When the user provides a sample ticket:
1. Fetch the ticket via Jira API
2. Extract the requested field values
3. Confirm with the user before applying

## Description Format — ADF Colored Panels

The description uses **ADF (Atlassian Document Format)** with colored `panel` nodes. This is the ONLY format that renders colored panels on Jira Cloud.

### Panel Type Mapping

| Section | ADF `panelType` | Rendered Color |
|---------|----------------|----------------|
| User Story | `success` | Green |
| Business Rules | `info` | Blue |
| Technical Requirements | `warning` | Yellow |
| Assumptions | `error` | Red/Orange |

### ADF Template for Description

Use `mcp_atlassian_editjiraissue` with `contentFormat: "adf"` and pass this structure in the `description` field:

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "panel",
      "attrs": { "panelType": "success" },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "User Story", "marks": [{ "type": "strong" }] }]
        },
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "As a ", "marks": [{ "type": "strong" }] },
            { "type": "text", "text": "<role>, I want <goal> so that <benefit>" }
          ]
        }
      ]
    },
    {
      "type": "panel",
      "attrs": { "panelType": "info" },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Business Rules", "marks": [{ "type": "strong" }] }]
        },
        {
          "type": "bulletList",
          "content": [
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Rule 1" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Rule 2" }] }] }
          ]
        }
      ]
    },
    {
      "type": "panel",
      "attrs": { "panelType": "warning" },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Technical Requirements", "marks": [{ "type": "strong" }] }]
        },
        {
          "type": "bulletList",
          "content": [
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Requirement 1" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Requirement 2" }] }] }
          ]
        }
      ]
    },
    {
      "type": "panel",
      "attrs": { "panelType": "error" },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Assumptions", "marks": [{ "type": "strong" }] }]
        },
        {
          "type": "bulletList",
          "content": [
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Assumption 1" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Assumption 2" }] }] }
          ]
        }
      ]
    }
  ]
}
```

### What does NOT work

- **Wiki markup** (`{panel:title=...|bgColor=...}`) — renders as raw text on Jira Cloud
- **Markdown with panel syntax** — not supported
- **`cloud_jira_update_issue`** — cannot set description in ADF format (use `mcp_atlassian_editjiraissue` instead)

## Acceptance Criteria Custom Field

Field ID: `customfield_10166`

This field is **separate from the description** and rendered as its own section in Jira. It must be written in **ADF format**.

### When to populate

- Always populate when creating Stories
- Populate for Tasks and Bugs when the user provides clear done-criteria
- When updating a ticket, check if this field is empty and offer to populate it

### ADF Template for Acceptance Criteria

```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Given <precondition>, when <action>, then <expected result>" }] }]
        },
        {
          "type": "listItem",
          "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Given <precondition>, when <action>, then <expected result>" }] }]
        }
      ]
    }
  ]
}
```

### Guidelines for Acceptance Criteria content

- Use Given/When/Then format where possible
- Each criterion should be independently testable
- Cover the happy path, edge cases, and error scenarios
- Keep criteria specific and measurable — avoid vague language like "should work correctly"
- If the user provides free-form criteria, reformat them into structured bullet points in ADF

## Tool Usage Summary

| Action | Tool | Format |
|--------|------|--------|
| Create ticket (basic fields) | `cloud_jira_create_issue` | plain text for summary |
| Update description (colored panels) | `mcp_atlassian_editjiraissue` | `contentFormat: "adf"`, pass ADF JSON in `fields.description` |
| Update User Story field | `mcp_atlassian_editjiraissue` | `contentFormat: "adf"`, pass ADF JSON in `fields.customfield_10267` |
| Update Acceptance Criteria | `mcp_atlassian_editjiraissue` | `contentFormat: "adf"`, pass ADF JSON in `fields.customfield_10166` |
| Add formatted comment | `mcp_atlassian_addcommenttojiraissue` | `contentFormat: "markdown"`, use `# heading` + `[text](url)` syntax |
| Read ticket | `cloud_jira_get_issue` or `mcp_atlassian_getjiraissue` | — |

**cloudId for all Atlassian MCP calls**: `disneyexperiences.atlassian.net`

## Interaction Guidelines

- If the user provides a complete description of what they want, generate the ADF panels and confirm before creating
- If the user is vague, ask clarifying questions to fill in the panels
- Always show the user a preview of the summary and panel content before creating/updating
- If the user says "use values from TICKET-XXX", fetch that ticket and extract the relevant fields
- After creation, report the ticket key with a link: `https://disneyexperiences.atlassian.net/browse/<KEY>`

## Error Handling

- If `mcp_atlassian_editjiraissue` rejects a field, check the field ID and ensure ADF format is correct
- If `cloud_jira_create_issue` fails, report the exact error and suggest corrections
- If a custom field is rejected with "not on appropriate screen", use `mcp_atlassian_editjiraissue` instead (it has broader field access)
- If no MCP tools are available, inform the user to configure their Jira Cloud PAT
