# Making steer-runtime agents visible in Kiro IDE

Kiro IDE does not read `~/.kiro/agents/*.json` directly — those are designed for `kiro-cli`.
Instead, Kiro IDE uses **steering files** and delegates to specialist agents via
`invokeSubAgent`. This guide covers the one-time setup and ongoing sync workflow.

---

## Quick setup

### Step 1: Install profiles via Koda

```bash
koda upgrade                          # Ensure latest Koda binary
koda install dev-core dev-mobile qa   # Pick the profiles your team needs
```

This places agent JSONs in `~/.kiro/agents/` and prompts in `~/.kiro/prompts/`.

### Step 2: Generate Kiro IDE steering files

```bash
koda kiro-ide install
```

This generates:

| Output                                   | Purpose                                                   |
|------------------------------------------|-----------------------------------------------------------|
| `~/.kiro/steering/70-agent-routing.md`   | Always-included routing table (agent registry for Kiro)   |
| `~/.kiro/steering/agent-{name}.md`       | Per-agent manual steering (load via `#agent-{name}`)      |
| `~/.kiro/skills/sync-agents-to-steering` | Skill to re-sync from inside Kiro IDE                     |
| `~/.kiro/hooks/*.kiro.hook`              | Guardrail hooks (write guards, secret scan, branch guard) |

### Step 3: Verify in Kiro IDE

Open any project in Kiro IDE and say:

> list my installed agents

Kiro reads the routing table and lists every available specialist.

---

## Keeping agents in sync

When you install or remove profiles, the steering files need to be regenerated.

### From the terminal

```bash
koda sync                   # Pull latest agents, prompts, MCP bundles
koda kiro-ide sync          # Regenerate steering files from updated profiles
```

Use `koda kiro-ide install` only for the first-time setup. Use `koda kiro-ide sync` for
subsequent updates — it refreshes existing steering and skill files without recreating hooks.

### From inside Kiro IDE

If you prefer to stay in the IDE:

> sync my agents

This runs the `sync-agents-to-steering` skill, which reads `~/.kiro/agents/*.json` and
regenerates the routing table and per-agent steering files.

---

## What gets generated

```text
~/.kiro/
├── steering/
│   ├── 70-agent-routing.md          # Always loaded — routing table with all agents
│   ├── agent-orchestrator.md        # Manual — full orchestrator prompt (#agent-orchestrator)
│   ├── agent-code_review_agent.md   # Manual — full code review prompt (#agent-code_review_agent)
│   └── ...                          # One per installed agent
├── skills/
│   └── sync-agents-to-steering.md   # Re-sync skill for in-IDE use
└── hooks/
    ├── guard-writes.kiro.hook       # Blocks writes to node_modules/, dist/, .git/
    ├── secret-scan.kiro.hook        # Scans for hardcoded secrets before writing
    ├── branch-guard.kiro.hook       # Blocks direct commits to main/master
    └── warn-destructive.kiro.hook   # Warns on rm -rf, DROP TABLE, --force
```

The routing file (`70-agent-routing.md`) is always included so Kiro IDE automatically knows
about every specialist. Per-agent files use `inclusion: manual` — load them explicitly with
`#agent-{name}` when you want the full agent prompt in your conversation context.

---

## How delegation works

When your request matches a specialist agent's domain, Kiro IDE:

1. Looks up the agent in the routing table (`70-agent-routing.md`)
2. Reads the agent's prompt from `~/.kiro/prompts/{agent}.md`
3. Delegates via `invokeSubAgent` with `name: "general-task-execution"`

For simple tasks, Kiro handles them directly — delegation adds overhead and is reserved for
tasks that benefit from the specialist's focused prompt and constraints.

For detailed walkthroughs across profiles, see [Agent Routing E2E Examples][e2e].

---

## Deep context mode

For complex tasks where you want the full agent prompt loaded into your conversation (not
delegated to an isolated sub-agent), reference the per-agent steering file directly:

> #agent-estimation_agent Estimate the effort for migrating auth from v2 to v3

This loads the estimation agent's full methodology (CCV + DRIFT) into your current context.
Useful when you want the agent's expertise applied within your conversation rather than in a
separate execution.

---

## Troubleshooting

| Problem                                      | Fix                                                                                       |
|----------------------------------------------|-------------------------------------------------------------------------------------------|
| "I said 'create a PR' but Kiro didn't route" | Check `~/.kiro/steering/70-agent-routing.md` exists. If not, run `koda kiro-ide install`. |
| Sub-agent can't access Jira or GitHub        | MCP servers are user-level. Run `koda mcp-install` to configure them.                     |
| Agent missing from routing table             | Run `koda kiro-ide sync` after installing new profiles.                                   |

---

## See also

- [Agent Routing E2E Examples][e2e] — detailed delegation walkthroughs
- [Koda CLI Reference][koda-ref] — all `koda` commands
- [Kiro CLI vs Kiro IDE][cli-vs-ui] — when to use each
- [MCP Setup][mcp-setup] — configuring MCP servers for tool access

<!-- Links -->
[cli-vs-ui]: KIRO_CLI_VS_UI.md
[e2e]: AGENT_ROUTING_E2E.md
[koda-ref]: ../reference/KODA_CLI_REFERENCE.md
[mcp-setup]: ../reference/MCP_SETUP.md
