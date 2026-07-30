# Studio Report Output Template

The agent MUST produce output matching this exact structure. Sections cannot be reordered, renamed, or omitted.

## Page title

```
Q{N} FY{YEAR} — Studio {Name}
```

## Sections (in order)

### 1. Metrics

| Metric                             | Value                |
|------------------------------------|----------------------|
| Resolved ({incl/excl} sub-tasks)   | {count}              |
| Created                            | {count}              |
| Net Backlog                        | {+/- count} ({trend}) |
| Issue Mix (Resolved)               | {type}: {n} ({%}), … |
| Sprint Velocity                    | ~{n} issues/sprint   |

### 2. Data source and methodology

Info panel containing:

| Field         | Value                                        |
|---------------|----------------------------------------------|
| Project       | {project_key}                                |
| Filter Method | {Studio Field / Sprint-based / Combined}     |
| Filter Value  | {studio_field_value or sprint_prefix}        |
| Date Filter   | resolved >= {start} AND resolved <= {end}    |
| Sub-tasks     | {Included / Excluded}                        |
| Board         | {board_id}                                   |
| Sprint Range  | {first_sprint} through {last_sprint}         |
| JQL           | {full_query}                                 |

### 3. Business impact

2-3 paragraphs. Must follow tone rules:

- Conservative — confirmed outcomes only
- Specific — product names, dates, environments
- Quantified — numbers, percentages, counts
- Business-value oriented — revenue, compliance, cost, guest experience
- No filler — every sentence must answer "so what?"

### 4. Key deliverables

Bulleted list grouped by workstream/feature. Each item:

- {Epic/Feature name} — {one-line outcome} ({date or sprint delivered})

### 5. Roadmap

| Lane             | Milestone       | Timeline             | Status        |
|------------------|-----------------|----------------------|---------------|
| Q{N} Delivered   | {item}          | {dates}              | ✅ DONE       |
| Q{N+1} Planned   | {item}          | {dates}              | 🔵 IN PROGRESS |
| Q{N+1} Planned   | {item}          | {dates}              | 🟡 PLANNED    |
| Constraint       | {freeze/dep}    | {dates}              | 🔴 BLOCKER    |

### 6. Risks and notes

Bulleted list:

- {Risk/note} — {impact} — {mitigation or status}

### 7. Director metrics

| Metric                  | Value              | Notes                    |
|-------------------------|--------------------|--------------------------|
| Impact Classification   | {color — category} | {justification}          |
| Guest Reach             | {markets}          | {explanation}            |
| Release Success Rate    | {%}                | {context}                |
| Health Rating           | {color — status}   | {justification}          |
| Sprint Velocity         | ~{n} issues/sprint | {trend}                  |
| Blocked Items           | {count}            | {details or "None"}      |

## Confluence rendering rules

- Info panel: `ac:structured-macro ac:name="info"`
- Status lozenges: `ac:structured-macro ac:name="status"` with `colour` and `title` params
- Tables: standard HTML `<table><thead>…</thead><tbody>…</tbody></table>`
- No Mermaid diagrams, no roadmap macro, no image attachments

## Consistency rules

- Column order in tables must match this template exactly
- Section numbering is for reference only — do not render numbers in headings
- Empty sections: if no data, write "None identified this quarter" — do not omit the section
- Metrics table always has exactly 5 rows (even if velocity is unavailable, write "N/A")
- Director metrics table always has exactly 6 rows
