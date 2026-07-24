# Shuri team

Shuri is the project that interacts with multiple SORs (GAM, Park Pass, etc.) and delivers that data to Adobe Experience Platform (AEP). AEP is then able to use Journey Orchestrations to push messaging via AJO or content via XBS/Hawkeye to Guests.

Shuri powers real-time, individualized digital experiences which seamlessly guide our Guests, increasing satisfaction and engagement throughout the Guest Journey.

## Project details

| Field              | Value                        |
|--------------------|------------------------------|
| Jira prefix        | GCX-                         |
| Studio (Jira)      | Guest Content Experiencies   |
| Parent workspace   | gcx-team                     |

## Tech stack

| Platform                    | Languages / formats        |
|-----------------------------|----------------------------|
| Adobe Experience Platform   | Spark SQL                  |
| Adobe Journey Optimizer     | PQL, Handlebars JS         |
| Adobe Data Collection       | JSON                       |
| Splunk                      | SPL                        |

## Available skills

Skills live in the `skills/` folder and are included manually when needed.

- `spark-sql-expert.md` — Spark SQL & DataFrame expert for query generation, debugging, and optimization
- `adobe-expert.md` — AEP Solution Architect & Developer expert for Adobe Experience Cloud guidance

## Workspace structure

```text
shuri-team/
├── context/   # Team context documents
├── skills/    # Specialist skill prompts (manual inclusion)
├── rules/     # Team-specific rules (currently empty)
└── README.md
```

This is a child workspace that extends **gcx-team** (parent).
