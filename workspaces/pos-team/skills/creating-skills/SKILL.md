---
name: creating-skills
description: >-
  Creates, audits, and iterates on Anthropic-format skills (SKILL.md + references/ + scripts/)
  following open-standard best practices. Use when the user wants to build a new skill, evaluate
  an existing skill, or convert a prompt/workflow into a reusable skill folder.
---

# Creating Skills

## Purpose

Create production-ready skills in the Anthropic open-standard format — from discovery through
evaluation. Takes a user's workflow, prompt, or idea and produces a complete skill folder
(`SKILL.md` + `references/` + optional `scripts/` and `assets/`) that scores ≥ 9/10 on the
best-practices audit. Also audits and improves existing skills.

## When to use

- User wants to create a new skill from a workflow they repeat frequently.
- User wants to convert an existing prompt or agent instruction into a proper skill.
- User asks to evaluate or audit an existing skill against best practices.
- User says "make this reusable", "turn this into a skill", or "package this workflow".
- User has a skill scoring below 9/10 and wants to improve it.

## When NOT to use

- User wants to use/invoke an existing skill (just use it directly).
- User needs a one-off prompt that won't be repeated (not worth a skill).
- User's workflow fits in 2-3 sentences (too simple for a skill).
- User needs a tool/MCP server, not a skill (skills are instructions, tools are capabilities).

## Inputs

| Input                           | Required | Notes                                              |
|---------------------------------|:--------:|----------------------------------------------------|
| Workflow description or idea    |  Yes*    | What the user does repeatedly                      |
| Existing prompt/skill to convert|  Yes*    | Raw material to transform                          |
| Domain context                  |    No    | Helps write better description and "When to use"   |
| Target audience                 |    No    | Affects degree of freedom and language choices      |

*One of the first two is required.

## Workflow

### Step 1 — Discovery interview

Assess whether this should be a skill at all:

| Signal                                    | Decision         |
|-------------------------------------------|------------------|
| Workflow repeats > 1x/week                | ✅ Worth a skill  |
| Instructions > 3-4 sentences             | ✅ Worth a skill  |
| Want to share with team                   | ✅ Worth a skill  |
| One-off task                              | ❌ Just do it     |
| Fits in 2 sentences                       | ❌ Too simple     |
| Does 5 unrelated things                   | ❌ Split into 5   |

If the workflow does 3+ distinct things, recommend splitting into multiple skills.

Ask **at most 3 questions** to clarify:
1. What triggers this workflow? (→ becomes the `description`)
2. What does the output look like? (→ becomes the Output section)
3. How predictable is the process? (→ determines degree of freedom)

### Step 2 — Determine degree of freedom

| Level    | When                                | Style                          |
|----------|-------------------------------------|--------------------------------|
| **Low**  | Predictable workflows (validation, CI/CD, data quality) | Numbered steps, fixed order |
| **Medium** | Exploratory analysis              | Main steps fixed, details open |
| **High** | Creative outputs (copy, design)    | Constraints only, no fixed steps |

Never make a predictable workflow "high freedom" (ambiguous) or a creative workflow "low freedom" (robotic).

### Step 3 — Write the frontmatter

**`name`** rules:
- Verb-ing form: `analyzing-`, `generating-`, `reviewing-`, `creating-`
- Lowercase + hyphens only. Max 64 chars.
- Must match the folder name.
- ❌ Never use `claude` or `anthropic` as part of the name.

**`description`** rules:
- Single sentence, max 1024 chars.
- Structure: **(a) what it does + (b) when to use it + routing keywords**.
- This is the most important line — the agent matches prompts against it.

Test the description: "If a user said X, would this description match?" Try 3 example prompts
mentally. If it wouldn't match any, rewrite it.

### Step 4 — Write the body

Follow this canonical structure:

```markdown
# [Title matching the skill name]

## Purpose
[What problem it solves — 2-3 sentences max.]

## When to use
[Bullet list of positive triggers.]

## When NOT to use
[Bullet list of exclusions — prevents false matches.]

## Inputs
[Table: what the skill needs to work.]

## Workflow
[Numbered steps with clear verbs. Branch points explicit.]

## Output
[Structure of the deliverable — format, sections, examples.]

## Edge cases and failure modes
[Table: situation → action.]

## Self-validation checklist
[What to verify before delivering.]

## References (load on demand)
[Pointers to references/ files with brief description of when to load each.]
```

