# System Patterns

## Architecture
- Profile-based agent system: `.kiro-dev/`, `.kiro-ba/`, `.kiro-qa/`, `.kiro-ops/`
- Each profile contains: `agents/` (JSON configs), `prompts/` (markdown instructions), optional `context/`, `powers/`, `skills/`, `steering/`
- Shared resources in `.kiro/tools/mcp-servers/`
- Common resources in `common/` (rules, prompts, memory-bank templates)
- Known project configs in `Projects/`
- Single `setup.sh` script handles all operations

## Agent Structure
- Agent JSON config → references a prompt `.md` file + tools + MCP servers
- Orchestrator pattern: each profile has an orchestrator that delegates to specialist agents
- Dev orchestrator: story analysis → codebase exploration → architecture review → planning → implementation → quality checks → PR creation
- Ops orchestrator: AI metrics, infra checks, deployments, code quality

## MCP Servers
- `jira-mcp` — Jira integration (Node.js)
- `confluence-mcp` — Confluence integration (Node.js)
- `github-mcp` — GitHub integration (Node.js)
- `mermaid-diagram-mcp` — Diagram generation
- `mcp-atlassian` — Docker-based Atlassian integration
- `harness` — Docker-based Harness CI/CD (ops profile)
- `sonarqube` — Docker-based SonarQube (ops profile)

## Installation Modes
- **CLI (global):** `./setup.sh install <profile>` → copies to `~/.kiro/`
- **UI (project-specific):** `./setup.sh install <profile> --project ~/my-project`

## Common Resources
- `common/rules/` — Shared coding rules (conventional commits, Java development)
- `common/prompts/` — Standalone workflow prompts (AI metrics, ECS checks)
- `common/memory-bank-templates/` — Templates for per-project memory banks
- `Projects/` — Pre-built memory banks for known repositories

## Key Patterns
- Auto-discovery of profiles via `.kiro-*` directory convention
- Env files (`.env`) for secrets, gitignored per MCP server
- Token placeholder pattern (`YOUR_TOKEN`) in agent configs for safe commits
- Per-project memory banks with standard schema (guidelines, product, structure, tech)
