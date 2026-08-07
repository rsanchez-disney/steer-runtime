---
name: coda-stepwise-setup
description: Configure and use Globant's CODA AI agent + Stepwise workflow orchestration — installation, providers, registry, capabilities, skills, executors, and troubleshooting. Use when asked about coda setup, stepwise configuration, capabilities execution, or skill registry.
---

# Skill: CODA + Stepwise Setup

## When to use

- User asks to install or configure CODA or Stepwise
- User asks about Stepwise capabilities, playlists, or skill execution
- User asks about CODA providers (GEAI, OpenAI-compat, Ollama)
- User asks about skill registry sync or management
- User asks about executor configuration (coda, claude-code, kiro, cursor-agent)
- User asks about quality gates, refinement, or excursion mode
- User asks to troubleshoot CODA or Stepwise errors

## Quick reference

### CODA installation

```bash
curl -fsSL 'https://docs.globant.ai/en/filedownload?4622,12' | bash
coda --version
```

### Stepwise installation

Download installer from Google Drive, then:
```bash
bash install.sh          # macOS/Linux (Azure Device Code auth)
stepwise --version
stepwise doctor --fix    # Health check
stepwise registry sync   # Sync skill registry
```

### Run a capability

```bash
stepwise exec capability_code-development --param task="Implement auth module"
stepwise exec capability_software-architecture --param project_name="My Service"
stepwise playlist run <playlist-name>
```

### Koda integration

```bash
koda runtime                          # Add coda to runtimes
koda chat --ws <name> --target coda   # Materialize workspace + launch CODA
```

## Full reference

For complete documentation (859 lines covering architecture, installation, configuration, registry, capabilities, skills catalog, features, project structure, integrations, and troubleshooting), see: `references/coda-stepwise-full-reference.md`
