---
name: auditing-skills
description: >-
  Audits existing skills against the 10-point best practices checklist, scores them 0-10,
  identifies violations, and provides actionable fix instructions. Use when the user wants
  to evaluate, review, or validate a skill's quality before production use.
---

# Auditing Skills

## Purpose

Evaluate an existing skill against the Anthropic open-standard best practices, produce a
scored audit report (0-10), identify every violation with its severity, and provide specific
fix instructions for each issue found. The goal is to bring any skill to ≥ 9/10 through
iterative audit → fix cycles.

## When to use

- User asks to evaluate, audit, review, or validate an existing skill.
- User wants to know if a skill follows best practices before production use.
- User says "check this skill", "is this skill good?", "score this skill".
- User asks "what's wrong with this skill?" or "how can I improve this skill?".
- User has a skill scoring below 9/10 and wants specific fix guidance.

## When NOT to use

- User wants to create a new skill from scratch (use `creating-skills`).
- User wants to design an agent configuration (use `designing-agents`).
- User needs to use/invoke the skill being evaluated (just use it directly).
- User asks about skills conceptually without having one to evaluate.

## Inputs

| Input                        | Required | Notes                                             |
|------------------------------|:--------:|---------------------------------------------------|
| Skill folder path or content |   Yes    | Must include SKILL.md; references/ if they exist  |
| Target score                 |    No    | Defaults to ≥ 9/10                                |
| Fix mode                     |    No    | "report-only" or "report-and-fix" (default)       |

## Workflow

### Step 1 — Read the complete skill

1. Read `SKILL.md` (the main file).
2. List and read all files in `references/` (if they exist).
3. List and read all files in `scripts/` and `assets/` (if they exist).
4. Check the folder name.
5. Count lines in each file (`wc -l`).

Do NOT skip any file. The audit requires full visibility.

### Step 2 — Run the 10-point checklist

Evaluate each criterion independently. For each one, assign:
- **PASS** — fully compliant
- **WARN** — minor issue, doesn't block production but should fix
- **FAIL** — violation that must be fixed before production

#### Criterion 1 — Frontmatter valid and well-formed

- [ ] YAML parses without errors
- [ ] `name` field present
- [ ] `description` field present
- [ ] No extra unrecognized fields that break parsing
- [ ] Frontmatter is at the very top of the file (line 1 = `---`)

#### Criterion 2 — Name follows conventions

- [ ] Verb-ing form (e.g., `generating-`, `analyzing-`, `reviewing-`)
- [ ] Lowercase only
- [ ] Hyphens only (no underscores, spaces, dots)
- [ ] Max 64 characters
- [ ] No reserved keywords (`claude`, `anthropic`)
- [ ] Matches the parent folder name exactly

#### Criterion 3 — Description quality

- [ ] Single sentence (no multi-line paragraphs)
- [ ] Max 1024 characters
- [ ] Contains (a) what it does + (b) when to use it
- [ ] Has routing keywords that would match realistic user prompts
- [ ] NOT a trigger list (those belong in "When to use" section)
- [ ] NOT vague ("helps with stuff") or too broad ("general purpose")

**Prompt test:** Mentally try 3 realistic user prompts. Would this description match them?

#### Criterion 4 — Body size

- [ ] `wc -l SKILL.md` < 500

| Lines   | Verdict |
|--------:|---------|
| < 350   | PASS    |
| 350-499 | WARN (consider extracting to references/) |
| ≥ 500   | FAIL    |

#### Criterion 5 — Explicit steps with clear verbs

- [ ] Workflow section exists with numbered or named steps
- [ ] Each step starts with an action verb (Generate, Classify, Validate, Search, etc.)
- [ ] Steps are ordered logically
- [ ] Branch points are explicit (if/then conditions stated)
- [ ] No passive descriptions ("the data is processed" → should be "Process the data")

#### Criterion 6 — Progressive disclosure (references/assets)

- [ ] Body stays lean — detail that's only sometimes needed is in `references/`
- [ ] References are one level deep only (`references/file.md`, not `references/sub/file.md`)
- [ ] Files >100 lines have a TOC at the top
- [ ] Each reference file has a brief purpose description at the top
- [ ] No 200+ line sections in the body that should be extracted

#### Criterion 7 — Forward slashes in all paths

