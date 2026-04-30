# Fork Governance Rules

## Upstream Candidate Labeling

When a PR is created on a **fork** of steer-runtime (not on the upstream repo itself), evaluate
whether the changes are generic improvements that benefit all teams.

### When to add `upstream-candidate`

Add the label `upstream-candidate` to a PR when **all** of these are true:

1. The PR is on a fork (not on `SANCR225/steer-runtime` directly)
2. At least one changed file falls in the "Sync from upstream" column of the fork strategy table:
   - Agent JSON configs (generic improvements)
   - Agent prompts (better instructions, fewer hallucinations)
   - Golden rules
   - Setup scripts or Koda changes
   - MCP server bundles or integrations
   - New common rules applicable org-wide
   - Documentation improvements
   - New agents that serve multiple teams
   - Bug fixes
3. The changes are **not** team-specific:
   - NOT memory banks or project mappings
   - NOT MCP tokens or credentials
   - NOT workspace configs (`workspaces/<team>/`)
   - NOT team-specific context files
   - NOT project-specific architecture decisions

### When NOT to add `upstream-candidate`

- PR is on the upstream repo itself (it's already upstream)
- All changes are in `workspaces/<team>/` directories
- Changes contain team-specific MCP token references or project paths
- Changes are purely additive team context files

### Mixed PRs

If a PR contains both upstream-worthy and fork-only changes:

1. Add the `upstream-candidate` label
2. Add a PR comment recommending the author split the PR:
   - One PR with the generic improvements (to be sent upstream)
   - One PR with the team-specific changes (stays in fork)

### Label format

- **Label name:** `upstream-candidate`
- **Label color:** `#0E8A16` (green)
- **Label description:** "Changes that should be contributed back to upstream steer-runtime"

### Upstream submission workflow

Once a PR with `upstream-candidate` is merged in the fork:

1. Fork owner creates a new branch from the merged changes
2. Opens a PR against `SANCR225/steer-runtime` main
3. References the original fork PR in the description
4. Removes team-specific content if any slipped through
5. Upstream maintainer reviews and merges
