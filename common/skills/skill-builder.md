---
name: skill-builder
description: Interactive guide for creating new skills. Use when the user says "create a skill", "build a skill", "new skill", or asks to define a repeatable workflow as a skill file.
activation: manual
---

# Skill: Skill Builder

Interactive guide for creating well-structured skills for steer-runtime workspaces.

## Workflow

### Step 1: Define the Use Case

Ask the user:

1. **What does this skill do?** — Describe the workflow or task it automates.
2. **When should it trigger?** — What phrases or situations activate it?
3. **Who is the audience?** — Which location? (`shared/skills/` for global, `workspaces/{team}/skills/` for team-specific)
4. **What tools or context does it need?** — MCP servers, steering files, external CLIs
5. **Does it have checkpoints?** — Points where the user must approve before continuing

If the user already provided a clear description, extract answers from their request.

### Step 2: Plan the Skill Structure

Determine:

| Decision | Options |
|----------|---------|
| **Location** | `shared/skills/` (global) or `workspaces/{team}/skills/` (team) |
| **Activation** | `manual` (explicit invocation) or omit for auto-trigger |
| **Pattern** | Sequential, Iterative refinement, Multi-tool coordination, Context-aware, Domain-specific |

Present the plan:
- Skill name (kebab-case)
- File path
- High-level workflow steps

**⏸ CHECKPOINT — User approves the plan before writing**

### Step 3: Write the Skill File

#### Frontmatter (YAML)

```yaml
---
name: {kebab-case-name}
description: {What it does}. Use when {trigger phrases and conditions}.
activation: manual  # Only if skill should NOT auto-trigger
---
```

**Rules:**
- `name`: kebab-case, matches filename without `.md`
- `description`: WHAT it does + WHEN to use it. Under 1024 characters.
- `activation`: Include `manual` only for explicit invocation. Omit for auto-triggering.

#### Body Structure

```markdown
# Skill: {Human-Readable Name}

{One-line summary.}

## Prerequisites

- {Required tools, MCP servers, or context}

---

## Workflow

### Step N: {Step Name}

{Clear, actionable instructions.}

**⏸ CHECKPOINT — {What user must approve}**

---

## Rules

- {Constraints and error handling}
```

#### Best Practices

1. **Be specific** — "Run `npm test`" not "validate the code"
2. **Include error handling** — what to do when things fail
3. **Explicit checkpoints** — mark mandatory stops with `**⏸ CHECKPOINT**`
4. **Show expected outcomes** — what does success look like?
5. **Reference existing patterns** — point to steering files, don't duplicate

### Step 4: Validate

- [ ] Filename matches `name` field (kebab-case)
- [ ] Description includes WHAT + WHEN
- [ ] Description under 1024 characters
- [ ] Instructions are specific and actionable
- [ ] Checkpoints present for approval gates
- [ ] Error handling included
- [ ] Minimal — no over-engineering

### Step 5: Save and Confirm

1. Write the file to the determined path
2. Read it back to verify
3. Present summary: name, location, trigger conditions, steps, checkpoints

---

## Skill Improvement Mode

If the user says "improve this skill" or provides an existing skill file:

1. Read the skill file
2. Assess against the validation checklist
3. Check for: undertriggering, overtriggering, vague instructions, missing checkpoints, missing error handling
4. Present findings with specific suggestions
5. Apply changes after user approval

---

## Rules

- **Always validate with the user** before writing (Step 2 checkpoint)
- **Match existing style** — read other skills in the target directory
- **Minimal viable skill** — start simple, iterate
- **One file per skill**
- **Frontmatter is critical** — bad description = skill never triggers (or always triggers)
- **Test mentally** — imagine 3 queries that SHOULD trigger and 3 that SHOULD NOT
