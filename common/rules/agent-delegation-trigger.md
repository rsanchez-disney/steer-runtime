# Agent Delegation Trigger

The routing table (`70-agent-routing.md`) is not loaded by default to save ~6 KB of context
per prompt. This rule defines when to load it on demand.

## Trigger phrases

When the user's message contains any of these patterns (case-insensitive), load the routing
table and delegate. The `{name}` placeholder means any agent name or role:

- "use sub agent for …"
- "use subagent for …"
- "delegate to …"
- "delegate this to …"
- "hand off to …"
- "route to …"
- "use the {name} agent"
- "ask the {name} agent"
- "let the {name} agent"
- "switch to {name} agent"
- "have the {name} agent"
- "get the {name} agent to"

## When triggered

1. Read `~/.kiro/steering/70-agent-routing.md` using `readFile`
2. Use the agent registry to identify the correct specialist
3. Delegate via `invokeSubAgent` following the delegation template in that file

If `70-agent-routing.md` does not exist, tell the user to run `koda kiro-ide install` or
`koda kiro-ide sync` to generate it.

## When NOT triggered

Do NOT load the routing table on prompts that don't match these trigger phrases.

Note: when the orchestrator agent is active (via `kiro-cli chat --agent orchestrator` or
an orchestrator steering file), it has its own intent classification and delegates based on
task semantics — trigger phrases are not required in that context. This rule is for the
default Kiro IDE agent which does not have the routing table in context.
