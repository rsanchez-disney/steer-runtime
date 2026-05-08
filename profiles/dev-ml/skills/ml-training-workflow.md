# ML Training Workflow

## Skill: End-to-End Model Training

### When to Use
- Fine-tuning a model on a custom dataset
- Training from scratch on a specific task
- Running evaluation benchmarks

### Steps

1. **Research** — Find working examples and current documentation
   - Search for landmark papers in the domain
   - Find example training scripts (e.g., `trl/examples/scripts/sft.py`)
   - Read current trainer config docs (SFTConfig, DPOConfig, etc.)

2. **Validate Resources**
   - Confirm model exists and check architecture/size
   - Inspect dataset: verify columns, format, splits, sample rows
   - Select hardware based on model size

3. **Implement**
   - Base script on researched working examples
   - Include `push_to_hub=True` and `hub_model_id`
   - Add monitoring (Trackio/W&B)
   - Set appropriate timeout (2h+ for any training)

4. **Test**
   - Run with small subset first (1-2 steps)
   - Verify imports, data loading, and training loop work
   - Check logs for errors before scaling up

5. **Launch**
   - Submit job with correct hardware and timeout
   - Monitor initial logs to confirm training starts
   - Provide monitoring dashboard URL to user

### Common Patterns

```python
# SFT Training
from trl import SFTConfig, SFTTrainer
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained("model-id")
tokenizer = AutoTokenizer.from_pretrained("model-id")
dataset = load_dataset("dataset-id")

training_args = SFTConfig(
    output_dir="./output",
    push_to_hub=True,
    hub_model_id="user/model-name",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-5,
    logging_steps=10,
    save_steps=500,
    report_to=["trackio"],
    disable_tqdm=True,
    logging_strategy="steps",
    logging_first_step=True,
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    tokenizer=tokenizer,
)
trainer.train()
trainer.push_to_hub()
```
