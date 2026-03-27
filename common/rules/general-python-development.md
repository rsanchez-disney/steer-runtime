# Python Development Standards

## Style

- Follow PEP 8 — use `black` for formatting, `isort` for imports
- Maximum line length: 88 (black default)
- Use type hints for all function signatures
- Use docstrings (Google or NumPy style) for public functions and classes

## Project Structure

```
project/
├── src/project_name/     # Source code
│   ├── __init__.py
│   └── main.py
├── tests/                # Tests
├── pyproject.toml        # Project metadata and dependencies
├── requirements.txt      # Pinned dependencies (or use poetry.lock)
└── .python-version       # Python version
```

## Dependencies

- Use virtual environments (`venv`, `poetry`, `conda`)
- Pin dependency versions in production
- Separate dev dependencies from production
- Use `pyproject.toml` over `setup.py` for new projects

## Type Hints

```python
def get_user(user_id: int, include_email: bool = False) -> dict[str, Any]:
    """Fetch user by ID."""
    ...
```

- Use `from __future__ import annotations` for forward references
- Use `mypy` for static type checking

## Error Handling

- Use specific exception types, not bare `except:`
- Create custom exceptions for domain errors
- Use context managers (`with`) for resource management
- Log exceptions with traceback

## Testing

- Use `pytest` as the test framework
- Use `pytest-cov` for coverage
- Use fixtures for test setup
- Name tests: `test_function_name_scenario_expected`
- Aim for ≥90% coverage on new code

## Async

- Use `asyncio` for I/O-bound concurrency
- Use `async/await` consistently — don't mix sync and async
- Use `aiohttp` or `httpx` for async HTTP
