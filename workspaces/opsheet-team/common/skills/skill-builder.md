---
name: skill-builder
description: Interactive guide for creating new skills for the steer-runtime workspace. Use when the user says "create a skill", "build a skill", "new skill", or asks to define a repeatable workflow as a skill file.
activation: manual
---

# Skill: Skill Builder

Interactive guide for creating well-structured skills for the Kiro CLI steer-runtime workspace, based on Anthropic's skill design principles.

## When to Use

- User wants to create a new skill for a profile or common area
- User wants to improve or review an existing skill
- User wants to convert a repeatable workflow into a skill

---

## Workflow

### Step 1: Define the Use Case

Ask the user:

1. **What does this skill do?** — Describe the workflow or task it automates.
2. **When should it trigger?** — What phrases or situations activate it? (e.g., "when the user says 'create a PR'", "when implementing a new endpoint")
3. **Who is the audience?** — Which profile will own this skill? (`common/skills/` for shared, `profiles/{profile}/skills/` for profile-specific)
4. **What tools or context does it need?** — MCP servers, steering files, external CLIs, etc.
5. **Does it have checkpoints?** — Are there points where the user must approve before continuing?

If the user already provided a clear description, extract the answers from their request rather than asking redundantly.

### Step 2: Plan the Skill Structure

Based on the use case, determine:

| Decision | Options |
|----------|---------|
| **Location** | `common/skills/` (shared) or `profiles/{profile}/skills/` (profile-specific) |
| **Activation** | `manual` (user must invoke explicitly) or omit for auto-trigger based on description |
| **Pattern** | Sequential workflow, Iterative refinement, Multi-tool coordination, Context-aware selection, or Domain-specific intelligence |
| **Checkpoints** | Where must the user approve before the skill continues? |

Present the plan to the user:
- Skill name (kebab-case)
- File path
- High-level workflow steps
- Key design decisions

**⏸ CHECKPOINT — User approves the plan before writing the skill**

### Step 3: Write the Skill File

Generate the skill markdown file following these rules:

#### Frontmatter (YAML)

```yaml
---
name: {kebab-case-name}
description: {What it does}. Use when {trigger phrases and conditions}.
activation: manual  # Include only if the skill should NOT auto-trigger
---
```

**Frontmatter rules:**
- `name`: kebab-case, no spaces, no capitals, matches filename without `.md`
- `description`: MUST include WHAT it does + WHEN to use it. Under 1024 characters. No XML angle brackets.
- `activation`: Include `manual` only if the skill should require explicit invocation. Omit for auto-triggering skills.
- Do NOT use "kiro" or "steer" as standalone skill names — reserved for platform internals

#### Body Structure

Follow this structure (adapt sections as needed):

```markdown
# Skill: {Human-Readable Name}

{One-line summary of purpose and when to use.}

## Prerequisites

- {Required tools, MCP servers, steering files, or CLI access}

---

## Workflow

### Step N: {Step Name}

{Clear, actionable instructions. Include:}
- What to do
- What commands to run (if any)
- What to present to the user
- Decision criteria (if/else logic)

**⏸ CHECKPOINT — {Description of what user must approve}**

{Repeat steps as needed}

---

## Rules

- {Non-negotiable constraints}
- {Error handling guidance}
- {What NOT to do}
```

#### Writing Best Practices (from Anthropic guide)

1. **Be specific and actionable** — "Run `npm run test`" not "validate the code"
2. **Include error handling** — What to do when things fail
3. **Use progressive disclosure** — Keep the main file focused; reference external docs for details
4. **Explicit checkpoints** — Mark mandatory stops with `**⏸ CHECKPOINT**`
5. **Show expected outcomes** — What does success look like at each step?
6. **Include examples** — Show real trigger phrases and expected behavior
7. **Reference existing patterns** — Point to steering files and conventions, don't duplicate them

### Step 4: Validate the Skill

Run through this checklist before saving:

- [ ] Filename is kebab-case matching the `name` field (e.g., `my-skill.md` → `name: my-skill`)
- [ ] Description includes WHAT + WHEN (trigger conditions)
- [ ] Description is under 1024 characters
- [ ] No XML angle brackets in frontmatter
- [ ] Instructions are clear and actionable (no vague "validate properly")
- [ ] Checkpoints are present where user approval is needed
- [ ] Error handling is included for likely failure modes
- [ ] Rules section defines boundaries and constraints
- [ ] Minimal — no unnecessary complexity or over-engineering
- [ ] Compatible with existing workspace patterns (check other skills in the target directory for style)

### Step 5: Save and Confirm

1. Write the file to the determined path
2. Read it back to verify
3. Present a summary to the user:
   - Skill name and location
   - Trigger conditions
   - Number of workflow steps
   - Key checkpoints
   - Any follow-up items (e.g., "add to a profile's README", "create supporting context files")

---

## Skill Improvement Mode

If the user says "improve this skill", "review this skill", or provides an existing skill file:

1. Read the skill file
2. Assess against the validation checklist above
3. Check for common issues:
   - **Undertriggering**: Description too vague or missing trigger phrases
   - **Overtriggering**: Description too broad, will activate on unrelated tasks
   - **Vague instructions**: Steps that say "handle appropriately" without specifics
   - **Missing checkpoints**: User should approve before destructive or irreversible actions
   - **Missing error handling**: No guidance on what to do when things fail
   - **Bloated**: Too much inline content that should be in references or steering files
4. Present findings with specific improvement suggestions
5. Apply changes after user approval

---

## Patterns Reference

Choose the pattern that best fits the use case:

### Sequential Workflow
Steps execute in strict order with dependencies between them.
Best for: onboarding flows, PR creation, deployment pipelines.

### Iterative Refinement
Output is generated, validated, and improved in a loop until quality criteria are met.
Best for: document generation, code review, spec writing.

### Multi-Tool Coordination
Workflow spans multiple MCP servers or external tools in phases.
Best for: cross-repo handoffs, design-to-dev pipelines.

### Context-Aware Selection
Same goal, different execution path based on context (file type, project, environment).
Best for: smart routing, adaptive implementations.

### Domain-Specific Intelligence
Embeds specialized knowledge that guides tool usage and decision-making.
Best for: compliance checks, architecture enforcement, triage workflows.

---

## Rules

- **Never create a skill with "kiro" or "steer" as a standalone name** — these are reserved for platform internals
- **Always validate with the user** before writing the file (Step 2 checkpoint)
- **Match existing style** — read other skills in the target directory for tone and structure
- **Minimal viable skill** — start simple, iterate. Don't over-engineer on first pass
- **One file per skill** — no README.md inside skill directories in this workspace
- **Frontmatter is critical** — a bad description means the skill never triggers (or triggers on everything)
- **Test mentally** — before saving, imagine 3 queries that SHOULD trigger and 3 that SHOULD NOT. Verify the description handles both cases.
- **Always write in English** — all skill content (title, description, steps, rules) must be in English regardless of the user's language
