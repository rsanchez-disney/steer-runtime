# Graphify (Knowledge Graph Generation)

> 🧪 **Status:** Experimental
> **Since:** v0.4.200 (Koda)

Generates a code knowledge graph (`graph.json` + `GRAPH_REPORT.md`) that agents use to understand project architecture, dependencies, and entry points.

## Quick start

```bash
# Graphify a single project
koda graphify wdpr-config-services

# Graphify all projects in the active workspace
koda graphify --all

# Output to project directory (committable)
koda graphify wdpr-config-services --output project
```

## How it works

1. Scans the project for source files, imports, exports, and dependencies
2. Builds a directed graph of module relationships
3. Identifies entry points, hot paths, and architectural layers
4. Produces a `GRAPH_REPORT.md` summary for agent consumption
5. Produces a `graph.json` for programmatic use

## Output modes

| Mode | Location | Use case |
|------|----------|----------|
| local | `~/.kiro/workspaces/<ws>/graphify/` | Personal, not shared |
| project | `<project>/graphify-out/` | Committable, shared via git |
| workspace | `workspaces/<ws>/context/` | Shared within steer-runtime |

## What agents get from it

When a graph exists, agents can:
- Understand "where does X live in the codebase?"
- Know import/dependency chains before making changes
- Identify affected files when modifying a module
- Understand architectural boundaries (layers, packages)

## Graph report example

```markdown
# Knowledge Graph: wdpr-config-services

## Architecture
- Layers: controller → service → repository → model
- Modules: 47 Java classes, 12 REST endpoints

## Entry points
- ConfigController (REST /api/v1/config)
- PromotionController (REST /api/v1/promotion)

## Hot modules (most dependencies)
- ConfigService (imported by 8 classes)
- DynamoRepository (imported by 5 classes)

## External dependencies
- AWS SDK (DynamoDB, S3)
- Spring Boot 3.x
- Jackson JSON
```

## Limitations

- Works best with Java, TypeScript, Python, Go projects
- Large monorepos (500+ files) may take 30-60 seconds
- Graph freshness — regenerate after significant refactors
