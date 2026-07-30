# Creating skills — guide

## What is a skill

A skill is a reusable workflow packaged as a folder. It tells an agent *how* to do something step by step — like a recipe it follows every time.

```
my-skill/
├── SKILL.md              ← the workflow (required)
├── references/           ← supporting detail (optional)
│   ├── patterns.md
│   └── examples.md
└── scripts/              ← automation helpers (optional)
    └── validate.sh
```

## When to create a skill

- You repeat the same workflow more than once a week
- The instructions are longer than 3-4 sentences
- You want to share the workflow with your team
- You want consistent output every time

## When NOT to create a skill

- One-off task (just ask the agent directly)
- Fits in 2 sentences (too simple — just say it)
- Does 5 unrelated things (split into 5 skills)
- You need a tool/API connection (that's an MCP server, not a skill)

## Quick start

### Ask the agent to create it for you

```
koda chat --agent skill_builder_agent
```

```
Create a skill for my PR review process. I check for security issues,
test coverage, naming conventions, and always leave a summary comment.
```

The agent will interview you (max 3 questions), then produce the full folder.

### Or create manually

1. Create the directory:

```bash
mkdir -p ~/.kiro/skills/reviewing-pull-requests
```

2. Create `SKILL.md`:

```markdown
---
name: reviewing-pull-requests
description: >-
  Reviews pull requests for security, test coverage, and naming conventions.
  Use when the user asks to review a PR, check code quality, or validate changes.
---

# Reviewing Pull Requests

## When to use

- User says "review this PR" or "check these changes"
- User wants code quality feedback before merging

## Workflow

### Step 1 — Read the diff

Read all changed files. Identify scope (how many files, which layers).

### Step 2 — Check security

Look for:
- Hardcoded secrets or tokens
- SQL injection vectors
- Unvalidated user input

### Step 3 — Check test coverage

- Are new functions tested?
- Do existing tests still pass with these changes?

### Step 4 — Check naming conventions

- Variables: camelCase
- Functions: descriptive verbs
- Files: kebab-case

### Step 5 — Deliver review

Post a summary comment with:
- Overall verdict (approve / request changes)
- Issues found (grouped by severity)
- Suggestions (non-blocking improvements)

## Edge cases

| Situation | Action |
|-----------|--------|
| Diff too large (>50 files) | Focus on high-risk files only, note what was skipped |
| No tests in the repo | Note the gap, don't block on it |
| Binary files changed | Skip content review, flag for manual check |
```

## Anatomy of SKILL.md

### Frontmatter (required)

```yaml
---
name: verb-ing-noun
description: >-
  One sentence: what it does + when to use it.
  Keep under 1024 characters. Include keywords users would say.
---
```

**Name rules:**
- Verb-ing form: `creating-`, `reviewing-`, `deploying-`
- Lowercase, hyphens only
- Matches the folder name exactly

**Description rules:**
- Contains *what* it does AND *when* to trigger it
- Has keywords matching realistic user prompts
- Not a trigger list (those go in "When to use")

### Body structure

```markdown
# Title

## When to use
(bullet list of trigger phrases/situations)

## When NOT to use
(prevents misrouting — points to other skills)

## Inputs
(table: what the agent needs from the user)

## Workflow
### Step 1 — Verb something
### Step 2 — Verb something else
...

## Edge cases
(table: situation → action)

## Output format
(what the user receives)
```

### References folder (optional)

Put detail here that's only needed sometimes:
- Scoring rubrics
- Pattern catalogs
- Example templates
- Domain-specific lookup tables

Rules:
- One level deep only (`references/file.md`, not nested)
- Files over 100 lines should have a TOC at the top
- Each file starts with a brief purpose description

## Quality checklist

Score your skill against these 10 criteria:

| # | Criterion | Check |
|:-:|-----------|-------|
| 1 | Frontmatter valid (name + description) | |
| 2 | Name is verb-ing, lowercase, hyphenated, matches folder | |
| 3 | Description has what + when + keywords | |
| 4 | Body under 500 lines (extract to references/ if longer) | |
| 5 | Steps use explicit action verbs in order | |
| 6 | Heavy detail extracted to references/ | |
| 7 | Forward slashes in all paths | |
| 8 | Edge cases documented (at least 3) | |
| 9 | Output format clearly specified | |
| 10 | At least 1 concrete example (input → output) | |

**Scoring:**
- 9-10: Production-ready
- 7-8: Needs minor fixes
- 0-6: Major rewrite needed

Or just ask: `audit this skill` — the `skill_builder_agent` will score it for you.

## Tips

- Keep SKILL.md under 350 lines — if it's growing, extract to `references/`
- Start every step with an action verb (Read, Check, Generate, Validate)
- Include "When NOT to use" — it prevents the wrong agent from picking up your skill
- Write the description as if it's a search result — would you click it for the right query?
- Test with 3 realistic prompts: does the description match all of them?

## Where skills live

| Location | Scope |
|----------|-------|
| `~/.kiro/skills/` | Available to all agents in all sessions |
| `profiles/<profile>/skills/` | Installed with the profile |
| `workspaces/<team>/skills/` | Team-specific, installed with workspace |
| `.kiro/skills/` (project root) | Project-specific |

## Examples of good skill names

| Good | Why |
|------|-----|
| `reviewing-pull-requests` | Verb-ing + noun, clear scope |
| `generating-api-tests` | Specific output type |
| `migrating-database-schemas` | Specific domain action |
| `auditing-security-configs` | Clear what gets audited |

| Bad | Why |
|-----|-----|
| `pr-review` | Not verb-ing form |
| `helper` | Too vague |
| `do_stuff` | Underscores, vague |
| `my-awesome-skill` | Not descriptive |

## Next steps

- Run `koda chat --agent skill_builder_agent` and describe your workflow
- Or copy the template above and fill in the sections
- Audit your skill: "score this skill" → get a 0-10 rating with fix instructions
- Share with your team by adding to your workspace's `skills/` directory
