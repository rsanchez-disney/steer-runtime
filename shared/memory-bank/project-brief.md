# Project Brief: steer-runtime

## Overview
Portable, IDE-agnostic AI agent platform for software teams. 40 specialized agents across 5 SDLC profiles, deployable to Kiro CLI, Cursor, Amazon Q, and Kite.

## Core Purpose
Define agents, coding standards, and integrations once — compile and deploy them to any AI-powered IDE. Agents automate SDLC tasks by integrating with Jira, Confluence, GitHub, Harness, and SonarQube.

## Target Users
- Developers (Config Studio, GCP, TRP/PAP, CAP, SPR, Cart, Payment Service)
- Business Analysts / Product Owners
- QA Engineers / Test Automation
- DevOps / Operations
- Project Managers / Scrum Masters

## Supported IDEs
| IDE | Format | Status |
|-----|--------|--------|
| Kiro CLI | Agent JSON + prompt markdown | ✅ Primary |
| Cursor | `.mdc` rule files + shared MCP | ✅ Supported |
| Amazon Q | Plain `.md` rule files | ✅ Supported |
| Kite | Desktop GUI over Kiro CLI | ✅ Companion |

## Key Repositories (Config Studio)
- `wdpr-config-services` — Java backend
- `wdpr-payment-controls-api` — Node.js/TypeScript BFF
- `wdpr-payment-controls-client` — Angular frontend

## Version
3.4.0 — Last updated March 20, 2026

## License
Internal Disney tool — not for external distribution.
