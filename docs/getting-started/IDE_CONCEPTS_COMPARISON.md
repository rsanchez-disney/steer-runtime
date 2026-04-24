# IDE Concepts Comparison

How the same concepts are named across AI-powered IDEs and tools.

---

## Core Concepts

| Concept                                 | Kiro CLI                         | Cursor                                            | Amazon Q                              | GitHub Copilot              | steer-runtime               |
|-----------------------------------------|----------------------------------|---------------------------------------------------|---------------------------------------|-----------------------------|-----------------------------|
| **Project config file**                 | `.kiro/` directory               | `.cursor/` directory                              | `.amazonq/` directory                 | `.github/` directory        | `project.yaml`              |
| **Steering / system prompt**            | `steering/*.md`                  | `.cursor/rules/*.mdc`                             | `.amazonq/rules/*.md`                 | `.github/instructions/*.md` | `profiles/*/steering/`      |
| **Rules** (always-on standards)         | `steering/*.md`                  | `.cursorrules` or `.mdc` with `alwaysApply: true` | `.amazonq/rules/*.md`                 | `.github/instructions/*.md` | `common/rules/*.md`         |
| **Agent** (specialized persona)         | `agents/*.json` + `prompts/*.md` | `.cursor/agents/*.md`                             | `.amazonq/cli-agents/*.json`          | `.github/agents/*.md`       | `profiles/*/agents/*.json`  |
| **Skill / command** (reusable workflow) | `@prompt` references             | `.cursor/skills/*/SKILL.md`                       | Prompt files                          | `.github/prompts/*.md`      | `common/skills/*.md`        |
| **Context / knowledge**                 | `resources` in agent JSON        | `@docs`, `@codebase`                              | `.amazonq/rules/` (loaded as context) | `.github/docs/*.md`         | `shared/context/*.md`       |
| **Memory / persistence**                | `knowledge` tool                 | — (session only)                                  | — (session only)                      | — (session only)            | `memory-banks/`             |
| **MCP servers**                         | `mcpServers` in agent JSON       | `~/.cursor/mcp.json`                              | `~/.aws/amazonq/mcp.json`             | —                           | `shared/tools/mcp-servers/` |
| **Hooks / guardrails**                  | `hooks` in agent JSON            | —                                                 | —                                     | —                           | `shared/hooks/*.sh`         |
| **Powers** (custom tools)               | `powers/` directory              | —                                                 | —                                     | —                           | `profiles/dev-core/powers/` |
| **Orchestration** (multi-agent)         | `use_subagent` + `delegate`      | Agent-to-agent via `@agent`                       | —                                     | Agent-to-agent via `@agent` | Orchestrator agents         |
| **Project manifest**                    | —                                | `.cursor/00-main.md` (YAML frontmatter)           | —                                     | —                           | `project.yaml`              |
| **Spec documents**                      | —                                | `docs/specs/_##_*.md`                             | —                                     | —                           | `common/templates/specs/`   |

---

## File Formats

| What                 | Kiro CLI             | Cursor                             | Amazon Q          | GitHub Copilot                |
|----------------------|----------------------|------------------------------------|-------------------|-------------------------------|
| Agent definition     | JSON (`.json`)       | Markdown (`.md`)                   | JSON (`.json`)    | Markdown (`.md`)              |
| Rules / instructions | Markdown (`.md`)     | MDC (`.mdc`) with YAML frontmatter | Markdown (`.md`)  | Markdown (`.instructions.md`) |
| Skills / prompts     | Markdown (`.md`)     | Markdown (`SKILL.md`) in directory | Markdown (`.md`)  | Markdown (`.prompt.md`)       |
| MCP config           | JSON in agent config | JSON (`mcp.json`)                  | JSON (`mcp.json`) | —                             |

---

## Rule Activation

| Mechanism          | Kiro CLI                  | Cursor                             | Amazon Q                       | GitHub Copilot                       |
|--------------------|---------------------------|------------------------------------|--------------------------------|--------------------------------------|
| Always active      | `resources` in agent JSON | `alwaysApply: true` in frontmatter | All rules in `.amazonq/rules/` | All files in `.github/instructions/` |
| File-pattern match | —                         | `globs` in frontmatter             | —                              | Glob in frontmatter                  |
| Manual activation  | `@prompt` reference       | `/skill-name` command              | —                              | `@agent` reference                   |
| Agent-scoped       | `resources` per agent     | —                                  | Per CLI agent config           | Per agent file                       |

---

## Agent Capabilities

| Capability             | Kiro CLI                     | Cursor                      | Amazon Q       | GitHub Copilot        |
|------------------------|------------------------------|-----------------------------|----------------|-----------------------|
| Read files             | `fs_read` tool               | Built-in                    | Built-in       | Built-in              |
| Write files            | `fs_write` tool              | Built-in                    | Built-in       | Built-in              |
| Run commands           | `execute_bash` tool          | Built-in                    | Built-in       | `runInTerminal`       |
| Code search            | `code` tool (LSP)            | Built-in                    | Built-in       | Built-in              |
| Web search             | —                            | `@web`                      | —              | `@web` (Copilot Chat) |
| MCP tools              | `@jira/*`, `@github/*`, etc. | Via `mcp.json`              | Via `mcp.json` | —                     |
| Multi-agent delegation | `use_subagent` tool          | `@agent` mention            | —              | `@agent` mention      |
| Persistent memory      | `knowledge` tool             | —                           | —              | —                     |
| Task tracking          | `todo` tool                  | —                           | —              | —                     |
| Reasoning              | `thinking` tool              | Built-in (chain of thought) | Built-in       | Built-in              |

---

## Directory Structure Comparison

```
Kiro CLI (.kiro/)              Cursor (.cursor/)           Amazon Q (.amazonq/)        Copilot (.github/)
├── agents/*.json              ├── agents/*.md             ├── cli-agents/*.json       ├── agents/*.md
├── prompts/*.md               ├── skills/*/SKILL.md       ├── rules/*.md              ├── prompts/*.md
├── context/*.md               ├── rules/*.mdc             │                           ├── instructions/*.md
├── steering/*.md              ├── 00-main.md              │                           ├── docs/*.md
├── hooks/*.sh                 │                           │                           │
├── tools/mcp-servers/         ├── mcp.json                ├── mcp.json                │
├── powers/                    │                           │                           │
└── settings/                  │                           │                           │
```

---

## steer-runtime Compilation

steer-runtime authors content once and compiles to each IDE's native format:

```
profiles/dev-core/prompts/orchestrator.md
    ↓ koda install
    → ~/.kiro/prompts/orchestrator.md          (Kiro CLI)

    ↓ ./setup.sh cursor install <dir>
    → .cursor/agents/orchestrator.md           (Cursor)

    ↓ koda amazonq install <dir>
    → .amazonq/rules/orchestrator.md           (Amazon Q)
```

Same knowledge, different formats. Update the source, every IDE gets the change on next sync.
