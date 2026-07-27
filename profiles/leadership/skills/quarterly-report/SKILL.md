---
name: quarterly-report-skill
description: Reusable workflow for generating quarterly business reports for Disney directors — multi-studio data collection, Confluence page hierarchy, roadmaps, and director-level metrics across multiple Jira projects.
---

# Quarterly Report Skill

Use when:
- task involves generating a quarterly report for a vertical or program
- audience is Disney directors or senior leadership
- data spans multiple Jira projects, studios, or teams
- deliverable is Confluence Cloud pages with executive summary + per-team detail pages

Primary outcomes:
- accurate Jira data using correct field methodology (Studio custom field, not labels)
- executive-ready Confluence page hierarchy (parent summary + per-studio child pages)
- visual roadmap with native Confluence status lozenges
- director-level metrics (impact classification, guest reach, health rating)
- clear data methodology documentation for reproducibility

## Lessons Learned (Q3 FY2026)

### Jira Data Collection Pitfalls

1. **Labels vs Custom Fields**: Studio assignment in ROS is tracked via `customfield_10156` ("Studio[Dropdown]"), NOT labels. Labels capture cross-team tags only.
2. **"Updated" inflates counts**: Using `updated >= date` returns issues with mere field changes or comments. Use `resolved >= date` for actual delivery metrics.
3. **Sub-task inflation**: Studios with granular workflow decomposition (7+ sub-tasks per story for sign-off phases) inflate resolved counts by 3-7x. Exclude sub-tasks for: Nebula, Bang, Terror, Cosmo, Star-Lord, Rocket, Yondu. Include for: Gamora, Vision, Tadashi, Mantis.
4. **Multi-project studios**: Not all studios live in the same Jira project:
   - ROS (Resort Sales): Most studios
   - TEP3 (Ticket Evolution): Yondu, Cosmo (partially)
   - GRPS (Guest Retail POS): Bolt
   - CCS (Centralized Config Suite): Forky
5. **Dual field values**: Terror requires querying TWO Studio field values: "ROS - Terror | Ruth" + "ROS - Terror Project | Ruth"
6. **Sprint-based filtering**: For non-ROS projects, use sprint name patterns (e.g., "Yondu-SP430") rather than Studio field
7. **API pagination**: Jira Cloud returns max 100 issues per request. Always report the `total` from API metadata, not the count of returned items.

### Confluence Page Architecture

**Recommended hierarchy:**
```
Q{N} FY{YEAR} Quarterly Report — {Vertical Name} (parent)
├── Q{N} FY{YEAR} — Studio {Name} (per-studio child, x N studios)
└── (optional) Q{N} FY{YEAR} — Production Release Pipeline
```

**Parent page contains:**
- Period, vertical, studios list, projects list
- Executive summary (total resolved, key achievements bullet list)
- Studio scorecard table (one row per studio: resolved, project, top deliverable, Q4 milestone)
- Combined roadmap (native table + status lozenges)
- Q4 key dates table
- Risks & recommendations
- Data methodology
- Children macro (auto-lists child pages)

**Each studio child page contains:**
- Metrics table (resolved, created, net backlog, issue mix, project, studio field, sprint cadence, board)
- Business impact narrative (conservative tone, confirmed outcomes only)
- Key deliverables list (grouped by feature/workstream)
- Team roster (with focus areas)
- Roadmap table (Lane | Milestone | Timeline | Status with lozenges)
- Risks & notes
- Director metrics table (impact classification, guest reach, release success rate, health rating, sprint velocity, blocked items)

### Roadmap Rendering

**What works:** Native Confluence tables with `ac:structured-macro ac:name="status"` lozenges:
- Green = DONE
- Blue = IN PROGRESS  
- Yellow = PLANNED or AT RISK
- Red = BLOCKER

**What doesn't work:**
- `roadmap` macro = "unsupported macro" on most instances
- Mermaid code blocks = don't render natively in Confluence Cloud
- PNG image attachments = intermittent "Preview unavailable" + some show wrong content

**Fallback:** Keep Mermaid source in a collapsible expand macro for external rendering (mermaid.live) if a visual Gantt is needed for presentations.

### Director-Level Metrics

