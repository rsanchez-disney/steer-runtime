# Dev DCL Node NestJS Profile

**NestJS specialist for DCL BFF/API applications**

---

## Agents (1)

### dev-dcl-node-nest

NestJS specialist for BFF (Backend for Frontend) applications.

**Use when:**

- NestJS module, controller, service development
- Guard and exception filter implementation
- OpenAPI client integration (connectors)
- YAML configuration with environment overlays
- Jest + supertest unit and E2E testing
- Swagger/OpenAPI documentation

---

## Tech Stack

- NestJS 11, Node 20, TypeScript 5.8
- class-validator + class-transformer for DTOs
- @nestjs/swagger for OpenAPI docs
- YAML config with env overlays
- OpenAPI Generator CLI for auto-generated clients
- Jest 29 + supertest
- ESLint 9 flat config + Prettier

---

## Quick Start

```bash
koda install dev-dcl-node-nest

kiro chat --agent dev-dcl-node-nest
> "Add a new NestJS endpoint for content pages with header validation guard"
```

---

## Structure

```
profiles/dev-dcl-node-nest/
├── agents/
│   └── dev-dcl-node-nest.json
├── prompts/
│   └── webapi.md
├── context/
│   └── node_conventions.md
├── steering/
│   └── 20-repo-webapi-node-nest.md
└── skills/
    ├── webapi-endpoint-implementation.md
    ├── webapi-connector-implementation.md
    ├── webapi-guard-filter.md
    └── webapi-bugfix-triage.md
```

---

**Profile Version:** 1.1
**Agents:** 1
**Last Updated:** July 8, 2026
