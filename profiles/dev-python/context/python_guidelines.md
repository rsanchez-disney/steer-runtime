# Python Development Guidelines

## Framework Selection

| Need | Recommended |
|------|------------|
| REST API (new project) | FastAPI |
| Legacy API / simple service | Flask |
| Full-stack web app | Django |
| CLI tool | Click or Typer |
| Data pipeline | Plain Python + asyncio |

## Dependency Management

- Use `pip-tools` or `uv` for dependency pinning
- Pin exact versions in `requirements.txt` for production
- Use `pyproject.toml` for project metadata and tool config
- Virtual environments: `venv` or `uv venv`

## Async Patterns

Use `async def` for I/O-bound endpoints. Never mix sync blocking calls in async code.

```python
# ❌ BAD — blocks event loop
import requests
async def get_user(user_id: str):
    response = requests.get(f"/api/users/{user_id}")
    return response.json()

# ✅ GOOD — non-blocking
import httpx
async def get_user(user_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"/api/users/{user_id}")
        return response.json()
```

- Use `asyncio.gather()` for concurrent I/O operations
- Use `httpx` (async) over `requests` (sync) in async contexts
- Use `asyncio.to_thread()` to run sync code in async context when no async alternative exists

## Error Handling

```python
# Custom exception hierarchy
class AppError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code

class NotFoundError(AppError):
    def __init__(self, resource: str, id: str):
        super().__init__(f"{resource} {id} not found", 404)

# FastAPI exception handler
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})
```

- Use custom exception classes inheriting from `Exception`
- Always return structured error responses with status code and message
- Log errors with `structlog` or `logging` — include request context

## Environment & Config

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    api_key: str
    debug: bool = False

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
```

- Use `pydantic-settings` for typed configuration
- Load from environment variables with `.env` fallback
- Never commit `.env` files — use `.env.example` as template

## Common Pitfalls

1. **Mutable default arguments** — use `None` and initialize inside function
```python
# ❌ BAD
def append_to(element, to=[]):
    to.append(element)
    return to

# ✅ GOOD
def append_to(element, to=None):
    if to is None:
        to = []
    to.append(element)
    return to
```

2. **Not closing resources** — always use context managers (`with` statements)
3. **Ignoring type hints** — add them for IDE support and error detection
4. **Hardcoding secrets** — always use environment variables
5. **Using `requests` in async code** — use `httpx` instead
