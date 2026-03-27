---
name: generate-plan
description: Break down a task into an incremental implementation plan with small, testable steps
---

# Generate Plan

Create an implementation plan with small, testable, incremental steps.

## Context Gathering

### Step 0: Read Project Config

1. Look for `project.yaml` in the project root
2. If found, read: `stack`, `baseBranch`, `commands.build`, `commands.test`, `commands.lint`, `integrations.jira.projectKey`, `workspace.specsDir`
3. If not found, check memory bank or `.kiro/context/` for equivalent info
4. If neither exists, ask the user

### Step 1: Gather Context from MCP (if available)

1. **Jira** — fetch ticket details (summary, description, ACs, subtasks, linked issues)
2. **Confluence/MyWiki** — search for related design docs or ADRs
3. **GitHub** — check for related PRs or issues

### Step 2: Analyze Codebase

1. Identify relevant files, modules, and patterns
2. Review existing tests for the affected area
3. Note dependencies and integration points

## Plan Structure

Generate a plan with this format:

```markdown
# Implementation Plan: <TICKET-ID> — <Title>

## Context
Brief summary of what needs to be done and why.

## Steps

### Step 1: <Description>
- Files: `path/to/file.ts`
- Changes: What to add/modify
- Tests: What to verify
- Estimated complexity: Low/Medium/High

### Step 2: <Description>
...

## Risks & Considerations
- List any risks, edge cases, or dependencies

## Out of Scope
- What this ticket does NOT include
```

## Guidelines

- Each step should be **independently testable** — if you stopped after any step, the code should compile and tests should pass
- Order steps by dependency — foundational changes first
- Keep steps small — if a step has more than ~3 file changes, split it
- Include test expectations for every step
- Flag steps that need user input or decisions
