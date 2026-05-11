# Studio Triumph — Team Context

## Team Overview

Studio Triumph owns the **Dash platform** — Disney's content propagation and publishing system. The team operates in a **Kanban** workflow with a 50/50 split between development and sustainment.

**Jira Board**: https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=8644 (Kanban)
**Jira Prefix**: GIT-

## Scope

- **Development (50%)**: Couchbase Observability, HKDL-Dash Secure Integration, RCW Delta Check, Jedai/Helix enhancements, OneId JWT v5 migration
- **Sustainment (50%)**: Content propagation delay investigations, Splunk alert standardization, Lambda transitions, security findings remediation, load testing, monitoring setup

## Active Epics

| Epic | Key | Description |
|------|-----|-------------|
| Couchbase Observability | GIT-59387 | Correlation IDs, monitoring, eventing functions for content propagation traceability |
| HKDL-Dash Secure Integration | GIT-59388 | Hong Kong Disneyland secure content integration |
| RCW Delta Check | GIT-59390 | Delta checking for content updates |
| Jedai/Helix Enhancements | GIT-59389 | Platform enhancements |
| Dash Sustainment | GIT-30944 | Ongoing maintenance and reliability |

## Key Technologies

- **Couchbase** (Server + Lite + Sync Gateway) — primary data store and mobile sync
- **AWS Lambda** — serverless processing (transitioning from Shuri platform)
- **Splunk** — monitoring and alerting
- **AppDynamics** — APM
- Content publishers (Characters, Content, Configuration)

## Team Members

| Name | Role |
|------|------|
| Rico, Alexander | Tech Lead / Architect |
| Abecasis, Federico | Senior Developer |
| Zapata, Santiago | Developer |
| Betancur, Daniel | Developer |
| Hurtado, Omar | Developer |
| Apaza, Jeferson Joel | Developer |
| Chavez, Renzo Loui | Developer |
| Ramirez, Angela | QA |
| Puerta, David | Developer |
