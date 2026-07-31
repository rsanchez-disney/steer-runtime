# OpenWebUI — Project Context

## What it is

This project is the JedAI team's deployment and customization layer on top of [Open WebUI](https://github.com/open-webui/open-webui). It provides a polished chat interface for internal teams to interact with AI models routed through LiteLLM.

## Customizations tracked here

- **SSO integration** — OIDC/OAuth2 configuration for internal identity provider
- **Custom pipelines** — preprocessing / postprocessing hooks for model requests
- **Model management** — override display names, restrict models per team
- **Docker configuration** — `docker-compose.yml` and environment variable templates

## Tech Stack

- Python (FastAPI backend, Open WebUI server)
- Svelte (upstream frontend — avoid deep modifications, prefer config/pipeline approach)
- Docker / Docker Compose for local dev and deployment

## Integration Points

- Connects to **LiteLLM** as the model backend (`OPENAI_API_BASE_URL` → LiteLLM endpoint)
- Auth via internal OIDC provider
- Session storage: Redis or SQLite (confirm with ops team)

## Key Principle

> Prefer configuration and pipeline hooks over code patches to the upstream Open WebUI codebase. This keeps upgrades manageable.

## Ownership

- **Team**: JedAI Platform
- **Repo**: `jedai/chat` on `github.disney.com`
- **Upstream**: https://github.com/open-webui/open-webui
