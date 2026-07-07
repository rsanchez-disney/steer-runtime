---
name: review-code-changes
description: Multi-language code review for POS platform — PHP, Go, React, and Kotlin with security and architecture checks
agents: [pos_code_review_agent, pos_security_scanner_agent, android_quality_agent]
---

# Review Code Changes

Comprehensive code review across POS platform languages. Detects quality issues, security vulnerabilities, and architecture violations.

## Prerequisites

- Git diff available (staged or committed changes)
- Target language/repo identified

## Workflow

### Step 1: Detect Language & Scope

1. Identify changed files from git diff
2. Determine language(s): PHP, Go, TypeScript/React, Kotlin
3. Map files to architectural layer:
   - Controllers/Handlers (entry points)
   - Services/Interactors (business logic)
   - Repositories/Data access
   - Models/DTOs
   - Tests
   - Configuration

### Step 2: Architecture Compliance

Check against platform principles:
- No business logic in controllers/handlers
- Repository pattern for data access
- No direct DB access across service boundaries
- Feature flags for new user-facing features
- Backward-compatible API changes
- gRPC proto backward compatibility

See `references/review-checklist.md` for language-specific checks.

### Step 3: Quality Checks

- Error handling: meaningful messages, no swallowed exceptions
- Null safety (language-appropriate patterns)
- Resource cleanup (disposables, defers, connections)
- No hardcoded values (strings, URLs, credentials)
- Test coverage for new code paths
- No unnecessary complexity or over-engineering
- Consistent naming conventions

### Step 4: Security Review

- No hardcoded secrets, tokens, or credentials
- SQL queries parameterized (no string concatenation)
- Input validation on all external data
- Auth/authz checks on new endpoints
- No sensitive data in logs
- OWASP Top 10 awareness for web-facing code
- XSS prevention (React: no dangerouslySetInnerHTML)

### Step 5: Generate Review

```markdown
## Code Review: {branch or PR title}

### Summary
{One paragraph: what changed, overall quality assessment}

### Findings

| # | Severity | File | Line | Issue | Suggestion |
|---|----------|------|------|-------|------------|
| 1 | 🔴 Critical | ... | ... | ... | ... |
| 2 | 🟡 Warning | ... | ... | ... | ... |
| 3 | 🔵 Info | ... | ... | ... | ... |

### Architecture Compliance: {✅ Pass | ⚠️ Concerns | ❌ Violations}

### Security: {✅ Clean | ⚠️ Review Needed | ❌ Issues Found}

### Verdict: {APPROVED | APPROVED WITH WARNINGS | CHANGES REQUESTED}
```

**Agents:** `pos_code_review_agent` (backoffice) | `android_quality_agent` (mobile) + `pos_security_scanner_agent`

## Severity Levels

- 🔴 **Critical:** Security vulnerability, data corruption risk, breaking change
- 🟡 **Warning:** Code smell, missing tests, suboptimal pattern
- 🔵 **Info:** Style suggestion, documentation opportunity

## Important Rules

- **Never approve code with critical findings**
- **Security issues are always critical** unless clearly false positive
- **Breaking API changes** without backward compat are critical
- **Missing tests** for new logic is a warning (minimum)
- **Be specific** — cite file, line, and provide a concrete fix suggestion
