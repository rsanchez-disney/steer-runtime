# BlueDolphin MCP server

Read-only MCP server for BlueDolphin Enterprise Architecture — search applications by BAPP ID, browse relationships, list workspaces, and inspect object schemas.

## Quick start

### 1. Get credentials

BlueDolphin supports two auth methods:

**Option A: OData (recommended for read-only)**

Contact the BlueDolphin admin to get your OData token, then:

```bash
koda env set BD_USE_ODATA true
koda env set BD_ODATA_USERNAME twdc
koda tokens set BD_ODATA_PASSWORD
```

**Option B: REST API key**

1. Request the PUBLIC_API add-on activation from your BlueDolphin admin
2. Generate a user API key (requires admin to create via Key Management API)
3. Set the credentials:

```bash
koda env set BD_TENANT twdc
koda env set BD_REGION eu
koda tokens set BD_API_KEY
```

### 2. Enable and sync

```bash
koda mcp enable bluedolphin
koda sync
```

### 3. Verify

```bash
koda doctor    # should show: ✓ bluedolphin
```

### 4. Use it

Ask any agent with `@bluedolphin/*` tools:

```text
"Find the architecture for BAPP0006350"
"List all applications in the TWDC workspace"
"Show me the relationships for the payment service"
"What object types are available in BlueDolphin?"
```

## Available tools

| Tool | Description |
|------|-------------|
| `bd_validate_connection` | Test API connectivity and auth |
| `bd_search_objects` | Search objects by name, BAPP ID, or filter |
| `bd_get_object` | Get full details for a specific object |
| `bd_list_objects` | List objects with workspace/type filters |
| `bd_list_relations` | Show relationships for an object |
| `bd_list_workspaces` | List available workspaces |
| `bd_list_object_types` | List object type schemas |

## Configuration

| Variable | Required | Description |
|----------|:--------:|-------------|
| `BD_TENANT` | Yes | Tenant name (default: `twdc`) |
| `BD_REGION` | No | API region: `eu` or `us` (default: `eu`) |
| `BD_API_KEY` | If REST | User API key for REST API |
| `BD_USE_ODATA` | If OData | Set to `true` for OData auth |
| `BD_ODATA_USERNAME` | If OData | OData username (tenant name) |
| `BD_ODATA_PASSWORD` | If OData | OData authentication token |

## Architecture

```text
Agent → @bluedolphin/* tool call → bluedolphin-mcp (stdio)
                                          │
                              ┌────────────┼────────────┐
                              │ OData API  │  REST API  │
                              │ (read-only)│  (full)    │
                              └────────────┴────────────┘
                                          │
                              ┌────────────▼────────────┐
                              │  BlueDolphin Platform    │
                              │  https://bluedolphin.app │
                              │  /twdc                   │
                              └─────────────────────────┘
```

## References

- [BlueDolphin user guide (Confluence)][user-guide]
- [BlueDolphin platform][platform]
- [API documentation (Swagger)][swagger]
- [ValueBlue support][support]

## Development

```bash
cd shared/tools/mcp-servers/bluedolphin-mcp
npm install
npm run build
npm run inspector   # interactive testing with MCP Inspector
```

<!-- Links -->
[platform]: https://bluedolphin.app/twdc
[swagger]: https://public-api.eu.bluedolphin.app/swagger/index.html
[support]: https://support.valueblue.nl/hc/en-us/categories/13253352426140-API-Documentation
[user-guide]: https://disneyexperiences.atlassian.net/wiki/spaces/~dan.ballagh@disney.com/pages/93291473/BlueDolphin+-+User+Guide
