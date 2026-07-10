# Graph Report

**Nodes:** 121 | **Edges:** 208 | **Communities:** 23

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 7 | packages/sdk | 26 |
| 9 | packages/sdk | 3 |
| 12 | packages/sdk | 2 |
| 20 | packages/sdk-react | 19 |
| 22 | root | 1 |
| 1 | examples/demo-app | 1 |
| 5 | packages/sdk | 1 |
| 8 | packages/sdk | 3 |
| 11 | packages/sdk | 9 |
| 16 | packages/sdk | 24 |
| 18 | packages/sdk-electron | 4 |
| 19 | packages/sdk-electron | 4 |
| 0 | examples/demo-app | 2 |
| 14 | packages/sdk | 4 |
| 2 | packages/sdk | 2 |
| 4 | packages/sdk | 1 |
| 10 | packages/sdk | 3 |
| 13 | packages/sdk | 2 |
| 15 | packages/sdk | 2 |
| 17 | packages/sdk-electron | 3 |
| 21 | packages/sdk-react | 3 |
| 3 | packages/sdk | 1 |
| 6 | packages/sdk | 1 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| packages/sdk/src/types.ts | 34 | 11 | 23 |
| packages/sdk/src/index.ts | 28 | 0 | 28 |
| packages/sdk/src/scoring/engine.ts | 17 | 0 | 17 |
| packages/sdk-react/src/index.ts | 10 | 0 | 10 |
| packages/sdk-react/src/ChatPanel.tsx | 9 | 2 | 7 |
| packages/sdk-react/src/ResponseBubble.tsx | 9 | 3 | 6 |
| packages/sdk/src/tokens/manager.ts | 9 | 2 | 7 |
| packages/sdk/src/core/acp-client.ts | 8 | 4 | 4 |
| packages/sdk/src/sessions/store.ts | 8 | 1 | 7 |
| packages/sdk/src/streaming/async-iterator.ts | 8 | 2 | 6 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| packages_sdk_src_discovery_agents_ts | packages_sdk_src_types_ts | packages/sdk → packages/sdk |
| packages_sdk_src_discovery_mcp_ts | packages_sdk_src_types_ts | packages/sdk → packages/sdk |
| packages_sdk_src_discovery_workspaces_ts | packages_sdk_src_types_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_types_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_streaming_router_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_tokens_manager_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_tools_registry_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_sessions_store_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_discovery_workspaces_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_discovery_agents_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_discovery_mcp_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_tokens_manager_ts | packages/sdk → packages/sdk |
| packages_sdk_src_index_ts | packages_sdk_src_tools_registry_ts | packages/sdk → packages/sdk |
| packages_sdk_src_powers_registry_ts | packages_sdk_src_types_ts | packages/sdk → packages/sdk |
| packages_sdk_src_sessions_store_ts | packages_sdk_src_types_ts | packages/sdk → packages/sdk |

## Suggested Questions

Questions this graph can help answer:

- What depends on `packages/sdk/src/types.ts` and what breaks if it changes?
- Why does `packages_sdk_src_discovery_agents_ts` depend on `packages_sdk_src_types_ts` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
