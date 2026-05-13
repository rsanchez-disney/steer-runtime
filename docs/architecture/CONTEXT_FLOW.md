# How it works — context flow

This page explains how steer-runtime provides context to the LLM and how each piece of the folder architecture contributes to agent behavior.

---

## The key insight

The LLM is **stateless**. It has no memory, no tools, and no awareness of steer-runtime. Every bit of specialization it exhibits comes from the context the IDE runtime injects before each request.

```text
steer-runtime (source) → Koda (installer) → ~/.kiro/ (installed) → IDE Runtime → LLM
```

---

## Folder structure

```text
~/.kiro/
├── agents/             # WHO can do what (JSON configs)
├── prompts/            # HOW to behave (markdown system prompts)
├── context/            # WHAT to know (shared organizational knowledge)
│   ├── _dynamic/       # Generated at runtime by hooks
│   └── _index.json     # TF-IDF index for smart context retrieval
├── steering/           # RULES to follow (behavioral rules by file type)
├── skills/             # HOW to do specific tasks (reusable patterns)
├── hooks/              # WHAT NOT to do (guardrails the LLM cannot override)
├── powers/             # Custom JS tool extensions
├── rules/              # Workspace/team rules (merged from workspace config)
├── tools/mcp-servers/  # External system integrations (Jira, GitHub, etc.)
├── settings/           # MCP config, tokens, workspace selection
│   ├── profiles.json   # Installed profiles and their agent lists
│   ├── workspace.json  # Active workspace configuration
│   ├── mcp.json        # MCP server connections (generated from tokens)
│   └── cli.json        # Kiro CLI preferences
├── extensions/         # IDE-specific extensions
├── sessions/           # Session state files
├── logs/               # Agent execution logs
├── steer-runtime/      # Local clone of the repo (for koda sync)
├── tokens.env          # Encrypted PATs for MCP servers (gitignored)
└── .env                # Environment variables
```

---

## How each piece provides context

### 1. Agents (`agents/*.json`)

Define **what** an agent is and **what tools** it can use. This is the configuration layer.

```json
{
  "name": "orchestrator",
  "prompt": "orchestrator.md",
  "tools": ["subagent", "grep", "fs_read", "thinking"],
  "resources": [
    "file://.kiro/context/golden_rules.md",
    "file://.kiro/steering/**/*.md"
  ],
  "allowedTools": ["@jira/*", "@github/*"],
  "hooks": { "agentSpawn": [], "preToolUse": [] }
}
```

**Context contribution**: Tells the runtime which prompt, tools, MCP servers, and context files to load for this agent.

### 2. Prompts (`prompts/*.md`)

The **system prompt** — the agent's identity, workflow, and behavioral instructions. This is the most direct context injection.

- Defines the agent's role and personality
- Specifies workflow steps (e.g., "Analyze → Plan → Implement")
- Sets output format expectations
- Lists rules and constraints

**Context contribution**: Injected as the system prompt at the start of every conversation. This is what makes a `code_review_agent` behave differently from a `planner_agent`.

### 3. Steering files (`steering/*.md`)

**Behavioral rules** that apply across agents. Numbered for load ordering.

```text
steering/
├── 00-foundation.md              # Cross-platform tool usage, vocab
├── 06-markdown-formatting.md     # Markdown output rules
├── 10-product-config-studio.md   # Product context
├── 20-repo-ui-angular.md         # Angular conventions (*.ts, *.html only)
├── 20-repo-backend-java.md       # Java conventions (*.java only)
├── 30-quality-and-tests.md       # Test standards
├── 40-security-and-secrets.md    # Security rules
└── 60-mobile-coordination.md     # Mobile patterns
```

**Context contribution**: Appended to the system prompt based on file-match patterns. For example, `20-repo-ui-angular.md` only activates when working with `*.ts`, `*.html`, `*.scss` files. This gives the model stack-specific knowledge without bloating every conversation.

The `inclusion` frontmatter controls when a file is injected:

| Value       | Behavior                                              |
|-------------|-------------------------------------------------------|
| `always`    | Every single turn                                     |
| `fileMatch` | Only when files matching a glob are in scope          |
| `auto`      | Hook-controlled (e.g., only if a session file exists) |