**Hard limit: <500 lines.** If you're approaching 400, move detail to `references/`.

### Step 5 — Create references (if needed)

Move to `references/` when:
- A section would exceed 100 lines if inline.
- Content is only relevant in specific sub-cases (progressive disclosure).
- Examples are long and would bloat the body.

Rules for reference files:
- One level deep only: `references/file.md`, never `references/subfolder/file.md`.
- If file >100 lines: add a TOC at the top.
- Include a brief description of purpose at the top of each file.
- Forward slashes always in paths.

### Step 6 — Audit (10-point checklist)

Score the skill 0-10 against these criteria:

| #  | Criterion                                    | Pass condition                                    |
|:--:|:---------------------------------------------|:--------------------------------------------------|
|  1 | Frontmatter valid and well-formed            | YAML parses, `name` + `description` present       |
|  2 | `name` follows conventions                   | Verb-ing, lowercase, hyphens, matches folder      |
|  3 | `description` is "what + when" with keywords | Single sentence, would match real user prompts    |
|  4 | Body <500 lines                              | Measured with `wc -l`                             |
|  5 | Explicit steps with clear verbs              | Every step starts with an action verb             |
|  6 | References/assets only when needed           | No bloated body; refs load on-demand              |
|  7 | Forward slashes in all paths                 | Zero backslashes anywhere                         |
|  8 | Edge cases and failure modes                 | Dedicated section with at least 3 scenarios       |
|  9 | Output format well specified                 | Reader knows exactly what they'll get             |
| 10 | Examples complete                            | At least 1 input→output example (inline or refs)  |

**Target: ≥ 9/10.** If below, iterate before delivering.

### Step 7 — Deliver

Provide:
1. **The complete skill folder** — ready to drop into `.kiro/skills/` or `.claude/skills/`.
2. **Audit score** — the 10-point table with pass/fail per criterion.
3. **Suggestions** — if score < 10, what to fix.
4. **Registration instructions** — how to wire it into the agent config.

## Output

The deliverable is a folder structure:

```
<skill-name>/
├── SKILL.md                    ← <500 lines, frontmatter + body
├── references/                 ← optional, on-demand markdown
│   └── <topic>.md
├── scripts/                    ← optional, executable code
│   └── <script>.py
└── assets/                     ← optional, templates/data files
    └── <template>.md
```

Plus an audit scorecard and registration snippet.

## Edge cases and failure modes

| Situation                                        | Action                                                   |
|--------------------------------------------------|----------------------------------------------------------|
| User's workflow does 5 unrelated things           | Recommend splitting into separate skills                 |
| User's workflow is 2 sentences                   | Advise against making a skill — too simple               |
| Existing skill scores 10/10 already             | Confirm and suggest unit-test harness as next step       |
| User provides a prompt with persona ("You are...") | Extract the workflow, drop the persona framing          |
| Description matches too broadly                  | Narrow with "When NOT to use" + more specific keywords   |
| Body approaching 500 lines                       | Extract sections to references/ proactively              |
| User wants a skill for a tool capability         | Explain skill vs. tool distinction, redirect if needed   |

## Anti-patterns to flag

When auditing or creating, always flag these:

- ❌ `description` vague or too broad → never triggers or triggers wrong
- ❌ Body >500 lines without delegation to references/
- ❌ Backslashes in paths → breaks cross-platform
- ❌ Mega-skill doing 5 things → split it
- ❌ Missing "When NOT to use" → false matches guaranteed
- ❌ Role-assignment opening ("You are a...") → use Purpose section instead
- ❌ Name as noun/role instead of verb-ing
- ❌ Folder name doesn't match `name` in frontmatter
- ❌ References nested deeper than one level
- ❌ No examples anywhere (body or references)

## Self-validation checklist

Before delivering a new skill:

- [ ] Would 3 different realistic prompts trigger this skill's description?
- [ ] Could someone unfamiliar with the domain follow the workflow?
- [ ] Is every step actionable (starts with a verb)?
- [ ] Does the "When NOT to use" prevent at least 2 realistic false matches?
- [ ] Is the output format clear enough to verify programmatically?
- [ ] Are all paths forward-slash only?
- [ ] Would this score ≥ 9/10 on the audit checklist?
- [ ] Is the folder name lowercase-hyphenated and matches `name`?

## References (load on demand)

- Read `references/best-practices-checklist.md` for the complete audit rubric with examples
  of passing vs. failing skills, scoring rationale, and common fix patterns.
