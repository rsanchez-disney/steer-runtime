# XRay Fetching Instructions

## Authentication

Run `jira_get_myself` to validate connection. If fails → user needs to check PAT.

## Fetching Test Cases

```
jira_search_issues({
  jql: "issue in testRepositoryFolderTests(\"{PROJECT}\", \"/{PATH}\")",
  maxResults: 50,
  customFields: ["automationCandidate", "automationStatus"]
})
```

- Extract project key from path (e.g., `COM` from `COM/Ticketing/...`). Default to `COM` if no prefix.
- Paginate until fewer than 50 returned.