### 4. Context files (`context/*.md`)

**Shared organizational knowledge** — domain glossary, team standards, API conventions, project mappings.

```text
context/
├── golden_rules.md          # 10 rules enforced at approval gates
├── domain_glossary.md       # Team-specific terminology
├── project_mappings.md      # Repo → team → Jira prefix mapping
├── sdlc-workflow.md         # 5-phase workflow
├── mcp_priority.md          # Which MCP server to use when
├── orchestrator_rules.md    # Delegation mandate
└── _dynamic/                # Runtime-generated (delegation map, registry)
```

**Context contribution**: Loaded via the `resources` field in agent JSON or via hooks at spawn time. These give the model persistent knowledge about your team, projects, and conventions without repeating it every message.

### 5. Skills (`skills/*.md`)

**Reusable workflow patterns** — step-by-step recipes for common tasks.

```text
skills/
├── implement-ticket.md       # Jira story → branch → implement → tests → PR
├── ship-it.md                # Commit → push → PR → merge flow
├── generate-plan.md          # Break down a task into steps
├── fix-failing-test.md       # Diagnose and fix a failing test
└── review-changed-code.md    # Review staged changes against base branch
```

**Context contribution**: Loaded when the agent encounters a task matching the skill's domain. They provide concrete implementation patterns. Think of them as mini-playbooks. Skills are invoked explicitly (`kiro-cli chat --prompt common/skills/implement-ticket.md`) or triggered by an orchestrator.

### 6. Hooks (`hooks/*.sh`)

**Guardrails** that constrain agent actions independently of the LLM. The LLM cannot override them.

| Hook                   | Purpose                                            |
|------------------------|----------------------------------------------------|
| `git-context.sh`       | Injects current branch and dirty status            |
| `agent-registry.sh`    | Injects workspace, team, installed agents count    |
| `delegation-map.sh`    | Generates agent→profile routing table              |
| `guard-writes.sh`      | Blocks writes to `node_modules/`, `dist/`, `.git/` |
| `secret-scan.sh`       | Scans for hardcoded secrets before writing         |
| `branch-guard.sh`      | Blocks direct commits to `main`/`master`           |
| `warn-destructive.sh`  | Warns on `rm -rf`, `DROP TABLE`, `--force`         |
| `lint-on-write.sh`     | Auto-runs linter after file writes                 |

**Context contribution**: Some hooks inject context (git-context, delegation-map). Others **enforce constraints** via exit codes. Exit 0 = allow, exit 2 = block. The LLM sees the rejection message but cannot bypass it.

### 7. Powers (`powers/*/`)

**Custom tool extensions** — lightweight JavaScript modules that add capabilities beyond built-in tools.

**Context contribution**: Powers add tools the agent can call. They run in-process (not as separate servers like MCP).

### 8. MCP servers (`tools/mcp-servers/`)

**External system integrations** — Jira, GitHub, Confluence, Splunk, ServiceNow, etc.

**Context contribution**: MCP servers expose external data as tool calls. When an agent calls `@jira/get_issue`, the MCP server translates that to a Jira REST API call and returns the result as context for the LLM.

---

## How steer-runtime compiles into `~/.kiro/`

Running `koda install <profile>` or `koda sync` performs:

```text
steer-runtime repo                          ~/.kiro/ (runtime)
─────────────────                           ─────────────────

profiles/dev-core/agents/*.json  ──compile──→  agents/
profiles/dev-core/prompts/*.md   ──compile──→  prompts/
profiles/dev-core/steering/*.md  ──compile──→  steering/
shared/context/*.md              ──compile──→  context/
shared/hooks/*.sh                ──compile──→  hooks/
common/skills/*.md               ──compile──→  skills/
common/rules/*.md                ──compile──→  rules/
workspaces/*/context/*.md        ──merge────→  context/ (workspace-specific)
workspaces/*/rules/*.md          ──merge────→  rules/
```

The compilation step:

1. Reads the profile's `agents/`, `prompts/`, `steering/`, `context/` directories
2. Merges with `shared/` and `common/` layers
3. Applies workspace overrides if a workspace is active
4. Writes the final compiled output to `~/.kiro/`
5. Rebuilds the TF-IDF index (`context/_index.json`) for smart retrieval

