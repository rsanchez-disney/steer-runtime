# Best Practices Checklist — Detailed Audit Rubric

> Complete scoring rubric for the 10-point skill audit. Load this file when you need detailed
> pass/fail examples or are explaining to the user why a criterion failed.

## Contents

1. [Criterion 1 — Frontmatter valid](#criterion-1--frontmatter-valid)
2. [Criterion 2 — Name conventions](#criterion-2--name-conventions)
3. [Criterion 3 — Description quality](#criterion-3--description-quality)
4. [Criterion 4 — Body size](#criterion-4--body-size)
5. [Criterion 5 — Explicit steps](#criterion-5--explicit-steps)
6. [Criterion 6 — Progressive disclosure](#criterion-6--progressive-disclosure)
7. [Criterion 7 — Forward slashes](#criterion-7--forward-slashes)
8. [Criterion 8 — Edge cases](#criterion-8--edge-cases)
9. [Criterion 9 — Output format](#criterion-9--output-format)
10. [Criterion 10 — Examples](#criterion-10--examples)
11. [Scoring examples](#scoring-examples)
12. [Common fix patterns](#common-fix-patterns)

---

## Criterion 1 — Frontmatter valid

**Pass:** YAML frontmatter parses correctly. Has `name` and `description` fields. No syntax errors.

```yaml
# ✅ Pass
---
name: scaffolding-api-endpoints
description: >-
  Scaffolds REST API endpoints with controllers, services, DTOs, and validation
  following project conventions. Use when the user needs to create or extend API routes.
---
```

```yaml
# ✅ Pass — another example
---
name: refactoring-legacy-modules
description: >-
  Refactors legacy code into clean, testable modules with proper dependency injection.
  Use when the user asks to modernize, clean up, or restructure existing code.
---
```

```yaml
# ❌ Fail — missing description
---
name: my-skill
---
```

```yaml
# ❌ Fail — YAML syntax error (no closing ---)
---
name: broken-skill
description: Does something
```

---

## Criterion 2 — Name conventions

**Pass:** Verb-ing form, lowercase, hyphens only, max 64 chars, matches folder name, no reserved words.

| Example                           | Verdict | Reason                              |
|-----------------------------------|---------|-------------------------------------|
| `scaffolding-api-endpoints`       | ✅ Pass  | Verb-ing, lowercase, hyphens        |
| `reviewing-pull-requests`         | ✅ Pass  | Verb-ing, lowercase, hyphens        |
| `generating-unit-tests`           | ✅ Pass  | Verb-ing, lowercase, hyphens        |
| `migrating-database-schemas`      | ✅ Pass  | Verb-ing, lowercase, hyphens        |
| `debugging-production-issues`     | ✅ Pass  | Verb-ing, lowercase, hyphens        |
| `api-builder`                     | ❌ Fail  | Noun, not verb-ing                  |
| `senior-backend-engineer`         | ❌ Fail  | Role name, not verb-ing             |
| `MySkill`                         | ❌ Fail  | Uppercase, no hyphens               |
| `claude-helper`                   | ❌ Fail  | Reserved keyword `claude`           |
| `refactoring-the-entire-legacy-monolith-into-microservices-architecture` | ❌ Fail | >64 chars |

---

## Criterion 3 — Description quality

**Pass:** Single sentence. Contains (a) what it does + (b) when to use it. Has routing keywords.

**Test:** Read 3 realistic user prompts. Would semantic matching connect them to this description?

```yaml
# ✅ Pass — clear what + when + keywords
description: >-
  Scaffolds REST API endpoints with controllers, services, DTOs, and validation following
  project conventions. Use when the user needs to create, extend, or restructure API
  endpoints or route handlers.
```

```yaml
# ✅ Pass — another development example
description: >-
  Generates unit and integration tests with mocks, fixtures, and edge-case coverage.
  Use when the user asks to test a module, increase coverage, or validate a bug fix.
```

```yaml
# ❌ Fail — too vague, no routing keywords
description: Helps with backend stuff.
```

```yaml
# ❌ Fail — too broad, matches everything
description: A general-purpose assistant that helps with any development task.
```

```yaml
# ❌ Fail — multi-paragraph trigger list (should be in "When to use" body section)
description: >
  Activate when the user mentions APIs, REST, endpoints, controllers, services,
  middleware, route handlers, request validation, response mapping, or when they
  ask "create an endpoint", "add a route", "scaffold the service layer"...
```

---

## Criterion 4 — Body size

**Pass:** `wc -l SKILL.md` returns <500.

| Lines | Verdict | Action                                         |
|------:|---------|------------------------------------------------|
|   180 | ✅ Pass  | Comfortable margin                             |
|   280 | ✅ Pass  | Good working size                              |
|   420 | ⚠️ Warn  | Getting close — consider moving to references/ |
|   510 | ❌ Fail  | Must extract sections to references/           |

---

## Criterion 5 — Explicit steps

**Pass:** Every workflow step starts with a clear action verb. Steps are numbered or labeled.

```markdown
# ✅ Pass — clear verbs, numbered
### Step 1 — Analyze the existing module structure
### Step 2 — Design the target architecture
### Step 3 — Implement the refactoring incrementally
### Step 4 — Run tests and fix regressions
### Step 5 — Document breaking changes
```

```markdown
# ✅ Pass — another development workflow
### Step 1 — Read the API specification
### Step 2 — Scaffold controller and service layers
### Step 3 — Implement validation and DTOs
### Step 4 — Wire up dependency injection
### Step 5 — Generate tests for each endpoint
### Step 6 — Verify with a build run
```

```markdown
# ❌ Fail — passive, no verbs, no numbering
### About the codebase
### The refactoring
### Testing considerations
### Documentation
```

```markdown
# ❌ Fail — vague blob, no structure
## Workflow
The skill looks at the code and figures out what to refactor. It makes changes
and runs tests. Various improvements are applied.
```

---

## Criterion 6 — Progressive disclosure

**Pass:** Body stays lean. Detail that's only sometimes needed lives in `references/`.
References are one level deep. Files >100 lines have a TOC.

```text
# ✅ Pass — lean body with on-demand references
SKILL.md (240 lines) — focused body
references/
├── patterns.md (180 lines, has TOC)      ← architecture patterns used by Step 2
└── examples.md (220 lines, has TOC)       ← full input→output examples for Step 5
```

**Fail signals:**

- Body has a 200-line example section that could be in references/
- References are nested: `references/subfolder/file.md`
- A reference file has no TOC despite being 150+ lines
- All references are always loaded (defeats the purpose)

---

## Criterion 7 — Forward slashes

**Pass:** Every file path in the skill uses forward slashes. Zero backslashes.

```markdown
# ✅ Pass
Read `references/patterns.md` for architecture guidance.
Run `scripts/validate.sh` to check output quality.
Output goes to `assets/template.md`.
```

```markdown
# ❌ Fail
Read `references\patterns.md` for architecture guidance.
Run `scripts\validate.sh` to check output quality.
```

---

## Criterion 8 — Edge cases

**Pass:** Dedicated section (table or list) with at least 3 failure/edge scenarios and corresponding actions.

```markdown
# ✅ Pass — table with clear situations and actions
| Situation                          | Action                                     |
|------------------------------------|--------------------------------------------|
| Input file is empty or missing     | Return error with expected format guidance |
| Conflicting requirements detected  | Escalate, list conflicts, don't guess      |
| Output exceeds token budget        | Truncate and note what's missing           |
| No test framework configured       | Offer to scaffold one before proceeding    |
| Circular dependency detected       | Flag the cycle and suggest resolution      |
| User provides wrong language/stack | Clarify expected input, ask again          |
```

```markdown
# ❌ Fail — no edge case section at all, or just:
## Edge cases
Handle errors gracefully. If something goes wrong, try to recover.
```

---

## Criterion 9 — Output format

**Pass:** Reader knows exactly what structure they'll receive. Sections, format, example.

```markdown
# ✅ Pass — explicit structure
## Output
1. Summary table (file changed, change type, lines affected, risk level)
2. Implementation code blocks (language-fenced, ready to apply)
3. Test file covering each new path
4. Migration notes if breaking changes exist
```

```markdown
# ✅ Pass — another development example
## Output
1. Architecture decision record (context, options, decision, consequences)
2. Dependency diagram in Mermaid syntax
3. Implementation checklist with acceptance criteria per task
4. Registration snippet for wiring into the agent config
```

```markdown
# ❌ Fail — vague
## Output
The skill produces useful results in a clear format.
```

---

## Criterion 10 — Examples

**Pass:** At least 1 concrete input→output example. Can be inline (short) or in references/ (long).

```markdown
# ✅ Pass — inline format template showing structure
## Example output

### Changes Applied

| File                      | Change                     | Risk   |
|---------------------------|----------------------------|--------|
| `src/auth/login.ts`      | Added input validation     | Low    |
| `src/db/connection.ts`   | Fixed connection pool leak | Medium |

### Implementation

\`\`\`typescript
// src/auth/login.ts — added input validation
export function validateCredentials(input: LoginInput): ValidationResult {
  // ...implementation
}
\`\`\`

### Tests

\`\`\`typescript
describe('validateCredentials', () => {
  it('rejects empty username', () => { /* ... */ });
  it('rejects password under 8 chars', () => { /* ... */ });
});
\`\`\`
```

Plus `references/examples.md` with 4–6 complete real-world examples: ✅

- No examples anywhere (body or references): ❌
- Example that only shows output without showing what input produced it: ❌

---

## Scoring examples

### Skill scoring 10/10

```text
1. ✅ Frontmatter valid
2. ✅ Name: `scaffolding-api-endpoints`
3. ✅ Description: what + when + keywords (REST, controllers, DTOs, validation)
4. ✅ Body: 265 lines
5. ✅ Steps: Step 1-6, clear verbs (Analyze, Design, Implement, Wire, Generate, Verify)
6. ✅ References: 2 files, on-demand, both with TOC
7. ✅ Forward slashes throughout
8. ✅ Edge cases: 6-row table covering empty input, conflicts, no framework
9. ✅ Output: 4-part structure defined (summary, code, tests, migration notes)
10. ✅ Examples: inline template + 5 full examples in references/
```

### Skill scoring 6/10

```text
1. ✅ Frontmatter valid
2. ❌ Name: `api-builder` (noun, not verb-ing)
3. ❌ Description: 600-char trigger list (too long, multi-line conditions)
4. ✅ Body: 310 lines
5. ✅ Steps: Step 1-5, clear verbs
6. ✅ References: 1 file, on-demand
7. ✅ Forward slashes
8. ❌ Edge cases: partial (mentions errors but no dedicated table)
9. ❌ Output: buried at bottom as "Results" paragraph, not structured
10. ✅ Examples: delegated to references/
```

---

## Common fix patterns

| Problem                              | Fix                                                                   |
|--------------------------------------|-----------------------------------------------------------------------|
| Name is a noun/role                  | Rewrite as verb-ing: `api-builder` → `scaffolding-api-endpoints`      |
| Description is a trigger list        | Condense to 1 sentence; move triggers to "When to use" section        |
| Body >500 lines                      | Extract long examples/tables to `references/`                         |
| Opens with "You are a..."           | Replace with a `## Purpose` section                                   |
| Missing "When NOT to use"            | Add 3-5 exclusions that prevent false matches                         |
| No edge cases section                | Add table with at least 3 failure scenarios                           |
| Backslashes in paths                 | Global find/replace `\` → `/`                                         |
| Folder name ≠ frontmatter name      | Rename folder to match `name` field                                   |
| References >100 lines without TOC    | Add numbered TOC at top of each reference file                        |
| Description too broad                | Add specifics: domain keywords, file types, trigger phrases           |
| Steps are passive nouns              | Rewrite with action verbs: "Testing" → "Run the test suite"          |
| Output format says "clear format"    | Replace with numbered structure listing each deliverable              |
