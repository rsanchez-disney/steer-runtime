# Dev Web Profile

Fullstack web specialists for Config Studio (Java + Node.js + Angular + Astro).

Requires `dev-core` as a base.

## Agents (5)

| Agent | Purpose |
|-------|---------|
| backend | Java services specialist (wdpr-config-services) |
| webapi | Node.js/TypeScript specialist (wdpr-payment-controls-api) |
| ui | Angular specialist (wdpr-payment-controls-client) |
| ux_specialist_agent | Accessibility (WCAG 2.1 AA) and UX pattern review |
| astro | Astro SSR specialist with React components and TypeScript |

## Structure

```
.kiro-dev-web/
├── agents/       # 5 agent JSON configs
├── prompts/      # 5 agent prompt files
├── steering/     # Repo-specific: backend-java, webapi-node, ui-angular
└── skills/       # 12 skills: api-*, backend-*, ui-*
```

## Install

```bash
./setup.sh install dev-core dev-web       # Fullstack web developer
./setup.sh install dev                    # All dev (includes web)
```
