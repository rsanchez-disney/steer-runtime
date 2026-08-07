# Jira & Project Management Context

> **⚠️ TEAM ACTION REQUIRED**: This document contains placeholders that must be filled by the DBE team.
> Each section marked with `📝 TODO` needs real content from the Project Manager and Tech Leads.

## Jira Configuration

### Project Details

| Field           | Value                                                                                  |
|-----------------|----------------------------------------------------------------------------------------|
| Jira Instance   | disneyexperiences.atlassian.net                                                        |
| Project Key     | MERCURY                                                                                |
| Board URL       | <https://disneyexperiences.atlassian.net/jira/software/c/projects/MERCURY/boards/2284> |
| Board Type      | Scrum                                                                                  |
| Sprint Duration | 2 weeks                                                                                |

### Issue Types

| Type | Usage | Example |
|------|-------|---------||
| Epic | Large initiative spanning multiple sprints | "GCP CloudSQL Self-Service Automation" |
| Story | Deliverable feature/capability (has business value) | "As a DBA, I want to provision a CloudSQL instance via API" |
| Task | Technical work without direct user value | "Configure Harness pipeline for new service" |
| Sub-task | Breakdown of a Story/Task | "Implement AWS provider class" |
| Bug | Defect in existing functionality | "Password rotation fails for Oracle 19c" |
| Spike | Research/investigation (time-boxed) | "Evaluate Azure SQL MI SDK capabilities" |

### Workflow States

📝 TODO: Document your Jira workflow

```text
📝 TODO: Replace with actual workflow
Example:
  Backlog → Ready for Dev → In Progress → In Review → QA → Done
```

| State   | Meaning               | Who moves it |
|---------|-----------------------|--------------|
| Backlog | Not yet prioritized   | PM           |
| 📝 TODO |                       |              |
| 📝 TODO |                       |              |
| Done    | Deployed and verified | Developer    |

### Labels Convention

| Label          | When to apply                        |
|----------------|--------------------------------------|
| `dpe_common`   | Story requires changes to dpe_common |
| `dpe_api`      | Story targets the main API           |
| `gcp-cloudsql` | GCP CloudSQL related                 |
| `azure-sql-mi` | Azure SQL MI related                 |
| `terraform`    | Infrastructure/Terraform work        |
| `rabbitmq`     | RabbitMQ platform work               |
| `mongodb`      | MongoDB related                      |
| `harness`      | CI/CD pipeline work                  |
| `tech-debt`    | Technical debt reduction             |
| `security`     | Security-related                     |
| `monitoring`   | Observability improvements           |

📝 TODO: Add any additional labels your team uses

### Components

📝 TODO: Define Jira components

| Component      | Owner   | Repos                                      |
|----------------|---------|--------------------------------------------|
| Core API       | 📝 TODO | dpe_api                                    |
| Shared Library | 📝 TODO | dpe_common, wdpr-dpe-*-lib                 |
| GCP Services   | 📝 TODO | dpe_api_gcp_cloudsql, dpe_api_gcp_vertexai |
| Azure Services | 📝 TODO | dpe-api-azure-sql-mi                       |
| Orchestrator   | 📝 TODO | wdpr-dpe-orchestrator                      |
| Infrastructure | 📝 TODO | terraform, dxcp-manifesto-*                |
| RabbitMQ       | 📝 TODO | helm-rabbitmq, rmq-*                       |
| Monitoring     | 📝 TODO | dpe_pmm, log-aggregator-*                  |

## Story Points & Estimation

### Point Scale

📝 TODO: Confirm these values with the team or adjust to your actual convention

| Points | Time Equivalent | Complexity | Example |
|--------|----------------|------------|---------||
| 1 | ≤ 4 hours | Trivial — config change, typo fix, one file | Update env variable in tfvars |
| 2 | 4–8 hours | Small — clear approach, 2-3 files | Add new endpoint to existing router |
| 3 | 1–2 days | Standard — known pattern, tests needed | New use case with provider |
| 5 | 2–3 days | Medium — multi-layer, new pattern | New cloud provider implementation |
| 8 | 3–5 days | Large — cross-repo, significant testing | New module in dpe_api with full stack |
| 13 | 1–2 weeks | Too large — MUST be split | New service from scratch |

### Estimation Rules

1. **13 points = mandatory split** — No story stays at 13. Break it down.
2. **Points include testing** — Tests are not a separate task; they're part of the story.
3. **Points include code review time** — Account for review cycles.
4. **Uncertainty = spike first** — If the team can't estimate, create a time-boxed spike (max 1 day).
5. **Cross-repo = add 1-2 points** — dpe_common changes add overhead (publish + consumer update).

