# Mermaid Diagram Requirements

Generate Mermaid diagrams for projects with non-trivial architecture. First determine if diagrams are needed.

## Skip diagrams when

- Kubernetes/Helm addon (Chart.yaml present, single chart, no app code)
- Simple scripts (single script, no orchestration)
- Simple config (only YAML/JSON/TOML, no logic)
- Docs-only (Markdown, no executable code)

## Minimal (1 diagram) when

- Terraform/infra (`*.tf` files) → `docs/architecture.mmd`
- Single-purpose tool → `docs/architecture.mmd`
- Script orchestration → `docs/architecture.mmd` or `docs/data-flow.mmd`

## Full set (3 diagrams) when

- Application/service (multiple components) → architecture + components + data-flow
- Monorepo (multiple packages) → architecture + components + data-flow
- Multi-tier system (API + DB + queue) → architecture + components + data-flow

## Diagram files

| File | Content |
|------|---------|
| `docs/architecture.mmd` | High-level architecture (flowchart/C4) |
| `docs/components.mmd` | Component relationships |
| `docs/data-flow.mmd` | Data flow, API calls (sequence/flowchart) |

## Workflow

1. Before generating: determine if diagrams are needed using heuristics above
2. New project: generate appropriate diagram set in `docs/`
3. Significant change: update affected diagrams
4. PR checklist: if architecture changed and diagrams exist, include updates
