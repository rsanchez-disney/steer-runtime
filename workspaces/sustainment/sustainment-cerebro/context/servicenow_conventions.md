# ServiceNow Conventions — Disney (DX Profile)

## Incident State Codes

| Code | State | SLA Clock |
|------|-------|-----------|
| 1 | New | Not started |
| 2 | Assigned | **RUNNING** |
| 3 | Work in Progress | **STOPPED** |
| 4 | Pending | **STOPPED** |
| 5 | Resolved | Stopped |
| 6 | Closed | N/A |
| 7 | Cancelled | N/A |

**Key rule**: Move to WIP (3) immediately when starting investigation to stop the SLA clock.

## SLA Targets

| Priority | Response | Resolution |
|----------|----------|------------|
| P1 (Critical) | 15 min | 4 hours |
| P2 (High) | 30 min | 8 hours |
| P3 (Medium) | 4 hours | 3 business days |
| P4 (Low) | 8 hours | 5 business days |

## Close Codes

| Code | When to Use |
|------|-------------|
| Solved (Permanently) | Root cause fixed, no recurrence expected |
| Solved (Workaround) | Temporary fix, follow-up needed |
| Not Solved (Not Reproducible) | Cannot reproduce, monitoring |
| Not Solved (Too Costly) | Fix requires major effort, risk accepted |
| Closed/Resolved by Caller | User confirmed resolved |
| Duplicate | Linked to existing INC |

## Work Note Format (Disney Standard)

```
[YYYY-MM-DD HH:MM UTC] - [Engineer Name]
Status: [Current State]
Action Taken: [What was done]
Findings: [What was discovered]
Next Steps: [What happens next]
---
```

## Triage Decision Flow

```
New INC → Is it our AG? 
  NO → Reassign + work note
  YES → Is it duplicate?
    YES → Link to parent, resolve
    NO → Pattern match?
      YES → Apply known resolution
      NO → Is it P1/P2?
        YES → Bridge protocol + PagerDuty
        NO → Standard WIP investigation
```

## Bridge Engagement Protocol

When you receive "Your Presence is Required" (automated child INC):
1. Join bridge immediately
2. Roles: Incident Commander (coordinates) or Communications Lead (drafts comms)
3. Document everything in parent INC work notes
4. Post updates to #dx-profile-p1-alerts
