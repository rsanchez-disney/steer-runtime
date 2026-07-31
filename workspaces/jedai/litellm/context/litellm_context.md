# LiteLLM — Project Context

## What it is

This project contains the JedAI team's LiteLLM proxy configuration and any custom extensions. LiteLLM provides a unified OpenAI-compatible API that routes requests to multiple LLM providers.

## Providers currently configured

| Provider       | Models                              | Notes                        |
|----------------|-------------------------------------|------------------------------|
| OpenAI         | gpt-4o, gpt-4o-mini, o1, o3-mini    | Primary provider             |
| AWS Bedrock    | claude-3-5-sonnet, claude-3-haiku   | Via Bedrock runtime          |
| Ollama (local) | llama3.2, mistral                   | Dev/testing only             |

## Key capabilities managed here

- **Routing rules** — model aliases, fallbacks, load balancing
- **Rate limiting** — per-team/per-key request and token limits
- **Cost tracking** — budget alerts, per-key spend attribution
- **Virtual keys** — team-scoped API keys mapped to provider credentials
- **Guardrails** — input/output filtering hooks

## Configuration approach

LiteLLM is configured via `config.yaml` (or environment variables for secrets). Key files:

```
config.yaml          ← Main routing and model config
.env.example         ← Required env vars template (no real values)
docker-compose.yml   ← Local dev setup
helm/                ← Kubernetes deployment (if applicable)
```

## Integration Points

- **chat** → LiteLLM (gateway) via `OPENAI_API_BASE_URL`
- **portal** → gateway `/model/list` and `/spend/logs` endpoints
- **Provider credentials** → via environment variables / secret manager, never in config.yaml

## Ownership

- **Team**: JedAI Platform
- **Repo**: `jedai/gateway` on `github.disney.com`
- **Upstream**: https://github.com/BerriAI/litellm
