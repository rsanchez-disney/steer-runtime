# POS Team Workspace

ActivateX (DSP Go & Check-Sync) — Disney POS Android application for Merchandise, QSR, and Table Service.

## Agents

| Agent | Role | Tools |
|-------|------|-------|
| `android_arch_agent` | Orchestrator — decomposes tasks, delegates to sub-agents | thinking, todo, subagent |
| `android_dev_agent` | Implements features and fixes, manages Jira tickets | fs_write, execute_bash, Jira MCP |
| `android_test_agent` | Generates MockK-based unit tests | fs_write, execute_bash, Jira MCP |
| `android_quality_agent` | Mandatory review gate (read-only) | fs_read, code, grep |
| `android_pr_agent` | Generates MR description content | fs_read, fs_write, Jira MCP |

## Workflow

```
Architect → Dev → Test → Quality → (Fix loop) → PR → Deliver
```

The Architect is the single point of contact. It presents a spec for approval before delegating implementation to sub-agents in sequence.

## Quick Start

```bash
koda workspace apply pos-team
kiro-cli chat --agent android_arch_agent
```

## Context Files

- `context/team_context.md` — Architecture guide, module structure, tech stack, conventions
- `context/testing_conventions.md` — MockK rules, object/static mocking patterns, Gradle commands

## Tech Stack

- Kotlin + Java (legacy) · Gradle · Hilt/Dagger · RxJava + Coroutines
- Room · Retrofit + gRPC · JUnit + MockK + Espresso
- Detekt · Spotless · JaCoCo · SonarQube
