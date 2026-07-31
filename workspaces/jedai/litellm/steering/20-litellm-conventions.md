---
inclusion: always
---

# LiteLLM conventions — jedai-litellm

## Config management

- All routing, model aliases, and budgets live in `config.yaml`
- Provider API keys go in environment variables — **never** in `config.yaml`
- Use `.env.example` to document required variables (with placeholder values)
- Changes to `config.yaml` require a PR — do not edit directly on the server

## Adding a new model

1. Add the model entry in `config.yaml` under `model_list`
2. Set a logical `model_name` (e.g., `gpt-4o`) that callers will use
3. Map `litellm_params.model` to the provider-specific name
4. Test with: `litellm --test` or a curl against `/chat/completions`
5. Update the model catalog page in the portal (Astro doc site)

## Adding a new provider

1. Add provider credentials as env vars (document in `.env.example`)
2. Add model entries in `config.yaml`
3. Set up fallback routing if the provider is non-primary
4. Verify cost tracking is working (check `/spend/logs`)

## Virtual keys / team access

- Create virtual keys via the LiteLLM `/key/generate` API
- Tag keys with `metadata.team` for cost attribution
- Set per-key rate limits and budget caps
- Rotate keys on a schedule — never share keys between teams

## Testing

- Run `pytest tests/` for unit tests on custom extensions
- Use `litellm --test` for smoke testing gateway connectivity
- Never send real user data in test payloads

## Security

- No provider credentials in code, logs, or config files
- Rate limiting must be enabled before exposing to new teams
- Guardrails hooks must be reviewed before modifying
