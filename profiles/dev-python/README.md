# Dev Python Profile

**Python specialist for FastAPI, Flask, Django, and general Python development**

Requires `dev-core` as a base.

## Agents (1)

### python
Python development specialist for API services, data pipelines, and CLI tools.

**Use when:**
- FastAPI / Flask / Django development
- Python API endpoints and services
- pytest test suites
- Async Python patterns

---

## Capabilities

- ✅ **Context7** — Up-to-date library documentation
- ✅ **Code Tools** — Read/write Python code
- ✅ **Execution** — Run pytest, linters, formatters
- ✅ **File Operations** — Manage project files

---

## Quick Start

```bash
koda install dev-core dev-python

kiro-cli chat --agent python
> "Create a FastAPI endpoint for user registration with Pydantic validation and pytest tests"
```

---

## Structure

```
.kiro-dev-python/
├── agents/       # 1 agent JSON config
│   └── python.json
├── prompts/      # Agent prompt
│   └── python.md
├── context/      # Python guidelines
│   └── python_guidelines.md
└── skills/       # 2 skills
    ├── api-endpoint-implementation.md
    └── python-testing-patterns.md
```

---

## Install

```bash
koda install dev-core dev-python       # Python developer
koda install dev                       # All dev (if alias updated)
```

---

**Profile Version:** 1.0
**Agents:** 1
**Last Updated:** April 3, 2026
