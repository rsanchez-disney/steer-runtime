---
inclusion: fileMatch
fileMatchPattern: [ "**/*.dart", "pubspec.yaml", "pubspec.lock", "analysis_options.yaml" ]
description: Git workflow, branch naming, and commit conventions for the Flutter monorepo
---

# Flutter Monorepo — Git Workflow & Conventions

## Branch Naming

The monorepo enforces branch name prefixes via GitHub repository rules. Branches must match one of
these prefixes:

```
applications/{app-name}/...
monorepo/...
layer1_chassis/chassis/...
layer2_app_foundation/app_foundation/...
layer3_bc_extension/bc/...
```

### Format

```
{prefix}/{type}/{description}
```

- `{prefix}` matches the monorepo layer or application (e.g. `applications/opsheet-plus`)
- `{type}` is a conventional commit type: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`
- `{description}` is a short kebab-case summary, optionally including a ticket number

### Examples

```
applications/opsheet-plus/feat/OPS-1234-guest-counter
applications/opsheet-plus/fix/OPS-5678-null-state
applications/opsheet-plus/chore/cleanup-kiro-workspace-config
monorepo/chore/update-dependencies
layer1_chassis/chassis/feat/new-http-client
```

## Commit Messages

Follow conventional commits:

```
{type}({scope}): {description}

{optional body}
```

- `{scope}` identifies the app or package (e.g. `opsheet-plus`, `core`, `ui-components`)

### Examples

```
feat(opsheet-plus): add guest counter widget
fix(core): handle null entity in mapper
chore(opsheet-plus): remove workspace .kiro config files
```

## Pull Request Policy

- PRs target `develop` (or the relevant integration branch for the monorepo layer)
- Squash merge is enforced — each PR becomes a single commit on the target branch
- PR title must follow the same conventional commit format: `{type}({scope}): {description}`