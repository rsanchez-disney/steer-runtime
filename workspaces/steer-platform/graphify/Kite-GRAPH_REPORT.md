# Graph Report

**Nodes:** 600 | **Edges:** 909 | **Communities:** 96

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 75 | packages/renderer | 19 |
| 14 | packages/main | 12 |
| 29 | packages/main | 5 |
| 34 | packages/main | 5 |
| 35 | packages/main | 3 |
| 44 | packages/renderer | 13 |
| 81 | packages/renderer | 4 |
| 12 | packages/main | 3 |
| 13 | packages/main | 2 |
| 11 | packages/main | 6 |
| 33 | packages/main | 5 |
| 45 | packages/renderer | 6 |
| 64 | packages/renderer | 9 |
| 65 | packages/renderer | 6 |
| 77 | packages/renderer | 5 |
| 47 | packages/renderer | 8 |
| 49 | packages/renderer | 5 |
| 60 | packages/renderer | 12 |
| 80 | packages/renderer | 3 |
| 95 | scripts | 1 |
| 18 | packages/main | 3 |
| 40 | packages/main | 2 |
| 56 | packages/renderer | 3 |
| 59 | packages/renderer | 4 |
| 84 | packages/renderer | 8 |
| 87 | packages/renderer | 2 |
| 6 | packages/main | 3 |
| 66 | packages/renderer | 6 |
| 9 | packages/main | 7 |
| 15 | packages/main | 3 |
| 19 | packages/main | 3 |
| 28 | packages/main | 2 |
| 41 | packages/main | 2 |
| 46 | packages/renderer | 6 |
| 68 | packages/renderer | 4 |
| 91 | packages/renderer | 3 |
| 3 | packages/main | 3 |
| 16 | packages/main | 5 |
| 17 | packages/main | 14 |
| 22 | packages/main | 7 |
| 25 | packages/main | 9 |
| 54 | packages/renderer | 5 |
| 79 | packages/renderer | 7 |
| 88 | packages/renderer | 5 |
| 63 | packages/renderer | 2 |
| 90 | packages/renderer | 3 |
| 20 | packages/main | 9 |
| 50 | packages/renderer | 2 |
| 51 | packages/renderer | 2 |
| 58 | packages/renderer | 12 |
| 70 | packages/renderer | 15 |
| 89 | packages/renderer | 4 |
| 93 | packages/renderer | 1 |
| 61 | packages/renderer | 7 |
| 71 | packages/renderer | 15 |
| 78 | packages/renderer | 9 |
| 82 | packages/renderer | 3 |
| 83 | packages/renderer | 7 |
| 85 | packages/renderer | 3 |
| 1 | packages/main | 19 |
| 31 | packages/main | 5 |
| 38 | packages/main | 3 |
| 57 | packages/renderer | 11 |
| 74 | packages/renderer | 14 |
| 76 | packages/renderer | 16 |
| 4 | packages/main | 9 |
| 5 | packages/main | 2 |
| 8 | packages/main | 6 |
| 53 | packages/renderer | 5 |
| 72 | packages/renderer | 10 |
| 86 | packages/renderer | 5 |
| 30 | packages/main | 6 |
| 32 | packages/main | 8 |
| 39 | packages/main | 2 |
| 42 | packages/main | 1 |
| 92 | packages/renderer | 1 |
| 94 | packages/shared | 23 |
| 27 | packages/main | 3 |
| 10 | packages/main | 3 |
| 48 | packages/renderer | 5 |
| 73 | packages/renderer | 5 |
| 2 | packages/main | 7 |
| 21 | packages/main | 7 |
| 23 | packages/main | 5 |
| 24 | packages/main | 5 |
| 26 | packages/main | 5 |
| 36 | packages/main | 12 |
| 43 | packages/renderer | 1 |
| 55 | packages/renderer | 9 |
| 0 | root | 1 |
| 7 | packages/main | 3 |
| 37 | packages/main | 10 |
| 52 | packages/renderer | 4 |
| 62 | packages/renderer | 18 |
| 67 | packages/renderer | 6 |
| 69 | packages/renderer | 3 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| packages/renderer/src/App.tsx | 49 | 1 | 48 |
| packages/main/src/ipc.ts | 43 | 0 | 43 |
| packages/main/src/acp-bridge.ts | 29 | 0 | 29 |
| packages/renderer/src/components/SettingsPanel.tsx | 25 | 1 | 24 |
| packages/renderer/src/components/ProfileRadar.tsx | 23 | 1 | 22 |
| packages/shared/src/index.ts | 22 | 0 | 22 |
| packages/renderer/src/components/ChatArea.tsx | 21 | 1 | 20 |
| packages/renderer/src/components/SentinelPanel.tsx | 21 | 1 | 20 |
| packages/renderer/src/stores/app.ts | 21 | 18 | 3 |
| packages/renderer/src/components/KnowledgeGraph.tsx | 20 | 1 | 19 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| packages_main_tests_module_registry_test_ts | packages_main_src_services_module_registry_ts | packages/main → packages/main |
| packages_main_tests_module_registry_test_ts | packages_main_src_services_identity_ts | packages/main → packages/main |
| packages_main_tests_session_metrics_test_ts | packages_main_src_services_session_metrics_ts | packages/main → packages/main |
| packages_main_tests_sustainment_module_test_ts | packages_main_src_services_module_registry_ts | packages/main → packages/main |
| packages_main_tests_sustainment_module_test_ts | packages_main_src_services_identity_ts | packages/main → packages/main |
| packages_renderer_src_app_tsx | packages_renderer_src_hooks_usestreamevents_ts | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_hooks_usekeyboardshortcuts_ts | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_stores_session_ts | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_stores_app_ts | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_components_dynamicsidebar_tsx | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_components_chatarea_tsx | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_components_promptinput_tsx | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_components_fileexplorer_tsx | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_components_mcpbrowser_tsx | packages/renderer → packages/renderer |
| packages_renderer_src_app_tsx | packages_renderer_src_components_githubdashboard_tsx | packages/renderer → packages/renderer |

## Suggested Questions

Questions this graph can help answer:

- What depends on `packages/renderer/src/App.tsx` and what breaks if it changes?
- Why does `packages_main_tests_module_registry_test_ts` depend on `packages_main_src_services_module_registry_ts` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
