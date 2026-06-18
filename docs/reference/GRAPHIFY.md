# Graphify — Code Knowledge Graph

## What is Graphify?

Graphify is a native Go engine built into Koda that generates a **code knowledge graph** from any project's source files. It produces a dependency map of files, functions, classes, and their relationships — enabling AI agents to understand project architecture instantly without expensive file-by-file exploration.

## Why?

AI agents (kiro-cli) typically spend thousands of tokens per session doing `grep`, `find`, and `fs_read` operations to understand project structure. A pre-built knowledge graph gives the agent instant access to:

- **File-level dependency map** — which files import/export what
- **Architecture communities** — which files belong together (Louvain clustering)
- **God nodes** — highly-connected coupling hotspots
- **Surprising connections** — unexpected cross-community dependencies

This reduces per-session token consumption significantly and improves response quality, especially for architecture questions, code review, and implementation planning.

## How It Works

Graphify runs a 7-step pipeline:

```
Detect → Extract → Build → Cluster → Analyze → Export → HTML
```

| Step | Description |
|------|-------------|
| **Detect** | Walks project directory, categorizes files by language (skips node_modules, .git, etc.) |
| **Extract** | Regex-based extraction of imports, functions, classes, interfaces per file |
| **Build** | Deduplicates nodes, validates edges, creates Graph struct |
| **Cluster** | Louvain community detection — groups related files into modules |
| **Analyze** | Identifies god nodes (top degree) and surprising cross-community connections |
| **Export** | Writes `graph.json` + `GRAPH_REPORT.md` |
| **HTML** | Generates interactive visualization (`graph.html`) |

### Supported Languages

TypeScript, JavaScript, Go, Python, Java, Kotlin, Rust, Dart, C#, Swift, Ruby, PHP, C, C++, Scala

### Key Properties

- **Zero external dependencies** — pure Go, no Python, no network calls
- **Cross-platform** — CGO_ENABLED=0, works on macOS/Linux/Windows
- **Fast** — 2000+ node graphs in under 1 second
- **Deterministic** — seeded RNG ensures reproducible community assignments

## Output Location

Graphs are stored in the workspace namespace:

```
~/.kiro/workspaces/<workspace-id>/graphify/
├── <project-name>/
│   ├── graph.json         # Full graph (nodes + edges + communities)
│   ├── GRAPH_REPORT.md    # Human-readable summary
│   └── graph.html         # Interactive visualization (open in browser)
```

This keeps source repos clean — no generated files in project directories.

## CLI Commands

### Graphify all projects in a workspace

```bash
koda graphify <workspace-name>
```

Generates graphs for every project listed in the workspace's `workspace.json`. Projects without a valid local path are skipped.

**Example:**
```bash
$ koda graphify adaptive-payments-team

📊 Graphify workspace: adaptive-payments-team (5 projects)

  ✓ wdpr-payment-controls-client — 1847 nodes, 3201 edges, 42 communities
  ✓ wdpr-payment-controls-api — 923 nodes, 1544 edges, 28 communities
  ✓ wdpr-config-services — 645 nodes, 1102 edges, 19 communities
  ⊘ wdpr-gcp-admin — path not found, skipping
  ✓ gcp-guest-services — 312 nodes, 487 edges, 11 communities

Done: 4 succeeded, 1 skipped, 0 failed
Output: ~/.kiro/workspaces/adaptive-payments-team/graphify/
```

### Graphify all projects in the active workspace

```bash
koda graphify --all
```

Uses the currently active workspace (as set by `koda workspace apply`).

### Graphify a single project

```bash
koda graphify <project-name>
```

Runs on one project from the active workspace. If no workspace is active, uses the current directory.

### TUI

Press `[G]` in the Koda dashboard to access the graphify screen. Projects with an existing graph show ⚡, others show ○.

## Agent Integration

When graphify runs, it installs a steering file at `~/.kiro/steering/graphify.md` that instructs agents to:

1. Check `~/.kiro/workspaces/<active-workspace>/graphify/<project>/` first
2. Read `GRAPH_REPORT.md` for high-level architecture overview
3. Query `graph.json` for specific dependency questions
4. Avoid expensive grep/find operations when the graph already has the answer

### Example Agent Prompt

> "What are the main architectural modules in wdpr-payment-controls-client?"

Without graphify: Agent reads 50+ files → 10,000+ tokens spent exploring.

With graphify: Agent reads `GRAPH_REPORT.md` → 500 tokens, instant answer with community breakdown.

## Graph Schema

### Nodes

```json
{
  "id": "src/services/PaymentService.ts",
  "label": "PaymentService.ts",
  "file_type": "code",
  "source_file": "src/services/PaymentService.ts",
  "kind": "file",
  "community": 3
}
```

### Edges

```json
{
  "source": "src/controllers/CartController.ts",
  "target": "src/services/PaymentService.ts",
  "relation": "imports",
  "confidence": "EXTRACTED",
  "weight": 1.0
}
```

### Relations

| Relation | Description |
|----------|-------------|
| `imports` | File A imports/requires file B |
| `calls` | Function A calls function B |
| `implements` | Class implements interface |
| `defines` | File defines a symbol |

## When to Re-run

Re-generate graphs when:
- Major refactoring or new modules added
- New team member needs architecture context
- After a sprint with significant structural changes

The graph is a snapshot — it doesn't auto-update. Run `koda graphify <workspace>` periodically or before architecture-heavy sessions.
