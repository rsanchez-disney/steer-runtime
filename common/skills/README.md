# Skills Library

Reusable multi-step workflows invokable across IDEs.

## What are skills?

Skills are standalone prompt files that define a complete workflow — from context gathering through execution. Unlike agents (which are persistent personas), skills are one-shot: invoke them, they run, they're done.

## Available Skills

### Core Workflow

| Skill                 | Description                                               |
|-----------------------|-----------------------------------------------------------|
| [implement-ticket]    | Jira story → branch → implement → tests → PR              |
| [ship-it]             | Commit → push → PR → merge flow                           |
| [generate-plan]       | Break down a task into an incremental implementation plan |
| [fix-failing-test]    | Diagnose and fix a failing test                           |
| [review-changed-code] | Review staged/committed changes against base branch       |

### Spec-Driven Development

| Skill                          | Description                                               |
|--------------------------------|-----------------------------------------------------------|
| [generate-base-specifications] | Bootstrap project spec documents from codebase analysis   |
| [generate-spec-document]       | Generate a single spec from a template                    |

### Documentation

| Skill                    | Description                                                |
|--------------------------|------------------------------------------------------------|
| [format-markdown-tables] | Format markdown tables so pipe characters align vertically |

## Usage

### Kiro CLI

```bash
kiro-cli chat --prompt common/skills/implement-ticket.md
```

### Cursor

Skills are compiled to `.cursor/skills/` by `setup.sh cursor install`.

### Amazon Q

Skills are compiled to `.amazonq/rules/` as reference prompts.

## Creating New Skills

1. Create a new `.md` file in this directory
2. Add YAML frontmatter with `name`, `description`
3. Write the workflow steps in markdown
4. Reference `project.yaml` or memory banks for project-specific config

<!-- Links -->
[fix-failing-test]: fix-failing-test.md
[format-markdown-tables]: format-markdown-tables.md
[generate-base-specifications]: generate-base-specifications.md
[generate-plan]: generate-plan.md
[generate-spec-document]: generate-spec-document.md
[implement-ticket]: implement-ticket.md
[review-changed-code]: review-changed-code.md
[ship-it]: ship-it.md
