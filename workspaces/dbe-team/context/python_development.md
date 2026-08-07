# Python Development Context

> **⚠️ TEAM ACTION REQUIRED**: This document contains placeholders that must be filled by the DBE team.
> Each section marked with `📝 TODO` needs real content from team members who own that domain.

## Development Workflow

### Local Setup

📝 TODO: Document the local development setup process

- Python version management (pyenv? system Python?)
- Poetry installation and Nexus registry configuration
- Local environment variables needed
- How to run services locally (docker-compose?)
- How to authenticate locally (AUTHZ_VALIDATION_ENABLED: false?)

### Code Style & Linting

- **Formatter**: black (line-length=120)
- **Import sorting**: isort
- **Linter**: flake8
- **Type checking**: mypy (strict mode only when using `Protocol`)
- **Pre-commit**: Required on all repos

```bash
pre-commit install
pre-commit run --all-files
```

**Planned Migration (Rust-based tooling):**

| Current Tool           | Future Tool | Timeline          | Benefits                                 |
|------------------------|-------------|-------------------|------------------------------------------|
| black + isort + flake8 | **Ruff**    | Next quarter      | 10-100x faster, single tool, Rust-based  |
| Poetry                 | **uv**      | Following quarter | Faster dependency resolution, Rust-based |

When migrating to Ruff, configure `pyproject.toml`:

```toml
[tool.ruff]
line-length = 120
select = ["E", "F", "I", "UP", "B", "SIM"]

[tool.ruff.isort]
known-first-party = ["dpe_common"]
```

### Branch Naming

Use the following branch naming convention with the **MERCURY** Jira project prefix:

| Type    | Pattern                                       | Example                                   |
|---------|-----------------------------------------------|-------------------------------------------|
| Feature | `feat/MERCURY-{ticket}-{short-description}`   | `feat/MERCURY-1234-add-gcp-provider`      |
| Bug fix | `fix/MERCURY-{ticket}-{short-description}`    | `fix/MERCURY-5678-null-response-handling` |
| Hotfix  | `hotfix/MERCURY-{ticket}-{short-description}` | `hotfix/MERCURY-9012-prod-timeout`        |
| Test    | `test/MERCURY-{ticket}-{short-description}`   | `test/MERCURY-3456-integration-coverage`  |
| Chore   | `chore/MERCURY-{ticket}-{short-description}`  | `chore/MERCURY-7890-update-dependencies`  |

### PR Conventions

- **One Jira ticket = one PR** — avoid bundling unrelated changes
- **PR title format**: `MERCURY-{ticket}: {description}`
- **Include BEFORE/AFTER** for any behavioral change
- **Minimal diff** — don't refactor unrelated code in the same PR
- **Run pre-commit and tests** before submitting

```text
# Good PR title
MERCURY-1234: Add GCP Cloud SQL provider implementation

# Bad PR title
Add new provider and fix some bugs and update deps
```

### Logging Conventions

Use `dpe_common` JSON formatter (inherited in all API projects) for structured Splunk-compatible logs.

**Log levels:**

| Level     | Use for                                         |
|-----------|-------------------------------------------------|
| `DEBUG`   | Development troubleshooting, verbose payloads   |
| `INFO`    | Operational events, request/response summaries  |
| `WARNING` | Recoverable issues, deprecation notices         |
| `ERROR`   | Failures requiring attention, exception details |

**Rules:**

- Always include correlation IDs in request-scoped logs
- Never log sensitive data (tokens, credentials, PII, payment info)
- Guard expensive debug payloads: `if logger.isEnabledFor(logging.DEBUG):`
- Don't log the same event before AND after — one post-action log is enough
- Include payload context directly in error logs — don't rely on separate debug logs

### Security Alerts & Dependabot

Monitor Dependabot alerts in GitHub for security vulnerabilities in dependencies. When an alert is raised:

1. **Review the alert** — Check the severity and affected package in the GitHub Security tab
2. **Update pyproject.toml** — Manually bump the vulnerable package version to the patched release
3. **Update the lock file** — Run `poetry update <package-name>` (or `poetry update` for all)
4. **Validate the codebase** — Run `pre-commit run --all-files` to ensure compatibility
5. **Run tests** — Execute `poetry run pytest` to verify nothing broke
6. **Create a PR** — Commit the updated `pyproject.toml` and `poetry.lock` together

