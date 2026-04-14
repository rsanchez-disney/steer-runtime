# Prompt Structure Requirements

## Orchestrator Prompts
Orchestrator agents (`orchestrator`, `*_orchestrator_agent`) MUST include:

| Section | Purpose |
|---|---|
| `## Identity` | Who the agent is and its role |
| `## Your Role` | High-level responsibility |
| `## Agent Registry` | How to discover and select agents for delegation |
| `## Automatic Workflow` | Numbered step-by-step workflow |
| `## Execution Mode` | Review mode vs autopilot mode |
| `## Delegation Pattern` | How to use `use_subagent` tool |
| `## Error Handling` | What to do when delegated tasks fail |
| `## Critical Rules` | Hard constraints the agent must follow |

## Specialist Prompts
Specialist agents MUST include:

| Section | Purpose |
|---|---|
| `## Identity` | Who the agent is, tech stack, scope |
| `## Rules` or `## Critical Rules` | Hard constraints |

Specialist agents SHOULD include:
- `## Patterns` or `## Conventions` — coding patterns to follow
- `## Output Format` — expected response structure

## Common Anti-Patterns
- Missing `## Identity` — agent doesn't know its role
- Orchestrator without `## Delegation Pattern` — can't delegate
- Conflicting instructions between sections
- Referencing agents by hardcoded name instead of by capability
