# MCP Live Data Gathering Steps

> These steps are executed BEFORE generating the 8-section response.
> Run silently — do not show them as part of the response to the user.

## Step A: Read the Incident (if INC number provided)

If the user provides an INC number, use the ServiceNow tools to fetch the full incident:

```
Tool: snow_query_table or jira_get_ticket (Compass MCP)
Table: incident
Query: number={INC_NUMBER}
Fields: number, short_description, description, state, priority, assignment_group, sys_created_on, work_notes, comments, cmdb_ci, category, subcategory
```

This gives you the real description, current state, priority, and any existing work notes.

## Step B: Search Historical Incidents (ALWAYS)

Extract 2-3 keywords from the incident description and search for similar past incidents:

```
Tool: snow_query_table (Compass MCP)
Table: incident
Query: assignment_group.name=web-global-Digital Profile^short_descriptionLIKE{keyword}^sys_created_on>=javascript:gs.daysAgoStart(90)^stateIN5,6
Fields: number, short_description, state, resolved_at, close_code, close_notes, work_notes
Order: sys_created_on DESC
Limit: 5
```

Alternative broader search if first returns empty:
```
Query: short_descriptionLIKE{keyword}^ORdescriptionLIKE{keyword}^sys_created_on>=javascript:gs.daysAgoStart(90)^stateIN5,6^priority<=3
```

## Step C: Check Splunk (if tools available)

If Splunk MCP tools are available, run a quick error check:

```
Tool: query_splunk (Compass MCP)
Query: index=dx_profile sourcetype=* (status>=500 OR level=ERROR) earliest=-4h | stats count by sourcetype, status | sort -count
```

## Step D: Fallback

If MCP tools are not available or fail:
- State in Section 7 (Confidence) that live data was not available
- Use pattern matching from context files as primary source
- Recommend the engineer run the queries manually
