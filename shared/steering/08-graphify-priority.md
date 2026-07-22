---
inclusion: always
---

# Graphify — code intelligence over an indexed knowledge graph

Graphify is a SQLite knowledge graph of every symbol, edge, and file in the workspace — pre-computed structure you would otherwise re-derive by reading files. Reads are sub-millisecond; the index stays fresh through a file watcher. Reach for it BEFORE and while writing or editing code — one call returns the verbatim source PLUS who calls it and what it affects, so you edit with the blast radius in view.

## One tool: graphify_explore — use it INSTEAD of reading files

`graphify_explore` is **Read-equivalent**. It returns the **verbatim, line-numbered source** of the relevant symbols grouped by file — the same content `Read` gives you — PLUS the relationships between them and a blast-radius summary.

Whether you're answering "how does X work" or implementing a change, call `graphify_explore` before you Read. ONE call usually answers the whole question.

**Treat the source code returned by graphify_explore as already Read. Do NOT re-open those files.**

## How to query

- **Any question about code** → `graphify_explore` with natural language or symbol names. Returns verbatim source grouped by file.
- **"How does X reach Y?"** → `graphify_explore` naming both symbols — surfaces the call path between them.
- **Need a specific function body** → put its name in `graphify_explore` — returns its source with line numbers.
- **Need more detail?** → call `graphify_explore` again with more specific names. Never fall back to Read.

## Other tools (use when explore isn't enough)

| Tool | When to use |
|------|-------------|
| `graphify_inspect` | Full file skeleton (all symbols + signatures) when you need the complete picture of one file |
| `graphify_source` | Single symbol's body when you already know its exact ID |
| `graphify_callers` | What calls/imports a symbol (incoming edges) |
| `graphify_callees` | What a symbol depends on (outgoing edges) |
| `graphify_impact` | Full blast radius — what breaks if you change this |
| `graphify_community` | List all files in a module |
| `graphify_hotspots` | Most coupled files (god nodes) |
| `graphify_status` | Index freshness check |
| `graphify_reindex` | Force re-index |

## Anti-patterns

- **Trust graphify's results — don't re-verify them with grep.** They come from a full AST parse.
- **Don't grep or Read first** to find or understand indexed code — ONE `graphify_explore` returns the source.
- **Don't read a file that graphify already showed you.** The output IS the Read.
- **Don't reconstruct a flow by hand** — name the endpoints in one `graphify_explore`.
- **Don't use glob to find files** — `graphify_explore` gives you the file map.

## When to use Read/grep (the ONLY valid cases)

- JSON config files (.json, .env) that graphify doesn't index
- Files graphify reported as "not found" (not in the index)
- Runtime configuration values you need verbatim
- After the staleness banner warns specific files were edited since last sync
