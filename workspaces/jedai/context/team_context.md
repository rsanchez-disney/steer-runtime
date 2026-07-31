# JedAI Platform — Team Context

## Team

- **Name**: JedAI Platform
- **Mission**: Build and operate the internal AI developer platform powering JedAI — portal, model gateway, and chat UI.

## Projects

- **portal** (jedai/portal) — Official JedAI platform documentation site, built with Astro
- **chat** (jedai/chat) — Open WebUI deployment and customization; team-facing chat UI powered by local and cloud models
- **gateway** (jedai/gateway) — LiteLLM gateway configuration; unified proxy routing requests to multiple LLM providers

## Architecture Overview

```
Users / Developers
       │
       ▼
 portal               ← Official documentation site (Astro)
       │
       ▼
  chat            ← Chat UI layer, model selection, conversation history
       │
       ▼
  gateway         ← Gateway: routing, rate limiting, cost tracking
       │
  ┌────┴─────┐
  ▼          ▼
OpenAI   Bedrock / Ollama / other providers
```

## Key Conventions

- Python services follow FastAPI patterns unless using an existing framework
- All secrets via environment variables — never hard-coded
- Model names are routed through LiteLLM; agents reference logical names, not provider endpoints
- OpenWebUI customizations are tracked as patches/overlays against upstream
