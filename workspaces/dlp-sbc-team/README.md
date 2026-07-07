# DLP SBC Workspace

## Overview

Workspace for the DLP Sales & Business Center team. Single-project workspace covering `dlp-sbc-ui`   a legacy Struts 1 / Spring 5.3 / Hibernate booking system with progressive Vue 3 frontend migration.

## Key Characteristics

- **Backend**: Java 11, Struts 1, Spring 5.3, Hibernate 5.6, Tomcat
- **Frontend**: Vue 3 Composition API progressively replacing JSP pages
- **Architecture**: Multi-module Maven (Config, TPSS-Client, MagicalGatheringBeans, MagicalGatheringWeb)
- **Communication**: NOT RESTful   uses `.do` Struts actions via AJAX
- **State**: Session-based via `SessionUtility`


## Skills

Reusable development patterns and conventions:

| Skill                      | Description                                                                                    |     |
| ----------------------------| ------------------------------------------------------------------------------------------------| -----|
| `admin-page-styles.md`     | Visual design system for standalone admin popup pages (blue gradient, Segoe UI, sticky tables) |     |
| `admin-popup-pattern.md`   | Full pattern for Vue 3 popup pages: entry point, CSRF, permissions, state management           |     |
| `dto-form-mapping.md`      | Field mapping between Java DTOs and Vue reactive forms                                         |     |
| `main-app-styles.md`       | Visual design system for main app modals (Verdana, gray buttons, EventBus)                     |     |
| `struts-action-pattern.md` | Struts Action class template, session management, JSON responses, admin actions                |     |
| `vue-modal-pattern.md`     | Vue 3 modal template: EventBus, Object.assign, Form files, send/accept pattern                 |     |

## Context

| File              | Purpose                                                                    |
| -------------------| ----------------------------------------------------------------------------|
| `sbc-steering.md` | Consolidated development standards, workflow conventions, and golden rules |

## Profiles Enabled

| Profile    | Agents | Purpose                                                              |
| ------------| :------:| ----------------------------------------------------------------------|
| `dev-core` | 21     | Orchestrator, planner, code review, architecture, security, PRs      |
| `dev-web`  | 5      | Backend (Java), WebAPI (Node), UI (Angular/Vue), UX, Astro           |
| `dev-ui`   | 3      | Angular legacy & uplift, Polymer, AWS Lambda                         |
| `qa`       | 16     | Test planning, automation, defect analysis, API testing, coverage    |
| `pm`       | 6      | Sprint management, standups, retros, risk tracking, delivery reports |
| `ba`       | 8      | Requirements, scope, stories, PRDs, estimation                       |

## MCP Integrations

- GitHub (github.disney.com)
- Jira (disneyexperiences.atlassian.net, prefix: RSDLP-)
- Confluence (confluence.disney.com)
- Maven (build)
- Docker (local dev)