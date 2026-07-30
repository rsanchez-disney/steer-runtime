# Scoring Rubric — Detailed Pass/Fail Examples

> Detailed examples of passing vs. failing skills for each criterion, plus common violation
> patterns and before/after fix demonstrations. Load this file when explaining WHY a criterion
> failed or when the user needs concrete examples of correct vs. incorrect patterns.

## Contents

1. [Criterion 1 — Frontmatter examples](#criterion-1--frontmatter)
2. [Criterion 2 — Name examples](#criterion-2--name)
3. [Criterion 3 — Description examples](#criterion-3--description)
4. [Criterion 4 — Body size guidance](#criterion-4--body-size)
5. [Criterion 5 — Steps examples](#criterion-5--steps)
6. [Criterion 6 — Progressive disclosure examples](#criterion-6--progressive-disclosure)
7. [Criterion 7 — Path examples](#criterion-7--paths)
8. [Criterion 8 — Edge cases examples](#criterion-8--edge-cases)
9. [Criterion 9 — Output format examples](#criterion-9--output-format)
10. [Criterion 10 — Examples examples](#criterion-10--examples)
11. [Common violation patterns](#common-violation-patterns)
12. [Before/after fix demonstrations](#beforeafter-demonstrations)

---

## Criterion 1 — Frontmatter

### PASS

```yaml
---
name: reviewing-pull-requests
description: >-
  Reviews pull requests for code quality, security, and architectural compliance.
  Use when the user needs a code review, PR feedback, or asks to check changes before merging.
---
```

### FAIL — Missing description

```yaml
---
name: my-skill
---
```

### FAIL — Not at top of file

```markdown
# My Skill Title

---
name: my-skill
description: Does something.
---
```

### FAIL — YAML syntax error

```yaml
---
name: broken-skill
description: Does something
  but this line breaks YAML parsing
---
```

---

## Criterion 2 — Name

### PASS examples

| Name                              | Why it passes                        |
|-----------------------------------|--------------------------------------|
| `reviewing-pull-requests`         | Verb-ing, lowercase, hyphens         |
| `scaffolding-api-endpoints`       | Verb-ing, lowercase, hyphens         |
| `refactoring-legacy-modules`      | Verb-ing, lowercase, hyphens         |
| `debugging-production-issues`     | Verb-ing, lowercase, hyphens         |
| `generating-unit-tests`           | Verb-ing, lowercase, hyphens         |
| `migrating-database-schemas`      | Verb-ing, lowercase, hyphens         |

### FAIL examples

| Name                              | Why it fails                         | Fix                                  |
|-----------------------------------|--------------------------------------|--------------------------------------|
| `code-reviewer`                   | Noun/role, not verb-ing              | → `reviewing-pull-requests`          |
| `senior-backend-engineer`         | Noun/role, not verb-ing              | → `scaffolding-api-endpoints`        |
| `MySkill`                         | Uppercase, no hyphens                | → `my-skill` (+ add verb-ing)       |
| `skill_name`                      | Underscores instead of hyphens       | → `skill-name` (+ add verb-ing)     |
| `claude-helper`                   | Reserved keyword `claude`            | → rename without reserved word       |
| `refactoring-the-entire-legacy-monolith-into-microservices-architecture` | >64 chars | → `refactoring-legacy-modules` |

### Folder name mismatch

```text
Folder: .kiro/skills/old-name/
SKILL.md name: new-name

Fix: rename folder to match → .kiro/skills/new-name/
```

---

## Criterion 3 — Description

### PASS — What + When + Keywords

```yaml
description: >-
  Scaffolds REST API endpoints with controllers, services, DTOs, and validation following
  project conventions. Use when the user needs to create, extend, or restructure API
  endpoints or route handlers.
```

Analysis: ✅ what (scaffolds API endpoints) + ✅ when (create/extend/restructure) + ✅ keywords (REST, controllers, services, DTOs, validation, routes)

### PASS — Another development example

```yaml
description: >-
  Generates unit and integration tests with mocks, fixtures, and edge-case coverage for
  existing code. Use when the user asks to test a module, increase coverage, or validate
  a bug fix.
```

Analysis: ✅ what (generates tests) + ✅ when (test/coverage/validate) + ✅ keywords (unit, integration, mocks, fixtures, edge-case, coverage)

### FAIL — Too vague

```yaml
description: Helps with backend stuff.
```

Analysis: ❌ No specifics. Would never match a real prompt.

### FAIL — Too broad

```yaml
description: A general-purpose assistant that helps with any development task.
```

Analysis: ❌ Matches everything = matches nothing correctly. Routing ambiguity guaranteed.

### FAIL — Trigger list (belongs in body)

```yaml
description: >
  Activate this skill whenever the user mentions code review, pull requests, linting,
  refactoring, architecture patterns, SOLID principles, clean code, or when they ask
  "review my code", "check this PR", "is this a good pattern", or ask to improve
  code quality in any way.
```

Analysis: ❌ Multi-sentence trigger list. This content belongs in the "When to use" section of the body, not the description. Condense to: "Reviews code for quality, security, and architectural compliance. Use when the user needs a code review or PR feedback."

---

## Criterion 4 — Body size

| Lines | Verdict | Recommended action                              |
|------:|:--------|:------------------------------------------------|
|   150 | PASS    | Comfortable — room for growth                   |
|   280 | PASS    | Good size                                       |
|   420 | WARN    | Consider extracting long sections to references |
|   499 | WARN    | One line from failure — extract now             |
|   500 | FAIL    | Must move content to references/                |
|   700 | FAIL    | Significant extraction needed                   |

**What to extract first** (highest ROI):

1. Long example sections (100+ lines of examples → `references/examples.md`)
2. Technique/framework details → `references/techniques.md`
3. Large tables with reference data

---

## Criterion 5 — Steps

### PASS — Clear verbs, numbered

```markdown
### Step 1 — Analyze the codebase context
### Step 2 — Identify affected components
### Step 3 — Implement the changes
### Step 4 — Validate with tests
### Step 5 — Document the output
```

### PASS — Another development workflow

```markdown
### Step 1 — Read the existing module structure
### Step 2 — Design the refactoring approach
### Step 3 — Apply transformations incrementally
### Step 4 — Run the test suite and fix regressions
### Step 5 — Produce a summary of changes
```

### FAIL — Passive, no verbs

```markdown
### About the codebase
### The changes
### Testing
### Documentation
### Results
```

### FAIL — No clear ordering

```markdown
## Workflow
The skill looks at the input and figures out what to do. It processes the code
and produces output. Various checks are performed along the way.
```

---

## Criterion 6 — Progressive disclosure

### PASS

```text
SKILL.md (230 lines) — lean body with clear pointers
references/
├── examples.md (290 lines, has TOC)
└── patterns.md (210 lines, has TOC)
```

### FAIL — Everything in body

```text
SKILL.md (680 lines) — 200 lines of code examples inline, no references/
```

Fix: Extract examples to `references/examples.md`, add TOC.

### FAIL — Nested references

```text
references/
└── subfolder/
    └── deep-file.md
```

Fix: Flatten to `references/deep-file.md`.

### FAIL — Long reference without TOC

```text
references/patterns.md (250 lines, no table of contents)
```

Fix: Add TOC at top with numbered section links.

---

## Criterion 7 — Paths

### PASS

```markdown
Read `references/patterns.md` for architecture guidance.
Run `scripts/validate.sh` to check results.
Output goes to `assets/template.md`.
```

### FAIL

```markdown
Read `references\patterns.md` for architecture guidance.
Run `scripts\validate.sh` to check results.
```

Fix: Global replace `\` → `/` in all paths.

---

## Criterion 8 — Edge cases

### PASS — Dedicated table with clear actions

```markdown
## Edge cases and failure modes

| Situation                          | Action                              |
|------------------------------------|-------------------------------------|
| Input file is empty or missing     | Return error with guidance          |
| Multiple conflicting requirements  | Escalate, don't decide arbitrarily  |
| Output exceeds token budget        | Truncate and note what's missing    |
| User provides wrong language/stack | Explain expected input, ask again   |
| Circular dependencies detected     | Flag the cycle and suggest a fix    |
| Repo has no test framework setup   | Offer to scaffold one first         |
```

### FAIL — No section at all

(Section simply doesn't exist in the SKILL.md)

### FAIL — Vague

```markdown
## Edge cases
Handle errors gracefully. If something goes wrong, try to recover.
```

---

## Criterion 9 — Output format

### PASS — Explicit structure

```markdown
## Output
1. Summary table (file changed, change type, lines affected, risk level)
2. Code blocks with the implementation (language-fenced, ready to apply)
3. Test file with passing assertions for each change
4. Migration notes if breaking changes are introduced
```

### PASS — Another development example

```markdown
## Output
1. Architecture decision record (context, options, decision, consequences)
2. Dependency diagram in Mermaid syntax
3. Implementation checklist with acceptance criteria per task
```

### FAIL — Vague

```markdown
## Output
The skill produces useful results in a clear format.
```

---

## Criterion 10 — Examples

### PASS — Inline format example + reference examples

Body shows the format template:

```markdown
## Changes Applied

| File                  | Change        | Risk   |
|-----------------------|---------------|--------|
| `src/auth/login.ts`  | Added input validation | Low |
| `src/db/connection.ts`| Fixed connection pool leak | Medium |

### Implementation

\`\`\`typescript
// src/auth/login.ts — added input validation
export function validateCredentials(input: LoginInput): ValidationResult {
  // ...
}
\`\`\`

### Tests Added

\`\`\`typescript
describe('validateCredentials', () => {
  it('rejects empty username', () => { /* ... */ });
  it('rejects password under 8 chars', () => { /* ... */ });
});
\`\`\`
```

Plus `references/examples.md` with 4–6 complete real-world examples.

### FAIL — No examples anywhere

Neither inline nor in references. Reader has no concrete model of what output looks like.

---

## Common violation patterns

| Pattern                                      | Frequency | Typical score impact |
|----------------------------------------------|:---------:|:--------------------:|
| Name is a noun/role instead of verb-ing      |   High    |         -1           |
| Description is a multi-line trigger list     |   High    |         -1           |
| Missing "When NOT to use"                    |   High    |    (bonus check)     |
| Body opens with "You are a..."              |   Medium  |    (bonus check)     |
| No edge cases section                        |   Medium  |         -1           |
| Output format vague or missing               |   Medium  |         -1           |
| Folder name ≠ frontmatter name              |   Low     |         -1           |
| Backslashes in paths                         |   Low     |         -1           |
| Body >500 lines                              |   Low     |         -1           |
| References nested deeper than one level      |   Low     |         -1           |

---

## Before/after demonstrations

### Demo 1: Name fix

**Before:** `name: code-reviewer` (noun/role)
**After:** `name: reviewing-pull-requests` (verb-ing)
**Impact:** Score +1, routing improves

### Demo 2: Description fix

**Before:**

```yaml
description: >
  Activate this skill whenever the user mentions code review, pull requests,
  refactoring, architecture patterns, SOLID, clean code...
```

**After:**

```yaml
description: >-
  Reviews code for quality, security, and architectural compliance.
  Use when the user needs a code review, PR feedback, or asks to check changes before merging.
```

**Impact:** Score +1, cleaner routing, triggers moved to "When to use" in body

### Demo 3: Body restructure

**Before:** Opens with "You are a Senior Staff Engineer with 15+ years..."
**After:** Opens with `## Purpose` section explaining what the skill solves.
**Impact:** Bonus check fixed, follows canonical structure

### Demo 4: Adding "When NOT to use"

**Before:** Section doesn't exist.
**After:**

```markdown
## When NOT to use
- User needs infrastructure provisioning (use a DevOps skill)
- User wants to deploy or manage CI/CD pipelines
- The task is purely about documentation with no code changes
- User needs database administration or query optimization
```

**Impact:** Prevents false matches, bonus check fixed
