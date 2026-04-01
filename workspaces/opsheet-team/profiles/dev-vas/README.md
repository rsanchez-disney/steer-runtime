# Dev VAS Profile

Koa/TypeScript specialist for `opsheet-plus-vas` — Lambda (ALB) + ECS API.

Requires `dev-core` as a base.

## Agents (1)

| Agent | Purpose |
|-------|---------|
| vasapi | Koa 2/TypeScript specialist (opsheet-plus-vas) |

## Structure

```
profiles/dev-vas/
├── agents/       # vasapi.json
├── prompts/      # vasapi.md
├── steering/     # 20-repo-vasapi-node.md, 30-pr-review-guide.md
└── skills/       # api-contract-compatibility-check, api-endpoint-implementation,
                  # api-export-streaming-and-timeouts, api-observability-logging
```

## Install

```bash
./setup.sh install dev-core dev-vas
```
