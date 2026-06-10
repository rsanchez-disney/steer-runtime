---
name: jira-ticket-creator
description: Creates Jira tickets for Parks mobile team with proper structure, epics, and templates. Use when the user asks to create a Jira ticket, file a bug, log a story, create a defect, or requests ticket creation for Android (AEXP), iOS (IEXP), or Flutter (COREEXP) projects.
---

# Jira Ticket Creator Skill

## Purpose

Create well-structured Jira tickets for the Parks mobile team. Gather required information, apply templates, and create the ticket with correct project, epic, and fix version.

## Required Information

When asked to create a ticket, collect the following. If not provided, **ask the user** (skip optional fields if user says so):

| Field | Required | Options |
|-------|----------|---------|
| **Type** | Yes | `story`, `tech debt`, `defect`, `task` |
| **Summary** | Yes | Brief title (will be prefixed per type rules) |
| **Description** | Yes | Detailed description of the work |
| **Technology** | Yes | `Android` → AEXP, `iOS` → IEXP, `Flutter` → COREEXP |
| **Area** | Yes | See Epic Mapping below |
| **Target Version** | Optional | `8.23`, `8.24`, `9.0`, `9.x`, or omit |
| **Story Points** | Optional | `1`, `2`, `3`, `5`, `8`, `13` — defaults to `3` if not provided |
| **Brands** | Optional | `DLR`, `WDW`, `HKDL` — defaults to all three if not specified |
| **Assignee** | Optional | Email or display name — defaults to the ticket creator if not specified |
| **Priority** | Optional | `1 - Critical`, `2 - High`, `3 - Medium`, `4 - Low` — defaults to `3 - Medium`, or `2 - High` if the issue involves a crash |

## Type Rules

| Type | Jira Issue Type | Summary Prefix |
|------|-----------------|----------------|
| `story` | Story | (none) |
| `tech debt` | Story | `[ENG] ` |
| `defect` | Bug | (none) |
| `task` | Task | (none) |

## Technology → Project Mapping

| Technology | Project Key |
|------------|-------------|
| Android | AEXP |
| iOS | IEXP |
| Flutter | COREEXP |

## Area → Epic Mapping

| Area | Epic Android | Epic iOS |
|------|--------------|----------|
| Sustainment | AEXP-92 | IEXP-1027 |

> **Note:** Fill in the Epic Keys above as they become known. When an epic key is `_TBD_`, skip the epic link and mention it in the output.

> **Important:** Do NOT use `customfield_10008` for epic linking — it is not available on the create screen. Instead, use the `epicKey` parameter in `additional_fields` (e.g., `{"epicKey": "AEXP-92"}`), which the MCP Jira tool supports natively.

## Studio & Feature Fields

These fields MUST be set on every ticket. When cloning a ticket, copy the Studio and Feature values from the source ticket.

### Studio (`customfield_20001` — select)

Default value: `CoreIS - Experience | Jain`

Always set this unless the user explicitly provides a different Studio.

### Feature (`customfield_17600` — cascading select)

| Condition | Feature Value |
|-----------|--------------|
| HKDL-only ticket (brands = HKDL only) | `Shield HKDL Sustainment` |
| All other tickets | `Shield Tech Sustainment` |

Logic:
- If brands are specified and the **only** brand is `HKDL` → use `Shield HKDL Sustainment`
- Otherwise (DLR, WDW, multiple brands, or all brands) → use `Shield Tech Sustainment`

### Setting in `additional_fields`

```json
{
  "customfield_20001": {"value": "CoreIS - Experience | Jain"},
  "customfield_17600": {"value": "Shield Tech Sustainment"}
}
```

For HKDL-only:
```json
{
  "customfield_20001": {"value": "CoreIS - Experience | Jain"},
  "customfield_17600": {"value": "Shield HKDL Sustainment"}
}
```

## Fix Version Format

When a target version is provided, set the fix version(s) based on technology and brands:

- **Brands**: Use the specified brands, or all three (`DLR`, `WDW`, `HKDL`) if none specified
- **Android**: `{brand} {version} Android` for each brand (e.g., `DLR 8.23 Android`)
- **iOS**: `{brand} {version} iOS` for each brand
- **Flutter**: Use project-specific version format (check existing tickets)

Examples:
- Brands: all, version 8.23, Android → `DLR 8.23 Android`, `WDW 8.23 Android`, `HKDL 8.23 Android`
- Brands: DLR + WDW, version 9.0, Android → `DLR 9.0 Android`, `WDW 9.0 Android`

## Templates

### Story / Tech Debt Template

```
### Description

{description}

### Implementation Details

- {bullet points of implementation approach}

### Acceptance Criteria

- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion 3}
```

### Defect Template

```
### Description

{description}

### Steps to Reproduce

1. {step 1}
2. {step 2}
3. {step 3}

### Expected Behavior

{expected}

### Actual Behavior

{actual}

### Environment

- App: {DLR/WDW/HKDL}
- Build: {version}
- Device: {device info}
```

### Task Template

```
### Description

{description}

### Scope

- {what is included}

### Notes

- {any relevant notes}
```

## Workflow

1. Parse user request for any provided fields
2. Ask for any missing **required** fields
3. Confirm optional fields or skip
4. Apply the appropriate template
5. Apply summary prefix rules
6. Create the ticket using `jira_create_issue` with:
   - `project_key` from technology mapping
   - `issue_type` from type mapping
   - `summary` with prefix applied
   - `description` from template
   - `assignee` — use provided value, or default to the current user (ticket creator)
   - `additional_fields` for epic link, fix versions, story points, Studio, and Feature (when available)
7. Report the created ticket key and URL

### Cloning Behavior

When cloning an existing ticket, copy the **Studio** and **Feature** values from the source ticket. If the source ticket does not have these fields set, apply the defaults documented above.

## Story Points

- Ask the user for story points as an optional field
- If not provided, default to **3**
- Use the `story_points` or `customfield_10004` field (check project configuration)
- Valid values: 1, 2, 3, 5, 8, 13

## Example Interaction

**User:** Create a ticket for the debug analytics helper we just added

**Agent:** I need a few details:
- **Type:** story, tech debt, defect, or task?
- **Technology:** Android, iOS, or Flutter?
- **Area:** (e.g., Sustainment, Analytics, Infrastructure...)
- **Target version:** (optional — 8.23, 8.24, 9.0, 9.x, or skip)

**User:** Tech debt, Android, Sustainment, 8.23

**Agent:** _(creates ticket with [ENG] prefix, AEXP project, description template, fix versions)_
