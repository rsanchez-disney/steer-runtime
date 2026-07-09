# Graph Report

**Nodes:** 364 | **Edges:** 773 | **Communities:** 88

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 42 | src/api-server | 4 |
| 54 | src/api-server | 1 |
| 78 | src/api-server | 1 |
| 32 | src/api-server | 3 |
| 43 | src/api-server | 2 |
| 57 | src/api-server | 2 |
| 59 | src/api-server | 6 |
| 38 | src/api-server | 12 |
| 46 | src/api-server | 1 |
| 12 | src/api-server | 2 |
| 0 | root | 2 |
| 67 | src/api-server | 2 |
| 72 | src/api-server | 19 |
| 14 | src/api-server | 2 |
| 16 | src/api-server | 2 |
| 41 | src/api-server | 3 |
| 75 | src/api-server | 4 |
| 7 | src/api-server | 1 |
| 18 | src/api-server | 1 |
| 44 | src/api-server | 7 |
| 71 | src/api-server | 1 |
| 74 | src/api-server | 1 |
| 84 | src/keycloak-plugin | 3 |
| 3 | src/api-server | 1 |
| 9 | src/api-server | 1 |
| 25 | src/api-server | 13 |
| 29 | src/api-server | 8 |
| 64 | src/api-server | 1 |
| 81 | src/keycloak-plugin | 11 |
| 20 | src/api-server | 1 |
| 36 | src/api-server | 3 |
| 45 | src/api-server | 2 |
| 56 | src/api-server | 3 |
| 63 | src/api-server | 2 |
| 70 | src/api-server | 2 |
| 73 | src/api-server | 2 |
| 15 | src/api-server | 1 |
| 21 | src/api-server | 6 |
| 60 | src/api-server | 2 |
| 79 | src/keycloak-plugin | 8 |
| 10 | src/api-server | 1 |
| 24 | src/api-server | 1 |
| 26 | src/api-server | 1 |
| 27 | src/api-server | 9 |
| 28 | src/api-server | 3 |
| 40 | src/api-server | 4 |
| 87 | test | 1 |
| 5 | src/api-server | 2 |
| 19 | src/api-server | 4 |
| 85 | src/keycloak-plugin | 14 |
| 2 | src/api-server | 13 |
| 4 | src/api-server | 6 |
| 11 | src/api-server | 1 |
| 34 | src/api-server | 2 |
| 35 | src/api-server | 1 |
| 39 | src/api-server | 2 |
| 48 | src/api-server | 2 |
| 58 | src/api-server | 1 |
| 22 | src/api-server | 1 |
| 30 | src/api-server | 3 |
| 49 | src/api-server | 1 |
| 50 | src/api-server | 9 |
| 61 | src/api-server | 1 |
| 65 | src/api-server | 30 |
| 76 | src/api-server | 2 |
| 80 | src/keycloak-plugin | 4 |
| 47 | src/api-server | 7 |
| 51 | src/api-server | 2 |
| 52 | src/api-server | 11 |
| 55 | src/api-server | 3 |
| 66 | src/api-server | 2 |
| 68 | src/api-server | 2 |
| 69 | src/api-server | 11 |
| 23 | src/api-server | 1 |
| 31 | src/api-server | 5 |
| 62 | src/api-server | 7 |
| 77 | src/api-server | 1 |
| 82 | src/keycloak-plugin | 2 |
| 86 | src/test-helpers | 1 |
| 13 | src/api-server | 2 |
| 1 | root | 1 |
| 6 | src/api-server | 3 |
| 17 | src/api-server | 2 |
| 53 | src/api-server | 2 |
| 83 | src/keycloak-plugin | 8 |
| 8 | src/api-server | 15 |
| 33 | src/api-server | 5 |
| 37 | src/api-server | 3 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| src/api-server/core/constants.js | 58 | 58 | 0 |
| src/api-server/resources/travel-request/crew/crew.actions.js | 39 | 3 | 36 |
| src/api-server/core/util.js | 39 | 19 | 20 |
| src/api-server/resources/travel-requests/travel-requests.action.js | 29 | 1 | 28 |
| src/keycloak-plugin/lib/authn/dcl-keycloak-response-processor.js | 22 | 1 | 21 |
| src/api-server/resources/travel-request-details/travel-request-details.action.js | 20 | 2 | 18 |
| src/api-server/core/app.js | 19 | 1 | 18 |
| src/keycloak-plugin/lib/util/dcl-keycloak-helpers.js | 19 | 3 | 16 |
| src/api-server/resources/port-hotel/port-hotel.action.js | 18 | 2 | 16 |
| src/api-server/resources/hotel-report/hotel-report.actions.js | 17 | 1 | 16 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| src_api_server_core_config_local_js | src_api_server_core_config_default_js | src/api-server → src/api-server |
| src_api_server_core_config_js | src_api_server_core_security_config_js | src/api-server → src/api-server |
| src_api_server_core_requester_keycloak_js | src_api_server_core_logger_js | src/api-server → src/api-server |
| src_api_server_core_requester_keycloak_js | src_api_server_core_constants_js | src/api-server → src/api-server |
| src_api_server_core_requester_swell_steps_js | src_api_server_core_constants_js | src/api-server → src/api-server |
| src_api_server_core_requester_swell_steps_js | src_api_server_core_logger_js | src/api-server → src/api-server |
| src_api_server_core_util_js | src_api_server_core_logger_js | src/api-server → src/api-server |
| src_api_server_core_util_js | src_api_server_core_constants_js | src/api-server → src/api-server |
| src_api_server_core_util_js | src_api_server_resources_travel_request_crew_crew_constants_js | src/api-server → src/api-server |
| src_api_server_resources_hotel_hotel_list_action_js | src_api_server_core_util_js | src/api-server → src/api-server |
| src_api_server_resources_hotel_hotel_list_action_js | src_api_server_core_constants_js | src/api-server → src/api-server |
| src_api_server_resources_hotel_hotel_list_routes_js | src_api_server_resources_hotel_hotel_list_action_js | src/api-server → src/api-server |
| src_api_server_resources_hotel_hotel_list_routes_js | src_api_server_core_constants_js | src/api-server → src/api-server |
| src_api_server_resources_hotel_hotel_stay_action_js | src_api_server_core_util_js | src/api-server → src/api-server |
| src_api_server_resources_hotel_hotel_stay_action_js | src_api_server_core_constants_js | src/api-server → src/api-server |

## Suggested Questions

Questions this graph can help answer:

- What depends on `src/api-server/core/constants.js` and what breaks if it changes?
- Why does `src_api_server_core_config_local_js` depend on `src_api_server_core_config_default_js` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
