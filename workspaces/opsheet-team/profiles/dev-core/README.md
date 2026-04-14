# Dev Core Profile (OpSheet Go)

Go specialist for OpSheet+ core backend services — APIs, event processors, shared libraries, and monorepo services.

Requires `dev-core` (base) as a foundation.

## Agents (1)

| Agent | Purpose                                                    |
|-------|------------------------------------------------------------|
| godev | Go specialist for OpSheet+ core services (APIs, processors, libraries) |

## Structure

```
profiles/dev-core/
├── agents/       # godev.json
├── prompts/      # godev.md
├── steering/     # Go architecture, tech stack, code patterns, testing, PR review, git workflow
└── skills/       # go-api-endpoint, go-event-processor, go-shared-library, go-monorepo-service
```

## Install

```bash
./setup.sh install dev-core dev-core   # within opsheet-team workspace
```
