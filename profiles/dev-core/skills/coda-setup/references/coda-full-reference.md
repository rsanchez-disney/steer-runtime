# CODA — Comprehensive Reference Guide

> Globant's AI coding agent for the entire software development lifecycle.
> Source: G-Coda documentation site (captured 2026-08-06)

---

## Table of contents

1. [Overview — What is CODA](#overview--what-is-coda)
2. [Installation](#installation)
3. [Connect a Provider](#connect-a-provider)
4. [Configuration](#configuration)
5. [Ways to Run CODA](#ways-to-run-coda)
6. [Core Concepts](#core-concepts)
7. [Extending CODA](#extending-coda)
8. [Commands & Flags Reference](#commands--flags-reference)
9. [Configuration Reference](#configuration-reference)
10. [Tools Reference](#tools-reference)
11. [Reasoning Effort](#reasoning-effort)
12. [Keyboard Shortcuts](#keyboard-shortcuts)
13. [FAQ](#faq)
14. [Glossary](#glossary)
15. [Release History](#release-history)

---

## Overview — What is CODA

CODA is Globant's AI coding agent, designed to help across the entire software development lifecycle (SDLC). You describe what you want to accomplish in plain language — CODA reads your codebase, figures out what needs to change, and gets it done, while you stay in control of every step.

### What you can do with CODA

- **Explore an unfamiliar codebase** — ask CODA to explain how authentication works, trace where a bug might be coming from, or map out the dependencies of a module before you touch anything.
- **Make changes with a safety net** — CODA snapshots your files before every edit (checkpoints). If something goes wrong, you can roll back to any previous state with a single command.
- **Automate repetitive work** — run CODA headlessly in scripts and CI pipelines. Feed it a prompt, let it work, and check the result — no terminal UI needed.
- **Extend it for your team** — connect MCP servers, write custom skills, and create shared `AGENTS.md` files so every developer on the project works with the same conventions baked in.

### How a session looks

| You                              | CODA                                                    |
|----------------------------------|---------------------------------------------------------|
| Describe the goal in plain language | Reads files, plans the approach                        |
| Review what it's about to do     | Edits files, runs shell commands                        |
| Approve, adjust, or undo         | Saves checkpoints so nothing is permanently lost        |

### Three ways to run it

| Mode               | Description                                                                                     |
|--------------------|-------------------------------------------------------------------------------------------------|
| Interactive (TUI)  | Full-screen terminal UI. Type prompts, review tool output, approve commands, navigate history.   |
| Headless (Batch)   | Single command, no UI. Give CODA a prompt, it runs, and exits. Use in scripts and CI.           |
| Editor (ACP)       | Native third-party integrations via Agent Client Protocol (Zed, JetBrains IDEs).                |

All three share the same agent and configuration.

---

## Installation

### Requirements

- **Git 2.5.0 or newer** — CODA uses Git under the hood for checkpoints. Run `git --version` to check.
- **A supported terminal** — any modern terminal on macOS, Linux, or Windows works.
- **Provider credentials** — connect an AI provider on first launch: sign in to Glob.AI OS with your Globant account (OAuth, recommended) or an API key, or configure a custom OpenAI-compatible provider.

### Install CODA

**macOS & Linux (recommended — install script, no dependencies):**

```bash
curl -fsSL 'https://docs.globant.ai/en/filedownload?4622,12' | bash
```

**Windows (PowerShell 7) — restart your terminal after installing:**

```powershell
irm 'https://docs.globant.ai/en/filedownload?5346,6' | iex
```

**Alternatively, via npm (requires Node.js LTS):**

```bash
npm i -g @globant/coda
```

### Keeping CODA up to date

```bash
coda upgrade        # from the terminal
/upgrade            # from inside the TUI
```

CODA picks the right mechanism automatically based on how you installed it:

- Installed via npm → upgrades through npm
- Installed via the script → swaps in the latest native binary under `~/.coda/bin`

### Troubleshooting

**Windows: `coda: The term 'coda' is not recognized`**

Expected right after installing — PowerShell hasn't picked up the updated PATH yet. Close and reopen your terminal (or open a new tab) and try again.

---

## Connect a Provider

A provider is the AI backend CODA talks to. You connect one the first time you launch CODA through a setup wizard that opens automatically.

### Launch modes

#### `coda --globant`

For Globant employees. The wizard asks you to pick between Glob.AI OS and Custom provider. If you choose Glob.AI OS, you'll see an instance picker:

| Instance     | Auth methods                   |
|--------------|--------------------------------|
| Clients      | OAuth (browser) or API key     |
| Corp         | API key only (OAuth coming soon) |
| SaaS Europe  | OAuth (browser) or API key     |
| Other        | API key                        |

If you select **Other**, the wizard asks for: Profile name, Base URL, and API key.

`--globant` is sticky — once set, it persists in your config. To revert: `coda --no-globant`.

#### `coda`

For non-Globant employees. Routes directly to SaaS Europe — no instance picker.

### Authentication

- **OAuth / Login (recommended)** — CODA opens your browser, you sign in with your Globant account. No keys to copy or rotate.
- **API Key** — paste or type your key (input is hidden), then press Enter.

API keys are stored in `~/.coda/.secrets`, separate from your config and never committed to Git.

### Custom provider (non-Glob.AI OS)

- **OpenAI-compatible** — enter a profile name, base URL, and API key.
- **Ollama** — point CODA at your local server (no API key needed).

### Reconfigure

Run `/providers` inside a session or `coda --reconfigure` from your terminal. Changes take effect after a restart.

### Switch between configured profiles

- `/switch-profile` — change which provider profile is active (takes effect next launch)
- `/project` — switch the active project within a profile (live, no restart needed; Glob.AI OS OAuth only)

---

## Configuration

CODA is configured from within the tool itself — you normally don't edit files by hand. Commands like `/providers` and `/settings` write your choices to a layered config.

### Profiles

| I want to…                                     | Use              |
|------------------------------------------------|------------------|
| Move from Clients instance to Corp             | `/switch-profile` |
| Move from one project to another on same instance | `/project`     |
| Go from Glob.AI OS to local Ollama             | `/switch-profile` |
| Reuse credentials but work in a different org  | `/project`       |

### Where settings live (priority order)

| File                       | What it's for                                              |
|----------------------------|------------------------------------------------------------|
| `~/.coda/config.json`      | Your personal defaults — provider, model, theme            |
| `~/.coda/.secrets`         | API keys and credentials (never commit this)               |
| `<project>/.coda/config.json` | Project-level overrides (safe to commit if no secrets)  |
| `<project>/coda.config.ts` | TypeScript config — replaces project config.json if present |
| `~/.coda/mcp.json`         | MCP servers available in all your projects                 |
| `<project>/.coda/mcp.json` | MCP servers for this project only                          |

### Common settings (`/settings`)

- **Bash approval level** — four levels: `safe`, `low` (default), `medium`, `high`
- **Shell mode** — `auto`, `bash`, `powershell`, or `wsl`
- **Compaction** — scope (global/project), enable/disable, threshold, retain fraction
- **Chat input** — Queue (default) or Steer (inject mid-turn)
- **Theme** — `classic` or `modern`

---

## Ways to Run CODA

### Interactive (TUI)

The full-screen terminal UI for day-to-day development:

```bash
cd /path/to/your/project
coda
```

Use slash commands to control the session: `/sessions`, `/timeline`, `/settings`, `/compact`, and more.

### Headless (Batch)

For automation — pass a prompt, CODA runs it, and exits:

```bash
coda -p "Run the test suite and report failures" --auto-approve all
```

Important flags for automation:

| Flag                        | What it does                                                              |
|-----------------------------|---------------------------------------------------------------------------|
| `-p` / `--prompt "…"`      | The prompt to run                                                         |
| `--prompt-file` / `-pf`    | Read the prompt from a file                                               |
| `--output text\|json`      | Output format (`json` emits newline-delimited events)                     |
| `--auto-approve all\|none` | Approval handling. `all` approves everything; `none` aborts on first ask  |
| `--timeout ms`             | Abort after N milliseconds (default 300000 = 5 min; 0 disables)          |
| `--tools default\|all\|*list*` | Limit available tools                                                |
| `--model` / `-m`           | Override the model for this run                                           |
| `--session-id` / `-s`      | Resume or create a session with a specific id                             |
| `--checkpoints=true`       | Enable file snapshots (off by default in headless)                        |
| `--coda-home dir`          | Use dir as config/data home instead of `~/.coda`                          |

**Batch mode limitations:** Single turn only — one prompt, one response. No multi-turn conversation.

### Editor (ACP)

CODA runs inside editors supporting the Agent Client Protocol.

#### Zed setup (macOS/Linux)

Edit `~/.config/zed/settings.json`:

```json
{
  "agent_servers": {
    "CODA": {
      "type": "custom",
      "command": "/Users/you/.coda/bin/coda",
      "args": ["--acp"],
      "env": {}
    }
  }
}
```

#### JetBrains setup

Edit `~/.jetbrains/acp.json`:

```json
{
  "default_mcp_settings": {},
  "agent_servers": {
    "CODA": {
      "command": "/Users/you/.coda/bin/coda",
      "args": ["--acp"],
      "env": {}
    }
  }
}
```

#### What works in ACP mode

- Streaming — assistant text streams into the editor's chat panel
- Native diffs — file edits render in the editor's own diff/review UI
- Editor terminal — commands run in the IDE's terminal pane
- Permissions — Default (ask before risky actions), Plan (propose without editing), Accept Edits (apply without prompting)

#### Prerequisites

1. Install CODA and note its absolute path (`which coda`)
2. Authenticate once in a terminal (CODA uses interactive OAuth)
3. ACP is enabled by default; opt out with `acp.enabled: false` in config

---

## Core Concepts

### The Agent Loop — How CODA Works

CODA works in a loop. Each turn, it:

1. Reads your request and context
2. Decides on a next step
3. Calls a tool to act
4. Observes the result
5. Repeats until the task is done

Tools CODA picks automatically:

| Tool         | What it does                                               |
|--------------|------------------------------------------------------------|
| File read/write | Read any file; write or patch files to make changes     |
| Shell        | Run shell commands — tests, linters, build scripts, git    |
| Search       | Search for patterns across your codebase                   |
| MCP tools    | Tools exposed by connected MCP servers                     |
| Skills       | Invoke a skill you or your team has defined                |
| Sub-agents   | Delegate a subtask to another CODA agent running in parallel |

CODA always reads files live from disk, not from a cached index.

### Compaction

Long sessions accumulate history. Once conversation reaches a certain size, CODA automatically condenses older messages into a summary while keeping recent messages verbatim.

```text
/compact       # trigger manually
/settings      # → Context Compaction to adjust
```

### Permissions & Approvals

CODA asks before doing anything risky. Approval controls:

#### Bash approval levels

| Level  | What it auto-approves                                                      |
|--------|----------------------------------------------------------------------------|
| safe   | Read-only commands only (`ls`, `cat`, `git status`)                        |
| low    | Safe commands + low-risk writes — default                                  |
| medium | Most file operations and git commits                                       |
| high   | Everything except clearly destructive operations                           |

Even at `high`, commands matching blocked patterns are refused outright (e.g., `rm -rf /`, fork bombs, `dd` to disk device, `mkfs`).

#### Other actions that ask first

- Overwriting a file it never read this session (anti-clobber guard)
- Consolidating memory (rewrites MEMORY.md)
- MCP and other tools go through the same approval flow

#### Custom gates with hooks

Use a `PreToolUse` hook to block actions — e.g., refusing `git push` to main. Blocking is fail-closed: if your hook errors or times out, the tool call is blocked.

#### Approvals in headless (batch) mode

- `--auto-approve` defaults to `all` (headless approves everything)
- `--auto-approve none` aborts on the first prompt
- Bash defaults to `high` tier in headless
- The `ask_user` tool ends the run (no one to answer)

### Agents

Agents let CODA delegate work to itself. You give a named profile and a task, and CODA starts a child session.

#### Built-in agents

- **coda-help** — in-app documentation assistant (auto-delegated when you ask about CODA)
- **explore** — codebase-exploration specialist for mapping unfamiliar areas

#### Defining an agent

Agent definitions are Markdown files with YAML frontmatter:

```markdown
---
name: explore
description: Explore one area of the codebase and report back a concise summary.
---

You are a codebase exploration specialist. Given an area or question:
1. Map the relevant files and how they fit together.
2. Trace the key data flows.
3. Report back a concise summary — no edits.
```

Required frontmatter: `name` and `description`.
Optional fields: `model` (or `inherit`), `tools` / `disallowedTools`, `background`, `color`.

#### Where CODA looks for agent definitions

1. `<project>/.coda/agents/` — walking up from project directory toward home
2. `~/.coda/agents/` — personal, user-wide library
3. Plugin agent directories

First match for a given name wins.

#### Managing agents

```text
/agents                        # Open the Agents overlay
/agents run <name> <task>      # Start a run (background by default)
/agents run <name> --foreground <task>  # Wait for result
/agents stop <id>              # Cancel a run
/agents open <id>              # Show run details
/agents transcript <id>        # Jump to child transcript
/agents enable [global|project]
/agents disable [global|project]
```

#### Agent intelligence tiers

CODA uses three tier shortcuts that resolve to concrete models:

| Tier  | Purpose                                              |
|-------|------------------------------------------------------|
| fast  | Cheapest / fastest — simple, high-volume tasks       |
| smart | Balanced quality vs. cost — default for most work    |
| deep  | Strongest reasoning, highest cost — complex analysis |

Config example:

```json
{
  "activeProfile": "geai-oauth",
  "profiles": {
    "geai-oauth": {
      "provider": "glob-ai",
      "model": "anthropic/claude-opus-4-8",
      "fastModel": "anthropic/claude-haiku-4-5",
      "smartModel": "anthropic/claude-sonnet-4-6",
      "deepModel": "anthropic/claude-opus-4-8"
    }
  },
  "agents": {
    "enabled": true,
    "maxConcurrent": 6,
    "fastModel": "anthropic/claude-haiku-4-5",
    "smartModel": "anthropic/claude-sonnet-4-6",
    "deepModel": "anthropic/claude-opus-4-8"
  }
}
```

Model resolution order:

1. Agent definition's `model` field (highest priority)
2. Tier shortcut resolution → provider-level first, then global config
3. Default — inherits main session's model

#### Limitations

- No nested agents — a child session can't spawn further agent runs
- No background runs in headless mode (foreground still works)
- First definition wins for duplicate names

### Sessions & Checkpoints

#### Resume sessions

```bash
coda --lastsession          # Resume most recent
coda --session-id <id>      # Resume specific session
```

Inside the TUI: `/sessions` to browse and switch.

#### Start fresh

```text
/new     # opens a new session; old one is saved
```

#### Checkpoints

CODA takes a checkpoint (file snapshot) before each turn. Stored in a private shadow repository under `~/.coda/checkpoints/` — your project's own Git history is never touched.

```text
/timeline     # view and restore checkpoints
/rewind       # alias for /timeline
Esc Esc       # also opens timeline (when chat input is empty)
```

Restoring a checkpoint also rewinds the conversation back to that point.

**Requirements:** Git 2.5.0+. If Git is unavailable, checkpoints are disabled automatically.

**What a snapshot captures:**

- Your project worktree files at that moment

**What it skips:**

- `.git`, `.coda/sessions`, `.coda/MEMORY.md`, `.coda/agents`, `node_modules`, `.venv`, `venv`, `dist`, `build`, `.next`, `.turbo`, `__pycache__`, `.pytest_cache`, `.cache`, `target`, `.gradle`

**Protected:**

- `.coda/MEMORY.md` is excluded at both capture and restore time (memory survives rollbacks)
- `.git/` is never touched

#### `.codaignore`

Add a `.codaignore` file at your project root (gitignore syntax) to keep additional paths out of snapshots.

#### Drift detection

If your worktree has uncaptured changes when you try to restore, CODA stops the restore. Press `F` to force through drift, or `Esc` to cancel.

#### Verify checkpoints

```bash
coda checkpoints-demo    # smoke-test the whole subsystem
```

### Memory

CODA remembers durable facts across sessions via `MEMORY.md` files.

#### Two memory files

| File                        | Scope                              |
|-----------------------------|------------------------------------|
| `~/.coda/MEMORY.md`         | User-wide (all projects)           |
| `<project>/.coda/MEMORY.md` | Project-specific (commit to share) |

#### Memory vs. AGENTS.md

| Aspect     | MEMORY.md                                 | AGENTS.md                              |
|------------|-------------------------------------------|----------------------------------------|
| Holds      | Learned preferences, decisions, gotchas   | Coding conventions and project rules   |
| Written by | CODA, as it learns                        | You (often via `/init`)                |
| Nature     | Knowledge about you / the project         | Instructions the agent must follow     |

#### What CODA remembers

- Personal or workflow preferences
- Important architectural decisions
- Corrections to its behavior
- Grouped under sections: Stable User Preferences, Stable Project Preferences, Important Decisions, Learned Facts, Known Gotchas, Source-of-Truth Pointers, Things To Re-Validate

#### What it does NOT store

- Ephemeral task state
- Transient output
- Conventions that belong in AGENTS.md
- Anything trivially rediscoverable from the repo
- Sensitive data (API keys, passwords)

#### Conflicts

If a new note contradicts an existing one, CODA keeps both with a `⚠️ CONFLICT` tag and asks you which to keep next time.

Memory survives resets and undo — independent of session history and checkpoints.

---

## Extending CODA

Five ways to extend CODA:

| Method      | Purpose                                                                    |
|-------------|----------------------------------------------------------------------------|
| MCP Servers | Connect external tools (issue tracker, CI system, database, APIs)          |
| Skills      | Teach CODA repeatable processes (Markdown-defined)                          |
| Extensions  | TypeScript modules that register custom tools and slash commands            |
| Plugins     | Versioned, installable packages that bundle skills, agents, and MCP servers |
| Workflows   | Orchestrate multiple agents (fan-out, pipelines, loops)                    |

### MCP Servers

MCP (Model Context Protocol) is an open standard for connecting AI agents to external services.

#### Add a server

```text
/mcp              # Open the MCP manager overlay
/mcp status       # Show connection state
/mcp list-tools   # Show available tools
```

Or configure by hand in `~/.coda/config.json` or `<project>/.coda/config.json`:

```json
{
  "mcp": {
    "servers": {
      "playwright": {
        "command": "npx",
        "args": ["@playwright/mcp@latest"]
      },
      "github": {
        "url": "https://api.github.com/mcp",
        "authorizationToken": "Bearer ${GITHUB_TOKEN}",
        "timeout": 30
      }
    }
  }
}
```

#### Server types

- **Local** (subprocess) — has `command` field
- **Remote** (HTTP) — has `url` field (must speak MCP Streamable HTTP)

Common fields:

- Local: `command`, `args`, `env`
- Remote: `url`, `headers`, `authorizationToken`, `timeout`
- Both: `disabled: true` to keep defined but off

Secrets in `env`, `headers`, and `authorizationToken` can reference variables with `${VAR}` (or `${VAR:-default}`), resolved from `.secrets`, project `.env`, or environment.

#### How CODA uses MCP tools

You don't call MCP tools by name. CODA exposes a single gateway tool, `mcp_execute`, and the system prompt lists every connected server with its available tools. Just describe what you want.

#### Connection behavior

- **Lazy connect** — servers connect on first prompt, not at startup
- **Per-session toggles** — `/mcp enable` and `/mcp disable` for session only
- **Live reload** — choose Reload in `/mcp` overlay; no restart needed

### Skills

A skill teaches CODA a repeatable process — a Markdown file with YAML header + instructions.

#### Create a skill with CODA

```text
create a skill that reviews a PR for test coverage
```

Or explicitly: `/create-skill`

#### Write a skill manually

```markdown
---
name: pr-review
description: Review a pull request for code quality, test coverage, and potential issues.
---

1. Read the diff carefully.
2. Check that every changed function has test coverage.
3. Flag any SQL queries that aren't parameterized.
4. Note any missing error handling.
5. Summarize the findings in a comment-ready format.
```

Save to `<project>/.coda/skills/pr-review/SKILL.md`.

Optional frontmatter flags:

- `disable-model-invocation: true` — keeps skill out of automatic selection
- `user-invocable: false` — hides from slash-command list

#### Where skills live

- **Project** — `<project>/.coda/skills/` (commit these)
- **Global** — `~/.coda/skills/` (personal, available everywhere)

Project skill wins if same name exists globally.

#### Use a skill

Automatic: just describe the task — CODA matches by description.
Explicit: `/pr-review`

#### Manage skills

```text
/skills              # Open manager
/skills list         # Show all skills and state
/skills enable       # Toggle on
/skills disable      # Toggle off
/skills refresh      # Re-scan folders
/skills add <url>    # Install from GitHub
/skills add <url> project  # Install to current project
```

#### Built-in skills

- **plan** — gathers context and writes an implementation plan
- **create-extension** — scaffolds a TypeScript extension
- **create-skill** — generates a SKILL.md from description

### QA & Testing Skills

The QE team maintains 45+ QA/testing skills in the `magnifai-gbx/coda-skills` repo.

#### Install

```text
/skills add https://github.com/magnifai-gbx/coda-skills
```

For private repos, set `GITHUB_TOKEN` (or `GH_TOKEN`).

#### Categories

| Area                   | Example skills                                                              |
|------------------------|-----------------------------------------------------------------------------|
| Test design & planning | `g-qe-test-plan`, `g-qe-test-strategy`, `g-qe-test-case-gherkin-designer`  |
| UI automation          | `g-qe-ui-automation-code-creation`, `g-qe-playwright-recorder`             |
| API testing            | `g-qe-api-tester`, `g-qe-api-test-designer`, `g-qe-bruno-collection-generator` |
| Mobile testing         | `g-qe-mobile-automator`, `g-qe-mobile-test-designer`                       |
| Performance            | `g-qe-performance-architect`, `g-qe-performance-test-planner`              |
| Security & accessibility | `g-qe-zap-pentesting`, `g-qe-a11y-scanner`                              |
| Defects & reporting    | `g-qe-defect-analyzer`, `g-qe-bug-report-writer`, `g-qe-bug-pusher`       |
| Unit tests & release   | `g-qe-unit-tests-generator`, `g-qe-release-gate`                          |

### Writing Extensions

Extensions are TypeScript modules that plug into CODA — register custom tools, slash commands, and lifecycle hooks.

#### Let CODA write it

```text
I want an extension that adds a /deploy slash command which deploys the app to staging or production.
```

Or explicitly: `/create-extension`

#### Anatomy of an extension

```typescript
import { z, type ExtensionAPI, type AgentTool, type ToolContext } from "@globant/coda-core";

export default function activate(api: ExtensionAPI): void {
  // Register tools, commands, hooks
}
```

#### Where extensions load from (priority order)

1. `.coda/extensions/*.ts` — project-level (highest)
2. `~/.coda/extensions/*.ts` — user-global
3. `config.json → extensions[]` — configured paths
4. `-e ./path.ts` — CLI flag

#### Registering a tool

```typescript
const myTool: AgentTool = {
  name: "my_tool",
  description: "Clear description of what the tool does and when to use it",
  parameters: z.object({
    query: z.string().describe("What to search for"),
    limit: z.number().int().positive().optional().describe("Max results"),
  }),
  label: "My Tool",
  execute: async (toolCallId, params, context: ToolContext) => {
    const cwd = context.cwd ?? process.cwd();
    // ... do the work ...
    return "result string returned to the agent";
  },
};
api.registerTool(myTool);
```

`ToolContext` fields: `cwd`, `signal`, `hitl`, `operations` (readFile, writeFile, glob, stat, exists, exec), `sessionId`, `mcp`, `onUpdate`, `model`.

#### Registering a slash command

```typescript
api.registerCommand("deploy", {
  description: "Deploy the application to staging or production",
  getArgumentCompletions: (prefix) => {
    const options = [
      { value: "staging", label: "staging — deploy to staging" },
      { value: "production", label: "production — deploy to production" },
    ];
    const p = prefix.trim().toLowerCase();
    return p ? options.filter((o) => o.value.startsWith(p)) : options;
  },
  handler: async (args, ctx) => {
    if (!args.trim()) {
      ctx.addMessage?.("system", "Usage: /deploy [staging|production]");
      return;
    }
    await ctx.sendMessage?.(`Deploy to ${args.trim()}`);
  },
});
```

`ExtensionCommandContext` fields: `addMessage`, `sendMessage`, `clearMessages`, `setModel`, `session`, `ui` (select, confirm, input, notify, setStatus), `showModelPicker()`, `showSettings()`, `showMcpManager()`, `waitForIdle()`, `exit()`.

Reserved command names (can't override):

```text
model, models, clear, compact, exit, help, mcp, providers, settings,
skills, agents, extensions, plugin, plugins, reload-plugins,
init, timeline, rewind, checkpoint-status
```

#### Subscribing to lifecycle hooks

```typescript
api.on("session_start", async ({ sessionId }) => {
  console.error("Session started:", sessionId);
});

api.on("context", async (context) => {
  context.systemPrompt += "\n\n## My custom instructions\n...";
});
```

Available hooks:

| Hook                    | When it fires                        |
|-------------------------|--------------------------------------|
| `session_start/end`     | After session creation / when it ends |
| `session_shutdown`      | Process exit — flush buffers         |
| `before_agent_start`    | Before the agent loop                |
| `agent_start/end`       | Agent loop boundaries                |
| `turn_start/end`        | Per-LLM-turn boundaries             |
| `context`               | Mutate before each LLM call          |
| `input`                 | Transform user input before send     |
| `tool_call`             | Intercept or deny a tool call        |
| `tool_result`           | Modify a tool result                 |
| `session_before_compact` | Before compaction                   |

#### Intercepting tool calls

```typescript
api.on("tool_call", async ({ toolName, input }) => {
  if (toolName === "bash" && input.command?.includes("rm -rf /")) {
    return { deny: true, reason: "Blocked destructive command" };
  }
});
```

### Plugins

A plugin is a versioned, installable package with a manifest.

#### Plugins vs. extensions

| Aspect   | Plugins                                    | Project extensions                     |
|----------|--------------------------------------------|----------------------------------------|
| Format   | JSON manifest + bundled assets             | A TypeScript file with `activate(api)` |
| Install  | `coda plugin install`                      | Copy into `.coda/extensions/`          |
| Versioning | Tracked in a registry with source + version | Ad hoc                              |
| Best for | Redistributable packages, marketplaces     | Project-specific scripts               |

#### Install a plugin

```bash
coda plugin install npm:@scope/my-plugin@1.0.0
coda plugin install https://github.com/org/repo.git
coda plugin install /absolute/path/to/plugin
coda plugin install my-plugin@acme     # from marketplace
```

Flags: `--scope project` (pin in `.coda/plugins.json`), `--name` (subfolder selection), `--copy` (copy instead of symlink).

Inside a session: `/plugin`

After installing/enabling/disabling: run `/reload-plugins` or restart.

#### Manage plugins

```text
/plugin list      # show installed plugins
/plugin info      # details for one plugin
/plugin enable    # turn on
/plugin disable   # turn off
/plugin remove    # uninstall
```

#### Plugin registries

- **User registry** — `~/.coda/plugins.json` (source of truth)
- **Project registry** — nearest `.coda/plugins.json` (commit for team)

#### Marketplaces

```bash
coda marketplace install <source>         # register a marketplace
coda plugin install my-plugin@acme        # install from marketplace
coda plugin marketplace list              # list registered
coda plugin marketplace remove            # remove one
```

#### Authoring a plugin

Manifest at `.coda-plugin/plugin.json`:

```json
{
  "name": "context7",
  "displayName": "Context7 Docs",
  "version": "1.2.0",
  "description": "Fetches up-to-date library docs into the session context.",
  "skills": "skills",
  "agents": "agents",
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "env": { "DEFAULT_MIN_TOKENS": "10000" }
    }
  }
}
```

Directory layout:

```text
my-context7-plugin/
  .coda-plugin/
    plugin.json
  skills/
    SKILL.md
  agents/
    context-fetcher.md
```

Bundled skills are namespaced as `plugin-name:skill-name`.

#### Compatibility

CODA reads manifests from `.claude-plugin/plugin.json` (Claude Code) and `.cursor-plugin/plugin.json` (Cursor). Recognized fields are used; unknown ones ignored.

### Hooks (Config-based)

Hooks let you run shell commands or scripts at specific events — configured in `config.json`.

#### Where hooks are configured (priority order)

1. `<project>/.coda/config.json → hooks` (highest)
2. `~/.coda/config.json → hooks`
3. `hooks/hooks.json` inside installed plugins (lowest)

To disable all: `"disableAllHooks": true`

#### Hook events

| Event               | When it fires                          | Can block? |
|---------------------|----------------------------------------|------------|
| PreToolUse          | Before a tool runs                     | Yes        |
| PostToolUse         | After a tool succeeds                  | No (can append context) |
| PostToolUseFailure  | After a tool errors                    | No         |
| UserPromptSubmit    | When you submit a message              | Yes        |
| PreCompact          | Before context compaction              | Yes (cancel) |
| PostCompact         | After compaction completes             | No         |
| SessionStart        | When a session is created              | Can inject env vars |
| SessionEnd          | When a session ends                    | No         |
| Stop / StopFailure  | When a turn finishes / errors fatally  | No         |
| SubagentStart/Stop  | Delegated agent run starts/ends        | No         |
| Notification        | When CODA sends a notification         | No         |
| PermissionRequest/Denied | Approval shown / call denied      | No         |
| ConfigChange        | On `/reload-hooks`                     | No         |
| CwdChanged          | After working directory changes        | Can update `$CODA_ENV_FILE` |
| FileChanged         | After a file is written or edited      | Can update `$CODA_ENV_FILE` |
| InstructionsLoaded  | When AGENTS.md is loaded               | No         |

#### Example: Block dangerous commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "bash",
        "hooks": [{ "type": "command", "command": ".coda/hooks/no-rm.sh" }]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# .coda/hooks/no-rm.sh
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
if echo "$COMMAND" | grep -qE '\brm\b.*-rf'; then
  echo "Blocked: rm -rf is not allowed" >&2
  exit 2
fi
```

#### Example: Auto-format after every edit

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "write|edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path // empty'); [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null; exit 0"
          }
        ]
      }
    ]
  }
}
```

#### Example: Activate a virtualenv for the session

```bash
#!/bin/bash
# SessionStart hook
[ -f ".venv/bin/activate" ] && source .venv/bin/activate
echo "export VIRTUAL_ENV=\"$VIRTUAL_ENV\"" >> "$CODA_ENV_FILE"
echo "export PATH=\"$PATH\"" >> "$CODA_ENV_FILE"
```

#### Example: Async webhook

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "https://hooks.example.com/coda-prompt",
            "headers": { "Authorization": "$WEBHOOK_TOKEN" },
            "allowedEnvVars": ["WEBHOOK_TOKEN"],
            "timeout": 3,
            "async": true
          }
        ]
      }
    ]
  }
}
```

#### Hook definition fields

**Command hooks:**

| Field         | Required | Description                                              |
|---------------|----------|----------------------------------------------------------|
| type          | ✅       | `"command"`                                               |
| command       | ✅       | Shell command (hook input arrives as JSON on stdin)       |
| args          |          | Run directly with args — no shell, no quoting            |
| shell         |          | `"bash"` or `"powershell"` (default is `sh`)             |
| timeout       |          | Seconds before stopped (default 600)                     |
| if            |          | Permission-style rule match, e.g. `"Bash(git push*)"`    |
| statusMessage |          | Custom label shown in UI while running                   |
| async         |          | Run in background                                        |

**HTTP hooks:**

| Field          | Required | Description                                         |
|----------------|----------|-----------------------------------------------------|
| type           | ✅       | `"http"`                                             |
| url            | ✅       | Endpoint to POST the hook input to                   |
| headers        |          | Request headers (`$VAR` filled from `allowedEnvVars`) |
| allowedEnvVars |          | Allowlist of env vars for interpolation              |
| timeout        |          | Seconds before aborted (default 600)                 |
| async          |          | Fire-and-forget                                      |

#### Hook I/O

Every hook receives JSON on stdin with: `session_id`, `cwd`, `hook_event_name`, and event-specific fields (for tool events: `tool_name` and `tool_input`).

To block: exit 2 and write reason to stderr.
For richer control, print JSON to stdout:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Policy: no force-push",
    "updatedInput": { "command": "git status" }
  }
}
```

- `PostToolUse` can return `additionalContext` or `updatedToolOutput`
- `UserPromptSubmit` can return `updatedPrompt`
- Any hook can return `{ "continue": false, "stopReason": "…" }` to stop the agent

#### Important notes

- Matching hooks run in parallel (last-write-wins if both change same thing)
- Blocking fails closed (timeout/error blocks the operation)
- Output capped at 10,000 characters per hook
- `$CODA_ENV_FILE` is for bash/WSL, not PowerShell
- Plugin hooks run automatically once installed

### Workflows

A workflow orchestrates multiple agents — fanning work out in parallel, running multi-stage pipelines, looping, and synthesizing results.

#### Create a workflow

Ask CODA to build one (delegates to built-in `create-workflow` agent):

```text
Create a workflow to do an independent per-principle SOLID audit — one reviewer per principle (SRP/OCP/LSP/ISP/DIP), each finding adversarially verified, synthesized into per-principle verdicts + a prioritized fix list.
```

The agent writes the file but doesn't run it. First run requires your confirmation.

#### Run a workflow

Just ask in plain language:

```text
Run the SOLID audit workflow on my codebase
```

Runs are background by default. CODA shows results on a later turn.

#### Monitor workflows

```text
/workflows              # Dashboard with live progress
/workflows stop <id>    # Stop a specific run
/workflows stop         # Stop all in-flight runs
```

#### Where workflows live

- `<project>/.coda/workflows/` — project-specific (commit to share)
- `~/.coda/workflows/` — personal, available in every project
- Plugins may bundle workflows
- Also discovers under `.claude/workflows/` (Claude Code compatibility)

#### Authoring a workflow (advanced)

```typescript
export const meta = {
  name: "solid-audit",
  description: "Independent per-principle SOLID audit with verification.",
  whenToUse: "When the user asks for a thorough, repo-wide SOLID review.",
  argsHint: "{ scope?: string }",
};

export async function run(ctx) {
  ctx.phase("Audit");
  const findings = await ctx.agent("Review SRP in the target scope", {
    schema: /* optional Zod/JSON schema for typed output */,
  });
  await ctx.writeArtifact("report.md", findings);
  return { done: true };
}
```

`ctx` helpers: `ctx.agent(prompt, opts)`, `ctx.parallel(...)`, `ctx.pipeline(...)`, `ctx.phase(title)`, `ctx.log(msg)`, `ctx.writeArtifact(name, content)`, `ctx.args`, `ctx.budget`.

---

## Commands & Flags Reference

### Slash commands — Session management

| Command                   | What it does                                                     |
|---------------------------|------------------------------------------------------------------|
| `/sessions`               | Browse, resume, rename, and delete saved sessions                |
| `/new`                    | Start a fresh session (old one is saved)                         |
| `/exit` (alias `/quit`)   | Exit CODA; prints `coda --session-id` so you can resume later    |
| `/clear`                  | Permanently wipe the current session's message history            |

### Slash commands — Files and changes

| Command                     | What it does                                                   |
|-----------------------------|----------------------------------------------------------------|
| `/timeline` (alias `/rewind`) | Open the timeline picker to view/restore checkpoints         |
| `/init`                     | Create or update an AGENTS.md file                             |
| `/project`                  | Switch the active Glob.AI OS project (OAuth only)              |

### Slash commands — Configuration

| Command                          | What it does                                                 |
|----------------------------------|--------------------------------------------------------------|
| `/providers`                     | Connect, add, update, or remove providers (restart required) |
| `/switch-profile`                | Switch the active provider profile (next launch)             |
| `/switch-model` (alias `/sm`)    | Open the model picker                                        |
| `/effort`                        | Set reasoning effort: `low\|medium\|high\|xhigh\|max`       |
| `/logout`                        | Sign out of Glob.AI OS session                               |
| `/settings`                      | Open settings panel                                          |
| `/auth-status` (alias `/whoami`) | Show current authentication status                           |

### Slash commands — Tools and extensions

| Command                              | What it does                                  |
|--------------------------------------|-----------------------------------------------|
| `/mcp`                               | Open MCP manager                              |
| `/mcp status`                        | Show server connection status                 |
| `/mcp list-tools [server]`           | List tools a server exposes                   |
| `/mcp enable` / `/mcp disable`       | Toggle a server for this session              |
| `/skills`                            | Open skills manager                           |
| `/skills list`                       | List skills and enabled state                 |
| `/skills enable` / `/skills disable` | Toggle a skill                                |
| `/skills add <url> [project\|global]` | Install from GitHub                          |
| `/skills refresh`                    | Re-scan skill directories                     |
| `/extensions`                        | Manage loaded extensions                      |
| `/plugin`                            | Install, enable, disable, list plugins        |
| `/plugin info`                       | Full record for an installed plugin           |
| `/plugin marketplace list/remove`    | Manage marketplaces                           |
| `/reload-plugins`                    | Reload plugins after disk changes             |
| `/hooks`                             | Browse lifecycle hook events                  |
| `/hooks list [event]`                | Show configured hooks                         |
| `/reload-hooks`                      | Reload hook config without restarting         |
| `/agents`                            | Open agents manager                           |
| `/agents run <name> [--foreground]`  | Launch an agent run                           |
| `/agents enable/disable [scope]`     | Toggle agent tools                            |
| `/agents overview/library/runs/status` | Show agent info                             |
| `/agents open/transcript/stop`       | Inspect or cancel a run                       |
| `/workflows`                         | Open workflow dashboard                       |
| `/workflows stop [runId]`            | Stop a workflow run                           |

### Slash commands — Context

| Command     | What it does                                         |
|-------------|------------------------------------------------------|
| `/compact`  | Manually condense conversation history               |
| `/upgrade`  | Check for newer version and open update dialog       |
| `/help`     | Print full list of available commands                 |

### Shell flags

| Flag                          | What it does                                                        |
|-------------------------------|---------------------------------------------------------------------|
| `--help` / `-h`              | Print CLI usage and exit                                             |
| `--version` / `-v`           | Print installed version                                              |
| `--reconfigure`              | Open provider setup wizard                                           |
| `--globant`                  | Show Glob.AI OS instance picker (sticky)                             |
| `--no-globant`               | Revert to default mode                                               |
| `--lastsession`              | Resume most recent session                                           |
| `--session-id` / `-s`        | Resume/create specific session                                       |
| `-p "prompt"` / `--prompt`   | Run in batch mode                                                    |
| `--prompt-file` / `-pf`      | Read headless prompt from file                                       |
| `--output text\|json`        | Output format for headless runs                                      |
| `--auto-approve all\|none`   | Headless approval handling (default: `all`)                          |
| `--tools` / `-t`             | Limit available tools                                                |
| `--timeout`                  | Abort headless run after N ms                                        |
| `--checkpoints[=true\|false]` | Force checkpoints on/off                                            |
| `--bash-security`            | Set bash approval level for this run                                 |
| `--model` / `-m`             | Use specific model                                                   |
| `--system-prompt`            | Replace built-in base prompt                                         |
| `--append-system-prompt`     | Append extra instructions after normal system prompt                 |
| `--mcp-config`               | MCP config as JSON file path or inline JSON                          |
| `--cwd`                      | Set working directory                                                |
| `--coda-home`                | Use as config/data home instead of `~/.coda`                         |
| `-e`                         | Load an extension file (repeatable)                                  |

### Headless provider selection flags

| Flag           | What it does                                                         |
|----------------|----------------------------------------------------------------------|
| `--profile`    | Use a persisted provider profile (read-only)                         |
| `--provider`   | Ephemeral provider: `glob-ai \| openai-compat \| ollama`             |
| `--instance`   | Glob.AI OS instance: `clients \| corp \| saas-europe`                |
| `--base-url`   | Base URL for ephemeral openai-compat or ollama                       |
| `--api-key`    | Ephemeral API key (never persisted)                                  |

### Shell subcommands

| Subcommand                  | What it does                                                   |
|-----------------------------|----------------------------------------------------------------|
| `coda install`              | Add coda binary directory to PATH                              |
| `coda upgrade [--check] [--yes]` | Update CODA                                              |
| `coda logs [options]`       | View/stream local logs                                         |
| `coda logs export`          | Write redacted support bundle                                  |
| `coda plugin install/remove/enable/disable/list/info` | Manage plugins from shell  |
| `coda marketplace install`  | Register a plugin marketplace catalog                          |

---

## Configuration Reference

### Config file locations

| File                                     | Purpose                                                 |
|------------------------------------------|---------------------------------------------------------|
| `~/.coda/config.json`                    | User-global settings                                    |
| `~/.coda/.secrets`                       | Secrets in dotenv format (never commit)                 |
| `~/.coda/mcp.json`                       | Global MCP server definitions                           |
| `<project>/.coda/config.json`            | Project-level overrides                                 |
| `<project>/.coda/.env`                   | Project-level environment variables                     |
| `<project>/coda.config.ts`               | TypeScript config (takes priority over project JSON)    |
| `<project>/.coda/mcp.json`               | Project-level MCP servers                               |
| `~/.coda/sessions/<id>/mcp.json`         | Per-session MCP overrides (highest precedence)          |

Values can reference env vars: `${VAR}` or `${VAR:-default}`.

### Provider types

| Type           | Description                                                    |
|----------------|----------------------------------------------------------------|
| geai           | Globant Glob.AI OS gateway. Requires `baseUrl` and `apiKey`    |
| openai-compat  | Any OpenAI-compatible HTTP API. Requires `baseUrl`             |
| ollama         | Local Ollama server (defaults to `http://127.0.0.1:11434/v1`)  |
| openai         | First-party OpenAI SDK                                         |
| anthropic      | First-party Anthropic SDK                                      |
| azure          | Azure OpenAI. Requires `resourceName`, `apiKey`, `apiVersion`  |
| google         | Google Gemini. Requires `apiKey`                               |
| vertex         | Vertex AI                                                      |
| groq           | Groq                                                           |
| openrouter     | OpenRouter                                                     |

Any provider can pin per-tier models with `fastModel`, `smartModel`, `deepModel`.

### bash settings

| Field              | Default | Description                                           |
|--------------------|---------|-------------------------------------------------------|
| `autoApproveLevel` | `"low"` | Risk level auto-approved: `safe`, `low`, `medium`, `high` |
| `shellMode`        | `"auto"` | Shell to use: `auto`, `bash`, `powershell`, `wsl`    |

### compaction settings

| Field            | Default | Description                                          |
|------------------|---------|------------------------------------------------------|
| `enabled`        | `true`  | Enable automatic pre-flight compaction               |
| `threshold`      | `0.75`  | Fraction of token budget that triggers (0.3–0.9)     |
| `retainFraction` | `0.3`   | Fraction of recent messages kept verbatim (0.1–0.9)  |

### tools settings

| Field                    | Default      | Description                             |
|--------------------------|--------------|-----------------------------------------|
| `tools.glob.enabled`    | `true`       | Enable glob file finder                 |
| `tools.glob.max_results` | `100`       | Max paths per glob call                 |
| `tools.grep.enabled`    | `true`       | Enable grep content search              |
| `tools.grep.backend`    | `"ripgrep"`  | Backend: `ripgrep` or `fastgrep`        |
| `tools.grep.index_path` | —            | Pre-built index directory (fastgrep only) |

### webSearch settings

| Field                 | Default    | Description                                 |
|-----------------------|------------|---------------------------------------------|
| `webSearch.provider`  | `"brave"`  | Search provider: `brave`, `exa`, `serper`   |
| `webSearch.apiKey`    | —          | API key (use `${VAR}` for secrets)          |

### vision settings

| Field                       | Default              | Description                              |
|-----------------------------|----------------------|------------------------------------------|
| `vision.model`              | `"openai/gpt-4o-mini"` | Model for image analysis              |
| `vision.useMainAgentModel`  | `false`              | Use main agent model instead             |

### reasoning settings

| Field              | Default    | Description                                     |
|--------------------|------------|-------------------------------------------------|
| `reasoning.enabled` | `false`   | Enable extended thinking                        |
| `reasoning.effort`  | `"medium"` | Budget: `low`, `medium`, `high`, `xhigh`, `max` |

### fallback settings

| Field              | Default | Description                           |
|--------------------|---------|---------------------------------------|
| `fallback.enabled` | `false` | Enable fallback                       |
| `fallback.provider` | —      | Provider key to fall back to          |
| `fallback.model`   | —       | Model to use on fallback              |

### session settings

| Field                        | Default | Description                       |
|------------------------------|---------|-----------------------------------|
| `session.autoRenameEnabled`  | `true`  | Auto-name sessions from content   |
| `session.autoRenameTimeoutMs` | `5000` | Timeout for rename call           |

### Other common settings

| Field                  | Default                        | Description                                    |
|------------------------|--------------------------------|------------------------------------------------|
| `theme`                | `"classic"`                    | UI theme: `classic` or `modern`                |
| `maxSteps`             | `300`                          | Cap on agent loop steps per turn               |
| `agents.enabled`       | `true`                         | Delegated agents available                     |
| `agents.maxConcurrent` | `6`                            | Cap on parallel agent runs (1–10)              |
| `agents.defaultModel`  | —                              | Model for agent runs                           |
| `checkpoints.enabled`  | on (interactive) / off (headless) | Master switch for checkpoints              |
| `autoupdate`           | `true`                         | Background update check                        |
| `acp.enabled`          | `true`                         | Enable coda --acp editor mode                  |

### Environment variables

| Variable                                | Default           | Description                                   |
|-----------------------------------------|-------------------|-----------------------------------------------|
| `CODA_HOME`                             | `~/.coda`         | Alternative home directory                    |
| `LOG_LEVEL`                             | —                 | Log verbosity: trace/debug/info/warn/error    |
| `CODA_WEBSEARCH_MODEL`                  | `openai/gpt-5.5`  | Override web search model                     |
| `CODA_AGENT_MODEL`                      | —                 | Override agent runs model                     |
| `CODA_OMNI_PARSER_INLINE_THRESHOLD_CHARS` | `8000`          | Chars threshold for file vs inline output     |
| `CODA_ENV_FILE`                         | —                 | Path sourced before every bash command        |
| `CODA_NO_MOTION` / `NO_MOTION`         | —                 | Disable UI animations (accessibility)         |

---

## Tools Reference

### Built-in tools

| Tool                                   | What it does                                              |
|----------------------------------------|-----------------------------------------------------------|
| `read`                                 | Read file contents with pagination and encoding handling  |
| `write`                                | Create or overwrite files (anti-clobber guard)            |
| `edit`                                 | Apply structured search-and-replace edits                 |
| `bash`                                 | Run shell commands (gated by risk tiers)                  |
| `glob`                                 | Find files by path pattern                                |
| `grep`                                 | Search file contents (ripgrep/fastgrep)                   |
| `think`                                | Lightweight scratchpad step for reasoning                 |
| `memory`                               | Read or update MEMORY.md notes                            |
| `ask_user`                             | Ask a question in the UI (interactive only)               |
| `web_search`                           | Search the web (Glob.AI OS)                               |
| `examine_images`                       | Analyze images with a vision model                        |
| `omni_parser`                          | Extract text/data from documents and media                |
| `mcp_execute`                          | Call a tool on a connected MCP server                     |
| `skills`                               | Load a discovered skill by name                           |
| `run_agent`, `wait_agents`, `cancel_agent` | Start and manage delegated agent runs                |
| `workflow`                             | Run a named workflow in the background                    |

### What you can configure

| Area   | What you control                              | Where                          |
|--------|-----------------------------------------------|--------------------------------|
| Bash   | Approval level and shell mode                 | `/settings` → Bash Preferences |
| Search | Enable/disable glob/grep, backend, limits     | Config file (`tools.*`)        |
| Vision | Model for `examine_images`                    | Config (`vision.model`)        |
| MCP    | Which servers load                            | `/mcp` manager                 |
| Agents | Delegation tools and run behavior             | Config (`agents.*`) + `/agents` |

### Tools inside agent runs (trimmed set)

Not available in child sessions: `run_agent`, `wait_agents`, `cancel_agent`, `workflow`, `ask_user`.

Available: `read`, `write`, `edit`, `bash`, `grep`, `mcp_execute`, and all everyday tools.

---

## Reasoning Effort

Control how much "thinking" a model does before answering.

### Set the effort level

```text
/effort high
/effort           # opens inline selector
```

Levels: `low`, `medium`, `high`, `xhigh`, `max`.

### Make it your default

```json
{
  "reasoning": {
    "enabled": true,
    "effort": "medium"
  }
}
```

### Show/hide thinking

Press `Ctrl+O` to toggle thinking visibility in the transcript (display toggle only).

---

## Keyboard Shortcuts

### Global

| Shortcut     | Action                                                     |
|--------------|------------------------------------------------------------|
| `Ctrl+C × 2` | Exit CODA (double-press within ~1500 ms)                  |
| `Ctrl+L`    | Clear the conversation                                      |
| `Ctrl+B`    | Toggle the sidebar                                          |

### In the chat input

| Shortcut   | Action                           |
|------------|----------------------------------|
| `Enter`    | Send your message                |
| `Ctrl+J`   | Insert a newline without sending |
| `↑` / `↓`  | Navigate input history           |
| `/`        | Open slash command palette       |
| `?`        | Open keyboard-shortcuts overlay  |

### During a turn

| Shortcut   | Action                                         |
|------------|------------------------------------------------|
| `Esc`      | Interrupt the current turn                     |
| `Ctrl+O`   | Toggle "thinking" visibility                   |
| `Ctrl+G`   | Clear any messages queued while agent is busy  |

### Transcript navigation

| Shortcut         | Action                              |
|------------------|-------------------------------------|
| `Ctrl+U`         | Scroll up in the transcript         |
| `Ctrl+D`         | Scroll down in the transcript       |
| `Ctrl+Shift+C`   | Copy last code block to clipboard   |
| `Esc Esc`         | Open timeline picker (double-press) |

### Model switching

| Shortcut      | Action                        |
|---------------|-------------------------------|
| `Shift+Tab`   | Cycle through favorite models |

Star models in `/switch-model` with `Space`, then `Shift+Tab` cycles through them.

---

## FAQ

### Getting started

- **Check version:** `coda --version`
- **Windows "not recognized" error:** Close and reopen terminal after installing.
- **Add/change provider:** `coda --reconfigure` (terminal) or `/providers` (in-session; restart required).
- **Setup wizard appears automatically:** Normal on first launch if no provider configured.
- **Get help inside CODA:** `/help`, press `?`, or ask in plain language (auto-delegates to `coda-help` agent).

### Working with sessions

- **Resume:** `coda --lastsession` or `coda --session-id <id>` or `/sessions` inside TUI.
- **Context percentage:** Shows how full the context is. At ~100%, CODA auto-compacts.
- **"Forgotten" context:** Automatic compaction condensed older messages. Disable in `/settings` → Context Compaction.

### Making changes

- **Undo:** `/timeline` or `/rewind` or `Esc Esc` — pick checkpoint to restore.
- **Less approval prompts:** Raise bash level in `/settings` → Bash Tool Preferences.
- **AGENTS.md:** Optional project-root file with conventions. Generate with `/init`, commit to share.

### Extensions and tools

- **Connect MCP server:** `/mcp` manager — paste JSON or import.
- **Create a skill:** `.md` file with YAML frontmatter in `/.coda/skills/` or `~/.coda/skills/`.
- **Create an extension:** `/create-extension` or ask CODA in plain language.
- **Agents vs. workflows:** Agent = one delegated task. Workflow = orchestrates many agents (parallel/pipelines/loops).

---

## Glossary

| Term           | Definition                                                                         |
|----------------|------------------------------------------------------------------------------------|
| AGENTS.md      | Project-root Markdown file with conventions CODA reads every session               |
| Agent          | Markdown-defined profile for delegating subtasks to parallel child sessions        |
| Batch mode     | Headless, non-interactive mode (`coda -p "prompt"`)                                |
| Checkpoint     | File snapshot before each turn; restored via `/timeline`                           |
| CLI            | The `coda` command-line tool (interactive TUI + headless modes)                    |
| coda-help      | Built-in agent answering questions about CODA itself                               |
| Compaction     | Automatic condensing of older conversation history                                 |
| Extension      | TypeScript module registering custom tools, slash commands, or hooks               |
| Glob.AI OS     | Globant's internal AI gateway — primary provider for CODA at Globant              |
| MCP            | Model Context Protocol — standard for connecting AI to external tools              |
| MEMORY.md      | Durable agent notes across sessions (survives checkpoint rollbacks)                |
| Plugin         | Versioned, installable package bundling skills, agents, extensions, MCP servers    |
| Provider       | AI backend CODA sends prompts to (Glob.AI OS, Ollama, OpenAI-compatible, etc.)    |
| Session        | Persistent CODA conversation, stored on disk, resumable                            |
| Skill          | Markdown file encoding a repeatable workflow; auto-matched or `/skill-name`        |
| TUI            | Terminal User Interface — full-screen interactive interface                        |
| Workflow       | Deterministic script orchestrating multiple agents (fan-out, pipelines, loops)     |

---

## Release History

### CODA v1.0.0 — July 14, 2026

A complete, ground-up rebuild of the Coding Agent.

**Getting started:**

- Easy Install: single command, no Python/manual setup
- OAuth Login: browser-based sign-in with Globant credentials, auto-refreshed tokens

**Ways to run:**

- Interactive Terminal UI: full-screen, explores codebase, edits files, runs commands
- Headless / Batch Mode: non-interactive for scripts/CI/CD
- Editor Integration (ACP): Zed and JetBrains IDEs with native diffs and terminal

**Core capabilities:**

- Access all frontier models (Anthropic, OpenAI, Azure, Google, Vertex, Groq, OpenRouter, local)
- Provider Profiles with `/switch-profile`
- Clipboard Image Paste
- Model Quality Tiers (fast/smart/deep)
- Effort Control for reasoning
- Checkpoints with auto-snapshots and timeline rollback
- Parallel Sub-agents
- Workflows for multi-agent orchestration
- Message Queuing while CODA is working

**Extend & Customize:**

- Extensions, Plugins & Marketplace (Claude Code ecosystem compatible)
- Lifecycle Hooks (shell + HTTP, Claude Code compatible)
- MCP Servers
- Skills (Markdown-defined task templates)
- Memory (global + project-specific)

**Under the hood:**

- Turbo Search powered by ripgrep and fast-grep

---

## Tips and Patterns

### Effective prompting

- Be specific: "How does the OAuth refresh token flow work?" > "How does auth work?"
- Ask follow-ups — CODA builds context as the session progresses
- Don't let it make changes during exploration: "just explain for now, don't change anything"

### Safe workflow for bigger changes

1. **Explore first, change later.** "List the files you'd need to change for X, but don't make any edits yet."
2. **Work in small steps.** "Add the model", then "add the controller", then "add the tests."
3. **Review after each step.** Use `/timeline` to verify changes.
4. **Test often.** "Run the tests for the billing module now."

### Team collaboration

- Commit `AGENTS.md` to Git so every developer gets consistent conventions
- Commit skills in `/.coda/skills/` for shared workflows
- Commit MCP servers in `/.coda/mcp.json`
- Commit project-level `/.coda/config.json` (never holds secrets)
- Don't commit: active provider, elevated bash approval level (those are personal choices)

### Working in a monorepo

CODA loads exactly one AGENTS.md — the one where you launch it. No upward directory walk.

```bash
cd packages/billing
coda    # loads packages/billing/AGENTS.md
```

### Batch mode in CI

```bash
#!/bin/bash
coda -p "Run the test suite and report any failures" \
  --auto-approve all \
  --output json \
  --timeout 600000
EXIT=$?
if [ $EXIT -ne 0 ]; then
  echo "CODA run failed with exit code $EXIT"
  exit $EXIT
fi
```

### View and share logs

```bash
coda logs                    # interactive viewer
coda logs --follow           # tail live
coda logs --level error      # filter by level
coda logs --service core.agent  # filter by service
coda logs --since 30m        # recent only
coda logs export             # redacted bundle for support
coda logs-demo               # self-test pipeline
```

Logs stored in `~/.coda/logs/`, rotate daily and at 50 MB, keep 7 most recent files.
Secrets are always scrubbed before hitting disk.

### Log viewer keyboard shortcuts

| Key             | Action                          |
|-----------------|---------------------------------|
| `↑`/`↓` or `j`/`k` | Move selection              |
| `PageUp`/`PageDown` | Jump by page               |
| `g` / `G`      | Jump to oldest / newest         |
| `Space`/`Enter` | Expand selected entry          |
| `c` or `Ctrl+C` | Copy selected entry's JSON     |
| `q` / `Esc`    | Quit                            |

### Per-service log levels

```bash
LOG_LEVEL=info,core.agent.step:debug,core.tools:warn coda
```

---

*Document compiled from G-Coda documentation site on 2026-08-06.*