### Velocity

📝 TODO: Document team velocity

| Metric                 | Value                                   |
|------------------------|-----------------------------------------|
| Team size              | 📝 TODO developers                      |
| Sprint duration        | 📝 TODO weeks                           |
| Average velocity       | 📝 TODO points/sprint                   |
| Capacity planning rule | 80% of velocity (buffer for interrupts) |

## Sprint Ceremonies

📝 TODO: Document sprint ceremony schedule

| Ceremony           | Day/Time | Duration | Participants |
|--------------------|----------|----------|--------------|
| Sprint Planning    | 📝 TODO  | 📝 TODO  |              |
| Daily Standup      | 📝 TODO  | 15 min   |              |
| Backlog Grooming   | 📝 TODO  | 📝 TODO  |              |
| Sprint Review/Demo | 📝 TODO  | 📝 TODO  |              |
| Retrospective      | 📝 TODO  | 📝 TODO  |              |

## Epic Planning

### Epic Lifecycle

```text
📝 TODO: Confirm this matches your process

1. PM identifies initiative (from roadmap, stakeholder request, tech debt)
2. PM + Architect define scope and approach
3. PM creates Epic in Jira with:
   - Clear objective and success criteria
   - Scope (in/out)
   - Target quarter
4. PM + Tech Lead decompose into stories
5. Team estimates stories in grooming
6. Stories pulled into sprints based on priority + dependencies
7. Epic closed when all stories are Done
```

### Epic Naming Convention

📝 TODO: Define your epic naming convention

```text
Suggested: [{Component}] {Capability} - {Phase}
Example:  [GCP CloudSQL] Self-Service Provisioning - Phase 1 (MVP)
```

### Roadmap Alignment

📝 TODO: Document how epics align to quarterly roadmap

- Q3 2026 priorities: 📝 TODO
- Q4 2026 priorities: 📝 TODO

## Story Dependencies

### Cross-Repo Dependency Rules

When a feature spans multiple repos, stories MUST be sequenced:

```text
1. [dpe_common] Interface/model changes
       ↓ blocked by
2. [dpe_common] Version bump + Nexus publish
       ↓ blocked by
3. [target_api] Implementation using new dpe_common
       ↓ blocked by
4. [terraform] Infrastructure provisioning (if needed)
       ↓ blocked by
5. [target_api] Integration test + deploy
```

### Link Types in Jira

| Link               | Usage                                    |
|--------------------|------------------------------------------|
| "is blocked by"    | Story cannot start until blocker is Done |
| "blocks"           | Reverse of above                         |
| "is part of"       | Story belongs to Epic                    |
| "relates to"       | Informational connection                 |
| "is duplicated by" | Duplicate stories (close one)            |

## Definition of Done (Global)

📝 TODO: Confirm or adjust this DoD with the team

### For Stories

- [ ] Code follows Clean Architecture layers
- [ ] Unit tests pass (≥90% coverage on new code)
- [ ] Pre-commit hooks pass (black, isort, flake8)
- [ ] PR approved by at least 1 reviewer
- [ ] No secrets in code
- [ ] Deployed to latest environment
- [ ] Acceptance criteria verified
- [ ] Documentation updated (if applicable)

### For Epics

- [ ] All stories are Done
- [ ] End-to-end tested in staging
- [ ] Documentation complete (README, Confluence)
- [ ] Stakeholder demo/sign-off
- [ ] Deployed to production

## Team Structure

📝 TODO: Document team roles

| Role            | Name    | Focus Area                          |
|-----------------|---------|-------------------------------------|
| Project Manager | 📝 TODO | Sprint planning, stakeholder comms  |
| Tech Lead       | 📝 TODO | Architecture decisions, code review |
| Senior Dev      | 📝 TODO | Core API, dpe_common                |
| Developer       | 📝 TODO |                                     |
| Developer       | 📝 TODO |                                     |
| DevOps/Infra    | 📝 TODO | Terraform, Harness, RabbitMQ        |
| DBA             | 📝 TODO | Oracle, RDS, MongoDB operations     |

## Confluence References

📝 TODO: Add links to PM documentation

| Topic                 | Confluence URL |
|-----------------------|----------------|
| Team Roadmap          |                |
| Sprint Board          |                |
| Velocity Reports      |                |
| Definition of Done    |                |
| Estimation Guidelines |                |
| Release Process       |                |
| Stakeholder Matrix    |                |
| Meeting Notes         |                |
