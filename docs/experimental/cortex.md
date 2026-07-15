# Cortex (Platform Architectural Knowledge Graph)

> 🧪 **Status:** Experimental
> **Since:** v0.2.160 (steer-runtime), v0.4.225 (Koda)

Extracts architectural metadata from workspace projects and serves a platform-level knowledge graph to agents via MCP. Agents can query which services exist, what endpoints they expose, how they communicate (HTTP, Kafka), and what contracts they share.

## Quick start

```bash
# One-time setup (installs uv + cortex)
koda cortex setup

# Extract graph from workspace projects
koda cortex extract

# Verify
koda cortex status
```

After extraction, agents with `@cortex/*` tools (orchestrator, architecture_agent) automatically gain platform awareness.

## How it works

```text
workspace.json (projects list + extractor_hints)
        │
        ▼  koda cortex extract
Deterministic parsers (Java, Android, iOS)
        │
        ▼
~/.kiro/workspaces/<team>/cortex/graph/latest.json
        │
        ▼  MCP server (stdio, auto-started)
Agents query @cortex/* tools
```

1. Reads the workspace's `projects` list and `cortex.extractor_hints`
2. Runs extractors against each project (no LLMs — rule-based parsing)
3. Aggregates results into a unified platform graph
4. MCP server starts automatically when a chat session begins

## MCP tools

| Tool                         | Description                                              |
|------------------------------|----------------------------------------------------------|
| `find_relevant_services`     | Keyword search across all services ("which handles payments?") |
| `list_endpoints`             | Endpoint index for a specific service                    |
| `get_service_context`        | Deep dive: dependencies, contracts, Kafka topics, communication |
| `get_endpoint_contract`      | Full request/response schema for one endpoint            |

## What agents get from it

When a Cortex graph exists, agents can:

- Answer "which services are involved in the payment flow?"
- Know what endpoints a service exposes before making cross-service calls
- Understand Kafka event flows between services
- Inspect DTO contracts to avoid breaking changes
- Identify inter-service dependencies for impact analysis

## Workspace configuration

Add `cortex` to your `workspace.json`:

```json
{
  "name": "my-team",
  "cortex": {
    "enabled": true,
    "auto_extract": false,
    "extractor_hints": {
      "payment-service": {
        "type": "backend-java",
        "domain": "payments",
        "tier": "critical",
        "purpose": "Core payment processing"
      },
      "mobile-app": {
        "type": "android",
        "domain": "mobile",
        "tier": "critical",
        "purpose": "Android consumer app"
      }
    }
  },
  "projects": [...]
}
```

### Fields

| Field                          | Type   | Default    | Description                                        |
|--------------------------------|--------|:----------:|----------------------------------------------------|
| `cortex.enabled`               | bool   |    true    | Enable Cortex for this workspace                   |
| `cortex.auto_extract`          | bool   |   false    | Re-extract automatically on `koda sync`            |
| `cortex.extractor_hints.<name>.type` | string | inferred | Extractor type (see supported types below)   |
| `cortex.extractor_hints.<name>.owner` | string | workspace team | Owning team                          |
| `cortex.extractor_hints.<name>.domain` | string | workspace name | Business domain                     |
| `cortex.extractor_hints.<name>.tier` | string | "standard" | Service tier (critical, standard, experimental) |
| `cortex.extractor_hints.<name>.purpose` | string | project name | Short description                    |
| `cortex.extractor_hints.<name>.keywords` | list | [] | Additional search keywords                      |

## Supported extractor types

| Type             | What it parses                                                        |
|------------------|-----------------------------------------------------------------------|
| `backend-java`   | Spring Boot endpoints, Kafka topics, DTOs, Gradle deps, Flyway, inter-service calls |
| `android`        | Gradle modules, permissions, SDK versions, dependency graph           |
| `ios`            | Xcode targets, SPM/CocoaPods deps, multi-target configurations        |

## Data storage

```text
~/.kiro/workspaces/<team>/cortex/
├── graph/
│   └── latest.json          ← aggregated platform graph
└── services/
    ├── payment-service/
    │   └── manifest.json    ← extracted service metadata
    └── mobile-app/
        └── manifest.json
```

## Prerequisites

| Dependency | Version | Install                    |
|------------|---------|----------------------------|
| uv         | ≥ 0.4   | `koda cortex setup` (auto) |
| cortex     | ≥ 1.0   | `koda cortex setup` (auto) |

`koda cortex setup` handles both automatically.

## Commands

```bash
koda cortex setup     # Install prerequisites
koda cortex extract   # Extract graph from workspace projects
koda cortex refresh   # Re-extract (alias for extract)
koda cortex serve     # Start MCP server manually
koda cortex status    # Show graph state and prerequisites
koda doctor           # Includes Cortex health checks
```

## Cortex vs graphify vs yax

| Layer        | Tool     | Scope      | Question it answers                             |
|--------------|----------|------------|-------------------------------------------------|
| Code-level   | graphify | One repo   | "What functions call X? What are the clusters?" |
| Architecture | Cortex   | All repos  | "Which services handle payments? What endpoints exist?" |
| Session      | yax      | Across time | "What did we decide about the auth refactor?"  |

## Limitations

- Currently supports Java/Spring Boot, Android, and iOS projects
- TypeScript/Node, Go, Python extractors are not yet available
- Extraction reflects code at the time `koda cortex extract` was run — not live
- Large workspaces (20+ projects) may take 1-2 minutes to extract
- Projects without `extractor_hints` default to `backend-java` type inference
