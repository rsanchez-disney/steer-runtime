# Workspace: ai-analytics-team

MVP AI Analytics — Platform for tracking AI tool token consumption across the organization.

## Quick start

```bash
koda chat --ws ai-analytics-team
```

## Team

- **Org:** DXT AI Analytics
- **Lead:** Andres Gomez
- **Jira:** PAF (disneyexperiences.atlassian.net)

## Profiles

| Profile  | Agents | Purpose                              |
|----------|:------:|--------------------------------------|
| dev-core |   3    | Python ETL, data engineering, tests  |

## Agents

| Agent                | Description                                              |
|----------------------|----------------------------------------------------------|
| orchestrator         | Coordinates ETL development, delegates to specialists    |
| data_engineer_agent  | ETL pipelines, Snowflake, MySQL schema design            |
| test_engineer_agent  | pytest suites, ≥90% coverage, service mocking            |

## Projects

| Repo                          | Stack             | Purpose          |
|-------------------------------|-------------------|------------------|
| wdpr-ai-analytics-data-etl   | Python 3.11, uv   | ETL pipeline     |

## Active work

| Ticket  | Title                            | Priority |
|---------|----------------------------------|----------|
| PAF-160 | Claude Anthropic ETL import      | Major    |
| PAF-161 | Kiro ETL import                  | Major    |
| PAF-176 | OpenTelemetry instrumentation    | Major    |
| PAF-202 | Kiro in dashboard (full-stack)   | Major    |
