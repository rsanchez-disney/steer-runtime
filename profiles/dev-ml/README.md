# Dev ML Profile

**ML engineering specialist for training, fine-tuning, data processing, inference, and evaluation using the Hugging Face ecosystem**

Requires `dev-core` as a base.

## Agents (1)

### ml_engineer
ML engineering specialist for autonomous research-driven ML implementation.

**Use when:**
- Model training and fine-tuning (SFT, DPO, GRPO, LoRA)
- Dataset inspection, processing, and validation
- ML inference and evaluation pipelines
- Hugging Face Hub operations (models, datasets, Spaces)

---

## Capabilities

- ✅ **Code Tools** — Read/write Python ML code
- ✅ **Execution** — Run training scripts, pytest, linters
- ✅ **File Operations** — Manage project files
- ✅ **Research** — Documentation lookup, paper analysis, example discovery

---

## Quick Start

```bash
koda install dev-core dev-ml

kiro-cli chat --agent ml_engineer
> "Fine-tune Llama-3.2-1B on ultrachat_200k using SFT with push to hub"
```

---

## Structure

```
profiles/dev-ml/
├── agents/       # 1 agent JSON config
│   └── ml_engineer.json
├── prompts/      # Agent prompt
│   └── ml_engineer.md
├── context/      # ML engineering guidelines
│   └── ml_engineering_guidelines.md
└── skills/       # 1 skill
    └── ml-training-workflow.md
```

---

## Install

```bash
koda install dev-core dev-ml       # ML engineer
```

---

**Profile Version:** 1.0
**Agents:** 1
**Last Updated:** May 2026