```bash
# Example workflow for a Dependabot alert on httpx
# 1. Edit pyproject.toml to bump httpx version
# 2. Update and validate
poetry update httpx
pre-commit run --all-files
poetry run pytest

# 3. Commit both files
git add pyproject.toml poetry.lock
git commit -m "fix(deps): bump httpx to address CVE-XXXX-XXXXX"
```

**Important**: Some transitive dependencies may not be directly listed in `pyproject.toml`. In those cases, you may need to add them explicitly or update a parent package that pulls them in.

### Annual Python Version Upgrade (October)

Every October, plan and execute the Python version upgrade to stay current with the latest stable release:

| Year | Target Python Version |
|------|-----------------------|
| 2026 | 3.13                  |
| 2027 | 3.14                  |
| 2028 | 3.15                  |
| 2029 | 3.16                  |

**Upgrade Process:**

1. **Review Python release notes** — Check new features, deprecations, and breaking changes
2. **Audit all dependencies** — Verify each third-party library supports the new Python version
3. **Update pyproject.toml** — Bump `python = "^3.XX"` and run `poetry update`
4. **Update Docker base images** — Ensure `python-docker-image-builder` has the new version available
5. **Run full test suite** — Execute `poetry run pytest` and fix any compatibility issues
6. **Update CI/CD pipelines** — Adjust Harness pipeline Python version references
7. **Gradual rollout** — Deploy to `latest` environment first, monitor for issues before promoting

### Third-Party Library Health Criteria

Before adding or keeping a dependency, verify it meets these criteria:

| Criterion                  | Minimum Requirement                                              |
|----------------------------|------------------------------------------------------------------|
| **Last commit**            | Within the last 12 months (24 months max for stable libs)        |
| **GitHub stars**           | ≥500 stars (or well-known within the ecosystem)                  |
| **PyPI downloads**         | ≥10,000 monthly downloads                                        |
| **Maintainer activity**    | Issues triaged, PRs reviewed, releases published                 |
| **Python version support** | Supports current and previous Python version (e.g., 3.12 + 3.13) |
| **Security track record**  | No unpatched CVEs older than 90 days                             |

**Avoid:**

- ❌ Libraries with <100 GitHub stars and no corporate backing
- ❌ Single-maintainer projects with no activity in 2+ years
- ❌ Libraries that vendor or wrap other libraries unnecessarily
- ❌ Dependencies that duplicate functionality already in `dpe_common` or the standard library

**When a dependency becomes stale:**

1. **Search for alternatives** — Look for actively maintained replacements with similar API
2. **Evaluate migration effort** — Assess breaking changes and refactoring scope
3. **Fork if critical** — As a last resort, fork the library under `DBE/` and maintain internally
4. **Document the decision** — Add an ADR if replacing a core dependency

```bash
# Check PyPI download stats
pip install pypistats
pypistats overall <package-name> --months 3

# Check GitHub activity (requires gh CLI)
gh repo view <owner>/<repo> --json stargazerCount,pushedAt
```

### Testing

- **Framework**: pytest + pytest-mock + pytest-asyncio
- **Coverage target**: ≥90%
- **Run tests**: `poetry run pytest`
- **Coverage report**: `poetry run pytest --cov --cov-report=html`

**Test naming conventions:**

| Test Type         | Naming Pattern                                          | Example                                                             |
|-------------------|---------------------------------------------------------|---------------------------------------------------------------------|
| Unit tests        | `test_{method_name}`                                    | `test_execute_returns_success`                                      |
| BDD / Integration | `test_given_{precondition}_when_{action}_then_{result}` | `test_given_valid_credentials_when_authenticate_then_returns_token` |

**Flaky test prevention:**

- Use `pytest` fixture scoping (`function`, `class`, `module`, `session`) appropriately
- Always clean up mocks with `monkeypatch` or context managers
- Avoid shared mutable state between tests
- Use `pytest-asyncio` with `mode=auto` for async tests
- Mock external services (AWS, GCP, databases) — never call real endpoints in unit tests
- Use `freezegun` or `time-machine` for time-dependent tests

**Test template (unit test):**

