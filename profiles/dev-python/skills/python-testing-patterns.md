# Skill: Python testing patterns

Use when writing or reviewing tests for Python projects.

## Checklist
1. Use pytest fixtures for setup/teardown
2. Use `@pytest.mark.parametrize` for data-driven tests
3. Mock external dependencies with `pytest-mock` or `unittest.mock`
4. Use `httpx.AsyncClient` for FastAPI integration tests
5. Assert specific exceptions with `pytest.raises`
6. Check coverage: `pytest --cov=app --cov-report=term-missing`