This means `~/.kiro/` is a **derived artifact** — you never edit it directly. All changes go through the steer-runtime repo and get compiled down.

---

## The assembly flow

When you type a message, here's what happens:

```text
1. IDE loads agent JSON       → determines tools, MCP servers, hooks
2. IDE reads prompt .md       → becomes the system prompt
3. IDE loads steering files   → appended based on file-match rules
4. IDE loads context files    → injected as additional context
5. IDE loads relevant skills  → available for task-specific guidance
6. Hooks run (agentSpawn)     → inject git branch, delegation map
7. Everything assembled       → sent to LLM as one big context window
8. LLM responds              → tool calls go through hooks before executing
```

### What the model actually sees

The model receives a **single assembled prompt** that combines all layers:

```text
┌─────────────────────────────────────────────┐
│  System prompt (from prompts/*.md)          │
├─────────────────────────────────────────────┤
│  Steering rules (from steering/*.md)        │
│  (only those matching current file types)   │
├─────────────────────────────────────────────┤
│  Context files (from context/*.md)          │
│  (loaded via resources or hooks)            │
├─────────────────────────────────────────────┤
│  Skill patterns (from skills/*.md)          │
│  (relevant to current task)                 │
├─────────────────────────────────────────────┤
│  Hook-injected context                      │
│  (git branch, delegation map, etc.)         │
├─────────────────────────────────────────────┤
│  Your message                               │
└─────────────────────────────────────────────┘
```

The separation into files is for **human maintainability** — different teams can own different context files, steering rules can be toggled per file type, and skills can be shared across agents.

### Token budget management

The agent schema supports a `contextBudget` field that allocates fractions of the context window:

```json
{
  "contextBudget": {
    "system_prompt": 0.15,
    "resources": 0.35,
    "hooks": 0.10,
    "conversation": 0.30,
    "tools": 0.10
  }
}
```

When the window fills up, lower-priority resources (marked `priority: "low"`) get dropped first. Resources marked `priority: "critical"` are never compacted.

---

## Resolution order at runtime

When Kiro CLI starts a session, it resolves context in this priority (highest wins):

```text
1. Workspace context/rules    (team-specific overrides)
2. Profile steering files     (role-specific behavior)
3. Shared context             (organization-wide standards)
4. Hook output                (dynamic, per-session)
```

---

## Example: full interaction

```text
Developer types: "Implement TEP3-1234"
         │
         ▼
    IDE Runtime (Kiro CLI)
         │  1. Loads orchestrator.json (tools: @jira, @github, subagent)
         │  2. Reads orchestrator.md (SDLC workflow, delegation rules)
         │  3. Loads golden_rules.md, sdlc-workflow.md (context)
         │  4. Starts Jira + GitHub MCP servers
         │  5. Assembles full prompt → sends to LLM
         │
         ▼
    LLM returns: "I'll fetch the Jira story"
         │  + tool call: @jira/get_issue { key: "TEP3-1234" }
         │
         ▼
    IDE routes to Jira MCP server → REST API → returns issue data
         │
         ▼
    LLM analyzes story, plans implementation
         │  returns: tool call: fs_write { path: "src/..." }
         │
         ▼
    Hooks (preToolUse):
         │  guard-writes.sh → path OK → exit 0 (allow)
         │  secret-scan.sh → no secrets → exit 0 (allow)
         │
         ▼
    File written to disk
         │
         ▼
    Hooks (postToolUse):
         │  lint-on-write.sh → auto-formats the file
         │
         ▼
    Continues until workflow completes...
```

---

## Key takeaways

1. **The LLM never touches external systems directly** — everything goes through the IDE runtime
2. **Hooks provide hard guarantees** — the only layer that cannot be overridden by the model
3. **Context is composable** — steering rules activate by file type, skills activate by task
4. **Agents are the atomic unit** — one JSON config + one prompt = one specialist
5. **The separation is for humans** — the model sees one big assembled context window
6. **`~/.kiro/` is derived** — never edit it directly, all changes flow from steer-runtime
