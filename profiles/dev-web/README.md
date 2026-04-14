# Dev Web Profile

**Fullstack web specialists for Java + Node.js + Angular + Astro**

Requires `dev-core` as a base.

---

## Agents (5)

### backend
Java services specialist for Spring Boot backend development.

**Use when:**
- Backend API development
- Database changes and migrations
- Java service implementation
- Spring Boot configuration

### webapi
Node.js/TypeScript specialist for API layer and BFF logic.

**Use when:**
- API layer development
- BFF (Backend for Frontend) logic
- TypeScript interfaces and types
- Express/Restify endpoints

### ui
Angular specialist for frontend development.

**Use when:**
- Angular components and services
- Standalone architecture with Signals
- Routing and lazy loading
- Jest unit and integration tests

### ux_specialist_agent
Accessibility (WCAG 2.1 AA) and UX pattern review.

**Use when:**
- Accessibility audits
- Usability reviews
- Focus management and ARIA compliance
- Figma design review

### astro
Astro SSR specialist with React components and TypeScript.

**Use when:**
- Astro pages and layouts
- React island components
- Server actions and API endpoints
- Nanostores state management

---

## Capabilities

Agents have access to:
- ✅ **Context7** — Up-to-date library documentation
- ✅ **Figma** — Design files, components, styles, comments (ui, ux_specialist, astro)
- ✅ **Code Tools** — Read/write source code
- ✅ **Execution** — Run builds, tests, linters
- ✅ **File Operations** — Manage project files

---

## Quick Start

```bash
koda install dev-core dev-web

kiro-cli chat --agent ui
> "Create a standalone Angular component for user profile with Signals and Jest tests"
```

---

## Example Usage

### Backend (Java)
```bash
kiro-cli chat --agent backend
> "Add a new REST endpoint for payment validation with Spring Boot"
```

### WebAPI (Node.js)
```bash
kiro-cli chat --agent webapi
> "Create a TypeScript endpoint for config export with streaming response"
```

### UI (Angular)
```bash
kiro-cli chat --agent ui
> "Refactor the dashboard to standalone components with Signal-based state"
```

### UX Review
```bash
kiro-cli chat --agent ux_specialist_agent
> "Audit the checkout flow for WCAG 2.1 AA compliance and keyboard navigation"
```

### Astro
```bash
kiro-cli chat --agent astro
> "Create an Astro page with a React data table component using Nanostores"
```

---

## Structure

```
.kiro-dev-web/
├── agents/              # 5 agent configurations
│   ├── backend.json
│   ├── webapi.json
│   ├── ui.json
│   ├── ux_specialist_agent.json
│   └── astro.json
├── prompts/             # Agent prompts
├── context/             # Stack-specific guidelines
│   ├── angular_modern_patterns.md
│   ├── java_conventions.md
│   ├── node_conventions.md
│   └── astro_project_patterns.md
├── steering/            # Repo-specific rules
└── skills/              # Reusable workflows
    ├── ui-angular-standalone-component.md
    ├── ui-feature-implementation.md
    ├── ui-bugfix-triage.md
    ├── api-endpoint-implementation.md
    ├── backend-endpoint-implementation.md
    ├── astro-page-creation.md
    ├── astro-react-component.md
    └── astro-server-action.md
```

---

## Install

```bash
koda install dev-core dev-web       # Fullstack web developer
koda install dev                    # All dev (includes web)
```

---

**Profile Version:** 2.0  
**Agents:** 5  
**Last Updated:** April 3, 2026
