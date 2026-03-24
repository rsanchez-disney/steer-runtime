Create an implementation summary as a child page of the source Confluence page.

## Source page

URL: {{CONFLUENCE_URL}}

## Instructions

1. First, fetch the source page using your confluence MCP tools to get its **page ID** and **space key**
2. Then create a NEW child page under it using `create_confluence_page` with:
   - `spaceKey`: from the parent page
   - `parentId`: the parent page's ID
   - `title`: "Implementation Summary — <parent page title>"
   - `body`: the implementation summary below, converted to Confluence storage format (XHTML)

## Content for the child page

Format the summary below as a well-structured Confluence page with:
- An **Overview** section with project name, date, and mode
- A **Steps Executed** table (Step | Agent | Key Output)
- A **Key Decisions** section extracted from architecture and planning steps
- A **Files Changed** section if available from implementation/review steps
- A **Quality Gates** section summarizing test results, code review findings, and security scan results
- A **Pull Request** section with the PR link if available

Use Confluence macros where appropriate (info panel, status macros, code blocks).
