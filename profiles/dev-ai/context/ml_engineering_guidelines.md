# ML Engineering Guidelines

## Training Framework Selection

| Task | Recommended |
|------|------------|
| Supervised fine-tuning (SFT) | TRL SFTTrainer |
| Preference alignment (DPO/RLHF) | TRL DPOTrainer / PPOTrainer |
| Reward-guided optimization | TRL GRPOTrainer |
| Parameter-efficient fine-tuning | PEFT (LoRA, QLoRA) |
| Image generation fine-tuning | Diffusers training scripts |
| Embedding model training | Sentence Transformers |
| Model evaluation | LightEval, lm-evaluation-harness |

## Dataset Format Requirements

Training will fail if the dataset format doesn't match the training method:

| Method | Required Columns |
|--------|-----------------|
| SFT | `messages`, `text`, or `prompt`/`completion` |
| DPO | `prompt`, `chosen`, `rejected` |
| GRPO | `prompt` |

All chat/instruction datasets must be in conversational ChatML format for HF library compatibility.

**Always inspect datasets before use:**
- Check schema/columns, row counts per split, value distributions
- Verify conversational format structure (roles, content keys)
- Surface class imbalance, missing values, unexpected formats

## Training Best Practices

### Configuration Essentials
```python
training_args = SFTConfig(
    push_to_hub=True,              # MANDATORY — job storage is ephemeral
    hub_model_id="user/model-name", # MANDATORY
    report_to=["trackio"],          # Monitoring
    output_dir="./output",
    disable_tqdm=True,              # Clean log output
    logging_strategy="steps",
    logging_first_step=True,
    # ... task-specific params
)
```

### Batch/Ablation Jobs
1. Submit ONE job first
2. Check logs to confirm training starts successfully
3. Only then submit remaining jobs
4. Never submit all at once — if there's a bug, all fail

### Dependency Management
Always include all required packages:
```python
dependencies = [
    "transformers", "trl", "torch", "datasets",
    "trackio", "accelerate", "peft",  # as needed
]
```

## Environment & Secrets

- `HF_TOKEN` is automatically available in job environments
- Never expose or log tokens
- Use `pydantic-settings` for typed configuration
- Load from environment variables with `.env` fallback

## Async Patterns

Use `async def` for I/O-bound operations. Never mix sync blocking calls in async code.

```python
# ✅ GOOD — non-blocking
import httpx
async def fetch_model_info(model_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://huggingface.co/api/models/{model_id}")
        return response.json()
```

## Error Recovery

1. Read the full error message and logs
2. Do not retry the exact same thing — identify what needs to change
3. For API/import errors: check documentation for the correct API
4. For OOM: reduce batch size + increase gradient accumulation (keep effective batch size identical)
5. Never change the user's requested approach without explicit approval
6. Never silently substitute resources (datasets, models)
