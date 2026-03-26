# Specification Templates

Templates for generating structured project documentation. Used by the `generate-base-specifications` and `generate-spec-document` skills.

## Templates

| Template | Purpose |
|----------|---------|
| `architecture.md.template` | System architecture, components, layers, data flow |
| `api-contracts.md.template` | API endpoints, request/response schemas, error codes |
| `domain-model.md.template` | Domain entities, relationships, aggregates |
| `business-rules.md.template` | Validation rules, business logic, constraints |
| `workflows.md.template` | User flows, process diagrams, state machines |
| `data-dictionary.md.template` | Data structures, field definitions, schemas |

## Usage

These templates are referenced by skills — you don't use them directly. Run:
- `generate-base-specifications` to bootstrap a full spec set for a new project
- `generate-spec-document` to create a single spec after implementing changes
