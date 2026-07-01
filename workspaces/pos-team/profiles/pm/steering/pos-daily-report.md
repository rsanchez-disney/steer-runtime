---
inclusion: manual
---

# POS Program — Daily Epic Status Report

## Context

Target Release: **DSP 2.1.1**
Project: Point of Sale
Report cadence: Daily

## JQL Query

```jql
project = "Point of Sale"
AND issuetype = Epic
AND "Target Release" ~ "DSP 2.1.1"
AND "Project Owner" in (
  "jonatan.x.arrieta.-nd@disney.com",
  "juan.zanetti.-nd@disney.com",
  "mariano.gabriel.guerra.-nd@disney.com",
  "manuel.diaz.salcedo.-nd@disney.com",
  "monica.cruz.-nd@disney.com",
  "lucia.trincabelli.simonet.-nd@disney.com",
  "jimena.chau.-nd@disney.com",
  "renato.renan.fellipa.-nd@disney.com",
  "martin.campo.-nd@disney.com"
)
```

## Report Sections

### 1. Epic Status Summary

Provide counts per status:
- New, Technical Analysis, Ready for Dev, In Progress, In QA, In Review, Done, Blocked
- Total Epics
- Days in current status (calculated from last transition date)
- Blocked Epics highlighted separately

### 2. Epic Status Transitions (Last 24 Hours)

For each Epic that changed status in the last 24h:
| Epic Key | Epic Name | Previous Status | New Status | Transition Date | User | Comment |

If no comment: "No related comment found."

### 3. Open Issues Inside Each Epic (non-Done Epics only)

For each non-Done Epic, list child issues in these statuses:
New, Technical Analysis, Ready for Dev, In Dev, In Code Review, Ready for Test, In Testing, Failed, Fixed Failed

| Issue Key | Type | Summary | Status | Assignee |

### 4. Risks and Attention Points

Flag:
- Epics blocked > 3 days
- Epics with no status movement in 7+ days
- Epics with > 5 open Bugs
- Epics with Failed or Fixed Failed issues still open

## Output Format

- Clear section headers
- Tables wherever possible
- Sort by priority then latest transition date
- Bullet points for risks
- Compare against previous execution to highlight new transitions and newly blocked items

## Execution Steps

1. Run the JQL query above to get all Epics
2. For each Epic: fetch status, last transition date, changelog (last 24h transitions)
3. For each non-Done Epic: fetch child issues with `jira_get_child_issues`
4. Calculate days-in-status from changelog
5. Apply risk rules and flag attention points
6. Format as markdown report
