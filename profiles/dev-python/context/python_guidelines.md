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

- Use `async def` for I/O-bound endpoints
- Use `asyncio.gather()` for concurrent I/O
- Never mix sync blocking calls in async code
- Use `httpx` (async) over `requests` (sync) in async contexts

## Error Handling

- Use custom exception classes inheriting from `Exception`
- FastAPI: register exception handlers with `@app.exception_handler`
- Always return structured error responses with status code and message
- Log errors with `structlog` or `logging` — include request context

## Environment & Config

- Use `pydantic-settings` for typed configuration
- Load from environment variables with `.env` fallback
- Never commit `.env` files — use `.env.example` as template
- Use `python-dotenv` for local development
