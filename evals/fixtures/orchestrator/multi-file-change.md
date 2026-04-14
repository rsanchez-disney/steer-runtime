---
agent: orchestrator
name: multi-file-change
description: Feature requiring changes across multiple layers — tests plan quality and delegation
timeout: 300
tags: [dev-core, critical]
---

I need to add a new "export configuration" feature to the config studio app. This involves:
- A new REST endpoint in the Java backend
- A new Angular component in the frontend
- Database migration for export history table

The backend is at ~/wdpr-config-services (Java Spring Boot) and the frontend is at ~/wdpr-config-studio-ui (Angular 17).

Start by analyzing what's needed and creating a plan. Don't implement anything yet.
