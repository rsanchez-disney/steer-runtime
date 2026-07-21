# AI Analytics — Team context

## Project identity

- **Name:** MVP AI Analytics
- **Jira:** PAF (disneyexperiences.atlassian.net)
- **GitHub org:** DXT-AI-Analytics (github.disney.com)
- **Lead:** Andres Gomez
- **Objective:** Platform for tracking AI tool token consumption across the organization

## Repositories

| Repo                          | Stack                      | Purpose                                         |
|-------------------------------|----------------------------|-------------------------------------------------|
| wdpr-ai-analytics-data-etl   | Python 3.11, FastAPI, uv   | ETL pipeline: Snowflake/CSV → MySQL             |

## Tech stack

- **Language:** Python 3.11+
- **Package manager:** uv (primary), Poetry (lock present)
- **Build:** Hatchling
- **Framework:** FastAPI (API), Click (CLI)
- **Database:** MySQL 8.4+ (Docker local, RDS cloud)
- **Data source:** Snowflake, CSV, Jira REST, HR Excel
- **Linting:** Ruff (line-length=100, rules: E, F, I, UP)
- **Type checking:** mypy (strict)
- **Testing:** pytest
- **Observability:** OpenTelemetry → Splunk Observability Cloud
- **Scheduler:** APScheduler (optional)

## Development commands

```bash
# Install
uv sync --extra dev

# Local MySQL
docker compose up -d

# Test
uv run pytest tests/ -v

# Lint
uv run ruff check src/ tests/
uv run ruff format --check src/ tests/

# Type check
uv run mypy src/

# Run extractors
uv run data-pipeline extract-cursor-cost
uv run data-pipeline extract-claude-cost
uv run data-pipeline extract-all
```

## Active stories

| Ticket  | Title                                  | Layer        | Status |
|---------|----------------------------------------|--------------|--------|
| PAF-160 | Backend ETL — Claude Anthropic Import  | ETL          | Open   |
| PAF-161 | Backend ETL — Kiro Import              | ETL          | Open   |
| PAF-176 | OpenTelemetry for FastAPI & MySQL      | Observability| Open   |
| PAF-202 | Kiro in Token Consumption Dashboard    | Full-stack   | Open   |

## Architecture — ETL pattern

Every extractor follows:
1. `cli.py` loads `AppConfig` from `config.toml` + env vars
2. Extractor reads source (Jira REST / Excel / CSV / Snowflake)
3. Each row flattened into `dict[str, Any]`
4. Rows batched (500) and written via `CSVWriter` or `MySQLWriter`

## Source structure

```text
src/data_pipeline/
├── cli.py                  # Click CLI entry point
├── config/
│   ├── loader.py           # TOML + env loading
│   └── schema.py           # Pydantic v2 settings
├── extractors/
│   ├── jira/               # Jira REST API extractor
│   ├── hr/                 # HR Excel extractor
│   ├── cursor_cost/        # Cursor AI usage CSV extractor
│   └── claude_cost/        # Claude Bedrock usage CSV extractor
├── output/
│   ├── factory.py          # Writer factory functions
│   ├── writers.py          # CSVWriter, MySQLWriter
│   └── naming.py           # Deterministic CSV naming
└── scheduler/
    └── runner.py           # APScheduler cron
```

## Environment variables

| Variable     | Purpose                  | Required           |
|--------------|--------------------------|--------------------|
| `JIRA_TOKEN` | Jira personal access token | Always            |
| `MYSQL_DSN`  | MySQL connection string  | When target=mysql  |

## Conventions

- Branch: `main`
- PR format: conventional commits
- Test coverage: ≥90% on new code
- All new extractors follow the Cursor/Claude Bedrock pattern
- Database tables join on `email`/`user_email`
