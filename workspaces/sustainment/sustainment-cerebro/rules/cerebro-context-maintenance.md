# Context maintenance rule

After completing any code change that modifies feature behavior, update the relevant documentation.
This ensures all developers and agents always have accurate context.

## When to update

| Trigger                              | Update target                              |
|--------------------------------------|--------------------------------------------|
| Feature behavior changed             | `<repo>/.kiro/specs/<feature>.md`          |
| New feature developed                | Create new `<repo>/.kiro/specs/<feature>.md`|
| Architectural decision made          | Add to Decisions section of the spec       |
| File moved/renamed                   | Update file manifest in the spec           |
| Tech stack upgraded                  | `<repo>/.kiro/steering/02-tech.md`         |
| New anti-alucinación pattern found   | `<repo>/.kiro/steering/03-patterns.md`     |
| Cross-repo convention changed        | `cerebro-team/steering/00-cerebro-foundation.md` |
| New production issue with pattern    | `sustainment-cerebro/context/incident_patterns.md` |

## When NOT to update

- Routine bug fixes that do not change external behavior
- Refactors that keep the same external behavior
- Test-only changes
- Dependency version bumps (unless they change APIs)

## Where things live

| Content                    | Location                              |
|----------------------------|---------------------------------------|
| Feature specs (lean)       | `<repo>/.kiro/specs/<feature>.md`     |
| Structure and paths        | `<repo>/.kiro/steering/01-structure.md`|
| Tech stack and commands    | `<repo>/.kiro/steering/02-tech.md`    |
| Anti-alucinación patterns  | `<repo>/.kiro/steering/03-patterns.md`|
| Cross-repo conventions     | `cerebro-team/steering/`              |
| Incident patterns          | `sustainment-cerebro/context/`        |

## How to update

1. Identify which file is affected
2. Read the current content
3. Apply the minimal edit that reflects the new behavior
4. Preserve existing content — append or modify, do not rewrite entire files
5. Spec updates go in the **same PR as the code change**

## Auto-update scope

This rule applies automatically when working on any Cerebro project listed in `workspace.json`.
The agent does NOT need user approval to update specs or steering — these are documentation, not code.
