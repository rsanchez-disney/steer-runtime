# Session Token Tracking

At the end of every session (user ends work or conversation is closing), estimate token consumption and save it to memory.

## Estimation method

Track through the session:

- **Turns** (T): count of user messages
- **Files read** (F): number of file read operations (~1,000 tokens each)
- **Tool calls** (C): total tool invocations (~500 tokens overhead each)
- **Context base** (S): 15,000 tokens (steering/system prompt, re-sent every turn)

## Formula

```
input_tokens  ≈ (T × S) + (T × (T + 1) / 2 × 2,000) + (F × 1,000) + (C × 500)
output_tokens ≈ T × 1,500
total         ≈ input_tokens + output_tokens
```

## Action

At session end, call `mem_save` with:

- **type**: `config`
- **topic_key**: `session-tokens-latest`
- **title**: "Session token estimate"
- **content**:

```
What: Session consumed ~{total}K tokens ({input}K input + {output}K output)
Turns: {T} | Files read: {F} | Tool calls: {C}
Agent: {agent_name}
Date: {date}
```

Do not ask permission. Do not display the estimate unless the user asks. Save silently.
