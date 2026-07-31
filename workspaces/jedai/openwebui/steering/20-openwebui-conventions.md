---
inclusion: always
---

# OpenWebUI conventions — jedai-openwebui

## Philosophy

Minimize patches to the upstream Open WebUI codebase. Favor:
1. Environment variable configuration
2. Open WebUI pipeline hooks (`pipelines/` directory)
3. Docker Compose overrides and volume mounts

Only patch upstream code when there is no other option, and document the patch clearly.

## Python conventions

- Python 3.11+
- Async-first (`async def`) for all I/O-bound functions
- Type hints required on all function signatures
- Dependencies pinned in `requirements.txt` — no open version ranges
- `pytest` for all tests; no `print()` in test output

## Pipeline development

Pipelines live in `pipelines/` and follow the Open WebUI pipeline API:

```python
from typing import List, Union
from pydantic import BaseModel

class Pipeline:
    class Valves(BaseModel):
        pass

    def __init__(self):
        self.name = "My Pipeline"

    async def on_startup(self): ...
    async def on_shutdown(self): ...
    async def pipe(self, user_message: str, model_id: str, messages: List[dict], body: dict) -> Union[str, dict]: ...
```

## Environment variables

Never hard-code values. Reference these env vars:
- `OPENAI_API_BASE_URL` — LiteLLM endpoint
- `OPENAI_API_KEY` — LiteLLM API key (via secret manager)
- `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET` — SSO credentials
- `REDIS_URL` — session store

## Upgrade process

Before pulling upstream updates:
1. Run `git diff HEAD upstream/main -- src/` to identify patched files
2. Review Open WebUI changelog for breaking changes
3. Re-apply patches on top of new version
4. Test login, model switching, and pipeline execution before promoting
