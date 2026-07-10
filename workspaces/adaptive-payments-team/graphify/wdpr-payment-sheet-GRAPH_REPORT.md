# Graph Report

**Nodes:** 500 | **Edges:** 1581 | **Communities:** 103

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 49 | src/app | 3 |
| 19 | src/app | 6 |
| 42 | src/app | 2 |
| 70 | src/app | 7 |
| 88 | src/static | 1 |
| 96 | src/static | 5 |
| 98 | src/static | 1 |
| 47 | src/app | 3 |
| 29 | src/app | 4 |
| 39 | src/app | 9 |
| 43 | src/app | 3 |
| 67 | src/app | 5 |
| 87 | src/static | 1 |
| 93 | src/static | 1 |
| 101 | src | 1 |
| 12 | src/app | 4 |
| 22 | src/app | 2 |
| 17 | src/app | 11 |
| 36 | src/app | 3 |
| 53 | src/app | 5 |
| 56 | src/app | 3 |
| 81 | src/payui-isolates | 12 |
| 85 | src/single-spa | 2 |
| 95 | src/static | 7 |
| 15 | src/app | 2 |
| 40 | src/app | 4 |
| 57 | src/app | 8 |
| 68 | src/app | 3 |
| 72 | src/app | 2 |
| 75 | src/app | 3 |
| 6 | src/app | 98 |
| 14 | src/app | 4 |
| 21 | src/app | 7 |
| 44 | src/app | 3 |
| 77 | src/app | 4 |
| 90 | src/static | 1 |
| 5 | src/app | 3 |
| 20 | src/app | 5 |
| 28 | src/app | 2 |
| 31 | src/app | 3 |
| 73 | src/app | 3 |
| 82 | src/payui-isolates | 34 |
| 94 | src/static | 1 |
| 97 | src/static | 6 |
| 11 | src/app | 2 |
| 10 | src/app | 2 |
| 24 | src/app | 2 |
| 52 | src/app | 2 |
| 69 | src/app | 10 |
| 71 | src/app | 7 |
| 89 | src/static | 1 |
| 102 | src | 2 |
| 7 | src/app | 2 |
| 13 | src/app | 2 |
| 23 | src/app | 2 |
| 34 | src/app | 2 |
| 35 | src/app | 2 |
| 46 | src/app | 3 |
| 100 | src/test-helpers | 2 |
| 26 | src/app | 6 |
| 2 | root | 1 |
| 4 | src/app | 6 |
| 9 | src/app | 3 |
| 45 | src/app | 2 |
| 58 | src/app | 7 |
| 64 | src/app | 8 |
| 0 | e2e | 3 |
| 1 | root | 1 |
| 16 | src/app | 3 |
| 37 | src/app | 2 |
| 62 | src/app | 7 |
| 63 | src/app | 2 |
| 78 | src/environments | 1 |
| 80 | src | 2 |
| 8 | src/app | 3 |
| 32 | src/app | 5 |
| 41 | src/app | 3 |
| 48 | src/app | 2 |
| 54 | src/app | 3 |
| 59 | src/app | 4 |
| 65 | src/app | 3 |
| 83 | src/payui-isolates | 13 |
| 27 | src/app | 4 |
| 3 | root | 1 |
| 18 | src/app | 2 |
| 55 | src/app | 2 |
| 60 | src/app | 2 |
| 74 | src/app | 3 |
| 91 | src/static | 1 |
| 92 | src/static | 1 |
| 30 | src/app | 18 |
| 38 | src/app | 3 |
| 50 | src/app | 2 |
| 51 | src/app | 2 |
| 61 | src/app | 12 |
| 66 | src/app | 3 |
| 76 | src/app | 2 |
| 79 | src/environments | 2 |
| 25 | src/app | 4 |
| 33 | src/app | 2 |
| 84 | src | 1 |
| 86 | src/static | 1 |
| 99 | src/test-helpers | 2 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| src/app/core/services/form/form.service.ts | 82 | 35 | 47 |
| src/app/core/services/payment-session/payment-session.service.ts | 74 | 53 | 21 |
| src/app/core/services/interface-control/interface-control.service.ts | 73 | 58 | 15 |
| src/app/core/constants.ts | 65 | 64 | 1 |
| src/payui-isolates/dpay-widget-3.0.min.js | 59 | 0 | 59 |
| src/app/core/services/content/content.service.ts | 47 | 44 | 3 |
| src/app/core/core.module.ts | 41 | 3 | 38 |
| src/app/core/services/wallet/wallet.service.ts | 37 | 17 | 20 |
| src/app/app.module.ts | 37 | 2 | 35 |
| src/app/payment-sheet/components/payui-layout-single-card-plus/payui-layout-single-card-plus.component.ts | 35 | 2 | 33 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| src_app_app_routing_module_ts | src_app_payment_sheet_components_payui_payment_sheet_payui_payment_sheet_component_ts | src/app → src/app |
| src_app_app_routing_module_ts | src_app_shell_cast_components_payui_shell_payui_shell_component_ts | src/app → src/app |
| src_app_app_routing_module_ts | src_app_core_resolvers_parcel_resolver_ts | src/app → src/app |
| src_app_app_component_spec_ts | src_app_core_services_payment_session_payment_session_service_ts | src/app → src/app |
| src_app_app_component_ts | src_app_set_font_css_vars_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_core_module_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_config_service_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_services_payment_session_payment_session_service_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_services_interface_control_interface_control_service_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_services_form_form_service_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_services_log_log_service_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_services_postal_code_postal_code_service_ts | src/app → src/app |
| src_app_app_module_ts | src_app_core_services_recaptcha_recaptcha_service_ts | src/app → src/app |
| src_app_app_module_ts | src_app_app_component_ts | src/app → src/app |
| src_app_app_module_ts | src_app_shell_cast_components_payui_shell_payui_shell_component_ts | src/app → src/app |

## Suggested Questions

Questions this graph can help answer:

- What depends on `src/app/core/services/form/form.service.ts` and what breaks if it changes?
- Why does `src_app_app_routing_module_ts` depend on `src_app_payment_sheet_components_payui_payment_sheet_payui_payment_sheet_component_ts` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
