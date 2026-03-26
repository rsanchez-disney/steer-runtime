# steer-runtime — Roadmap

> Have an idea or found a bug? → [Waypoints](https://github.disney.com/users/SANCR225/projects/2/views/1) · [Open an issue](https://github.disney.com/SANCR225/steer-runtime/issues/new/choose)

---

## ✅ Completed

### Phase 4 — Waifinder-Inspired Features (v3.6.0)

Closed content gaps identified from the dxt-waifinder comparative analysis.

| Feature | What shipped |
|---------|-------------|
| Skills library | 7 reusable workflows in `common/skills/` — implement-ticket, ship-it, generate-plan, fix-failing-test, review-changed-code, generate-base-specifications, generate-spec-document |
| Spec-driven development | 6 templates in `common/templates/specs/` — architecture, API contracts, domain model, business rules, workflows, data dictionary |
| Structured project manifest | `common/templates/project.yaml` — machine-readable config for stack, branch, commands, integrations |
| Expanded tech stack rules | 7 new rules in `common/rules/` — C#, Kubernetes, AWS, SQL, API design, testing strategies, performance |

### Earlier Releases

| Version | Highlights |
|---------|-----------|
| v3.6.0 | Koda CLI as primary setup method, install scripts, waifinder features |
| v3.5.0 | Team workspaces, Context7 MCP, dev profile split, fork strategy |
| v3.0.0 | 41 agents across 5 SDLC profiles, IDE-portable (Kiro CLI, Cursor, Amazon Q, Kite) |

---

## 🚧 In Progress

### Phase 1 — Artifact Generation & Quality Gates

Structured document generation with formal review gates.

- **Artifact templates** — PRD, backlog, test plan, ADR, bounded context templates
- **PRD generation agent** — research → draft → refine cycle using Jira + Confluence MCP
- **Backlog generation agent** — PRD → epics → features → user stories → story map
- **Quality gate mechanism** — formal approve/reject/revise gates between generation steps
- **Enhanced test plan agent** — structured output with Gherkin test case generation

### Phase 2 — Depth & Quality

Deeper architecture and QA coverage, plus evaluation and validation.

- **Architecture agent expansion** — split into bounded context, ADR writer, and architecture spec agents
- **QE agent expansion** — add QE strategy, E2E test generator, web discovery, and test framework agents
- **Agent quality evaluation** — automated scoring framework with rubrics and fixtures
- **Schema validation** — JSON Schema for agent configs, workflows, and workspace manifests

### Phase 3 — Economics & Portability

Token tracking and project abstraction for cross-org reuse.

- **Token usage tracking** — per-agent, per-workflow logging with cost estimation
- **Project abstraction** — extract Disney-specific references into configurable variables
- **Engagement templates** — pre-built workspace configs for common project types (greenfield API, legacy modernization, mobile app)

---

## 💡 Propose a Feature

We track ideas and issues in [Waypoints](https://github.disney.com/users/SANCR225/projects/2/views/1), our GitHub Project board.

To propose a feature or report a bug:

1. [Open an issue](https://github.disney.com/SANCR225/steer-runtime/issues/new/choose) using one of the templates
2. Your issue will appear in the **Proposed** column on Waypoints
3. We'll review, discuss, and move it through the board as it progresses

All ideas welcome — new agents, skills, rules, IDE targets, integrations, or workflow improvements.
