---
name: generate-spec-document
description: Generate a single specification document for recently implemented changes
---

# Generate Spec Document

Create a specification document for completed changes, serving as a reference for future AI agents and developers.

## When to Use

- After implementing a new feature or architectural pattern
- After significant refactoring
- When documenting a new integration or API

## Process

### Step 1: Identify Changes

1. Run `git diff <baseBranch>...HEAD --name-only` to list changed files
2. Analyze the scope and nature of the changes
3. Determine the appropriate spec type (see table below)

### Step 2: Select Template

| Change Type | Template |
|-------------|----------|
| New component/module architecture | `architecture.md.template` |
| New or modified API endpoints | `api-contracts.md.template` |
| New domain entities or relationships | `domain-model.md.template` |
| New business logic or validation rules | `business-rules.md.template` |
| New user flows or process changes | `workflows.md.template` |
| New data structures or schemas | `data-dictionary.md.template` |

Templates are in `common/templates/specs/`.

### Step 3: Generate Spec

1. Read the selected template
2. Fill in each section based on the actual implementation
3. Include code examples from the changed files
4. Add mermaid diagrams for architecture and flow sections
5. Reference specific files and line numbers

### Step 4: Save

Save to `docs/specs/YYYYMMDD_<title>.md` (e.g., `20260326_export_api.md`).

## Output Quality

- Every section in the template must be filled (no TODOs or placeholders)
- Code examples must be from the actual codebase, not hypothetical
- Diagrams must reflect the real implementation
- Cross-reference related specs if they exist
