# Dev UI Profile

**Legacy UI specialists for Angular (v12–v18+), Polymer 2/3, and lightweight Lambda development**

Built for the L2 studio team handling maintenance and uplift of legacy front-end tools for Config Studio pre-sales applications (ticketing). Requires `dev-core` as a base for the orchestrator and quality agents.

---

## Agents (9)

### From dev-core (6 cherry-picked)

| Agent | Purpose |
|-------|---------|
| orchestrator | SDLC orchestrator — delegates to specialist agents, manages workflow |
| codebase_explorer | Code exploration and navigation across repositories |
| code_review | Code review and quality checks |
| test_runner | Test execution and coverage analysis |
| security_scanner | Security analysis and vulnerability detection |
| pr_creator | Pull request creation and management |

### From dev-ui (3 specialists)

#### ui_legacy
Angular legacy & uplift specialist (v12–v18+) for Config Studio pre-sales applications.

**Use when:**
- Angular v12–v15 maintenance (NgModule-based, decorator I/O, Zone.js)
- Incremental uplift from v15 → v16 → v17 → v18+ (standalone components, signals, control flow, zoneless)
- Vista design system integration in pre-sales UIs
- Version-aware code generation — detects project version and uses matching patterns

#### polymer
Polymer 2/3 web component specialist for legacy uplift.

**Use when:**
- Polymer 2 web components (HTML imports, `<dom-module>`, `dom-repeat`)
- Polymer 3 development (ES modules, LitElement compatibility)
- Uplift from Polymer 2 → Polymer 3 → Lit
- Vista `<wdpr-*>` component integration alongside Polymer elements

#### lambda
Lightweight AWS Lambda specialist for Node.js handlers.

**Use when:**
- AWS Lambda function development (Node.js runtime)
- Thin-handler pattern with separated service modules
- Cold start optimization and structured logging
- Local testing with AWS SAM CLI

---

## Capabilities

Agents have access to:
- ✅ **Code Tools** — Read/write source code (`fs_read`, `fs_write`)
- ✅ **Execution** — Run builds, tests, linters (`execute_bash`)
- ✅ **Hooks** — Guard writes, secret scanning, auto-lint on write
- ✅ **Context** — Angular v12–v18+ patterns & uplift guides, Polymer 2/3 patterns, Lambda patterns

> **Note:** The `ui_legacy` and `polymer` agents have Confluence and Confluence Cloud MCP access to fetch RA migration guides during uplifts. The `lambda` agent has no MCP servers. Additional MCP access (Jira, GitHub, etc.) comes from the dev-core agents (orchestrator, code_review, pr_creator).

---

## Quick Start

```bash
# Install all 9 agents (recommended)
koda install dev-core dev-ui

# Start with the orchestrator for full SDLC workflow
kiro-cli chat --agent orchestrator
> "Uplift the search-results Polymer 2 component to Polymer 3 ES modules"
```

---

## Example Usage

### UI Legacy (Angular v12–v18+)
```bash
kiro-cli chat --agent ui_legacy
> "Add a new NgModule-based filter component for the client search page"
> "Uplift this v15 component to v17 with standalone + signal inputs"
```

### Polymer
```bash
kiro-cli chat --agent polymer
> "Migrate the config-card Polymer 2 element to Polymer 3 with ES module imports"
```

### Lambda
```bash
kiro-cli chat --agent lambda
> "Create a Lambda handler for the config export API with structured logging"
```

### Orchestrator (full workflow)
```bash
kiro-cli chat --agent orchestrator
> "Implement the ticket search feature — Angular 15 UI + Lambda backend"
```

---

## Structure

```
profiles/dev-ui/
├── README.md
├── agents/              # 3 specialist agent configurations
│   ├── ui_legacy.json
│   ├── polymer.json
│   └── lambda.json
├── prompts/             # Agent system prompts
│   ├── ui_legacy.md
│   ├── polymer.md
│   └── lambda.md
└── context/             # Stack-specific reference material
    ├── angular_legacy_patterns.md
    ├── polymer_patterns.md
    └── lambda_patterns.md
```

---

## Install

```bash
koda install dev-ui                 # 3 specialist agents only
koda install dev-core dev-ui        # All 9 agents (recommended)
```

> **Important:** `dev-core` is required as the base profile. It provides the orchestrator (which delegates to the 3 specialists), plus quality agents (code_review, test_runner, security_scanner) and workflow agents (codebase_explorer, pr_creator). Running `koda install dev-ui` alone installs only the 3 specialist agents without orchestration or quality tooling.

---

**Profile Version:** 1.0  
**Agents:** 3 (9 with dev-core)  
**Last Updated:** April 2026
