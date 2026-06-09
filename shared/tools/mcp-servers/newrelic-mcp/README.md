# New Relic MCP Server

Custom MCP server for querying New Relic via the NerdGraph GraphQL API. Read-only by design.

## Tools

| Tool | Description |
|------|-------------|
| `run_nrql` | Execute any NRQL SELECT query (read-only enforced) |
| `list_entities` | Search monitored entities by name/type |
| `get_entity_golden_signals` | Get response time, throughput, error rate for an entity |
| `get_alert_violations` | List active/recent alert violations |
| `get_deployments` | Get recent deployment markers for change correlation |

## Security

- **Read-only**: Only SELECT/FROM NRQL queries are allowed. Mutation keywords are rejected via `validateNrqlQuery()`.
- **Input sanitization**: All user-provided strings interpolated into NRQL are sanitized via `sanitizeNrqlString()` — strips single quotes, backslashes, and newlines to prevent injection.
- **No external dependencies beyond MCP SDK**: Minimizes supply chain risk.
- **API key stays local**: Loaded from environment variables, never transmitted to third parties.

## Setup

1. **Install dependencies:**
   ```bash
   cd shared/tools/mcp-servers/newrelic-mcp
   npm install
   npm run build
   ```

2. **Configure environment** (add to `~/.kiro/tokens.env` or `.env`):
   ```bash
   NEW_RELIC_API_KEY=NRAK-xxxxxxxxxxxxxxxxxxxx
   NEW_RELIC_ACCOUNT_ID=1234567
   NEW_RELIC_REGION=US   # US or EU
   ```

3. **Add to MCP config** (`.kiro/settings/mcp.json`):
   ```json
   {
     "mcpServers": {
       "newrelic": {
         "command": "node",
         "args": ["/path/to/steer-runtime/shared/tools/mcp-servers/newrelic-mcp/dist/index.cjs"],
         "env": {
           "NEW_RELIC_API_KEY": "NRAK-xxxxxxxxxxxxxxxxxxxx",
           "NEW_RELIC_ACCOUNT_ID": "1234567",
           "NEW_RELIC_REGION": "US"
         }
       }
     }
   }
   ```

## Development

```bash
npm run build       # Compile TypeScript
npm run bundle      # Create CJS bundle (dist/index.cjs)
npm run watch       # Watch mode
npm run test        # Run tests (vitest)
npm run test:watch  # Run tests in watch mode
npm run inspector   # Test with MCP Inspector
npm run typecheck   # Type check without emit
npm run lint        # Lint source files
npm run format      # Format source files
```

## Getting Your API Key

1. Go to New Relic → API Keys (User menu → API keys)
2. Create a **User** type key
3. Copy the key (starts with `NRAK-`)

## Getting Your Account ID

1. In the New Relic UI, click your user name (bottom-left)
2. Go to **Administration → Access Management** or look at the URL bar
3. Your Account ID is the numeric value in the URL (e.g., `https://one.newrelic.com/...?account=786801`)
4. Alternatively, it's listed under **API Keys** next to each key you create

## Architecture

```
src/
├── index.ts              # Server entry point
├── tools/
│   ├── runNrql.ts        # NRQL query execution
│   ├── listEntities.ts   # Entity search
│   ├── getEntityGoldenSignals.ts  # Golden signals
│   ├── getAlertViolations.ts      # Alert violations
│   └── getDeployments.ts          # Deployment markers
└── utils/
    ├── apiClient.ts      # NerdGraph HTTP client
    └── validators.ts     # Query validation (read-only enforcement)
```
