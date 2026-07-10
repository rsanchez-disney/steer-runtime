# Graph Report

**Nodes:** 208 | **Edges:** 202 | **Communities:** 25

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 24 | internal/tui | 13 |
| 1 | internal/cli | 22 |
| 7 | internal/mcp | 20 |
| 12 | internal/project | 4 |
| 17 | internal/store | 3 |
| 21 | internal/store | 14 |
| 23 | internal/store | 4 |
| 4 | internal/cli | 1 |
| 6 | internal/dedup | 3 |
| 10 | internal/mcp | 8 |
| 11 | internal/project | 6 |
| 14 | internal/store | 6 |
| 15 | internal/store | 2 |
| 20 | internal/store | 8 |
| 2 | internal/cli | 2 |
| 3 | internal/cli | 2 |
| 5 | internal/dedup | 3 |
| 18 | internal/store | 9 |
| 19 | internal/store | 5 |
| 22 | internal/store | 23 |
| 0 | cmd/yax | 2 |
| 8 | internal/mcp | 13 |
| 9 | internal/mcp | 11 |
| 13 | internal/store | 7 |
| 16 | internal/store | 17 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| internal/cli/cli.go | 24 | 0 | 24 |
| internal/mcp/handlers.go | 22 | 0 | 22 |
| internal/store/sync.go | 22 | 0 | 22 |
| internal/store/observations.go | 16 | 0 | 16 |
| internal/tui/tui.go | 14 | 0 | 14 |
| internal/mcp/server.go | 14 | 0 | 14 |
| internal/store/store_test.go | 13 | 0 | 13 |
| internal/mcp/handlers_test.go | 13 | 0 | 13 |
| internal/store/security_test.go | 8 | 0 | 8 |
| internal/store/doctor.go | 7 | 0 | 7 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

No cross-community imports detected.

## Suggested Questions

Questions this graph can help answer:

- What depends on `internal/cli/cli.go` and what breaks if it changes?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
