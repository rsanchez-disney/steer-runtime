# Local Workspaces — Testing Guide

## What are local workspaces?

Local workspaces let you test a workspace configuration **before committing it** to steer-runtime. This is useful when:

- Creating a new workspace for your team
- Modifying workspace profiles, context, or skills
- Testing steering rules or agent changes
- Iterating on workspace config without pushing to the repo

## How to use

### Pass a local path to `--ws`

```bash
# Absolute path
koda chat --ws /path/to/steer-runtime/workspaces/my-new-team

# Relative path
koda chat --ws ./workspaces/my-new-team

# Home-relative path
koda chat --ws ~/Workspace/steer-runtime/workspaces/my-new-team

# Direct workspace.json path
koda chat --ws /path/to/workspaces/my-new-team/workspace.json
```

### What happens

1. Koda detects the path (contains `/` or starts with `.`)
2. Verifies `workspace.json` exists at that location
3. Shows a warning:

```
  ⚠️  LOCAL WORKSPACE (testing mode)
  Path: /path/to/workspaces/my-new-team
  This workspace is not committed to steer-runtime.
  Changes here won't affect other users until pushed.
```

4. Walks up the directory tree to find the steer-runtime root (looks for `profiles/` directory)
5. Reads the workspace name from `workspace.json`
6. Materializes the workspace using the local steer-runtime as source
7. Launches chat normally with the workspace's agents and context

### With a target

Works with all targets:

```bash
koda chat --ws ./workspaces/my-new-team --target geai
koda chat --ws ./workspaces/my-new-team --target kiro
koda chat --ws ./workspaces/my-new-team --target cursor
```

## Workflow: creating a new workspace

### Step 1: Create workspace.json

```bash
mkdir -p workspaces/my-new-team
cat > workspaces/my-new-team/workspace.json << 'EOF'
{
  "name": "my-new-team",
  "description": "My team workspace",
  "profiles": ["dev-core", "dev-web", "qa"],
  "default_agent": "orchestrator",
  "projects": [],
  "rules": ["conventional_commit"],
  "enable_tools": true,
  "workspace_path": "${WORKSPACE_ROOT}/my-project"
}
EOF
```

### Step 2: Add context (optional)

```bash
mkdir -p workspaces/my-new-team/context
cat > workspaces/my-new-team/context/team_context.md << 'EOF'
# My Team Context
...
EOF
```

### Step 3: Test locally

```bash
koda chat --ws ./workspaces/my-new-team --target geai
```

### Step 4: Iterate

Edit `workspace.json`, context files, steering rules, skills — then re-run:

```bash
koda chat --ws ./workspaces/my-new-team --target geai
```

Each run re-materializes from the local path, picking up your changes immediately.

### Step 5: Commit when ready

Once everything works:

```bash
git add workspaces/my-new-team/
git commit -m "feat(workspace): add my-new-team workspace"
git push
# Create PR
```

## How it differs from `--steer-root`

| Flag | What it does | When to use |
|------|-------------|-------------|
| `--ws my-team` | Looks up workspace by name from installed steer-runtime | Normal usage — workspace already committed |
| `--ws ./path/to/workspace` | Materializes from local path | Testing uncommitted workspaces |
| `--steer-root /path/to/repo` | Changes where Koda looks for ALL workspaces | Testing an entire branch of steer-runtime |

`--ws /path` is the simplest option for testing a single workspace. Use `--steer-root` when testing broader steer-runtime changes (new profiles, global hooks, etc.).

## Limitations

- The local path must contain a valid `workspace.json`
- The steer-runtime root must be discoverable (parent directory with `profiles/`)
- Workspace is materialized to `~/.kiro/workspaces/<name>/` (same as committed workspaces)
- If a workspace with the same name is already materialized, it gets overwritten
- Local workspace data doesn't persist across `koda sync` (sync overwrites from the committed repo)

## Tips

- Keep your local workspace in a steer-runtime checkout (branch) so profiles resolve correctly
- Use `koda chat --ws ./workspaces/my-team --target geai` for fastest iteration (no kiro-cli dependency)
- Test with `--agent orchestrator` to verify the delegation map includes your workspace's agents
- Run `koda doctor` after materializing to verify everything looks correct
