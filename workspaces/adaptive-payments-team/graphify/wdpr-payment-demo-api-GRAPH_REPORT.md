# Graph Report

**Nodes:** 189 | **Edges:** 316 | **Communities:** 52

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 19 | src/api-server | 4 |
| 26 | src/api-server | 2 |
| 38 | src/api-server | 1 |
| 40 | src/api-server | 2 |
| 48 | src/api-server | 7 |
| 10 | src/api-server | 3 |
| 23 | src/api-server | 2 |
| 35 | src/api-server | 4 |
| 45 | src/api-server | 2 |
| 51 | src/test-helpers | 2 |
| 13 | src/api-server | 2 |
| 17 | src/api-server | 8 |
| 21 | src/api-server | 2 |
| 31 | src/api-server | 3 |
| 41 | src/api-server | 12 |
| 46 | src/api-server | 3 |
| 49 | src/api-server | 2 |
| 4 | src/api-server | 1 |
| 11 | src/api-server | 1 |
| 15 | src/api-server | 1 |
| 20 | src/api-server | 3 |
| 24 | src/api-server | 2 |
| 2 | src/api-server | 7 |
| 8 | src/api-server | 11 |
| 12 | src/api-server | 4 |
| 33 | src/api-server | 2 |
| 34 | src/api-server | 2 |
| 47 | src/api-server | 3 |
| 0 | root | 2 |
| 9 | src/api-server | 5 |
| 14 | src/api-server | 2 |
| 22 | src/api-server | 3 |
| 36 | src/api-server | 6 |
| 42 | src/api-server | 2 |
| 44 | src/api-server | 2 |
| 5 | src/api-server | 17 |
| 7 | src/api-server | 6 |
| 25 | src/api-server | 4 |
| 27 | src/api-server | 10 |
| 28 | src/api-server | 2 |
| 29 | src/api-server | 8 |
| 37 | src/api-server | 2 |
| 6 | src/api-server | 1 |
| 18 | src/api-server | 2 |
| 30 | src/api-server | 2 |
| 32 | src/api-server | 2 |
| 39 | src/api-server | 3 |
| 43 | src/api-server | 3 |
| 50 | src/test-helpers | 1 |
| 1 | root | 1 |
| 3 | src/api-server | 4 |
| 16 | src/api-server | 1 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| src/api-server/core/config.js | 48 | 42 | 6 |
| src/api-server/core/base-request/base-request.js | 34 | 12 | 22 |
| src/api-server/resources/session-manager/session-manager.actions.js | 21 | 4 | 17 |
| src/api-server/core/app.js | 17 | 1 | 16 |
| src/api-server/core/base-request/gccm-base-request.js | 17 | 1 | 16 |
| src/api-server/core/security/cryptographer.js | 17 | 6 | 11 |
| src/api-server/resources/vco/vco.actions.js | 14 | 1 | 13 |
| src/api-server/resources/cache-reset/get-servers-list-confluence.actions.js | 13 | 1 | 12 |
| src/api-server/core/logger.js | 11 | 8 | 3 |
| src/api-server/resources/cache-reset/reset-cache.actions.js | 10 | 1 | 9 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| gruntfile_js | src_api_server_core_config_js | root → src/api-server |
| src_api_server_core_app_js | src_api_server_core_config_js | src/api-server → src/api-server |
| src_api_server_core_app_js | src_api_server_core_health_check_js | src/api-server → src/api-server |
| src_api_server_core_base_request_base_request_js | src_api_server_core_config_js | src/api-server → src/api-server |
| src_api_server_core_base_request_base_request_js | src_api_server_core_logger_js | src/api-server → src/api-server |
| src_api_server_core_base_request_base_request_js | src_api_server_core_security_cryptographer_js | src/api-server → src/api-server |
| src_api_server_core_base_request_base_request_v5_spec_js | src_api_server_core_base_request_base_request_js | src/api-server → src/api-server |
| src_api_server_core_base_request_gccm_base_request_js | src_api_server_core_config_js | src/api-server → src/api-server |
| src_api_server_core_base_request_gccm_base_request_js | src_api_server_core_logger_js | src/api-server → src/api-server |
| src_api_server_core_base_request_gccm_base_request_js | src_api_server_core_security_cryptographer_js | src/api-server → src/api-server |
| src_api_server_core_feature_toggles_js | src_api_server_core_config_js | src/api-server → src/api-server |
| src_api_server_core_health_check_js | src_api_server_core_config_js | src/api-server → src/api-server |
| src_api_server_core_logger_js | src_api_server_core_config_js | src/api-server → src/api-server |
| src_api_server_core_properties_js | src_api_server_core_config_js | src/api-server → src/api-server |
| src_api_server_core_security_cryptographer_js | src_api_server_core_config_js | src/api-server → src/api-server |

## Suggested Questions

Questions this graph can help answer:

- What depends on `src/api-server/core/config.js` and what breaks if it changes?
- Why does `gruntfile_js` depend on `src_api_server_core_config_js` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