- [ ] Zero backslashes (`\`) in any file path anywhere in the skill
- [ ] All references use forward slashes (`references/file.md`)
- [ ] Script paths use forward slashes (`scripts/validate.py`)

#### Criterion 8 — Edge cases and failure modes

- [ ] Dedicated section exists (table or list)
- [ ] At least 3 edge case scenarios documented
- [ ] Each scenario has a clear corresponding action/resolution
- [ ] Covers: bad input, ambiguous input, missing data, conflicting sources

#### Criterion 9 — Output format well specified

- [ ] Reader knows exactly what structure they'll receive
- [ ] Sections/parts of the output are listed
- [ ] Format is clear (markdown, JSON, table, code block, etc.)
- [ ] NOT vague ("produces useful results in a clear format")

#### Criterion 10 — Examples complete

- [ ] At least 1 concrete input→output example exists (inline or in references/)
- [ ] Example shows both input AND expected output structure
- [ ] Examples are realistic (not placeholder/lorem ipsum)

### Step 3 — Check additional quality signals

Beyond the 10-point score, check these bonus criteria:

| Check                                   | Status |
|-----------------------------------------|--------|
| "When to use" section present           |        |
| "When NOT to use" section present       |        |
| "Inputs" section present                |        |
| Self-validation checklist present       |        |
| Restrictions / guardrails present       |        |
| No role-assignment opening ("You are...") |      |
| No description duplication with body    |        |
| References have TOC (if >100 lines)     |        |

### Step 4 — Produce the audit report

Deliver in this exact format:

```markdown
## Audit Report: <skill-name>

**Score: X/10**
**Verdict:** [PRODUCTION-READY | NEEDS-FIXES | MAJOR-REWRITE]

| Verdict thresholds |
|-|
| 9-10 = PRODUCTION-READY |
| 7-8 = NEEDS-FIXES (minor issues) |
| 0-6 = MAJOR-REWRITE (structural problems) |

### Scorecard

| #  | Criterion                         | Status | Issue (if any)                    |
|:--:|:----------------------------------|:------:|:----------------------------------|
|  1 | Frontmatter valid                 | PASS/WARN/FAIL | [specific issue]         |
|  2 | Name conventions                  | ...    | ...                               |
| ...| ...                               | ...    | ...                               |
| 10 | Examples complete                 | ...    | ...                               |

### Additional Checks

| Check                              | Status |
|------------------------------------|--------|
| "When to use" present              | ✅/❌   |
| "When NOT to use" present          | ✅/❌   |
| ...                                | ...    |

### Issues Found (ordered by severity)

#### FAIL — Must fix
1. [Issue description + specific location + fix instruction]
2. ...

#### WARN — Should fix
1. [Issue description + specific location + fix instruction]
2. ...

### Fix Instructions

[For each issue, provide the specific change needed — not just "fix it" but HOW to fix it.
Include the exact text to change, add, or remove.]

### Summary
[1-2 sentences: overall assessment and recommended next action.]
```

### Step 5 — Fix (if fix mode is enabled)

If the user requested "report-and-fix" (default):

1. Apply all FAIL fixes.
2. Apply all WARN fixes.
3. Re-run the audit on the fixed version.
4. Deliver both the report AND the fixed skill.
5. Show a before/after score comparison.

## Edge cases and failure modes

| Situation                                        | Action                                                    |
|--------------------------------------------------|-----------------------------------------------------------|
| Skill has no SKILL.md                            | FAIL immediately — not a valid skill                      |
| SKILL.md exists but is empty                     | Score 0/10, recommend starting from `creating-skills`     |
| Skill scores 10/10                               | Confirm, suggest unit-test harness as next step           |
| Folder name doesn't exist (content pasted inline)| Audit the content, note folder-name check is not possible |
| References folder is empty                       | Not an issue — references/ is optional                    |
| Skill is in a non-standard location              | Audit normally, note the non-standard path                |
| User provides multiple skills to audit           | Audit each independently, provide consolidated summary    |

## Self-validation checklist

Before delivering the audit report:

- [ ] Every criterion scored (no skipped items)
- [ ] Every FAIL and WARN has a specific fix instruction (not generic advice)
- [ ] The fix instructions are actionable (exact text changes, not "improve this")
- [ ] Score accurately reflects pass/fail counts
- [ ] Verdict matches the score threshold
- [ ] If fix mode: fixes were applied AND re-audited

## References (load on demand)

- Read `references/scoring-rubric.md` for detailed pass/fail examples per criterion,
  common violation patterns, and before/after fix demonstrations.
