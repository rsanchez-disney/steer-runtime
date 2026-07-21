---
inclusion: always
---

# Graphify — Code Knowledge Graph Priority

## Rule

Before exploring a codebase with `grep`, `glob`, `find`, or reading multiple files to understand project structure, **use the graphify MCP tools first**.

## Priority Order

### 1. Graphify MCP Tools (preferred)

If `@graphify/*` tools are available, use them as the primary exploration method:

| Tool | When to use |
|------|-------------|
| `graphify_explore` | First call — natural language query to find relevant files, relationships, and module structure |
| `graphify_callers` | Find what imports/calls a given file or symbol |
| `graphify_callees` | Find what a file/symbol depends on |
| `graphify_impact` | Blast radius — what breaks if I change this? |
| `graphify_community` | List all files in a module/community |
| `graphify_hotspots` | Find high-coupling god nodes |
| `graphify_status` | Check if the index is fresh |
| `graphify_reindex` | Force re-index if stale (>7 days) |

**Flow:**
1. Call `graphify_explore` with your question (accepts natural language)
2. Review the returned files, relationships, and communities
3. Read specific files from the results — no need to grep the entire repo
4. Use `graphify_callers`/`graphify_callees` for dependency tracing
5. Use `graphify_impact` before proposing changes to understand blast radius

### 2. Static GRAPH_REPORT (fallback)

If graphify MCP tools are NOT available (no `@graphify/*` in your tools list), check for a static report:

- `~/.kiro/workspaces/<workspace>/graphify/<project>-GRAPH_REPORT.md`
- `<project-root>/graphify-out/GRAPH_REPORT.md`

Read it first if it exists — it gives you the full architectural map in ~500 tokens.

### 3. grep/glob/find (last resort)

Only fall back to manual exploration if:
- No graphify tools are available AND no GRAPH_REPORT exists
- The graph doesn't cover what you need (file content, test data, config values, runtime behavior)
- You need very recent changes not yet indexed (check `graphify_status` first)

## Why

| Method | Token cost | Tool calls | Freshness |
|--------|-----------|------------|----------|
| `graphify_explore` | ~200-400 tokens | 1 | Live (file watcher) |
| GRAPH_REPORT.md | ~500 tokens | 1 (read) | Static (may be stale) |
| grep + read files | 10,000+ tokens | 15+ calls | Always current |

The MCP approach is both cheaper and gives richer results (relationships, communities, impact analysis) that grep cannot provide.

## Auto-generation

The graphify MCP server auto-generates the index the first time it runs for a project. If `graphify_status` shows the index is empty or very stale, call `graphify_reindex` to refresh it.
