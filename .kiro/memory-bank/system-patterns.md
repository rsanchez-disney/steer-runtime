# System Patterns

## Architecture
- IDE-agnostic platform: agent knowledge authored once, compiled to each IDE's native format
- Profile-based agent system: `.kiro-dev/`, `.kiro-ba/`, `.kiro-qa/`, `.kiro-ops/`, `.kiro-pm/`
- Each profile: `agents/` (JSON configs), `prompts/` (markdown), optional `context/`, `skills/`, `steering/`
- Shared resources: `.kiro/context/`, `.kiro/hooks/`, `.kiro/tools/mcp-servers/`
- IDE templates: `.cursor-templates/` (19 .mdc), `.amazonq-templates/` (19 .md)
- Common resources: `common/` (rules, prompts, memory-bank templates)
- Known project configs: `workspaces/default/projects/` (9 projects)
- Single entry point: `setup.sh` (macOS/Linux), `setup.ps1` (Windows)

## Compile-to-IDE-Target Model
```
steer-runtime (source of truth)
  → setup.sh install       → .kiro/ (Kiro CLI native)
  → setup.sh cursor install → .cursor/rules/ (.mdc + MCP config)
  → setup.sh amazonq install → .amazonq/rules/ (plain .md)
  → Kite reads .kiro/ directly (GUI wrapper)
```

## Agent Structure
- Agent JSON config → prompt .md + tools + MCP servers + hooks + resources
- Orchestrator pattern: each profile has an orchestrator that delegates to specialists
- Dev orchestrator workflow: Jira fetch → explore → architecture → plan → gate → implement → test → review → security → quality → PR → done
- All 40 agents use consistent tool names: fs_read, fs_write, execute_bash, grep, code

## Context Engineering (over prompt engineering)
- `resources` — files loaded into every session (golden_rules.md, project_mappings.md)
- `steering` — numbered behavioral rules (00-foundation through 60-mobile)
- `skills` — reusable knowledge chunks (16 skills)
- `context` — profile-specific guidelines (qa_guidelines, pm_guidelines, etc.)
- `hooks` — shell scripts enforcing guardrails (exit 0=allow, exit 2=block)

## Golden Rules (11 rules in `.kiro/context/golden_rules.md`)
1. Backward compatibility  2. Test coverage ≥90%  3. No secrets in code
4. Structured logging  5. Minimal diff  6. Input validation
7. Error handling  8. Accessibility  9. Performance
10. Documentation  11. Cross-platform tool usage (no findstr/dir/type)

## MCP Server Bundling
- Pre-built as single `.cjs` files via esbuild — no npm install needed
- Stored in `~/.kiro/tools/mcp-servers/`
- Shared across Kiro CLI and Cursor (via generated mcp.json)
- Tokens configured via `./setup.sh mcp-install` or `./setup.sh configure`

## Installation Modes
- CLI (global): `./setup.sh install <profile>` → copies to `~/.kiro/`
- UI (project): `./setup.sh install <profile> --project ~/my-project`
- Cursor: `./setup.sh cursor install <dir>` → `.cursor/rules/` + `.cursor/mcp.json`
- Amazon Q: `./setup.sh amazonq install <dir>` → `.amazonq/rules/`

## Key Conventions
- Auto-discovery of profiles via `.kiro-*` directory naming
- Conventional commits for all changes
- Additive changes only — never modify existing agent functionality
- `YOUR_TOKEN` placeholder pattern for safe commits
- Per-project memory banks: guidelines.md, product.md, structure.md, tech.md
