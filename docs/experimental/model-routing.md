# Model routing

> 🧪 **Status:** Experimental
> **Since:** v0.4.238 (Koda)

Assigns optimal LLM models per agent based on task complexity — stronger models for deep reasoning, faster models for simple execution.

## Quick start

### Per-agent model (in agent JSON)

```json
{
  "name": "code_review_agent",
  "model": "claude-opus-4.6",
  "description": "Reviews code for security, quality, and performance"
}
```

### CLI override

```bash
koda chat --model claude-opus-4.6
koda chat --agent planner_agent --model claude-sonnet-4
```

### Settings default

```bash
koda config set model claude-sonnet-4.6
koda config get model
```

## Resolution order

Model selection follows a priority chain — first match wins:

```text
1. CLI flag (--model)         → Explicit user override
2. Agent JSON "model" field   → Agent author's recommendation
3. Settings DefaultModel      → User's global preference
4. "auto"                     → kiro-cli picks per task internally
```

## Available models

| Model               | Credits | Best for                                              |
|---------------------|:-------:|-------------------------------------------------------|
| `claude-opus-4.6`   |  2.20x  | Code review, architecture, complex planning           |
| `claude-sonnet-4.6` |  1.30x  | General development, orchestration, multi-step coding |
| `claude-sonnet-4`   |  1.30x  | Everyday coding, tool execution                       |
| `claude-haiku-4.5`  |  0.40x  | Q&A, simple lookups, read-only agents                 |
| `auto`             |  1.00x  | kiro-cli routes per task (default)                    |

## Recommended model assignments

| Agent                  | Model               | Reasoning                                        |
|------------------------|---------------------|--------------------------------------------------|
| `code_review_agent`    | `claude-opus-4.6`   | Needs deep reasoning for nuanced review          |
| `planner_agent`        | `claude-opus-4.6`   | Complex multi-step decomposition                 |
| `architecture_agent`   | `claude-opus-4.6`   | System design requires broad reasoning           |
| `orchestrator`         | `claude-sonnet-4.6` | Routing decisions, not deep analysis             |
| `devops_runner_agent`  | `claude-sonnet-4`   | Executes commands, follows patterns              |
| `steery_agent`         | `claude-haiku-4.5`  | Read-only Q&A from knowledge base                |
| All others             | *(omitted)*         | Defers to `auto` routing                         |

## How it works

### koda chat path

1. User runs `koda chat --agent code_review_agent`
2. Koda reads `code_review_agent.json` → finds `"model": "claude-opus-4.6"`
3. Koda passes `--model claude-opus-4.6` to kiro-cli
4. kiro-cli uses Opus for the entire session

### Team workers path

1. Team spec defines `"model": "claude-opus-4.6"` per worker
2. Koda spawns ACP client with `--model claude-opus-4.6`
3. Each worker runs on its assigned model independently

### Cursor path

Cursor manages its own model selection via the IDE model picker. The `"model"` field in agent JSON is ignored during `.cursor/agents/` generation — no breaking change.

## Agent JSON schema

```json
{
  "name": "agent_name",
  "model": "claude-opus-4.6",
  "description": "...",
  "prompt": "...",
  "tools": [...]
}
```

The `"model"` field is optional. Valid values:

- Empty/omitted → defers to resolution chain
- `"auto"` → explicit opt-in to kiro-cli's task-based routing
- `"claude-opus-4.6"` → force a specific model

## Cross-runtime compatibility

| Runtime    | Reads model? | Behavior                             |
|------------|:------------:|--------------------------------------|
| kiro-cli   |      ✅      | Passes `--model` at spawn time       |
| Cursor     |      ❌      | Ignored — uses IDE model picker      |
| Team       |      ✅      | Per-worker model via `WorkerSpec`    |
| ACP        |      ✅      | `--model` flag on `kiro-cli acp`    |

## Cost considerations

Using Opus for all agents would cost ~2.2x more credits. The routing strategy balances quality with cost:

- **Opus (2.2x):** Reserve for agents where reasoning quality directly impacts output (review, planning, architecture)
- **Sonnet (1.3x):** Default tier for most development work
- **Haiku (0.4x):** Use for simple, read-only, or high-frequency agents

A typical session with routing enabled costs ~30% less than running Opus everywhere, while maintaining quality where it matters.

## Limitations

- Unknown model names trigger a warning at chat time but are still passed through — kiro-cli will reject invalid values
- No per-phase model switching within a single session (entire session uses one model)
- `auto` mode behavior is controlled by kiro-cli internally and may change between versions
