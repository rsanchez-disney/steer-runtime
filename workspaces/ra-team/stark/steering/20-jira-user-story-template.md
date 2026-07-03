---
inclusion: auto
description: Jira user story creation template for Stark team
---

# Jira User Story Template — Studio Stark (GEW)

Use this template when creating or refining Jira user stories for the Stark team (project prefix: `GEW-`).

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

## Usage Instructions

When asked to create or update a Jira story for the Stark team:

1. Fetch the ticket from Jira using the `GEW-` prefix (e.g., `GEW-1234`)
2. Map the existing content to this template structure
3. Present the formatted result to the user for review **before** updating Jira
4. Only update the ticket after explicit user confirmation

## Field Guidance

| Field | Notes |
|---|---|
| User type | Be specific: "developer", "QA engineer", "platform consumer", "team lead" |
| Goal | One clear action or outcome, not a list |
| Benefit | Business or technical value — avoid vague "so that I can use it" |
| Deliverable | Concrete artifact: library version, API endpoint, migration guide |
| Tech Notes | Angular version constraints, npm registry, peer dependency impacts |
| Acceptance Criteria | Minimum 2 ACs; use Given/When/Then; each must be independently testable |

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
