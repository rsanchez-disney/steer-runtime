---
name: generate-user-manual
description: Generate a consistent user manual for a feature module, combining Jira ticket details with BA-provided context
---

# Generate User Manual

Create a structured, end-user-facing manual for a feature module. Ensures consistency across teams regardless of which BA writes it.

## When to Use

- A feature has been fully implemented and needs user-facing documentation
- A module needs a manual for training, onboarding, or support reference
- Multiple BAs need to produce manuals with the same structure and quality bar

## Prerequisites

- Feature module name (e.g., "Schedule Management", "Alert Configuration")
- At least one of:
  - Jira epic or story IDs related to the feature
  - BA-provided description of the feature's purpose and user flows
- MyWiki/Confluence MCP configured (for publishing)

---

## Workflow

### Step 1: Gather Feature Context

1. Ask the BA for:
   - **Module name** (used as the manual title)
   - **Target audience** (e.g., Operations Cast Members, Managers, Admins)
   - **Jira references** (epic ID, key story IDs) — optional but recommended
   - **Figma file/frame URL** — optional but recommended for visual reference
   - **Any additional context** not captured in Jira (edge cases, known quirks, tips)
2. If Jira IDs are provided:
   - Fetch the epic and its child stories via MCP
   - Extract: summary, acceptance criteria, permissions, validations
3. If visual context is needed (UX flows, screenshots, component states):
   - Ask the BA to provide screenshots, screen recordings, or exported Figma frames directly
   - Request UX flows and interaction patterns as descriptions or attached images
   - Ask the BA to identify key screens to reference in the manual (navigation paths, form layouts, table views)
   - Request any annotations or comments from the UX designer that clarify intended behavior
   - Note: Do NOT use the Figma MCP/Power to fetch designs — rate limits make it unreliable for documentation workflows
4. If Confluence/MyWiki pages exist for the feature:
   - Search for related design docs or specs
   - Pull relevant details (UX flows, screenshots references, architecture notes)

### Step 2: Identify Manual Sections

Based on the gathered context, determine which sections apply. All manuals MUST include sections 1–5. Sections 6–9 are included when applicable.

### Step 3: Generate the Manual

Write the manual following the **Output Structure** below. Use clear, non-technical language appropriate for the target audience.

### Step 4: Review with BA

Present the draft to the BA for review:
- Flag any sections where information was assumed or incomplete
- Ask for screenshots or visual references to include
- Confirm permission descriptions match current implementation

**⏸ CHECKPOINT — BA reviews and approves before publishing**

### Step 5: Publish

