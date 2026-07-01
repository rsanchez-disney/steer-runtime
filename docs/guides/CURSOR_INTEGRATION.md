# Cursor Integration Guide

Reference patterns for setting up Cursor projects with steer-runtime workspaces.

Based on the [dx-dlp-ia-java-common][dlp-repo] repository — a mature Cursor-native skills distribution system for Java teams.

## Quick Start

```bash
# Generate .cursor/ from your workspace
koda cursor --ws my-team

# Or via the unified entry point
koda chat --ws my-team --target cursor
```

## How it works

`koda cursor --ws` materializes a workspace and translates it into Cursor's `.cursor/` format:

| steer-runtime source | → | Cursor output |
|---------------------|---|---------------|
| `steering/*.md` | → | `.cursor/rules/*.mdc` |
| `context/*.md` | → | `.cursor/rules/ctx-*.mdc` (alwaysApply: true) |
| `agents/*.json` + `prompts/*.md` | → | `.cursor/agents/*.md` |
| `skills/*/SKILL.md` | → | `.cursor/skills/*/SKILL.md` (identical) |
| `settings/mcp.json` | → | `.cursor/mcp.json` |

## Frontmatter translation

| Kiro steering | Cursor `.mdc` |
|--------------|---------------|
| `inclusion: always` | `alwaysApply: true` |
| `inclusion: auto` + `description: "..."` | `alwaysApply: false` + `description: "..."` |
| `inclusion: fileMatch` + `fileMatchPattern: [...]` | `alwaysApply: false` + `globs: [...]` |

## Reference patterns from DLP

### Module-based composition

DLP uses `module.yaml` files to group related rules + skills + agents:

```yaml
name: api
description: "REST API provider: endpoints, auth, rate-limiting, OpenAPI"
requires: [core]
rules:
  - spring/rest-api.mdc
  - dlp/authorization.mdc
skills:
  - dlp-create-rest-api
  - dlp-configure-authorization
agents:
  - openapi-docs
```

Profiles combine modules for different service types:
- `api-service` = core + api
- `batch-service` = core + batch + data
- `event-service` = core + messaging

This maps to steer-runtime's profile system — each module is like a mini-profile.

### Multi-lane code review

DLP splits code review into parallel "lanes" with focused subagents:

| Lane | Focus |
|------|-------|
| STRUCTURE_SEMANTIC | Architecture, hexagonal layers, naming |
| PERFORMANCE_MEMORY | N+1 queries, unbounded collections, caching |
| SECURITY_PII | OWASP, PII exposure, auth bypass |
| STANDARDS_NFR | Framework usage, logging, error handling |

Each lane has its own subagent prompt and runs independently — results are merged by an arbiter. This pattern maps well to our `inspector_orchestrator` profile.

### Session memory (PROJECT_MEMORY.md)

A Cursor-specific rule that maintains a living project context file across sessions. Since Cursor doesn't persist conversation context:
- Agent reads `docs/PROJECT_MEMORY.md` at session start
- Updates it with architectural decisions, conventions, known constraints
- Keeps it concise (~50-100 lines max, living doc not a changelog)

Similar to our `memory-bank` concept but simpler and file-based.

### Detection manifest

A YAML-driven system where the agent scans the project for patterns and auto-selects relevant rules/skills:

```yaml
detect:
  - signal: "pom.xml contains spring-boot-starter-batch"
    activate: [spring/spring-batch.mdc, dlp-configure-job-notification]
  - signal: "src/**/config/*RabbitMq*.java exists"
    activate: [dlp-configure-rabbitmq]
```

### CI pipeline integration

DLP runs agentic PR reviews in Harness CI using `agent -p` (headless mode):
1. Clone target repo + PR diff
2. Prepare context (rules + skills relevant to changed files)
3. Run each lane in parallel via `agent -p --force`
4. Merge lane reports → arbiter evaluates quality
5. Post comment on PR

This maps to our `koda ci run` command.

## Directory structure (DLP reference)

```
project/
├── .cursor/
│   ├── rules/           # .mdc files (from steering + context)
│   │   ├── java/        # Subdirs supported
│   │   ├── spring/
│   │   └── dlp/
│   ├── agents/          # Subagent personas (.md)
│   ├── skills/          # Skills (SKILL.md format — same as Kiro)
│   └── mcp.json         # MCP server config
├── .cursorignore        # Files to exclude from agent context
└── docs/
    └── PROJECT_MEMORY.md # Living project context
```

## .cursorignore

Exclude large/irrelevant files from agent context:

```
# Dependencies
node_modules/
.m2/
target/
build/

# Generated
dist/
*.min.js
*.min.css

# Binary
*.jar
*.war
*.class
*.so
*.dll
```

<!-- Links -->
[dlp-repo]: https://github.disney.com/WDPR-DLP-IS/dx-dlp-ia-java-common
