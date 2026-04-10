---
inclusion: manual
description: Code review process for OpSheet+ VAS branches and PRs
---

# Code Review Process

When this skill is activated, IMMEDIATELY execute the review process below. Do not ask for confirmation.

## 0. Pre-Review Scripts

Run these commands before starting the review:

```bash
git fetch
git branch --show-current
git diff --name-status main...HEAD
git diff main...HEAD
npm run lint
npm run test
```

## 1. Steering Files Compliance

Verify that all changes comply with the project's steering files. Cross-check violations against each:

| Steering File | What to Verify |
|---|---|
| `architecture.md` | Layer separation, dependency flow, no business logic in VAS, anti-patterns |
| `code-patterns.md` | Naming conventions, code structure, DI, type safety, error handling, auth patterns |
| `git-workflow.md` | Branch naming, commit message format |
| `testing.md` | Test location, Mock.create pattern, afterEach cleanup |
| `tech-stack.md` | Correct dependencies, internal libraries, UrlUtil, HttpClient |

### Checklist
- [ ] Architecture layer boundaries respected (architecture.md)
- [ ] File and class naming conventions followed (code-patterns.md)
- [ ] Route name format: `{method}.{domain}.{resource}` (code-patterns.md)
- [ ] Dependency injection via constructor with defaults (code-patterns.md)
- [ ] Type safety rules followed (code-patterns.md)
- [ ] Error handling patterns followed (code-patterns.md)
- [ ] Auth & security patterns followed (code-patterns.md)
- [ ] Branch name matches `{type}/OPS-{number}` (git-workflow.md)
- [ ] Commit messages follow conventional format with OPS ticket (git-workflow.md)
- [ ] Tests use `Mock.create<T>()` not `jest.mock()` (testing.md)
- [ ] Test files in `src/tests/domains/{domain}/` mirroring source (testing.md)
- [ ] Mocks cleared in `afterEach` (testing.md)
- [ ] URLs built with `UrlUtil.buildUrl()` (tech-stack.md)
- [ ] HTTP calls via `HttpClient` / `RestAPIService` (tech-stack.md)
- [ ] Internal libraries used where applicable (tech-stack.md)

Flag any deviation as an issue with the corresponding priority level and reference the specific steering file being violated.

## 2. Review Output Format

```markdown
## OpSheet+ VAS Code Review

**Overall Assessment**: [Approve/Request Changes/Comment]
**Architecture**: [Score/10] | **TypeScript**: [Score/10] | **Performance**: [Score/10] | **Testing**: [Score/10]
**Test Coverage**: [Percentage]

---

### 🏗️ Architecture & Layer Separation
**Status**: [✅ Compliant / ⚠️ Issues Found]

**Issues Found:**
- **[Priority]** `path/to/file.ts:line` - [Issue description]

---

### 📘 TypeScript & Code Quality
**Status**: [✅ Type Safe / ⚠️ Needs Improvement]

**Issues Found:**
- **[Priority]** `path/to/file.ts:line` - [Issue description]

---

### ⚡ Performance & Best Practices
**Status**: [✅ Optimized / ⚠️ Needs Optimization]

**Issues Found:**
- **[Priority]** `path/to/file.ts:line` - [Issue description]

---

### 🧪 Testing & Coverage
**Status**: [✅ Well Tested / ⚠️ Needs Tests]

**Issues Found:**
- **[Priority]** `path/to/file.spec.ts:line` - [Issue description]

---

### 📋 Steering Files Compliance
**Status**: [✅ Compliant / ⚠️ Violations Found]

| Steering File | Status |
|---|---|
| `architecture.md` | ✅ / ⚠️ [details] |
| `code-patterns.md` | ✅ / ⚠️ [details] |
| `git-workflow.md` | ✅ / ⚠️ [details] |
| `testing.md` | ✅ / ⚠️ [details] |
| `tech-stack.md` | ✅ / ⚠️ [details] |

**Violations Found:**
- **[Priority]** `path/to/file.ts:line` - [Violation] (steering: `{file}.md`)

---

## Priority-Organized Issues

### 🔴 Critical Issues (Block Merge)
1. **File**: `path/to/file.ts` | **Line**: `123` | **Category**: [Architecture/TypeScript/Performance/Testing]
   - **Issue**: [Brief description]
   - **Impact**: [Why this blocks merge]
   - **Fix**: [Specific action needed]

### 🟠 High Priority (Should Fix Before Merge)
1. **File**: `path/to/file.ts` | **Line**: `89` | **Category**: [Architecture/TypeScript/Performance/Testing]
   - **Issue**: [Brief description]
   - **Impact**: [Why this should be fixed]
   - **Fix**: [Specific action needed]

### 🟡 Medium Priority (Improve Quality)
1. **File**: `path/to/file.ts` | **Line**: `234` | **Category**: [Architecture/TypeScript/Performance/Testing]
   - **Issue**: [Brief description]
   - **Impact**: [Quality improvement benefit]
   - **Fix**: [Specific action needed]

### 🟢 Low Priority (Nice to Have)
1. **File**: `path/to/file.ts` | **Line**: `567` | **Category**: [Architecture/TypeScript/Performance/Testing]
   - **Issue**: [Brief description]
   - **Impact**: [Minor improvement]
   - **Fix**: [Specific action needed]

---

## Files Changed Summary

| File | Critical | High | Medium | Low | Total Issues |
|------|----------|------|--------|-----|------------|
| `path/to/controller.ts` | 2 | 1 | 0 | 1 | 4 |
| `path/to/service.ts` | 0 | 3 | 2 | 0 | 5 |
| **TOTAL** | **2** | **4** | **2** | **1** | **9** |

---
```

## 3. Review Guidelines

### Critical Issues (Block Merge)
- Business logic in VAS (should be in core services)
- Services doing data transformation (use transformers)
- Transformers calling services
- Security vulnerabilities
- Missing authentication/authorization
- Hardcoded credentials or secrets
- Breaking layer separation rules
- Missing error handling
- Tests using real external services
- Blocking operations in async code

### High Priority (Should Fix Before Merge)
- `any` types without justification
- Missing TypeScript types
- Route names not following convention
- Missing tests for new code
- Improper dependency flow
- Performance bottlenecks
- Missing validators on routes
- Unused imports or code
- ESLint violations

### Medium Priority (Improve Quality)
- Suboptimal naming
- Import organization
- Test coverage gaps
- Minor refactoring opportunities
- Documentation gaps
- Missing type definitions

### Low Priority (Nice to Have)
- Code style preferences
- Additional test scenarios
- Performance micro-optimizations
- Comment improvements
- Helper function extractions

## 4. Issue Reporting Format

When reporting issues, ALWAYS include:
1. Full relative file path (e.g., `src/controllers/domain.controller.ts`)
2. Specific line number or range (e.g., `123` or `123-145`)
3. Category (Architecture/TypeScript/Performance/Testing)
4. Clear description of the issue
5. Impact explanation
6. Specific fix recommendation