1. Save a local markdown copy to `workspaces/opsheet-team/context/user-manuals/<module-name-kebab>.md`
2. Publish to Confluence using the MyWiki MCP:
   - **Space:** `OPSHEET` (always — regardless of which BA or team is publishing)
   - **Parent page:** "User Manuals" (create if it doesn't exist)
   - **Page title:** `<Module Name> — User Manual`
   - If the page already exists, update it (increment version); do not create duplicates
3. Provide the BA with the Confluence URL and local file path

---

## Cross-Linking & Prerequisites Strategy

Many features depend on prior configuration in shared modules (e.g., Entity Management). To avoid duplication and keep manuals focused:

1. **Shared/foundational modules get their own manual** (e.g., "Entity Management — User Manual"). This is the single source of truth for configuration steps.
2. **Feature manuals link to prerequisites** rather than duplicating setup instructions. Each feature manual includes a "Prerequisites" section (see Section 1.1 in the template below) that:
   - Names the prerequisite module(s)
   - Links to the specific manual (Confluence page)
   - Calls out which specific screens/configurations are required for this feature
   - Example: *"Entities must have Wait Time lanes configured. See [Entity Management — User Manual > Lane Configuration](link)."*
3. **Keep the boundary clear:** If a step happens in Entity Management, it belongs in the Entity Management manual. The feature manual only describes what the user does *within the feature itself*.
4. **Confluence parent structure:**
   ```
   User Manuals (parent page)
   ├── Entity Management — User Manual
   │   ├── Overview & Navigation
   │   ├── <Tab Name> (e.g., Wait Time Configuration)
   │   ├── <Tab Name> (e.g., Schedule Configuration)
   │   ├── <Tab Name> (e.g., Alert Configuration)
   │   └── ... (one child page per tab)
   ├── Wait Times — User Manual          (links to Entity Management > Wait Time Configuration)
   ├── Schedule Management — User Manual  (links to Entity Management > Schedule Configuration)
   ├── Alert Configuration — User Manual  (links to Entity Management > Alert Configuration)
   └── ...
   ```
5. **Entity Management is organized by tabs.** Since Entity Management contains a tab for each feature's configuration, its manual should be structured as one child page per tab. This allows feature manuals to deep-link directly to the relevant tab's page (e.g., *"See [Entity Management > Wait Time Configuration](link)"*) rather than linking to the entire Entity Management manual.
6. **Each tab page follows the same template** as a regular feature manual (sections 2–9 from the Output Structure), scoped to that tab's functionality only.
7. **Reference Tables (dropdown data sources).** Many dropdowns across OpSheet+ are driven by reference tables configured in the **Admin Management → Reference Tables** module. Both Entity Management and other feature modules consume these tables to populate their dropdowns. When documenting a feature:
   - Identify all dropdowns in the feature's screens
   - For each dropdown, determine which reference table drives it
   - Document this in the feature manual's Prerequisites table, linking to the Admin Management > Reference Tables manual with the specific table name
   - Example: *"The 'Reason Code' dropdown is populated from Admin Management > Reference Tables > Reason Codes. See [Admin Management — Reference Tables > Reason Codes](link)."*
   - The Admin Management > Reference Tables manual is a standalone page under User Manuals:
   ```
   User Manuals (parent page)
   ├── Admin Management — Reference Tables — User Manual
   │   ├── <Table Name> (e.g., Reason Codes)
   │   ├── <Table Name> (e.g., Status Types)
   │   └── ... (one section or child page per reference table)
   ├── Entity Management — User Manual
   │   ├── Overview & Navigation
   │   ├── <Tab Name> (dropdowns link back to Admin Mgmt > Reference Tables)
   │   └── ...
   ├── Wait Times — User Manual
   └── ...
   ```

---

## Output Structure

Every user manual MUST follow this structure. Do not skip sections — if a section is not applicable, state "Not applicable for this module" with a brief reason.

```markdown
# <Module Name> — User Manual

> **Last Updated:** <date>
> **Target Audience:** <audience>
> **Related JIRA Epic:** <epic ID and link>

---

## 1. Overview

Brief description of what this module does and why it exists.
- What business problem does it solve?
- Who uses it and when?
- Where does it fit in the overall application?

### 1.1 Prerequisites

> List any modules that must be configured before this feature can be used.
> Link to their respective user manuals with the specific section that applies.

| Prerequisite Module | Required Configuration | Manual Link |
|--------------------|----------------------|-------------|
| <Module name>      | <Specific screen/setup needed> | [<Module> — User Manual > <Section>](<confluence-url>) |

> **Note:** If this module has no prerequisites (e.g., it is a foundational module like Entity Management), replace this table with: "This is a foundational module with no prerequisites."

---

## 2. Access & Permissions

How to access the module and what permissions are required.

| Permission Level | Capabilities |
|-----------------|--------------|
| View            | <describe>   |
| Edit            | <describe>   |
| Admin           | <describe>   |

- System module reference: `<SYSTEM-MODULE-CODE>`
- Entity-level permissions: <yes/no, describe if yes>
- How to request access: <process or contact>

---

## 3. Navigation

How to reach this module from the main application.

1. <Step-by-step navigation path>
2. ...

Include breadcrumb path if applicable: `Home > Module > Sub-section`

---

## 4. Core Functionality

### 4.1 <Primary Action> (e.g., "Viewing Records")

Step-by-step instructions for the most common use case.

1. <Step>
2. <Step>
3. <Step>

**What you'll see:** <describe the expected screen/result>

### 4.2 <Secondary Action> (e.g., "Adding a New Record")

1. <Step>
2. <Step>

**Important:** <any critical notes, e.g., required fields, validation rules>

### 4.3 <Additional Actions>

Repeat for each major action: Edit, Delete, Export, Filter, etc.

---

## 5. Data Table Behavior

> Reference: [Global Acceptance Criteria](https://mywiki.disney.com/display/OPSHEET/Global+Acceptance+Criteria)

Describe the table behavior specific to this module:

- **Default view:** <what records are shown by default>
- **Default sort:** <column and direction>
- **Active/Inactive:** <yes/no — describe toggle behavior>
- **Soft delete:** <yes/no — describe show deleted behavior>
- **Effective/Expiration dates:** <yes/no — describe filtering>
- **Filtering:** <available filter types and qualifiers>
- **Row count:** <where displayed, what it reflects>

### Save & Cancel Behavior
- When Save is available: <conditions>
- When Cancel is available: <conditions>
- Unsaved changes warning: <yes/no>
- Refresh Table: <available? what it resets>

---

## 6. Validations & Error Handling

| Field / Action | Validation Rule | Error Message |
|---------------|-----------------|---------------|
| <field>       | <rule>          | <message>     |

- **Single error:** Red underline on cell + error toast
- **Multiple errors:** Red underline on all cells + generic error toast
- **After error:** Save disabled until corrected; Cancel remains available

---

## 7. History & Audit Trail

- **How to view history:** <click "Updated On" link>
- **What is logged:** <fields tracked>
- **Display:** Panel expands below the record, max 5 visible with scroll
- **Limitations:** One record's history visible at a time

---

## 8. Related Resources

- [Global Acceptance Criteria](https://mywiki.disney.com/display/OPSHEET/Global+Acceptance+Criteria)
- [<Related Confluence page>](<url>)
- JIRA Stories: <list of key story IDs>
```

---

## Glossary Contribution

While writing the manual, the BA may encounter domain-specific terms, acronyms, or OpSheet-specific concepts that end users may not immediately understand. Rather than defining these inline in every manual:

1. **Identify glossary candidates** — Any term that requires explanation for the target audience (e.g., "Entity", "Lane", "Dispatch Interval", "VAS", "Reason Code", "Effective Date").
2. **Check the shared glossary** — Look at the existing glossary page: `User Manuals > OpSheet+ Glossary` in Confluence.
3. **If the term already exists** — Link to it from the manual using the format: *[term](glossary-link#term-anchor)*.
4. **If the term is new** — Add it to the glossary page with:
   - **Term:** The word or phrase
   - **Definition:** A plain-language explanation (1–2 sentences)
   - **Context:** Where in the application this term is used
5. **In the manual itself** — On first use of a glossary term, italicize it and link to the glossary. Subsequent uses in the same manual do not need the link.

The glossary is a shared, living page maintained by all BAs:
```
User Manuals (parent page)
├── OpSheet+ Glossary
├── Admin Management — Reference Tables — User Manual
├── Entity Management — User Manual
├── Wait Times — User Manual
└── ...
```

---

## Quality Checklist

Before publishing, verify:

- [ ] All mandatory sections (1–5) are complete with real content (no placeholders)
- [ ] Language is non-technical and appropriate for the target audience
- [ ] Permission table matches the current implementation
- [ ] Navigation steps are accurate and tested
- [ ] Data table behavior matches Global Acceptance Criteria
- [ ] Validation rules match what is implemented (not just what was spec'd)
- [ ] Screenshots or visual references are noted where helpful (even if pending)
- [ ] No internal jargon without explanation (e.g., "BFF", "VAS" should be avoided or defined)
- [ ] Related JIRA stories are linked for traceability
- [ ] Module name in title matches the application's navigation label exactly

---

## Consistency Rules

These rules ensure all manuals feel like they belong to the same product:

1. **Voice:** Second person ("you"), present tense ("Select Save" not "You should select Save")
2. **Action verbs:** Use "Select" for buttons/links, "Enter" for text fields, "Choose" for dropdowns
3. **UI references:** Bold UI element names (e.g., **Save**, **Cancel**, **Refresh Table**)
4. **Notes format:** Use blockquotes for important callouts: `> **Note:** ...`
5. **Numbered steps:** Always use numbered lists for sequential actions
6. **Tables:** Use tables for permissions, validations, and troubleshooting — not prose
7. **Module naming:** Use the exact label shown in the application navigation
8. **Cross-references:** Always link to Global Acceptance Criteria rather than duplicating content
9. **Date format:** Use `MM-DD-YYYY` for the "Last Updated" field
