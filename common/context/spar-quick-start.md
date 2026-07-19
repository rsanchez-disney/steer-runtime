# Spar agent — quick start

## What spar_agent does

The `spar_agent` generates, validates, renders, and enriches architecture models in the `.spar.yaml` format. It turns workspace repos into visual, validated architecture documentation.

## How to invoke (via orchestrator)

Say any of these to trigger delegation:

- "generate a spar model for this workspace"
- "render the architecture diagram"
- "what's the system topology?"
- "diff the architecture between these two files"
- "enrich the spar model with Cortex data"
- "validate the architecture model"

## Direct usage (when talking to spar_agent directly)

### Generate a model

```
Generate a spar model for the payment-controls workspace
```

The agent will:
1. Read workspace.json to identify repos
2. Query Cortex for service topology (if available)
3. Create a `.spar.yaml` with services, connections, and views
4. Validate and render the result

### Render a diagram

```
Render the architecture for examples/payment-controls-enriched.spar.yaml
```

Returns a Mermaid diagram you can paste into GitHub/Notion/Slides.

### Compare versions

```
Diff the old and new architecture models
```

Shows added/removed/modified services, connections, and types.

### Enrich progressively

```
Enrich the broker service with port and protocol detail
```

Adds L1/L2 detail to a specific service without restructuring.

### Import from OpenAPI

```
Import the payload types from api/openapi.yaml into our spar model
```

Pulls JSON Schema definitions from OpenAPI into `types.payloads`.

## MCP tools available

| Tool                  | What it does                              |
|-----------------------|-------------------------------------------|
| `@spar/spar_validate` | Check model against schema + lint rules  |
| `@spar/spar_load`     | Load and inspect a model                 |
| `@spar/spar_render`   | Generate Mermaid/Graphviz/JSON diagram   |
| `@spar/spar_add_service` | Add a service to the model            |
| `@spar/spar_add_connection` | Add a connection between services  |
| `@spar/spar_enrich`   | Add detail to a service (ports, runtime) |
| `@spar/spar_merge_fragment` | Merge a fragment into the model    |

## Detail levels

| Level | Content                           | Source                     |
|:-----:|-----------------------------------|----------------------------|
| L0    | Services + connections            | workspace.json, manual     |
| L1    | + ports, protocols, runtime       | Cortex, code scan          |
| L2    | + payload types (JSON Schema)     | OpenAPI, Cortex DTOs       |
| L3    | + SLAs, telemetry bindings        | Splunk, load tests         |

## Example model (minimal L0)

```yaml
spec: spar/v0.1
kind: System
metadata:
  name: my-system
services:
  frontend:
    kind: client
  api:
    kind: service
connections:
  frontend-to-api:
    from: frontend
    to: api
    kind: sync
```
