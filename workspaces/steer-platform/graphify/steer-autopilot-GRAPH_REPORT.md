# Graph Report

**Nodes:** 346 | **Edges:** 379 | **Communities:** 51

## Communities

| ID | Label | Nodes |
|:--:|-------|:-----:|
| 40 | internal/metrics | 6 |
| 47 | internal/store | 2 |
| 8 | dashboard/src | 2 |
| 11 | internal/api | 9 |
| 19 | internal/api | 3 |
| 20 | internal/api | 19 |
| 23 | internal/artifacts | 2 |
| 24 | internal/audit | 9 |
| 27 | internal/broker | 10 |
| 38 | internal/engine | 3 |
| 0 | cmd/autopilot | 16 |
| 12 | internal/api | 2 |
| 22 | internal/artifacts | 10 |
| 30 | internal/bus | 10 |
| 42 | internal/model | 2 |
| 44 | internal/model | 3 |
| 46 | internal/model | 9 |
| 49 | internal/store | 22 |
| 9 | dashboard/src | 10 |
| 15 | internal/api | 2 |
| 29 | internal/bus | 3 |
| 36 | internal/engine | 13 |
| 39 | internal/gateway | 16 |
| 6 | dashboard/src | 5 |
| 10 | dashboard | 1 |
| 26 | internal/broker | 9 |
| 33 | internal/engine | 5 |
| 35 | internal/engine | 7 |
| 37 | internal/engine | 9 |
| 43 | internal/model | 1 |
| 48 | internal/store | 19 |
| 7 | dashboard/src | 3 |
| 21 | internal/artifacts | 9 |
| 50 | internal/store | 2 |
| 16 | internal/api | 2 |
| 25 | internal/broker | 11 |
| 31 | internal/bus | 11 |
| 41 | internal/model | 4 |
| 45 | internal/model | 2 |
| 1 | dashboard/.astro | 1 |
| 3 | dashboard/.astro | 12 |
| 5 | dashboard | 1 |
| 14 | internal/api | 9 |
| 17 | internal/api | 8 |
| 28 | internal/broker | 5 |
| 32 | internal/config | 15 |
| 34 | internal/engine | 6 |
| 2 | dashboard/.astro | 1 |
| 4 | dashboard/.astro | 1 |
| 13 | internal/api | 2 |
| 18 | internal/api | 2 |

## God Nodes

Highest-connected nodes — potential coupling hotspots.

| Node | Degree | In | Out |
|------|:------:|:--:|:---:|
| cmd/autopilot/main.go | 26 | 0 | 26 |
| internal/api/server.go | 24 | 0 | 24 |
| internal/store/sqlite.go | 22 | 0 | 22 |
| internal/engine/engine.go | 20 | 0 | 20 |
| internal/store/postgres.go | 19 | 0 | 19 |
| internal/gateway/gateway.go | 19 | 0 | 19 |
| dashboard/.astro/content.d.ts | 18 | 0 | 18 |
| internal/config/config.go | 15 | 0 | 15 |
| internal/bus/nats.go | 14 | 0 | 14 |
| internal/artifacts/s3.go | 13 | 0 | 13 |

## Surprising Connections

Cross-community edges — unexpected dependencies.

| Source | Target | Communities |
|--------|--------|:-----------:|
| dashboard_src_components_gatelist_tsx | dashboard_src_lib_api_ts | dashboard/src → dashboard/src |
| dashboard_src_components_pipelinedetail_tsx | dashboard_src_lib_api_ts | dashboard/src → dashboard/src |
| dashboard_src_components_pipelinelist_tsx | dashboard_src_lib_api_ts | dashboard/src → dashboard/src |

## Suggested Questions

Questions this graph can help answer:

- What depends on `cmd/autopilot/main.go` and what breaks if it changes?
- Why does `dashboard_src_components_gatelist_tsx` depend on `dashboard_src_lib_api_ts` across community boundaries?
- Which modules have the tightest coupling between communities?
- What is the shortest path between two seemingly unrelated modules?
