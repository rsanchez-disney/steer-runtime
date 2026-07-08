---
name: implement-backoffice-ticket
description: Full SDLC workflow for POS Backoffice tickets — Jira story through PHP/Go/React implementation to PR
agents: [pos_architecture_agent, pos_story_analyzer_agent, pos_codebase_explorer_agent, pos_planner_agent, pos_php_agent, pos_go_agent, pos_react_agent, pos_test_runner_agent, pos_code_review_agent, pos_security_scanner_agent, pos_work_documenter_agent]
---

# Implement Backoffice Ticket

End-to-end development workflow for POS Backoffice tickets spanning PHP (Connect monolith), Go microservices, and React frontend.

## Prerequisites

- Jira MCP configured (POS-* tickets accessible)
- Git repository with clean working tree
- Access to the target repo (connect, connect-frontend, or Go microservice)

## Workflow

### Step 1: Fetch & Analyze Ticket

1. Ask user for the ticket ID if not provided (e.g., `POS-19542`)
2. Fetch ticket via Jira MCP: summary, description, acceptance criteria, components, labels
3. Determine target technology:
   - Component `Items`, `Configuration`, `Reporting`, `API` → PHP (Connect monolith)
   - Component `Frontend`, `UI` → React (connect-frontend)
   - Component `gRPC`, `Microservice`, labels like `go-service` → Go microservice
4. Extract acceptance criteria and testable requirements

**Agent:** `pos_story_analyzer_agent`

### Step 2: Explore Codebase

1. Navigate to the target repository
2. Identify relevant files, modules, and existing patterns
3. Map dependencies (gRPC protos, shared libraries, database schemas)
4. Note integration points with other services

**Agent:** `pos_codebase_explorer_agent`

### Step 3: Architecture Review

For changes that span services or introduce new patterns:
1. Evaluate if change belongs in monolith vs microservice
2. Check for backward compatibility with ActivateX (mobile client)
3. Assess gRPC contract changes
4. Verify feature flag requirements (Unleash)

**Agent:** `pos_architecture_agent` (direct mode)

### Step 4: Generate Implementation Plan

1. Break ticket into ordered sub-tasks
2. Assign each to the correct language specialist
3. Identify test strategy per component
4. Estimate complexity (High/Standard)

**Agent:** `pos_planner_agent`

**⏸ GATE 1 — User reviews and approves the plan before proceeding**

### Step 5: Create Branch

```bash
git fetch origin
git checkout -b POS-XXXXX-short-description origin/main
```

Branch naming: `POS-XXXXX-short-description` (flat, no type prefix)
- Example: `POS-19542-external-system-reset`
- NO `fix/`, `feat/`, or `chore/` prefixes — backoffice uses flat branch names

### Step 6: Implement

Route to the appropriate language agent based on Step 1 detection:

**PHP (Connect monolith):**
- Follow CodeIgniter 2/3 patterns
- Models in `ci/application/connect/models/`
- Controllers in `ci/application/connect/controllers/`
- API routes in `ci/application/api-v5/`
- Use `appetize_lib/` for shared utilities

**Go (Microservices):**
- Entry in `cmd/`, business logic in `internal/`
- gRPC proto definitions in `proto/`
- Repository pattern for data access
- Structured logging, proper error wrapping

**React (Frontend):**
- Components follow existing Redux/RTK patterns
- MUI 5 for UI components
- TypeScript strict mode
- API calls via existing service layer

**Agent:** `pos_php_agent` | `pos_go_agent` | `pos_react_agent`

### Step 7: Run Tests

1. **PHP:** PHPUnit tests run in k8s pod (`kubectl exec`)
2. **Go:** `go test ./...` with race detector
3. **React:** `yarn test --coverage`
4. Target ≥90% coverage on new code
5. Ensure existing tests still pass

**Agent:** `pos_test_runner_agent`

### Step 8: Code Review + Security Scan

1. Review code for quality, patterns, and correctness
2. Check for secrets, SQL injection, XSS, auth bypasses
3. Validate gRPC contract backward compatibility
4. Verify no direct DB access across service boundaries

**Agent:** `pos_code_review_agent` + `pos_security_scanner_agent`

**⏸ GATE 2 — User reviews results before documentation**

### Step 9: Document & Ship

1. Generate conventional commit message
2. Create PR description with:
   - Summary of changes
   - Acceptance criteria mapped to code changes
   - Test coverage report
   - Breaking changes (if any)
3. Push branch and create MR/PR

**Agent:** `pos_work_documenter_agent`

## Important Rules

- **Backward compatibility is mandatory** for API changes (ActivateX clients)
- **Feature flags required** for new user-facing features
- **No shared DB access** between services
- **gRPC proto changes** must be additive (no field removal/renaming)
- **Never proceed past a gate** without explicit user approval
- **Minimal diff** — change only what the ticket requires
