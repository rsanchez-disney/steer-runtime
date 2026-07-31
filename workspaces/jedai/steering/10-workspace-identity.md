---
inclusion: always
---

# Workspace identity — jedai

## What this workspace is

The development workspace for the JedAI internal AI platform: a suite of three interconnected projects that together provide a model gateway, chat UI, and developer portal for teams consuming AI capabilities.

## Repositories (3 projects)

| Repo          | Language       | Purpose                                                           |
|---------------|----------------|-------------------------------------------------------------------|
| portal        | Astro/MDX      | Official JedAI documentation site — guides, model catalog, reference |
| chat          | Python/Svelte  | Open WebUI deployment — team-facing chat UI over LiteLLM          |
| gateway       | Python         | LiteLLM proxy — routes to OpenAI, Bedrock, Ollama, and others     |

## Primary tasks in this workspace

- Develop and maintain the JedAI portal (auth, dashboards, model catalog)
- Configure and extend the chat UI (custom pipelines, SSO, model management)
- Manage LiteLLM gateway (routing rules, cost controls, new provider onboarding)
- Integrate the three projects end-to-end (portal → openwebui → litellm)

## Working directories

- portal:       `${WORKSPACE_ROOT}/jedai/portal`
- chat:         `${WORKSPACE_ROOT}/jedai/chat`
- gateway:      `${WORKSPACE_ROOT}/jedai/gateway`

## Conventions

- Default branch: `main` for all repos
- Python services: FastAPI + Pydantic, async-first
- All secrets via env vars — never in code or workspace files
- Model routing: always reference logical names via LiteLLM, never raw provider endpoints
- Commit format: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
