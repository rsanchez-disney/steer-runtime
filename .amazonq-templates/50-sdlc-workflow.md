# SDLC Workflow

When implementing a Jira story end-to-end, follow these steps:

## 1. Fetch & Analyze Story
Use Jira MCP tools to fetch the story by key (e.g., DPAY-14337).
Extract: title, description, acceptance criteria, type, priority, components.
Flag if incomplete (missing ACs, vague description, TBD placeholders).

## 2. Explore Codebase
Identify which repositories and files are affected based on project mappings.
Search for existing patterns, related code, and dependencies.

## 3. Review Architecture
Check which layers are affected (UI, WebAPI, Backend).
Follow existing patterns — don't introduce new patterns without justification.

## 4. Create Implementation Plan
Break the story into tasks by layer/component.
Estimate complexity. Identify dependencies between tasks.

## 5. Get Approval
Present the plan to the user before implementing. Wait for confirmation.

## 6. Implement
Work through tasks in dependency order.
Follow the language-specific rules (Java, Node, Angular, Go, Flutter).
Minimal diff — only change what the story requires.

## 7. Run Tests
Run relevant tests for changed files. Verify coverage ≥90%.
Add tests for new logic, error cases, and edge cases.

## 8. Code Review
Check against the review checklist: security, quality, performance, testing.
Fix CRITICAL issues. Document WARNING issues.

## 9. Security Scan
Check for hardcoded secrets, vulnerable dependencies, injection patterns.
Fix CRITICAL/HIGH issues before proceeding.

## 10. Quality Report
Summarize: tests passed, coverage %, review findings, security scan results.
Get user approval before creating PR.

## 11. Create PR
Branch: `<type>/<story-id>-<slug>` (e.g., `feature/DPAY-14337-export-progress`)
Commit: conventional commit format
PR description: story link, changes, ACs, test results, golden rules checklist.

## 12. Done
Summary: PR URL, files changed, quality checks passed, duration.
