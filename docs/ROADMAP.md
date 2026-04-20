# steer-runtime — Roadmap

> Have an idea or found a bug? → [Waypoints](https://github.disney.com/users/SANCR225/projects/2/views/1) · [Open an issue](https://github.disney.com/SANCR225/steer-runtime/issues/new/choose)

---

## 🔜 Next Up

### 1. Per-Project Manifest (`project.yaml`)

Drop a `project.yaml` in any repo and agents instantly know the stack, build commands, Jira prefix, and specs location — no fork required. Teams adopt steer-runtime without modifying it.

- Agents read `project.yaml` at point of use for branch names, test commands, integrations
- Complements (not replaces) freeform memory banks
- Template already shipped in `common/templates/project.yaml` — next step is agent integration

**Why first:** This is the key to adoption without forking. Any team, any project, zero changes to steer-runtime.

### 2. Spec-Driven Development

Agents that generate and consume structured project specifications.

- Base spec generation — analyze a codebase and produce foundational docs (architecture, testing, coding standards)
- Spec-aware agents — architecture, code review, and planning agents reference specs for context
- Skills and templates already shipped — next step is wiring agents to read/write specs

### 3. Expanded Tech Stack Rules

Broader coverage so agents produce quality output regardless of stack.

- Already shipped: C#, Kubernetes, AWS, SQL, API design, testing strategies, performance
- Next: Liquibase, Terraform, Python, React, Docker
- Rules are additive — install only what your stack needs

### 4. CLI Maturity (Koda)

Compiled Go binary replacing `setup.sh`. Tracked in the [Koda repo](https://github.disney.com/SANCR225/Koda).

- Self-update (`koda self-update`)
- Deep health check (`koda doctor`)
- Drift detection (`koda status`)
- Daily auto-update via LaunchAgent/cron
- Interactive TUI dashboard

---

## 📋 Planned

### Artifact Generation & Quality Gates

Structured document generation with formal review gates.

- Artifact templates — PRD, backlog, test plan, ADR, bounded context
- PRD and backlog generation agents
- Quality gate mechanism — formal approve/reject/revise gates between steps
- Enhanced test plan agent with Gherkin test case generation

### Architecture & QA Depth

- Architecture agent expansion — bounded context, ADR writer, architecture spec agents
- QE agent expansion — QE strategy, E2E test generator, web discovery, test framework agents
- Agent quality evaluation — automated scoring with rubrics and fixtures
- Schema validation for agent configs and workspace manifests

### Economics & Portability

- Token usage tracking — per-agent, per-workflow logging with cost estimation
- Project abstraction — extract org-specific references into configurable variables
- Engagement templates — pre-built workspace configs for common project types

---

## ✅ Completed

### v3.6.0

| Feature | What shipped |
|---------|-------------|
| Koda CLI | Primary setup method with install scripts for macOS, Linux, Windows |
| Skills library | 7 reusable workflows in `common/skills/` |
| Spec templates | 6 templates in `common/templates/specs/` |
| Project manifest | `common/templates/project.yaml` template |
| Expanded rules | 7 new tech stack rules in `common/rules/` |
| PM workspaces | DTA, UAD sustainment, UAD ongoing team workspaces |
| Issue templates | Feature request and bug report templates → Waypoints |

### Earlier

| Version | Highlights |
|---------|-----------|
| v3.5.0 | Team workspaces, dev profile split, fork strategy |
| v3.0.0 | 41 agents across 5 SDLC profiles, IDE-portable (Kiro CLI, Cursor, Amazon Q, Kite) |

---

## 💡 Propose a Feature

We track ideas and issues in [Waypoints](https://github.disney.com/users/SANCR225/projects/2/views/1), our GitHub Project board.

To propose a feature or report a bug:

1. [Open an issue](https://github.disney.com/SANCR225/steer-runtime/issues/new/choose) using one of the templates
2. Your issue will appear in the **Proposed** column on Waypoints
3. We'll review, discuss, and move it through the board as it progresses

All ideas welcome — new agents, skills, rules, IDE targets, integrations, or workflow improvements.
