---
name: jira-user-story-template
description: Jira user story creation and refinement template for Studio Stark (GEW- prefix). Use when creating, formatting, or refining Jira user stories for the Stark team.
---

# Jira User Story Template — Studio Stark (GEW)

## When to activate

- User asks to create a new Jira story for the Stark team
- User asks to format or refine an existing GEW- ticket
- User provides requirements and wants them structured as a user story
- User mentions "user story", "Jira template", or "GEW-" in the context of story creation

## Template

```
As a [type of user], I want [goal], so that [a benefit / a value / a reason]

**Description:**
Provide a detailed description of the user story, including any specific requirements or conditions.

**Deliverable:** [Feature to be delivered as an outcome of the user story]

**Tech Notes:**
[Any technical context, constraints, or implementation notes relevant to the story]

**Attachments:** [Link to relevant documents, designs, or other resources]

**Acceptance Criteria:**
Format: Given <precondition>, When <action>, Then <expected result>

- AC1: Given [...], When [...], Then [...]
- AC2: Given [...], When [...], Then [...]
- AC3: Given [...], When [...], Then [...]
```

## Workflow

1. **Identify the source** — determine if the user is creating from scratch or refining an existing ticket.
2. **If refining an existing ticket** — fetch the ticket from Jira using the `GEW-` prefix (e.g., `GEW-1234`) and extract current content.
3. **Map content to the template** — structure the information using the template format above, applying the field guidance below.
4. **Present for review** — show the formatted story to the user **before** making any Jira updates.
5. **Update only after confirmation** — only update the Jira ticket after the user explicitly approves.

## Field Guidance

| Field | Notes |
|---|---|
| User type | Be specific: "developer", "QA engineer", "platform consumer", "team lead" |
| Goal | One clear action or outcome, not a list |
| Benefit | Business or technical value — avoid vague "so that I can use it" |
| Deliverable | Concrete artifact: library version, API endpoint, migration guide |
| Tech Notes | Angular version constraints, npm registry, peer dependency impacts |
| Acceptance Criteria | Minimum 2 ACs; use Given/When/Then; each must be independently testable |

## Response format

- Output the story in a single markdown code block for easy copy-paste
- Use the exact template structure — do not reorder or rename fields
- If information is missing, use bracketed placeholders (e.g., `[TBD - needs design input]`) rather than omitting sections
- Language: English

## Example

```
As a platform consumer, I want the wdpr-ra-angular-logger package to support structured log levels,
so that I can filter and trace logs consistently across environments.

**Description:**
The current logger implementation does not support structured log levels (DEBUG, INFO, WARN, ERROR).
Consumers need a way to configure log verbosity per environment.

**Deliverable:** Updated wdpr-ra-angular-logger package with log level configuration API

**Tech Notes:**
- Must be backward compatible with existing logger consumers
- Angular 15+ required; peer deps must be updated accordingly
- Publish to internal npm registry

**Attachments:** [Link to design doc or Confluence page]

**Acceptance Criteria:**
- AC1: Given a consumer configures LOG_LEVEL=ERROR, When a DEBUG message is emitted, Then it is suppressed
- AC2: Given a consumer does not configure LOG_LEVEL, When any message is emitted, Then it defaults to INFO level
- AC3: Given the updated package is installed, When existing logger calls are used without changes, Then they continue to work without errors
```

## Constraints

- **Never update Jira without explicit user approval** — always present draft first
- **Project prefix is `GEW-`** — all Stark team stories use this prefix
- **Minimum 2 Acceptance Criteria** — reject stories with fewer than 2 testable ACs
- **Given/When/Then format is mandatory** for all acceptance criteria

## Checklist

- [ ] Story follows "As a / I want / So that" format
- [ ] User type is specific (not generic "user")
- [ ] Goal is a single clear action
- [ ] Benefit states business or technical value
- [ ] Deliverable is a concrete artifact
- [ ] Tech Notes include relevant constraints
- [ ] At least 2 Acceptance Criteria in Given/When/Then format
- [ ] Each AC is independently testable
- [ ] User reviewed and approved before any Jira update
