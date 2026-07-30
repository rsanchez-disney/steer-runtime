# Elasticsearch MCP Server

MCP server for querying Elasticsearch clusters across multiple environments (latest, stage, prod). Provides 5 tools for index discovery, search, ES|QL queries, mapping inspection, and shard analysis.

## Features

- **Multi-environment routing** — Each tool call accepts an `environment` parameter to target the correct cluster
- **5 tools** — `list_indices`, `search`, `esql`, `get_mappings`, `get_shards`
- **Cached clients** — Elasticsearch clients are created once per environment and reused
- **ES|QL support** — Columnar responses are automatically converted to readable objects

## Setup

### 1. Configure via Koda TUI

All environment variables are managed through the Koda TUI. Press `[t]` for tokens or `[m]` for the full MCP configuration screen:

```bash
koda
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ES_URL_LATEST` | **Yes** | Elasticsearch URL for latest/dev cluster |
| `ES_URL_STAGE` | **Yes** | Elasticsearch URL for stage cluster |
| `ES_URL_PROD` | **Yes** | Elasticsearch URL for production cluster |
| `ES_LATEST_API_KEY` | **Yes** | API key for latest cluster |
| `ES_STAGE_API_KEY` | **Yes** | API key for stage cluster |
| `ES_PROD_API_KEY` | **Yes** | API key for production cluster |

Each team must provide their own cluster URLs and API keys — there are no defaults.

### 2. Build

```bash
cd shared/tools/mcp-servers/elasticsearch-mcp
npm install
npm run prepare
```

This compiles TypeScript → JavaScript → bundled CJS at `dist/index.cjs`.

## Environment Routing

Every tool accepts an optional `environment` parameter:

| Value | Cluster |
|-------|---------|
| `"latest"` (default) | Latest/dev — `ES_URL_LATEST` |
| `"stage"` | Stage — `ES_URL_STAGE` |
| `"prod"` | Production — `ES_URL_PROD` |

If omitted, tools default to `"latest"`.

## Tool Reference

### list_indices

List indices matching a pattern. Returns health, status, doc count, and store size.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `environment` | `"latest" \| "stage" \| "prod"` | No | Target environment (default: latest) |
| `index_pattern` | `string` | **Yes** | Index pattern (e.g. `"*"`, `"wdw_*"`, `"boost_block*"`) |

**Example:**
```json
{
  "environment": "stage",
  "index_pattern": "wdw_*"
}
```

**Response:**
```json
[
  {
    "index": "wdw_entities_en-us",
    "health": "green",
    "status": "open",
    "docs.count": "1542876",
    "store.size": "2.1gb",
    "pri": "5",
    "rep": "1"
  }
]
```

---

### search

Execute an Elasticsearch search using full Query DSL.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `environment` | `"latest" \| "stage" \| "prod"` | No | Target environment (default: latest) |
| `index` | `string` | **Yes** | Index name to search |
| `query_body` | `object` | **Yes** | Full Elasticsearch Query DSL body |
| `fields` | `string[]` | No | Fields to include in `_source` |

**Example — match query:**
```json
{
  "environment": "latest",
  "index": "wdw_entities_en-us",
  "query_body": {
    "query": { "match": { "name": "Space Mountain" } },
    "size": 5
  },
  "fields": ["name", "type", "id"]
}
```

**Example — aggregation:**
```json
{
  "index": "wdw_entities_en-us",
  "query_body": {
    "size": 0,
    "aggs": {
      "types": {
        "terms": { "field": "type.keyword", "size": 20 }
      }
    }
  }
}
```

**Response:**
```json
{
  "total": 3,
  "hits": [
    {
      "_index": "wdw_entities_en-us",
      "_id": "abc123",
      "_score": 8.5,
      "_source": { "name": "Space Mountain", "type": "attraction", "id": "abc123" }
    }
  ]
}
```

---

### esql

Execute an ES|QL query. Results are automatically converted from columnar format to an array of objects.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `environment` | `"latest" \| "stage" \| "prod"` | No | Target environment (default: latest) |
| `query` | `string` | **Yes** | ES|QL query string |

**Example:**
```json
{
  "environment": "latest",
  "query": "FROM wdw_entities_en-us | STATS count = COUNT(*) BY type | SORT count DESC | LIMIT 10"
}
```

**Response:**
```json
{
  "columns": ["count (long)", "type (keyword)"],
  "rows": [
    { "count": 5432, "type": "attraction" },
    { "count": 3210, "type": "restaurant" }
  ],
  "total": 10
}
```

---

### get_mappings

Get field mappings for an index. Shows field names, types, and analyzer configurations.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `environment` | `"latest" \| "stage" \| "prod"` | No | Target environment (default: latest) |
| `index` | `string` | **Yes** | Index name |

**Example:**
```json
{
  "environment": "prod",
  "index": "wdw_entities_en-us"
}
```

**Response:**
```json
{
  "wdw_entities_en-us": {
    "mappings": {
      "properties": {
        "name": { "type": "text", "analyzer": "standard" },
        "type": { "type": "keyword" },
        "id": { "type": "keyword" }
      }
    }
  }
}
```

---

### get_shards

Get shard allocation information. Shows distribution across nodes, state, and document counts.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `environment` | `"latest" \| "stage" \| "prod"` | No | Target environment (default: latest) |
| `index` | `string` | No | Index name filter (omit for all indices) |

**Example:**
```json
{
  "environment": "stage",
  "index": "wdw_entities_en-us"
}
```

**Response:**
```json
[
  {
    "index": "wdw_entities_en-us",
    "shard": "0",
    "prirep": "p",
    "state": "STARTED",
    "docs": "308575",
    "store": "430mb",
    "node": "instance-0000000001"
  }
]
```

## Troubleshooting

### API Key Format

Elasticsearch API keys should be the **encoded** format (Base64 string), not the `id:api_key` pair. If you generated a key via Kibana or the API, use the `encoded` value directly:

```
ES_LATEST_API_KEY=dGhpcyBpcyBhIGZha2UgYXBpIGtleQ==
```

### Connection Errors

- **`ECONNREFUSED`** — Verify the URL is correct and accessible from your network
- **`401 Unauthorized`** — API key is invalid or expired. Generate a new one from Kibana → Stack Management → API Keys
- **`ENOTFOUND`** — DNS resolution failed. Check you're on VPN if required

### Missing Environment Variable

If you see `Missing required environment variable: ES_*`, ensure you've configured all 6 required variables via the Koda TUI (`koda` → press `[t]` or `[m]`).

### TLS Errors

The server uses `tls.rejectUnauthorized: true` by default. If you're hitting a cluster with a self-signed certificate in a dev environment, you may need to set `NODE_TLS_REJECT_UNAUTHORIZED=0` (not recommended for production).

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Bundle to dist/index.cjs
npm run bundle

# Full build (build + bundle)
npm run prepare
```

## Architecture

```
src/
├── index.ts           # MCP server setup, tool registration, request routing
├── utils/
│   └── client.ts      # Elasticsearch client factory with per-environment caching
└── tools/
    ├── listIndices.ts  # cat.indices API
    ├── search.ts       # Full Query DSL search
    ├── esql.ts         # ES|QL with columnar → object conversion
    ├── getMappings.ts  # Index mapping retrieval
    └── getShards.ts    # Shard allocation info
```

Each tool exports:
- `schema` — MCP tool definition (name, description, inputSchema)
- `handler` — Async function that executes the tool and returns MCP-formatted response