| Metric | Color Coding | Purpose |
|--------|-------------|--------|
| Impact Classification | Green=Revenue, Blue=Infrastructure/Platform, Yellow=Compliance/Cost Reduction | Connects tech to business value |
| Guest Reach | Markets list | Scale of impact |
| Release Success Rate | Percentage | Production reliability |
| Health Rating | Green=On Track, Yellow=At Risk, Red=Blocked | Executive attention signal |
| Sprint Velocity | Issues/sprint | Capacity predictability |
| Blocked Items | Count + details | Escalation triggers |

**Health Rating criteria:**
- 🟢 ON TRACK: No blocked epics, manageable backlog, milestones progressing
- 🟡 AT RISK: Blocked epics OR backlog growing significantly OR freeze conflict OR capacity concern
- 🔴 BLOCKED: Critical dependency preventing delivery, needs escalation

### Business Impact Tone

- **Conservative**: State confirmed outcomes only, not aspirational projections
- **Distinguish**: Revenue generating vs cost reducing vs compliance vs infrastructure
- **Quantify where possible**: "15+ services migrated", "1,407 tests authored", "8 languages"
- **Acknowledge unknowns**: "Business impact will materialize when X launches"
- **No hype**: "This is investment without realized return until launch"

## Workflow

1. **Identify scope**: Determine vertical, quarter period (Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun for FY), studios/teams, and Jira projects
2. **Discover studio tracking method**: For each Jira project, identify how studios are tracked (custom field, label, sprint name, board)
3. **Query resolved issues**: Use `resolved >= start AND resolved <= end` with appropriate studio filter and `issuetype != Sub-task` where applicable
4. **Collect issue type breakdown**: From sampled results (100 per query), extrapolate percentages to total
5. **Identify key deliverables**: Group by feature/workstream from issue summaries and sprint goals
6. **Query epics for roadmap**: Find completed epics (Q3 milestones) and in-progress/planned epics (Q4 outlook)
7. **Identify freeze windows**: Check for deployment restrictions affecting Q4 planning
8. **Create parent page**: Executive summary + scorecard + combined roadmap + risks
9. **Create studio child pages**: Full metrics + business impact + deliverables + team + roadmap + director metrics
10. **Review and refine**: Verify with stakeholders, filter irrelevant data, correct team attributions

## JQL Templates

```
# Studio in ROS (custom field)
project = ROS AND "Studio[Dropdown]" = "{STUDIO_VALUE}" AND resolved >= {START} AND resolved <= {END} AND issuetype != Sub-task ORDER BY resolved DESC

# Sprint-based (TEP3, GRPS)
project = {PROJECT} AND sprint in ("{SPRINT_PREFIX}-SP{N}", ...) AND resolved >= {START} AND resolved <= {END} AND issuetype != Sub-task

# Epics for roadmap
project = {PROJECT} AND issuetype = Epic AND (resolved >= {START} OR status != Done) AND updated >= {START} ORDER BY resolved DESC

# Exclude specific assignees
project = {PROJECT} AND resolved >= {START} AND resolved <= {END} AND issuetype != Sub-task AND assignee NOT IN ("{NAME1}", "{NAME2}")
```

## Confluence Storage Format Templates

### Status Lozenge
```xml
<ac:structured-macro ac:name="status">
  <ac:parameter ac:name="colour">{Green|Blue|Yellow|Red}</ac:parameter>
  <ac:parameter ac:name="title">{LABEL}</ac:parameter>
</ac:structured-macro>
```

### Roadmap Table Row
```xml
<tr>
  <td><strong>{LANE}</strong></td>
  <td>{MILESTONE}</td>
  <td>{START_DATE} – {END_DATE}</td>
  <td>{STATUS_LOZENGE}</td>
</tr>
```

### Collapsible Section
```xml
<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">{SECTION_TITLE}</ac:parameter>
  <ac:rich-text-body>{CONTENT}</ac:rich-text-body>
</ac:structured-macro>
```

### Children Macro (auto-list child pages)
```xml
<ac:structured-macro ac:name="children">
  <ac:parameter ac:name="sort">title</ac:parameter>
</ac:structured-macro>
```
