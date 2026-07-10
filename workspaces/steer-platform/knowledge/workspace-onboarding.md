# Workspace onboarding patterns

## Creating a new team workspace

### Structure

```text
workspaces/<team-name>/
├── workspace.json          ← Required: defines profiles, repos, MCP
├── context/                ← Team-specific context files
│   ├── team_context.md     ← Team conventions, architecture
│   └── memory-bank/        ← Persistent learnings (optional)
├── skills/                 ← Orchestrated workflows
│   └── <skill-name>/SKILL.md
└── profiles/               ← Profile overrides (optional)
    └── <profile>/agents/   ← Agent JSON overrides
```

### workspace.json minimal

```json
{
  "name": "team-name",
  "profiles": ["dev-core"],
  "repos": [
    { "name": "main-repo", "path": "~/Workspace/path", "lang": "TypeScript" }
  ]
}
```

### Inheritance

- `"extends": "parent-workspace"` inherits parent's context, skills, profiles
- Child overrides win on conflict
- Validate with: `make workspace-resolve WS=team-name`

### Common reviewer mistakes to catch

- Workspace JSON missing `"name"` field
- Repos with absolute paths (non-portable) — should use `~/` prefix
- Workspace touching files outside their `workspaces/<name>/` directory
- Agent overrides referencing parent-relative paths incorrectly

### Onboarding flow

1. Team creates workspace PR with JSON + context
2. Review: scoped to their directory? Paths resolve? No profile pollution?
3. Merge with squash
4. Team runs `koda sync` to pick up new workspace
5. Team runs `koda ws apply <team-name>` to activate

### Validation

```bash
make validate-workspaces    # Checks all workspaces for required fields
make workspace-resolve WS=<name>  # Resolves inheritance chain
make workspace-validate-inherit   # Validates all inheritance chains
```
