# Dev AI Profile

**AI/ML engineering specialists covering the full lifecycle: data science, model training, LLM applications, and production MLOps.**

Requires `dev-core` as a base.

## Agents (5)

### ai_orchestrator
Routes and coordinates AI/ML tasks across specialist agents.

**Use when:** Multi-step AI workflows, architecture decisions, task routing.

### ml_engineer
ML engineering specialist for autonomous research-driven model training.

**Use when:** SFT/DPO/GRPO training, fine-tuning, model evaluation, HF Hub operations.

### data_scientist
Data science specialist for exploration, statistics, and classical ML.

**Use when:** EDA, statistical testing, feature engineering, visualization, scikit-learn/XGBoost.

### llm_engineer
LLM application specialist for building on top of language models.

**Use when:** RAG pipelines, prompt engineering, vector DBs, agent frameworks, LangChain/LlamaIndex.

### mlops_engineer
MLOps specialist for production ML infrastructure.

**Use when:** Model serving (vLLM, TGI), deployment pipelines, experiment tracking, drift monitoring.

---

## Quick Start

```bash
koda install dev-core dev-ai

kiro-cli chat --agent ai_orchestrator    # Route AI/ML tasks
kiro-cli chat --agent ml_engineer        # Model training
kiro-cli chat --agent data_scientist     # Data analysis
kiro-cli chat --agent llm_engineer       # LLM applications
kiro-cli chat --agent mlops_engineer     # ML deployment
```

---

## Structure

```
profiles/dev-ai/
├── agents/
│   ├── ai_orchestrator.json
│   ├── ml_engineer.json
│   ├── data_scientist.json
│   ├── llm_engineer.json
│   └── mlops_engineer.json
├── prompts/
│   ├── ai_orchestrator.md
│   ├── ml_engineer.md
│   ├── data_scientist.md
│   ├── llm_engineer.md
│   └── mlops_engineer.md
├── context/
│   └── ml_engineering_guidelines.md
└── skills/
    └── ml-training-workflow.md
```

---

## Install

```bash
koda install dev-core dev-ai       # Full AI/ML stack (5 agents)
```

---

**Profile Version:** 2.0
**Agents:** 5
**Last Updated:** May 2026
