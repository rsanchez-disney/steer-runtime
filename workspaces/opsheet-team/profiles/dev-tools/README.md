# Dev Tools Profile

Shared skills and utilities available to all OpSheet+ agents. Provides cross-cutting skills that any profile can activate.

Requires `dev-core` as a base.

## Agents (0)

## Skills (1)

| Skill                  | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| fetch-ticket-context   | Fetch and cache JIRA ticket context for the session  |

## Structure

```
profiles/dev-tools/
└── skills/
    └── fetch-ticket-context.md
```

## Install

Included automatically via the `opsheet-team` workspace. Can also be installed manually:

```bash
./setup.sh install dev-tools
```
