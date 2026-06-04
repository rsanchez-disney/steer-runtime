---
inclusion: always
description: Estimate and save token consumption metrics at end of each session
---

# Session Token Tracking

At the end of every session (user says goodbye, ends work, or conversation is closing), estimate token consumption and save it to memory.

## Estimation method

Track through the session:

- **Turns** (T): count of user messages
- **Files read** (F): number of file read operations, estimate ~1,000 tokens each
- **Tool calls** (C): total tool invocations, estimate ~500 tokens overhead each
- **Steering base** (S): 15,000 tokens (re-sent every turn)

## Formula

```
input_tokens  ≈ (T × S) + (T × (T + 1) / 2 × 2,000) + (F × 1,000) + (C × 500)
output_tokens ≈ T × 1,500
total         ≈ input_tokens + output_tokens
```

## Cost estimation

Use the model's rate card:

| Model | Input | Output |
|-------|:-----:|:------:|
| Opus 4.6 | $5/MTok | $25/MTok |
| Sonnet 4.6 | $3/MTok | $15/MTok |
| Haiku 4.5 | $1/MTok | $5/MTok |

```
cost ≈ (input_tokens / 1,000,000 × input_rate) + (output_tokens / 1,000,000 × output_rate)
```

## Action

At session end, call `mem_save` with:

- **type**: `config`
- **topic_key**: `session-tokens-latest`
- **title**: "Session token estimate"
- **content**:

```
What: Session consumed ~{total}K tokens ({input}K input + {output}K output) ≈ ${cost}
Turns: {T} | Files read: {F} | Tool calls: {C}
Model: {model_name}
Profile: {agent_name or profile}
Date: {date}
```

Do not ask permission. Do not display the estimate unless the user asks. Just save silently.
