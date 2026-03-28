# PM / Scrum Master Guidelines

## Sprint Cadence
- 2-week sprints (standard for Disney Payments)
- Sprint planning: first day of sprint
- Daily standup: 15 minutes max
- Sprint review: last day of sprint
- Retrospective: after sprint review

## Definition of Done
- Code complete and peer-reviewed
- Unit tests passing (≥90% coverage)
- Integration tests passing
- Documentation updated
- Deployed to staging
- PO acceptance

## Story Point Reference
| Points | Complexity | Example |
|--------|-----------|---------|
| 1 | Trivial | Config change, copy update |
| 2 | Small | Simple bug fix, add field |
| 3 | Medium | New endpoint, UI component |
| 5 | Large | Feature with multiple layers |
| 8 | Complex | Cross-service feature |
| 13 | Epic-level | Break down further |

## Velocity Guidelines
- Use rolling 3-sprint average for capacity planning
- Don't commit more than 85% of average velocity
- Account for PTO, holidays, on-call rotations

## Escalation Path
- Blocker > 1 day → Scrum Master action
- Blocker > 3 days → Engineering Manager
- Cross-team dependency unresolved > 1 sprint → Director level
