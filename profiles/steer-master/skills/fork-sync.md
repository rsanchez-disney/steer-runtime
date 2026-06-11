# Skill: Fork Sync

Bidirectional fork sync — pull upstream changes into fork and push upstream-candidate PRs back to the main repo.

Use when the user mentions syncing fork, pulling upstream, pushing to upstream, upstream candidates, or bidirectional sync.

---

## Prerequisites

- Remote `upstream` points to the canonical steer-runtime repo (e.g., `SANCR225/steer-runtime`)
- Remote `origin` points to the team fork
- GitHub MCP server configured and authenticated
- Fork PRs intended for upstream are labeled `upstream-candidate`

Verify remotes:

```bash
git remote -v
# origin    git@<github-host>:<team-org>/steer-runtime.git (fetch)
# upstream  git@<github-host>:<upstream-org>/steer-runtime.git (fetch)
```

---

## Direction 1: Downstream (Upstream → Fork)

Pull latest upstream changes into the fork.

### Steps

1. Fetch upstream

```bash
git fetch upstream --tags
```

2. Merge into fork main

```bash
git checkout main
git merge upstream/main
```

3. Resolve conflicts if any — conflicts typically appear in:
   - `common/rules/` (team-specific rules)
   - `workspaces/` (team workspace configs)
   - Custom context files added by the fork

4. Create a sync branch and push

```bash
git checkout -b sync/upstream-$(date +%Y%m%d)
git push -u origin sync/upstream-$(date +%Y%m%d)
```

5. Open a PR for team review using the GitHub MCP server

Use the appropriate `@github/*` `create_pr` tool:

- **repo**: `<team-org>/steer-runtime`
- **head**: `sync/upstream-YYYYMMDD`
- **base**: `main`
- **title**: `sync: merge upstream/main YYYY-MM-DD`
- **body**:
  ```
  ## Downstream sync

  Merges latest upstream/main into fork.

  ### Conflicts resolved
  - <list conflicts and resolution strategy>

  ### Validation
  - [ ] koda check passes
  - [ ] No team-specific content lost
  ```

> **Rule**: Always use `@github/*` MCP tools — never use `gh` CLI via shell.

6. Verify installation

```bash
koda check
```

### When to run

- Weekly (recommended cadence)
- Immediately after a new upstream release tag (`v*.*.0`)
- Before starting upstream-candidate work (ensures clean base)

---

## Direction 2: Upstream (Fork → Upstream via `upstream-candidate`)

Push fork improvements back to the main repo using cherry-pick from labeled PRs.

### Steps

1. List merged candidates

Use the `@github/*` `search_prs` tool to find merged PRs with the `upstream-candidate` label:

- **repo**: `<team-org>/steer-runtime`
- **state**: `closed`

Then filter for the `upstream-candidate` label from results.

2. For each candidate, create an upstream branch

```bash
git checkout -b upstream/<short-description> upstream/main
```

3. Cherry-pick the merge commit

```bash
git cherry-pick -m 1 <mergeCommit-sha>
```

   If the PR had multiple meaningful commits:

```bash
git cherry-pick <commit1> <commit2> ...
```

4. Review the diff — strip team-specific content

   These must NOT go upstream:
   - Memory banks or project-specific context
   - MCP tokens or credentials
   - Team workspace configs
   - Project-specific architecture decisions
   - Custom code-style preferences

```bash
git diff upstream/main --stat
```

5. Run tests for affected MCP servers

```bash
cd shared/tools/mcp-servers/<affected-server> && npm test
```

6. Push branch to fork remote

```bash
git push -u origin upstream/<short-description>
```

7. Open PR against upstream using the GitHub MCP server

Use the `@github/*` `create_pr` tool:

- **repo**: `<upstream-org>/steer-runtime`
- **base**: `main`
- **head**: `<team-org>:upstream/<short-description>`
- **title**: `<type>: <description>`
- **body**:
  ```
  Cherry-picked from fork PR #<number>.
  Original: <fork-pr-url>

  ## Changes
  - <summary of what this contributes>

  ## Validation
  - [ ] No team-specific content included
  - [ ] Tests pass for affected MCP servers
  - [ ] koda check passes on upstream/main + this branch
  ```

> **Rule**: Always use `@github/*` MCP tools — never use `gh` CLI via shell.

8. After upstream merges, remove the label

Use the `@github/*` `update_pr` tool to remove the `upstream-candidate` label from the original fork PR.

### What qualifies for upstream

- ✅ Agent prompt improvements
- ✅ New agents serving multiple teams
- ✅ Bug fixes in setup scripts or hooks
- ✅ New MCP server integrations
- ✅ Documentation improvements
- ✅ Common rules applicable org-wide
- ❌ Team-specific memory banks or project mappings
- ❌ Team-specific MCP tokens or credentials
- ❌ Project-specific architecture or conventions
- ❌ One-off customizations

---

## Combined sync session

When running both directions in one session:

1. Downstream first — ensures your fork is current
2. Upstream second — cherry-picks are based on a clean, up-to-date upstream/main
3. Verify — `koda check` after each direction

---

## Conflict resolution guidance

| File location         | Resolution strategy                              |
|-----------------------|--------------------------------------------------|
| `shared/context/`    | Accept upstream, re-add team additions separately |
| `common/rules/`      | Merge both — team rules are additive             |
| `profiles/*/agents/` | Accept upstream unless team added MCP servers     |
| `workspaces/`        | Keep fork version (team-specific)                |
| `shared/hooks/`      | Accept upstream                                  |
| `docs/`              | Accept upstream, re-add team docs if needed       |
