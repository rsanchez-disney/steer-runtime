# Graph Report

**Nodes:** 147 | **Edges:** 225 | **Communities:** 26

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 3 | backend/src | 3 |
| 4 | backend/src | 1 |
| 5 | backend/src | 4 |
| 14 | frontend/src | 4 |
| 16 | frontend/src | 3 |
| 20 | frontend/src | 2 |
| 9 | desktop/electron | 6 |
| 10 | frontend/src | 3 |
| 11 | frontend/src | 3 |
| 12 | frontend/src | 14 |
| 15 | frontend/src | 3 |
| 17 | frontend/src | 2 |
| 23 | frontend/src | 3 |
| 24 | frontend/src | 2 |
| 1 | backend/src | 1 |
| 2 | backend/src | 18 |
| 7 | backend/src | 11 |
| 8 | backend/src | 23 |
| 18 | frontend/src | 4 |
| 19 | frontend/src | 2 |
| 25 | shared/types | 8 |
| 6 | backend/src | 12 |
| 21 | frontend/src | 2 |
| 22 | frontend/src | 2 |
| 13 | frontend/src | 4 |
| 0 | backend/src | 7 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| backend/src/services/settings.ts | 26 | 0 | 26 |
| backend/src/routes.ts | 25 | 0 | 25 |
| frontend/src/app/core/models/index.ts | 13 | 0 | 13 |
| backend/src/services/mock-jira.ts | 12 | 0 | 12 |
| backend/src/services/jira.ts | 12 | 0 | 12 |
| desktop/electron/main.ts | 10 | 0 | 10 |
| frontend/src/app/core/services/api.service.ts | 9 | 4 | 5 |
| frontend/src/app/features/team-detail/team-detail.component.ts | 9 | 0 | 9 |
| frontend/src/app/shared/components/traffic-light/traffic-light.component.ts | 8 | 3 | 5 |
| frontend/src/app/shared/components/header/header.component.ts | 8 | 1 | 7 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| frontend_src_app_app_component_ts | frontend_src_app_shared_components_header_header_component_ts | frontend/src → frontend/src |
| frontend_src_app_app_component_ts | frontend_src_app_shared_components_pat_setup_modal_pat_setup_modal_component_ts | frontend/src → frontend/src |
| frontend_src_app_features_dashboard_dashboard_component_ts | frontend_src_app_core_services_api_service_ts | frontend/src → frontend/src |
| frontend_src_app_features_dashboard_dashboard_component_ts | frontend_src_app_core_services_loading_service_ts | frontend/src → frontend/src |
| frontend_src_app_features_dashboard_dashboard_component_ts | frontend_src_app_shared_components_traffic_light_traffic_light_component_ts | frontend/src → frontend/src |
| frontend_src_app_features_team_detail_team_detail_component_ts | frontend_src_app_core_services_api_service_ts | frontend/src → frontend/src |
| frontend_src_app_features_team_detail_team_detail_component_ts | frontend_src_app_shared_components_traffic_light_traffic_light_component_ts | frontend/src → frontend/src |
| frontend_src_app_features_team_detail_team_detail_component_ts | frontend_src_app_shared_components_sprint_progress_chart_sprint_progress_chart_component_ts | frontend/src → frontend/src |
| frontend_src_app_features_team_detail_team_detail_component_ts | frontend_src_app_shared_components_burndown_chart_burndown_chart_component_ts | frontend/src → frontend/src |
| frontend_src_app_shared_components_header_header_component_ts | frontend_src_app_shared_components_theme_toggle_theme_toggle_component_ts | frontend/src → frontend/src |
| frontend_src_app_shared_components_header_header_component_ts | frontend_src_app_core_services_api_service_ts | frontend/src → frontend/src |
| frontend_src_app_shared_components_theme_toggle_theme_toggle_component_ts | frontend_src_app_core_services_theme_service_ts | frontend/src → frontend/src |
| frontend_src_app_shared_components_traffic_light_traffic_light_component_spec_ts | frontend_src_app_shared_components_traffic_light_traffic_light_component_ts | frontend/src → frontend/src |
| frontend_src_main_ts | frontend_src_app_app_component_ts | frontend/src → frontend/src |

## Suggested Questions

Questions this graph can help answer:

- What depends on `backend/src/services/settings.ts` and what breaks if it changes?
- Why does `frontend_src_app_app_component_ts` depend on `frontend_src_app_shared_components_header_header_component_ts` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
