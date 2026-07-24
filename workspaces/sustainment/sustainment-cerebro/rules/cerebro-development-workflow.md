# Cerebro development workflow

Mandatory flow for all code tasks in Cerebro repositories.

## Flow

```text
Plan → 🚦 Gate 1 → Implement → Local QA → Unit Tests → Lint → Commit → PR
```

## Phases

### 1. Plan

- Read the Jira ticket (if provided)
- Read `.kiro/specs/<feature>.md` for the affected feature
- Produce an implementation plan:
  - Files to modify (use the file manifest from the spec)
  - Approach and rationale
  - Risks or open questions
- If multiple approaches are viable, present options with trade-offs
- Plan may be created by the developer, by the agent, or collaboratively

### 2. 🚦 Gate 1 — Plan approval

- Present the plan to the user
- **Do NOT proceed until the user explicitly approves**
- If the user requests changes, revise and re-present

### 3. Implement

- Execute the approved plan
- **Only modify files listed in the plan** — do not expand scope without approval
- Route to appropriate agent by stack:
  - Angular (profile-rac, profile-spa) → `ui` agent
  - Node (profile-webapi) → `webapi` agent
- If the implementation reveals the plan was incomplete, stop and propose amendments
- Update `.kiro/specs/<feature>.md` if behavior changed (same branch, same PR)

### 4. Local QA (user-driven)

- The user tests the changes end-to-end in their local environment
- The agent does NOT run e2e tests — the user validates functionality manually
- If the user reports a failure:
  - Analyze the failure
  - Revise the plan
  - Re-implement (repeat from step 3)
  - Continue the cycle until the user confirms it works locally

### 5. Unit tests

After the user confirms local QA passes:

- Write unit tests for the changed functionality
- Tests must validate **functional behavior**, not chase coverage numbers
- Keep tests concise — there is a file size limit on test cases
- Write only the tests necessary to prove the feature works correctly
- Test the feature/service/directive behavior, not internal implementation details
- Run the tests: `npm test` (or the repo's test command)
- If tests fail, fix and re-run until green

### 6. Lint

- Run the linter: `npm run lint` (or the repo's lint command)
- Fix any lint errors
- Do not disable lint rules — fix the code to comply
- Some lint rules are global across all Cerebro repos

### 7. Commit

- Only commit when lint and tests pass
- Follow the team's commit convention (to be specified by the user)
- Stage only the files related to this task
- Never commit unrelated changes
- Never push directly to main/master/develop

### 8. PR

- Create a pull request targeting `develop` (or the repo's default branch)
- PR description includes: summary, what changed, what was tested, ticket link
- If specs were updated, mention it in the PR description

## Rules

- Gates are mandatory — never skip them
- Never commit without explicit user approval
- One ticket per flow — do not batch unrelated changes
- If the ticket is ambiguous, ask clarifying questions BEFORE planning
- Only modify files in the approved plan scope
- The user does local QA — the agent does not assume changes work
- Unit tests prove functionality, not coverage percentage
- Authority order: code > spec > steering
- Spec updates go in the same PR as the code change
