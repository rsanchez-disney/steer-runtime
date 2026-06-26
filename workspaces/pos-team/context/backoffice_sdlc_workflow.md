# Backoffice SDLC Workflow

7-stage workflow for Jira story implementation across POS platform projects (PHP, Go, React).

## Stages

```text
Analyze → Explore → Plan → 🚦 Gate 1 → Implement → Test → Review → 🚦 Gate 2 → Document
```

| Stage     | Purpose                                    | Output                              |
|-----------|--------------------------------------------|-------------------------------------|
| Analyze   | Understand requirements from Jira ticket   | Requirements, ACs, linked context   |
| Explore   | Find relevant code and identify impact     | Relevant files, patterns, deps      |
| Plan      | Break into ordered tasks with test strategy | Ordered task list + test strategy   |
| Implement | Write code per the approved plan           | Code changes                        |
| Test      | Run tests, validate coverage               | Test results, coverage delta        |
| Review    | Code quality + security scan               | Quality findings, vulnerabilities   |
| Document  | Summarize work, generate commit msg + PR   | Work summary, commit message, PR description |

## Gates

- **Gate 1** (after Plan): present plan to user, wait for approval before implementing.
- **Gate 2** (after Review): present test results + review findings, wait for approval before documenting.

Never skip gates. If user says "autopilot" or "run all", execute stages sequentially but still pause at gates.

## Stage Details

### 1. Analyze

- Fetch Jira ticket — extract ACs, description, linked issues.
- Detect language/project (see Language Detection below).
- If the ticket is ambiguous or incomplete, flag gaps before proceeding.

### 2. Explore

- Find relevant source files, patterns, and dependencies.
- Identify the impact surface (what will change).
- If the change touches multiple services or introduces a new pattern, escalate for architecture guidance.

### 3. Plan

- Produce an ordered task list with:
  - Files to create/modify.
  - Dependencies between tasks.
  - Test strategy (what to test, how to verify).
- Present plan at Gate 1.

### 4. Implement

- Route each task to the appropriate language specialist.
- Tasks within the same language run sequentially.
- Tasks across different services may run in parallel if resource tier allows.

### 5. Test

- Run unit tests, check coverage delta against changed files.
- Execution method is project-specific (local, Docker, k8s pod) — read from project steering.
- If tests fail, loop back to Implement with failure context.

### 6. Review

- Code quality review — style, correctness, architectural compliance.
- Security scan — vulnerability detection on changed files.
- If critical findings, loop back to Implement with review feedback.
- Present results at Gate 2.

### 7. Document

- Produce a work summary covering what was done and why.
- Generate commit message: `<TICKET-ID> <type>: <description>`
- Generate PR description with sections: Description, Ticket, Evidence, How to Test?, Tests table.
- Developer uses this output to commit and create the PR manually.

## Language Detection

Determine the target language in priority order:

1. Explicit user instruction ("this is the Go repo").
2. Jira ticket project key, labels, or components.
3. Repo markers in working directory:
   - `composer.json` → PHP
   - `go.mod` → Go
   - `package.json` (with react, @mui, @reduxjs) → React
4. File extension of files referenced in the ticket or context.

## Project-Specific Configuration

Each project provides its own context via `.kiro/steering/` files:

- **Test commands** — how to run tests (local, Docker, k8s pod).
- **Directory structure** — where code lives.
- **Conventions** — naming, patterns, dependency management.
- **CI/CD** — pipeline specifics.

The orchestrator injects this context into sub-agents automatically. No hardcoded project knowledge lives in this workflow.
