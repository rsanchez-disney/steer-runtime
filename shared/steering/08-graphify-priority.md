---
inclusion: always
---

<!-- Supersedes the Koda-installed graphify.md with more detailed workspace resolution rules -->

# Graphify — Code Knowledge Graph Priority

## Rule

Before exploring a codebase with `grep`, `glob`, `find`, or reading multiple files to understand project structure:

1. **Check if a GRAPH_REPORT exists** for the current project in:
   - `~/.kiro/workspaces/<workspace>/graphify/<project>-GRAPH_REPORT.md`
   - `~/.kiro/workspaces/<workspace>/context/graphify/<project>/GRAPH_REPORT.md`
   - `<project-root>/graphify-out/GRAPH_REPORT.md`

2. **If it exists, read it first.** The GRAPH_REPORT contains:
   - All files and their module/community groupings
   - Dependency relationships (who imports what)
   - God nodes (high-coupling hotspots)
   - Surprising cross-module connections
   - Suggested questions the graph can answer

3. **Then go to the specific files** referenced in the report — no need to grep the entire repo.

4. **Only fall back to grep/glob exploration** if:
   - No GRAPH_REPORT exists for this project
   - The report doesn't cover what you need (e.g., file content, test data, config values)
   - You need information the graph can't provide (runtime behavior, env variables, secrets)

## Why

A GRAPH_REPORT gives you the full architectural map in ~500 tokens. Exploring with grep/find costs 10,000+ tokens and 15+ tool calls to achieve the same understanding. Always prefer the graph when available.

## Workspace Resolution

To find the right GRAPH_REPORT:
- Match the current repo/project name against the filenames in the graphify directory
- The workspace is identified from the steering context (e.g., `05-ccs-workspace.md` → `ccs-team`)
- If unsure which workspace, check `~/.kiro/workspaces/` for directories containing `graphify/`
