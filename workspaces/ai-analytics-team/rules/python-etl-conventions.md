---
inclusion: always
description: Python/ETL development conventions for AI Analytics
---

# Python development conventions

## Code style

- Python 3.11+ features allowed (match statements, type unions with `|`, etc.)
- Line length: 100 characters max
- Linter: Ruff with rules E, F, I, UP
- Type checking: mypy strict mode — all functions must have type annotations
- Imports: sorted by Ruff (isort-compatible)

## Project structure

- Source in `src/data_pipeline/`
- Tests in `tests/` mirroring source structure
- Config in `config.toml` with Pydantic v2 schema validation

## New extractor pattern

When implementing a new extractor (ETL source):

1. Create `src/data_pipeline/extractors/<name>/extractor.py`
2. Add Pydantic config model to `config/schema.py`
3. Add `[<name>]` section to `config.toml`
4. Add Click command to `cli.py`
5. Add `make_<name>_writer()` to `output/factory.py`
6. Create MySQL table DDL (composite PK: date + user_email + model)
7. Add to `extract-all` CLI command
8. Add tests (unit + integration)
9. Update `v_ai_tools_data` view with UNION

## Testing

- Framework: pytest
- Target ≥90% coverage on new code
- Use fixtures for database mocking
- Integration tests use Docker MySQL (`docker compose up -d`)
- Run: `uv run pytest tests/ -v`

## Dependencies

- Add via: `uv add <package>`
- Dev deps: `uv add --dev <package>`
- Always pin major versions
- Snowflake connector: `snowflake-connector-python`

## Database

- MySQL 8.4+
- No enforced foreign keys — join on email fields
- Use UPSERT pattern (INSERT ... ON DUPLICATE KEY UPDATE)
- All tables need composite primary keys (date + user_email at minimum)
- Views prefixed with `v_`
- Stored procedures prefixed with `get_`

## Error handling

- Use custom exceptions inheriting from a base `PipelineError`
- Log errors with context (source, batch number, row count)
- Fail gracefully — partial imports should commit what succeeded
- Retry transient failures (network, Snowflake timeouts) up to 3 times

## Configuration

- All secrets via environment variables (never in config.toml)
- `config.toml` for non-sensitive settings
- Pydantic v2 `BaseSettings` for validation
- Document required env vars in README
