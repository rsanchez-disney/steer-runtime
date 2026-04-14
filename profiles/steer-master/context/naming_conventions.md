# Naming Conventions

## Agents
- Specialist agents: `{name}_agent` (e.g., `story_analyzer_agent`, `code_review_agent`)
- Orchestrators: `{scope}_orchestrator_agent` (e.g., `ba_orchestrator_agent`) or `orchestrator` (dev-core)
- JSON filename must match the `name` field exactly
- Use snake_case

## Profiles
- Directory name under `profiles/`: kebab-case (e.g., `dev-core`, `dev-web`, `steer-master`)
- Sub-profiles use prefix: `dev-core`, `dev-web`, `dev-mobile`, `dev-python`, `dev-infra`

## Hooks
- Shell scripts: kebab-case with `.sh` extension (e.g., `git-context.sh`, `guard-writes.sh`)
- Located in `shared/hooks/`
- Must be executable (`chmod +x`)

## Context Files
- Markdown files: snake_case with `.md` extension (e.g., `golden_rules.md`, `project_mappings.md`)
- Located in `shared/context/` (global) or `profiles/{name}/context/` (profile-specific)

## Prompts
- Markdown files matching agent name: `{agent_name}.md` (e.g., `orchestrator.md`)
- Located in `profiles/{name}/prompts/`

## Workspaces
- Directory name: kebab-case (e.g., `payments-core`, `opsheet-team`)
- Config file: `workspace.json` (always this name)

## Rules
- Markdown files: kebab-case with `.md` extension (e.g., `conventional_commit.md`)
- Located in `common/rules/`
