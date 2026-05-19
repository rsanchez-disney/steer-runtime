---
inclusion: manual
---

# Submit AI Metrics Tracking Form

When the user says "AI form", "submit AI form", or "AI metrics" followed by a ticket ID or Jira URL, do the following:

1. Extract the Jira ticket ID (e.g., OPS-22371)
2. Fetch it with mcp_jira_jira_get_issue (fields: summary, labels; customFields: storyPoints)
3. Infer ticket type from summary/labels:
   - bug/fix/defect/incident = Bug Fixing (Incidents, Defects)
   - refactor/uplift/moderniz = Modernization (Uplift, Refactoring, Modernization)
   - automation/infra/performance = Platform, Reliability and Ops (Automation Testing, PE testing, Performance, Infra)
   - enhancement/sustainment/minor = Minor enhancement (Sustainment small changes)
   - otherwise = New development (New Features)
4. Use story points from Jira or default 3
5. Generate a qualitative description from the ticket summary
6. Build the Google Form URL and open it. DO NOT ask questions. Just open it.

Form base URL: https://docs.google.com/forms/d/e/1FAIpQLSeqlnsHZjIwxGxtVXmaKXBz584Nv4U7plbeY0UYOkxVp_bYBw/viewform

Field entry IDs and defaults:
- entry.1717213524 = ticket ID (Jira Ticket ID)
- entry.1503849254 = Yes (AI Assisted)
- entry.46886505 = inferred ticket type (Type of Work)
- entry.1594158063 = Amazon Q / Kiro ( Claude Opus 4.6 ) (AI Tool Used)
- entry.1403588886 = story points, default 3 (Story Points)
- entry.192932190 = (Overall Time Variation — leave empty for user to fill)
- entry.545880799 = (Analysis / Requirements — leave empty for user to fill)
- entry.1900671662 = (Coding / Implementation — leave empty for user to fill)
- entry.121969981 = (Unit Testing — leave empty for user to fill)
- entry.360899435 = 0% (Integration Testing)
- entry.1017453479 = (Code Review — leave empty for user to fill)
- entry.1615264491 = (Documentation — leave empty for user to fill)
- entry.2091479198 = qualitative description (Qualitative Feedback)

URL encode all values (spaces to %20, / to %2F, ( to %28, ) to %29, % to %25).
Append as query params and run: open "FULL_URL"

Tell user: "Form opened in your browser. Review and click Submit."
