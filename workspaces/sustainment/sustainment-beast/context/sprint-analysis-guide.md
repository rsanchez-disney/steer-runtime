
# Sprint Analysis Guide — Beast Team

Use this guide when analyzing sprint capacity, planning sprints, or evaluating team workload.
Requires: #team-roster, #jira-config, #capacity-params

## Analysis Process

### 1. Gather Sprint Data
- Use `jira_get_sprints_from_board` with board_id `468` to get active/future sprints
- Use `jira_get_sprint_issues` to get issues in the target sprint
- Filter by Beast team members (see #team-roster for the list)

### 2. Estimate Story Points
If tickets don't have story points assigned, estimate using this scale:

| Difficulty | Story Points | Criteria |
|---|---|---|
| Very Low | 1-2 | Trivial change, no risk, no dependencies |
| Low | 3 | Defensive change or quick win, clear scope |
| Medium | 5 | Analysis + implementation + testing, defined scope |
| High | 8 | Multiple components, external dependencies, coordination needed |
| Very High | 13 | Multiple features, cross-team dependencies, broad or ambiguous scope |

Hours per Story Point: 6-8 hrs

### 3. Calculate Real Capacity

Per developer per sprint (10 business days):
```
Gross hours:           80 hrs (8 hrs/day × 10 days)
- Day off:             -8 hrs (at least 1 per sprint)
- Incident review:    -15 hrs (1.5 hrs/day × 10 days)
- Scrum ceremonies:    -4 hrs (2 hrs/week × 2 weeks)
- Shift handover:      -5 hrs (30 min/day × 10 days)
= Available for dev:   48 hrs
```

Monitoring duty week (1 dev rotates): subtract additional 8 hrs → 40 hrs

Capacity in story points per dev per sprint: ~6-8 SP (at 6-8 hrs/SP)

### 4. Prioritization Criteria

1. Priority of ticket (Highest > High > Medium > Low)
2. Tickets with work already started (PO Validation, In Progress) first to close cycle
3. Tickets without external dependencies before blocked ones
4. Group tickets from same technical context in same sprint
5. Leave buffer (~2-3 pts) in intermediate sprints for unplanned work
6. Study/Research tickets at the end (require prior coordination)

### 5. Generate Output

Create a sprint analysis document with:
- Table of candidate tickets with scoring
- Availability calculation (gross hours - operational = development)
- Time distribution visualization
- Capacity gap (demand vs capacity)
- Estimation detail per ticket (difficulty, implications, dependencies, risk)
- Sprint plan with justification per ticket
- Deferred tickets with options for PO
- Risk matrix (high/medium/low)
- Executive summary with final recommendation

### 6. Risk Assessment

| Risk Level | Criteria |
|---|---|
| High | External dependency, unclear scope, cross-team coordination, P1/P2 incident history |
| Medium | Partial dependency, needs investigation, moderate complexity |
| Low | Self-contained, clear scope, no dependencies |

## Ticket Creation Templates

### Incident Research Task
```
Summary: [sustainment][research][{INC_NUMBER}] {brief description}
Type: Task
Priority: Based on incident priority
Assignee: Available dev from current shift
Description:
  ## Context
  - Incident: {INC_NUMBER}
  - Priority: {P1/P2/P3/P4}
  - ServiceNow AG: app-frdlp-digital-ext-support
  - Short description: {from SNOW}

  ## Investigation Steps
  1. Review Splunk logs for the timeframe
  2. Identify root cause
  3. Document findings
  4. Propose fix or workaround

  ## Links
  - [ServiceNow]({SNOW_URL})
  - [Splunk]({SPLUNK_URL})
```

### Post-Mortem Task
```
Summary: [Sustainment][Postmortem][{component}][{date}] {P_level}-{INC_NUMBER}| {title}
Type: Task
Priority: High
Description:
  ## Incident Summary
  - Incident: {INC_NUMBER}
  - Duration: {start} to {end}
  - Impact: {guest impact description}

  ## Timeline
  - {timestamp}: Alert triggered
  - {timestamp}: Acknowledged by {person}
  - {timestamp}: Root cause identified
  - {timestamp}: Fix applied
  - {timestamp}: Resolved

  ## Root Cause
  {description}

  ## Action Items
  - [ ] {preventive action 1}
  - [ ] {preventive action 2}
```

### Sustainment / Enabler Task
```
Summary: [Sustainment][{category}] {description}
Type: Task or Enabler Story
Priority: Medium
Labels: sustainment
Epic/Enabler: Current PI sustainment enabler
```

### Deployment / CHG Task
```
Summary: [{date}][{env}][{component}] {description} - {CHG_NUMBER}
Type: Task
Priority: Medium
```

## Integration with ServiceNow

When creating incident research tickets:
1. Query ServiceNow: `search_incidents` with `number={INC_NUMBER}`
2. Extract: short_description, priority, state, assignment_group, sys_created_on
3. Use the data to populate the Jira ticket description
4. Link the SNOW URL: `https://disney.service-now.com/incident.do?sys_id={sys_id}`
