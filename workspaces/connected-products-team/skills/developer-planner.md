---
name: developer-planner
description: Builds companion TODO documents from Jira tickets to guide implementation. Use when starting work on a ticket to plan tasks before coding.
---

# Developer Planner Skill

## Purpose

Generate structured TODO documents that break a Jira ticket into actionable implementation tasks. The TODO lives in the project's `agents-playground/` folder and serves as the execution plan for the developer skill workflow.

## When to Use

- When starting work on a new Jira ticket
- When the user asks to plan or break down a ticket into tasks
- When creating a companion document for an implementation

## Context

- **Jira instance**: disneyexperiences.atlassian.net (Jira Cloud)
- **Projects**: SHOWREADY, SARG
- **Acceptance Criteria field**: `customfield_10166` (ADF format)
- **User Story field**: `customfield_20000` (wiki markup panels)

## TODO Document Rules

### File Location & Naming

- Place in `<project>/agents-playground/<TICKET-ID>-todo.md`
- Example: `agents-playground/SHOWREADY-562-todo.md`

### Header Section (required)

Every TODO document must start with:
- **Ticket link** (full URL: `https://disneyexperiences.atlassian.net/browse/<TICKET-ID>`)
- **Metadata**: type, priority, fix version (from Jira)
- **Branch name** following the developer skill convention: `<type>/<TICKET-ID>_<short_description>`
- **Summary**: 1-3 sentence plain-language description of what the ticket accomplishes
- **Key constraints/decisions**: any notable constraints from ticket comments or description (e.g., "no backward compatibility required")

### Task Breakdown Rules

1. **Group tasks by layer** — data model, service layer, API layer, cleanup
2. **Each task must be a checkbox** (`- [ ]`) so progress is trackable
3. **Tasks must be implementation-specific** — not vague ("update code") but precise ("add `fieldName` to `ModelClass`")
4. **Extract requirements directly from the ticket** — do not invent features beyond what the ticket describes
5. **Respect the user's PR strategy** — if the user specifies multiple PRs, separate tasks by PR with clear labels

### Test Strategy Section (fixed rule — do not ask)

**PR #1 — Implementation only:**
- Contains all code changes (data model, service, API, cleanup)
- If existing tests break due to the changes, fix them minimally
- Broken test fixes follow the developer skill's "When Tests Break" checklist (changelog entry with "Breaks Tests" marker)
- No new tests are added in this PR

**PR #2 — New tests only:**
- Contains all new test cases covering every required path
- No production code changes
- Follows the developer skill's "Test-only PRs" rule

### Definition of Done Section (required)

Always end with a definition-of-done checklist that includes:
- [ ] All implementation tasks completed
- [ ] Build passes (detect tool: `mvn clean test -s settings.xml` / `npm test` / `dotnet test` / `flutter test` / etc.)
- [ ] CHANGELOG.md updated
- [ ] Code committed and pushed
- [ ] PR created against base branch

## Deriving Tasks from Ticket Content

When reading a Jira ticket, extract tasks from:

1. **Description** — data model changes, API changes, flow descriptions
2. **User Story custom field** (`customfield_20000`) — business rules → validation logic tasks; technical requirements → concrete code tasks
3. **Acceptance Criteria** (`customfield_10166`) — if present, map each criterion to a verifiable task
4. **Comments** — constraints, decisions, scope reductions (e.g., "no migration needed")

## Interaction Guidelines

- If the ticket is ambiguous about scope, ask the user before assuming
- If the user provides additional constraints (PR split, test strategy, phasing), incorporate immediately
- Keep the document concise — no prose explanations between tasks, just headers and checkboxes
- Update the TODO document in-place when the user refines the plan
