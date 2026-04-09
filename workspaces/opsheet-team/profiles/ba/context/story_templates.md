# OpSheet JIRA Issue Templates

Standard templates for creating consistent JIRA issues across the OpSheet project.
All Product, Business Analyst, Developer, and Testing resources must use these templates.

Reference: [JIRA Issue Templates (MyWiki)](https://mywiki.disney.com/spaces/OPSHEET/pages/724505280/JIRA+Issue+Templates)

---

## 1. User Story

**Issue Type:** Story

**Summary Format:** `<Module>: <Screen/Functionality> - <Action>`
Example: `User Management: Role Management - Add Security Roles`

**Required Fields:**
- Epic Link, Fix Version(s), Initiative Link
- Label: `Product` (frontend — Mobile App, Web App) or `Technical` (backend — Core, Harness, Mongo, Reporting, VAS)
- Additional labels as needed
- Component(s)
- Dependency Links
- Team association

**Description Template (paste in "Text" view):**

```
{panel:title=User Story:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#85e085|bgColor=#ffffff}
As a <PERSONA>, I want to <FUNCTIONALITY>, so that <BENEFIT>.
{panel}
{panel:title=Supporting Details:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#f7a13a|bgColor=#ffffff}
*Assumptions:*
 * <TYPE HERE>

*UX Mockup:*
 * TBD
{panel}
{panel:title=Acceptance Criteria:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#d8b5ff|bgColor=#ffffff}
 * <TYPE ACCEPTANCE FLOW DETAILS HERE>

+Validations:+
 * <TYPE HERE>
 * Application standards/logic for validations and toast messages, as well as standard behavior for Cancel/Save can be found in the global acceptance criteria.
 * Validation text should match what is provided in the UX mock-up, or specified in this story.
 * Logic for Validation Error & Toast Messaging:
 ** When a user selects out of a data entry cell, if a validation error is detected, the red underline should display on the impacted cell.
 ** If a user selects save and there is a single validation error, the red underline should display on the impacted cell, with the associated error toast message populated.
 ** If a user selects save and there are multiple validation errors, the red underline should display for all impacted cells, and a single, generic error toast message should populate.
 ** Following the selection of save, if validation errors are detected, the Save button will go disabled until errors are corrected. The Cancel button should remain available.
 * If a user has made changes but attempts to navigate away prior to saving or cancelling, they should receive an unsaved changes warning:
 ** Yes, Continue: Unsaved changes will be discarded and navigation away from the page will be completed.
 ** No, Go Back: User will be sent back to the page with the unsaved changes still in place.

+Permissions Requirements:+
 * [Click Here|https://mywiki.disney.com/display/OPSHEET/Global+Acceptance+Criteria] for global permissions acceptance criteria.
 * The 'User Security Service' should be used to determine and apply permissions on this module, which equates to the <SYSTEM MODULE NAME> (<SYSTEM MODULE CODE>) system module.
 * This module utilizes the following permission checks: <ADD PERMISSION TYPES & LOGIC>

+Global Acceptance Criteria:+
 * [Click Here|https://mywiki.disney.com/display/OPSHEET/Global+Acceptance+Criteria] for global acceptance criteria. Please ensure this module is linked with all reusable components and design standards.
{panel}
```

---

## 2. Technical Story

**Issue Type:** Story

**Required Fields:**
- Epic Link, Fix Version(s), Initiative Link
- Label: `Technical`
- Additional labels as needed
- Component(s), Dependency Links, Team association

**Description Template (paste in "Text" view):**

```
{panel:title=Technical Story:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#85e085|bgColor=#ffffff}
<Description of Goal>
{panel}
{panel:title=Supporting Details:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#f7a13a|bgColor=#ffffff}
<Use Case Examples or Other Helpful Context>

*Swagger:*
 * <Input URL Here>

*Design Page:*
 * <Input URL Here>
{panel}
{panel:title=Acceptance Criteria:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#d8b5ff|bgColor=#ffffff}
 * <TYPE HERE>

+Validations:+
 * <TYPE HERE; Ex: Inputs required, URL parameters, etc.>

+Permission Requirements:+
 * [Click Here|https://mywiki.disney.com/display/OPSHEET/Global+Acceptance+Criteria] for global permissions acceptance criteria.
 * <AUTHZ SCOPE DETAILS>

+Global Acceptance Criteria:+
 * [Click Here|https://mywiki.disney.com/display/OPSHEET/Global+Acceptance+Criteria] for global acceptance criteria. Please ensure all design standards are followed with this implementation.
{panel}
```

---

## 3. Tech Spike

**Issue Type:** Spike

**Summary Format:** `<Module> [Tech Spike]: <Goal>`
Example: `OpSheet Core [Tech Spike]: Identify a Data Purging Strategy`

**Required Fields:**
- Epic Link, Fix Version(s), Initiative Link
- Module label (prefixed `OpSheet_`, e.g. `OpSheet_UserManagement`, `OpSheet_Core`)
- Component: `Research`
- Dependency Links, Team association

**Description Template (paste in "Text" view):**

```
{panel:title=Technical Spike:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#85e085|bgColor=#ffffff}
Tech Spike story to <.....Add Details>
{panel}
{panel:title=Supporting Details:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#f7a13a|bgColor=#ffffff}
 * <Use Case Examples or Other Helpful Context>
{panel}
{panel:title=Acceptance Criteria:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#d8b5ff|bgColor=#ffffff}
 * Final solution should be reviewed with the technology and business teams for sign-off, and properly documented.
 * Prior to closing this story, any stories needed to support work created by this technical spike should be added to the backlog, with any dependencies outlined.
{panel}
```

---

## 4. UX Design

**Issue Type:** Design

**Summary Format:** `<Module>: <Screen/Functionality> - <Web/Mobile UX>`
Example: `User Management: Access Requests - Web UX`

**Required Fields:**
- Epic Link, UX Fix Version(s)
- Module label (prefixed `OpSheet_`)
- Component: `UX Design`
- Dependency Links

**Description Template (paste in "Text" view):**

```
{panel:title=UX Story:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#85e085|bgColor=#ffffff}
The purpose of this story is the mock-up <Goal>.
{panel}
{panel:title=Supporting Details:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#f7a13a|bgColor=#ffffff}
 * <Use Case Examples and Design Criteria>
{panel}
```

---

## 5. Change Request / Debts

**Issue Type:** Change Request, Product Debt, Improvement, or Tech Debt (whichever applies)

**Summary Format:** `<Module>: <Screen/Functionality> - <Action>`

**Important:** Only Disney Product Team members should create these. Approval must be provided before the item is queued for work.

**Required Fields:**
- Category selection
- Approval status: `Pending` (updated to Denied/Approved after prioritization)
- Business Justification (why the change is being requested)
- Epic Link, Fix Version(s)
- Label: `Product` or `Technical`
- Additional labels, Component(s), Team association
- Dependency Links:
  - Link original story (if applicable) as `Related To`
  - Link submitted request as `Created By`

**Description Template (paste in "Text" view):**

```
{panel:title=Change Request/Product Debt:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#85e085|bgColor=#ffffff}
<Insert purpose of change request here>
{panel}
{panel:title=Supporting Details:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#f7a13a|bgColor=#ffffff}
<Insert supporting details here>
{panel}
{panel:title=Acceptance Criteria:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#d8b5ff|bgColor=#ffffff}
 * <Insert acceptance criteria here>
{panel}
```

---

## 6. Bug

**Issue Type:** Bug

**Summary Format:** `<Module>: <Screen/Functionality> - <Action>`

**Note:** Business Support and Testing teams should use the JIRA "Report a Bug" form. Developers may create bugs directly following these best practices.

**Required Fields:**
- Steps to Reproduce
- Actual Result
- Expected Result
- URL, Browser(s) Used, Environment Encountered
- Bug Type selection
- Severity selection
- Priority (based on Severity)
- Epic Link, Fix Version(s), Initiative Link (matching the associated Epic)
- Label: `Product` or `Technical`
- Environment label: `OpSheet_Web`, `OpSheet_Mobile`, `OpSheet_Reporting`, or `OpSheet_Integrations`
- Component(s), Team association
- Dependency Links (link original story as `Related To`)

**Description Template (paste in "Text" view):**

```
{panel:title=Bug Report:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#85e085|bgColor=#ffffff}
<Brief description of the issue>
{panel}
{panel:title=Steps to Reproduce:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#f7a13a|bgColor=#ffffff}
 # <Step 1>
 # <Step 2>
 # <Step 3>
{panel}
{panel:title=Results:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#d8b5ff|bgColor=#ffffff}
*Actual Result:*
 * <What happened>

*Expected Result:*
 * <What should have happened>
{panel}
{panel:title=Environment:|borderStyle=dashed|borderColor=#cccccc|titleBGColor=#cccccc|bgColor=#ffffff}
*URL:* <URL where issue was found>
*Browser(s):* <Browser and version>
*Environment:* <DEV/QA/STG/PROD>
{panel}
```

---

## Common Rules (All Issue Types)

- Always include Epic Link, Fix Version(s), and Initiative Link
- Use consistent summary format: `<Module>: <Screen/Functionality> - <Action>`
- When cloning, update Components, Labels, Epic Link, Fix Version, and Initiative accordingly
- Reference [Global Acceptance Criteria](https://mywiki.disney.com/display/OPSHEET/Global+Acceptance+Criteria) for shared standards
- Contact [OpSheet Product Team](mailto:DPEP.DL-OpSheet.Tech.Support@disney.com) for questions