```python
import pytest
from unittest.mock import AsyncMock, MagicMock

from module.application.use_cases import FeatureUseCase
from module.application.interfaces import IRepository, IProvider


@pytest.fixture
def mock_repository() -> AsyncMock:
    """Provide a mocked repository."""
    return AsyncMock(spec=IRepository)


@pytest.fixture
def mock_provider() -> MagicMock:
    """Provide a mocked provider."""
    return MagicMock(spec=IProvider)


@pytest.fixture
def use_case(mock_repository: AsyncMock, mock_provider: MagicMock) -> FeatureUseCase:
    """Provide the use case with mocked dependencies."""
    return FeatureUseCase(repository=mock_repository, provider=mock_provider)


class TestFeatureUseCase:
    """Tests for FeatureUseCase."""

    async def test_execute_returns_success(
        self,
        use_case: FeatureUseCase,
        mock_repository: AsyncMock,
    ) -> None:
        # Arrange
        mock_repository.find.return_value = [{"id": "123"}]

        # Act
        result = await use_case.execute(params={"query": "test"})

        # Assert
        assert result.status_code == 200
        mock_repository.find.assert_called_once()

    async def test_execute_handles_repository_error(
        self,
        use_case: FeatureUseCase,
        mock_repository: AsyncMock,
    ) -> None:
        # Arrange
        mock_repository.find.side_effect = RepositoryError("Connection failed")

        # Act
        result = await use_case.execute(params={"query": "test"})

        # Assert
        assert result.status_code == 500
        assert "Connection failed" in result.message
```

📝 TODO: Document integration test patterns

- How to run integration tests locally
- Test environment URLs
- Test data management

## Deployment Process

### Environments

| Environment | Purpose                 | URL     |
|-------------|-------------------------|---------|
| latest      | Development/integration | 📝 TODO |
| staging     | Pre-production          | 📝 TODO |
| load        | Performance testing     | 📝 TODO |
| production  | Live traffic            | 📝 TODO |

### CI/CD Pipeline (Harness)

📝 TODO: Document the Harness pipeline stages

- Pipeline trigger (PR merge to develop? Tag?)
- Build stage (Docker image build)
- Test stage (unit + integration)
- Deploy to latest (automatic?)
- Promote to staging (manual approval?)
- Promote to production (change request required?)

### Docker

📝 TODO: Document Docker conventions

- Base image source (python-docker-image-builder weekly builds)
- Dockerfile standards
- docker-compose.yml for local development
- Image registry (ECR? Other?)

### ECS Deployment

📝 TODO: Document ECS deployment specifics

- Task definition conventions
- Service configuration
- Auto-scaling rules
- Health check endpoints
- Log configuration (Splunk? CloudWatch?)

## Nexus (Internal PyPI)

### Poetry Commands Reference

```bash
# Dependency management
poetry install                    # Install all dependencies
poetry add <package>              # Add a dependency
poetry add --group dev <package>  # Add a dev dependency
poetry remove <package>           # Remove a dependency
poetry update                     # Update all dependencies
poetry update dpe_common          # Update specific package (after Nexus publish)
poetry show --outdated            # List outdated packages

# Running code
poetry run python script.py       # Run a script
poetry run pytest                 # Run tests
poetry run pytest --cov           # Run tests with coverage

# Code quality
poetry run black .                # Format code
poetry run isort .                # Sort imports
poetry run flake8                 # Lint code
poetry run mypy .                 # Type check (when using Protocol)
pre-commit run --all-files        # Run all pre-commit hooks

# Environment
poetry env info                   # Show environment info
poetry env list                   # List virtual environments
poetry shell                      # Activate virtual environment
```

### Publishing dpe_common

📝 TODO: Document the Nexus publish workflow

- How to bump version (VERSION file + pyproject.toml)
- Who triggers the publish (Harness automatic? Manual?)
- Nexus repository URL
- How consumers update: `poetry update dpe_common`

### Consuming Packages

📝 TODO: Document how to configure Poetry to use Nexus

- `poetry source add` command
- pip.conf / pip.example file
- Required credentials

## Confluence References

📝 TODO: Add links to team Confluence documentation

| Topic                 | Confluence URL |
|-----------------------|----------------|
| Development Standards |                |
| Deployment Runbook    |                |
| Onboarding Guide      |                |
| Architecture Overview |                |
| API Design Guidelines |                |
| Security Standards    |                |
| Incident Response     |                |
