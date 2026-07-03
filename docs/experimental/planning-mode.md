# Planning Mode

> 🧪 **Status:** Experimental
> **Since:** v0.4.207 (Koda)

Explore changes, break down tasks, and produce implementation plans — without modifying any code.

## Quick start

```bash
koda plan "Add pagination to the /users API"
koda plan --ws app-payment-controls "Migrate auth from JWT to OAuth2"
koda plan --agent architecture_agent "Design the new event system"
```

## How it works

- Launches the `kiro_planner` agent (or specified agent) in read-only mode
- The agent can read files, search code, and access MCP tools
- Produces a structured plan with tasks, dependencies, and test strategy
- Does NOT write files, create branches, or make changes

## Output format

A typical plan includes:

```
## Implementation Plan: Add pagination to /users API

### Tasks
1. Add limit/offset params to UserRepository.findAll()
2. Update /users route handler to accept page/pageSize query params
3. Add pagination metadata to response envelope
4. Update existing tests with pagination scenarios
5. Add integration test for multi-page traversal

### Dependencies
- Task 3 depends on Task 1 (needs total count from repo)
- Task 4-5 can run in parallel after Task 1-3

### Test strategy
- Unit: repository returns correct slice
- Integration: API returns correct page metadata
- Edge: empty results, last page, page beyond total

### Routing
- Tasks 1-3: backend agent
- Tasks 4-5: test_runner agent
```

## When to use

- Before starting implementation (validate approach)
- When exploring unfamiliar codebases
- For architecture spikes and technical design
- To estimate complexity before committing to a ticket

## Flags

| Flag | Description |
|------|-------------|
| `--agent` | Agent to plan with (default: `kiro_planner`) |
| `--ws` | Workspace context (loads project knowledge) |

## Relationship to autopilot

In autopilot mode, the planning phase runs automatically and proceeds if the plan quality is sufficient. In planning mode, you get the plan and decide what to do with it — it's the "think before you act" companion to autopilot's "act autonomously."
