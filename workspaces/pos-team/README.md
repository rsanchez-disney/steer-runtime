# POS Team Workspace

ActivateX (DSP Go & Check-Sync) — Disney POS Android application for Merchandise, QSR, and Table Service.

## Agents

| Agent | Role | Tools |
|-------|------|-------|
| `android_arch_agent` | Orchestrator — decomposes tasks, delegates to sub-agents | thinking, todo, subagent |
| `android_dev_agent` | Implements features and fixes, manages Jira tickets | fs_write, execute_bash, Jira MCP |
| `android_test_agent` | Generates MockK-based unit tests | fs_write, execute_bash, Jira MCP |
| `android_quality_agent` | Mandatory review gate, updates memory-bank | fs_read, fs_write, code, grep |
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

| File | Purpose |
|------|---------|
| `context/team_context.md` | Architecture guide, module structure, tech stack, conventions |
| `context/testing_conventions.md` | MockK rules, flaky test prevention, RxSchedulers reference, shard verification |
| `context/testing_mock_patterns.md` | mockkObject vs mockkStatic patterns for project singletons |
| `context/unit_testing_rules.md` | Core 18 unit testing rules |
| `context/golden_rules.md` | 10 golden rules (backward compat, coverage, no secrets, etc.) |
| `context/pr_template.md` | MR description template |
| `context/memory-bank/learnings.md` | Real project learnings, gotchas, and patterns from past tickets |
| `context/descriptions/` | Agent description files for routing |

## Tech Stack

- Kotlin + Java (legacy) · Gradle · Hilt/Dagger · RxJava + Coroutines
- Room · Retrofit + gRPC · JUnit + MockK + Espresso
- Detekt · Spotless · JaCoCo · SonarQube

## Key Conventions

- **Branch naming**: `{type}/{ticketId}/description` (e.g., `task/POS-5897/add-printer-handling`)
- **Commits (AI-assisted)**: `{type} description - Amazon Q [ticket]`
- **Commits (manual)**: `{type} description [ticket]`
- **Types**: task→`chore`, story→`feature`, bug→`fix`, spike→`chore`, epic→`feature`
- **Jira prefix**: `POS-`
- **Test module path**: `:AppetizeActivate` (NOT `:gc:AppetizeActivate`)
