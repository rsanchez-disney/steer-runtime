# Git Branching Strategy — Studio Anglerfish

## Branch Types

| Branch type | Pattern                         | Purpose                                        |
|-------------|---------------------------------|------------------------------------------------|
| Development | `main` (or `master`)            | Latest development version                     |
| Release     | `release/<VERSION>`             | Release stabilization (e.g., `release/8.23`)   |
| Feature     | `feature/<NAME>`                | New feature work (e.g., `feature/cart-upsell`) |
| Sandbox     | `sandbox/<GITHUB_USER>/<TITLE>` | Individual developer work branches             |

## Workflow

- Feature branches are created from `main` and merged back via PR.
- Release branches are cut from `main` when preparing a release. Only bug fixes go into release branches.
- Hotfixes branch from the release branch and merge back into both release and `main`.

## Sandbox Branches (Developer Work)

Developers create sandbox branches for ticket work:

```
sandbox/<GITHUB_USER>/<TITLE>
```

When a ticket is tied to a specific release version, create a branch per target version:

```
sandbox/<GITHUB_USER>/<JIRA_TICKET>_8.23   ← target release version
sandbox/<GITHUB_USER>/<JIRA_TICKET>_8.24   ← cherry-pick to next release
sandbox/<GITHUB_USER>/<JIRA_TICKET>_8.25   ← master/main
```

Each branch targets its corresponding release branch (or `main` for the latest). PRs are raised against each target independently.
