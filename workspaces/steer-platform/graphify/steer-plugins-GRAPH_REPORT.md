# Graph Report

**Nodes:** 26 | **Edges:** 52 | **Communities:** 7

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 0 | intellij/src | 4 |
| 1 | intellij/src | 3 |
| 2 | vscode/src | 3 |
| 3 | vscode/src | 3 |
| 4 | vscode/src | 8 |
| 5 | vscode/src | 2 |
| 6 | vscode/src | 3 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| intellij/src/main/kotlin/com/disney/steer/ACPClient.kt | 13 | 0 | 13 |
| vscode/src/chatView.ts | 11 | 1 | 10 |
| vscode/src/acpClient.ts | 10 | 2 | 8 |
| vscode/src/extension.ts | 7 | 0 | 7 |
| intellij/src/main/kotlin/com/disney/steer/SteerToolWindowFactory.kt | 6 | 0 | 6 |
| vscode/src/agentPicker.ts | 6 | 1 | 5 |
| vscode/src/contextProvider.ts | 5 | 2 | 3 |
| AgentPicker | 1 | 1 | 0 |
| addMessage | 1 | 1 | 0 |
| ACPClient | 1 | 1 | 0 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| vscode_src_chatview_ts | vscode_src_acpclient_ts | vscode/src → vscode/src |
| vscode_src_chatview_ts | vscode_src_contextprovider_ts | vscode/src → vscode/src |
| vscode_src_extension_ts | vscode_src_chatview_ts | vscode/src → vscode/src |
| vscode_src_extension_ts | vscode_src_acpclient_ts | vscode/src → vscode/src |
| vscode_src_extension_ts | vscode_src_agentpicker_ts | vscode/src → vscode/src |
| vscode_src_extension_ts | vscode_src_contextprovider_ts | vscode/src → vscode/src |

## Suggested Questions

Questions this graph can help answer:

- What depends on `intellij/src/main/kotlin/com/disney/steer/ACPClient.kt` and what breaks if it changes?
- Why does `vscode_src_chatview_ts` depend on `vscode_src_acpclient_ts` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
