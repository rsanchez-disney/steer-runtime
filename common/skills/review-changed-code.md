---
name: review-changed-code
description: Review all changes against the base branch with structured feedback
---

# Review Changed Code

Conduct a thorough code review for changes targeting the base branch.

## Process

### Step 1: Identify Changes

1. Read `project.yaml` or memory bank for `baseBranch`
2. Run `git diff <baseBranch>...HEAD --name-only` to list changed files
3. Run `git diff <baseBranch>...HEAD --stat` for a summary

### Step 2: Review Each File

Read each changed file in full context and evaluate against:

#### Functional Correctness
- Does the code work as intended?
- Are edge cases handled?

#### Logic and Design
- Is the logic clear and appropriate?
- Are abstractions right-sized — not over-engineered, not under-designed?

#### Code Quality
- Clean, readable, well-organized?
- Follows project patterns and naming conventions?

#### Security
- No hardcoded secrets or credentials?
- Input validation on user-facing endpoints?
- No SQL injection, XSS, or other vulnerabilities?

#### Testing
- New code has tests?
- Edge cases covered?
- Tests are meaningful (not just coverage padding)?

#### Performance
- No N+1 queries?
- No unnecessary allocations in hot paths?
- Pagination for large datasets?

### Step 3: Cross-Reference

- Verify changes map to the ticket's acceptance criteria
- Check for unrelated changes (golden rule: minimal diff)
- Verify backward compatibility for API changes

### Step 4: Write Review

Output a structured review:

```markdown
# Code Review: <branch-name>

## Summary
<one-paragraph overview>

## Findings

### 🔴 Blockers
<issues that must be fixed before merge>

### 🟡 Suggestions
<improvements that should be considered>

### 🟢 Positive
<things done well>

## Verdict
APPROVE / REQUEST CHANGES / NEEDS DISCUSSION
```
