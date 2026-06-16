# APP Team — Agile/Scrum Practices & Jira Guidelines

Source: [Agile/Scrum Practices](https://confluence.disney.com/pages/viewpage.action?pageId=1959340552) | [Jira Guidelines](https://confluence.disney.com/pages/viewpage.action?pageId=2050099933)

---

## Sprint Cadence

- **Duration:** 2 weeks
- **Start:** Wednesday 12:00 PM EST
- **End:** Tuesday 11:59 PM EST
- **Scope delivery target:** ≥ 80% of committed story points
- **Rollover allowance:** ≤ 10% of work

## Sprint Scope Rules

- Once a sprint begins, **no new tickets** should be added (protects sprint stability)
- Fly-in tickets: Leads, Product, Architecture, and Scrum roles act as first contact. Team must discuss and agree. If bandwidth is maxed, an existing ticket must be removed
- Fly-in work must be estimated in story points

## Carry-Over Protocol

When a story is not completed in a sprint:
1. Add a **comment** explaining reasons for carry-over
2. Apply **Carry Over** tag
3. Select **Missed Commitment Reason** field

## Ceremonies

| Ceremony | Frequency | Time (EST) | Duration | Attendees |
|----------|-----------|------------|----------|-----------|
| Daily Stand-up | Daily | 9:30–10:00 AM | 30 min | Whole Team, Stakeholders, CQE, Sustainment |
| Sprint Planning | Bi-weekly (Week 1) | Wed 9:30–10:30 AM | 1 hour | Whole Team, PO, SM, Tech Leads |
| Scrum of Scrums | Weekly (Thu) | Thu 1:30–2:00 PM | 30 min | Tech Leads (UI/BE/DB), SM |
| Priorities Review | Bi-weekly (Week 1) | Tue 2:00–2:30 PM | 30 min | PO, SM, Tech Leads |
| Pre-Planning | Bi-weekly (Week 2) | Mon 11:30 AM–12:00 PM | 30 min | PO, SM, Tech Leads |
| BE Sprint Demo | Bi-weekly (Week 2) | Tue 11:00–11:45 AM | 45 min | Backend Team, PO, SM |
| UI Sprint Demo | Bi-weekly (Week 2) | Tue 2:00–3:00 PM | 1 hour | UI Team, PO, SM |
| Sprint Retrospective | End of sprint | TBD | TBD | Whole team |

---

## Jira Issue Types

| Type | When to Use |
|------|-------------|
| **Bug** | Defects in existing functionality |
| **Spike** | Research, investigation, or proof-of-concept |
| **Story** | Feature work without CQE, OR the CQE testing container (linked from Task) |
| **Task** | Development work that requires CQE — developer works in Task, CQE validates linked Story |

## Required Fields (All Tickets)

**Core:** Summary, Description (with ACs), Story Points, Assignee, Developers, Sprint, Fix Version
**Task Type:** Tasks → "Development"
**AI Adoption:** Labels (AI-Assisted, AI-Peer-Reviewed), AI Assisted Effort, AI Usage Level, AI Tools Used

## CQE vs Non-CQE Workflow

**Requires CQE:**
1. Developer receives a **Task**
2. Task linked to a **Story**
3. Dev completes → close Task → reassign Story to CQE

**No CQE:**
1. Developer receives a **Story** directly
2. Complete work → close Story

## Status Workflows

**Story:** Open → In Development → Ready for Testing → Ready for Release → Closed
- Code Review = stays "In Development"

**Task:** Not Started → Dev In Progress → Ready for Test → Awaiting Release → Done
- Code Review = stays "Dev In Progress"

**Bug:** Open → In Triage → Ready for Fix → In Progress → Ready for Testing → Ready for Release → Closed

## Key Rules

- "Ready for Testing" and "Ready for Release" are final dev states for reporting
- Stories & Tasks in Code Review remain In Development / Dev In Progress
- CQE testing is always on the **Story**, not the Task
- Story Points: estimate normally (do not adjust for AI)
