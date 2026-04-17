# OpSheet JIRA Query Context

## Project
- **Key:** OPS
- **Custom Field for Team:** `customfield_22600` (aliased as `cf[22600]` in JQL)

## Team IDs (customfield_22600)

| Team                         | ID   |
|------------------------------|------|
| OpSheet+ Pod 1               | 422  |
| OpSheet+ Pod 2               | 423  |
| OpSheet+ Pod 3               | 424  |
| OpSheet+ Pod 4               | 571  |
| OpSheet+ Pod 5               | 1107 |
| OpSheet Core Team            | 285  |
| OpSheet Business Support Team| 342  |
| OpSheet Product Team         | 362  |

## Querying by Pod and Label

To search tickets for a specific pod and label, use JQL like:

```
project = OPS AND cf[22600] = {team_id} AND labels = "{label}"
```

### Examples

Get tickets for Pod 2 with a release candidate label:
```
project = OPS AND cf[22600] = 423 AND labels = "September2026_ReleaseCandidate"
```

Get open tickets for Pod 1:
```
project = OPS AND cf[22600] = 422 AND status != Done
```

Get tickets for Pod 3 with multiple labels:
```
project = OPS AND cf[22600] = 424 AND labels in ("September2026_ReleaseCandidate", "October2026_ReleaseCandidate")
```

## Notes
- The Team field is a custom select field; JQL queries use the numeric ID, not the display name.
- Always include `customFields: ["team"]` when calling `jira_search_issues` or `jira_get_issue` to retrieve the team value.
- Labels are case-sensitive in JQL.
