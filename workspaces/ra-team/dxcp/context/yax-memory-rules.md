---
inclusion: always
---

# Yax Persistent Memory Rules (DXCP)

## Session Lifecycle

At the start of every session:
1. Call `yax_session_start` with the current project name and directory
2. Call `yax_search` for relevant prior knowledge about the current task
3. Call `yax_context` to retrieve recent observations for this project

At the end of a session (PR created, task completed, user says done):
1. Call `yax_session_summary` with a concise summary of what was accomplished
2. Call `yax_session_end`

## What to Save (yax_save)

Save observations after:
- **Architecture decisions** — override naming choices, addon design patterns, blueprint structure decisions
- **Bugfixes with root cause** — why something broke and how it was fixed
- **Patterns discovered** — Rafay quirks, Helm pitfalls, AWS gotchas, Jira field behavior
- **Configuration discoveries** — account IDs, cluster naming, API behaviors learned during troubleshooting
- **Operational procedures** — steps that worked for specific scenarios (not documented elsewhere)
- **Team preferences** — coding conventions, PR format preferences, review criteria

### Observation Types

Use the appropriate type for each save:

| Type | When |
|------|------|
| `decision` | Architecture/design choices (ADR-like) |
| `architecture` | System structure, component relationships |
| `bugfix` | Root cause + fix for issues |
| `pattern` | Reusable approaches, Rafay/Helm/AWS patterns |
| `config` | Infrastructure config, field mappings, API behaviors |
| `discovery` | New findings about tools, APIs, platform behavior |
| `learning` | Team learnings, operational knowledge |

### Topic Keys (for deduplication)

Use structured topic keys to enable upsert deduplication:

```
rafay/override/<override-name>         # Override-specific knowledge
rafay/addon/<addon-name>               # Addon-specific knowledge
helm/<chart-name>                       # Chart-specific knowledge
aws/<account-profile>                   # Account-specific knowledge
cluster/<cluster-name>                  # Cluster-specific knowledge
jira/field/<field-name>                 # Jira field behavior
release-cycle/<sprint>/<env>            # Release cycle outcomes
troubleshooting/<component>             # Troubleshooting patterns
```

## What NOT to Save

- Secrets, tokens, API keys, credentials
- Routine lookups (things already in context/ docs)
- Rejected approaches (unless the rejection reason is valuable)
- Raw conversation text
- Transient state (current PR numbers, WIP branch names)

## Knowledge Graph (yax_link)

Connect related observations:
- Link override observations to their parent addon
- Link bugfixes to the component/cluster they affected
- Link release cycle observations to the environment
- Link Jira ticket learnings to their domain area

Relationship types: `depends_on`, `relates_to`, `caused_by`, `supersedes`, `validates`

## Team Knowledge Sharing

Observations saved with shareable types (decision, architecture, pattern, discovery) are eligible for team sync via `koda knowledge push`. This exports knowledge to a git branch that team members can pull.

## DXCP-Specific Memory Patterns

### After Addon Work
```
yax_save(type="pattern", topic_key="rafay/addon/<name>", content="...")
yax_link(source=<addon_obs>, target=<override_obs>, relationship="depends_on")
```

### After Troubleshooting
```
yax_save(type="bugfix", topic_key="troubleshooting/<component>", content="Root cause: ... Fix: ...")
```

### After Release Cycle
```
yax_save(type="discovery", topic_key="release-cycle/<sprint>/<env>", content="Outcome: ...")
```

### After Jira/Confluence Discovery
```
yax_save(type="config", topic_key="jira/field/<field>", content="Behavior: ...")
```
