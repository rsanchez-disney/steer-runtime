# Upstream Candidate Triage

A PR was just created. This hook only applies if the PR targets a steer-runtime repository (upstream `SANCR225/steer-runtime` or any team fork of it). If the PR targets a different repository, skip this analysis entirely.

Analyze the PR content against the upstream-candidate criteria.

## Qualifies for upstream

- Agent prompt improvements (better instructions, fewer hallucinations)
- New agents that serve multiple teams
- Bug fixes in setup scripts or hooks
- New MCP server integrations
- Documentation improvements
- New common rules applicable org-wide

## Does not qualify

- Team-specific memory banks or project mappings
- Team-specific MCP tokens or credentials
- Project-specific architecture decisions or conventions
- Custom code-style preferences
- One-off customizations

## Decision logic

Based on the PR title, description, and changed files:

1. If clearly generic and beneficial to all teams → add the `upstream-candidate` label to the PR
2. If clearly team-specific → do nothing, inform the user it stays fork-only
3. If mixed or unclear → ask the user whether to label it as upstream-candidate

Use the GitHub MCP tools to inspect the PR and add the label if appropriate.
