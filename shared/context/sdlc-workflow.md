# SDLC workflow

5-phase workflow for Jira story implementation. Used by dev-core, steer-master, and qa orchestrators.

## Phases

```text
Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship
```

| Phase     | Agents                                                    | Output                    |
|-----------|-----------------------------------------------------------|---------------------------|
| Analyze   | story_analyzer → codebase_explorer → architecture (if complex) | Story context, code map   |
| Plan      | planner_agent                                             | Implementation plan       |
| Implement | Route each task to specialist (backend/ui/webapi/etc.)    | Code changes              |
| Quality   | test_runner → code_review → security_scanner              | Test results, review      |
| Ship      | pr_creator_agent                                          | Pull request              |

## Gates

- **Gate 1** (after Plan): present plan to user, wait for approval before implementing
- **Gate 2** (after Quality): present test results + review findings, wait for approval before PR

Never skip gates. If user says "autopilot" or "run all", execute phases sequentially but still pause at gates.

## Resource-aware strategy

Adapt delegation based on system tier (injected by agent-registry hook):

| Tier     | RAM    | Max concurrent | Strategy                                    |
|----------|--------|:--------------:|---------------------------------------------|
| light    | ≤16GB  |       2        | Sequential only — one agent at a time       |
| standard | ≤32GB  |       4        | Parallel OK for 2-3 agents, sequential 4+   |
| power    | >32GB  |       6        | Full parallel delegation                    |

## Implementation routing

Route implementation tasks by tech stack:

| Stack indicator                        | Agent    |
|----------------------------------------|----------|
| Angular, TypeScript UI, component      | `ui`     |
| Node, Restify, Express, gateway, BFF   | `webapi` |
| Java, Spring, DynamoDB, service        | `backend`|
| Flutter, Dart, mobile                  | `flutter`|
| Terraform, infrastructure, IaC         | `terraform` |
| Astro, SSR, React pages                | `astro`  |
| Python, Django, FastAPI                 | `python` |
