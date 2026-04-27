# DPE — AWS Application Inventory

Use this context when triaging incidents, looking up logs, checking deployments, or correlating errors across DPE services.

## AWS Accounts

| Environment | Account ID | AWS Profile |
|-------------|------------|-------------|
| latest / latest2 / sandbox | <dev-account-id> | wdpr-packaging-dev |
| stage / stage2 / load | <test-account-id> | wdpr-packaging-test |
| prod | <prod-account-id> | wdpr-packaging-prod |

## Regions

| Site | Region |
|------|--------|
| WDW (Walt Disney World) | us-east-1 |
| DLP (Disneyland Paris) | us-east-1 |
| DLR (Disneyland Resort) | us-west-2 |
| Sandbox | us-east-1 |

---

## ECS Services

### DPE Admin UI

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0243246 | latest | dpe-admin-ui-latest-live | packaging2-S0001693 |
| WDW | BAPP0243246 | stage | dpe-admin-ui-stage-live | packaging2-S0001693 |
| WDW | BAPP0243246 | load | dpe-admin-ui-load-live | packaging-S0001693 |
| WDW | BAPP0243246 | prod | dpe-admin-ui-prod-live | packaging-S0001693 |
| DLR | BAPP0244652 | latest | pricingengine-admin-ui-latest-live | packaging2-S0001691 |
| DLR | BAPP0244652 | latest2 | pricingengine-admin-ui-latest2-live | packaging2-S0001691 |
| DLR | BAPP0244652 | stage | pricingengine-admin-ui-stage-live | packaging2-S0001691 |
| DLR | BAPP0244652 | stage2 | pricingengine-admin-ui-stage2-live | packaging2-S0001691 |
| DLR | BAPP0244652 | load | pricingengine-admin-ui-load-live | packaging2-S0001691 |
| DLR | BAPP0244652 | prod | pricingengine-admin-ui-prod-live | packaging2-S0001691 |
| DLP | BAPP0245626 | latest | dpe-adminui-dlp-latest-live | packaging2-S0001647 |
| DLP | BAPP0245626 | latest2 | dpe-adminui-dlp-latest2-live | packaging3-S0001647 |
| DLP | BAPP0245626 | stage | dpe-adminui-dlp-stage-live | packaging2-S0001647 |
| DLP | BAPP0245626 | stage2 | dpe-adminui-dlp-stage2-live | packaging3-S0001647 |
| DLP | BAPP0245626 | load | dpe-adminui-dlp-load-live | packaging-S0001647 |
| DLP | BAPP0245626 | prod | dpe-adminui-dlp-prod-live | packaging-S0001647 |
| Sandbox | BAPP0245618 | latest | dpe-admin-ui-latest-live | packaging2-S0001711 |

### DPE Price Calculation Service

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0243246 | latest | dpe-svc-latest-live | packaging2-S0001693 |
| WDW | BAPP0243246 | stage | dpe-svc-stage-live | packaging2-S0001693 |
| WDW | BAPP0243246 | load | dpe-svc-load-live | packaging-S0001693 |
| WDW | BAPP0243246 | prod | dpe-svc-prod-live | packaging-S0001693 |
| DLR | BAPP0244656 | latest | pricingengine-svc-latest-live | packaging2-S0001691 |
| DLR | BAPP0244656 | latest2 | pricingengine-svc-latest2-live | packaging2-S0001691 |
| DLR | BAPP0244656 | stage | pricingengine-svc-stage-live | packaging2-S0001691 |
| DLR | BAPP0244656 | stage2 | pricingengine-svc-stage2-live | packaging2-S0001691 |
| DLR | BAPP0244656 | load | pricingengine-svc-load-live | packaging2-S0001691 |
| DLR | BAPP0244656 | prod | pricingengine-svc-prod-live | packaging2-S0001691 |
| DLP | BAPP0245626 | latest | dpe-calcsvc-dlp-latest-live | packaging2-S0001647 |
| DLP | BAPP0245626 | latest2 | dpe-calcsvc-dlp-latest2-live | packaging3-S0001647 |
| DLP | BAPP0245626 | stage | dpe-calcsvc-dlp-stage-live | packaging2-S0001647 |
| DLP | BAPP0245626 | stage2 | dpe-calcsvc-dlp-stage2-live | packaging3-S0001647 |
| DLP | BAPP0245626 | load | dpe-calcsvc-dlp-load-live | packaging-S0001647 |
| DLP | BAPP0245626 | prod | dpe-calcsvc-dlp-prod-live | packaging-S0001647 |
| Sandbox | BAPP0245620 | latest | dpe-calcsvc-latest-live | packaging2-S0001711 |

### DPE Data Service

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0245630 | latest | pricingengine-data-latest-live | packaging3-S0001693 |
| WDW | BAPP0245630 | stage | pricingengine-data-stage-live | packaging2-S0001693 |
| WDW | BAPP0245630 | load | pricingengine-data-load-live | packaging-S0001693 |
| WDW | BAPP0245630 | prod | pricingengine-data-prod-live | packaging-S0001693 |
| DLR | BAPP0246562 | latest | pricingengine-data-latest-live | packaging2-S0001691 |
| DLR | BAPP0246562 | latest2 | pricingengine-data-latest2-live | packaging2-S0001691 |
| DLR | BAPP0246562 | stage | pricingengine-data-stage-live | packaging2-S0001691 |
| DLR | BAPP0246562 | stage2 | pricingengine-data-stage2-live | packaging2-S0001691 |
| DLR | BAPP0246562 | load | pricingengine-data-load-live | packaging2-S0001691 |
| DLR | BAPP0246562 | prod | pricingengine-data-prod-live | packaging2-S0001691 |
| DLP | BAPP0245630 | latest | dpe-datasvc-latest-live | packaging2-S0001647 |
| DLP | BAPP0245630 | latest2 | dpe-datasvc-latest2-live | packaging3-S0001647 |
| DLP | BAPP0245630 | stage | dpe-datasvc-stage-live | packaging2-S0001647 |
| DLP | BAPP0245630 | stage2 | dpe-datasvc-stage2-live | packaging3-S0001647 |
| DLP | BAPP0245630 | load | dpe-datasvc-load-live | packaging-S0001647 |
| DLP | BAPP0245630 | prod | dpe-datasvc-prod-live | packaging-S0001647 |
| Sandbox | BAPP0245622 | latest | dpe-datasvc-latest-live | packaging2-S0001711 |

### DPE Promotion Service

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0251195 | latest | promotion-svc-latest-live | packaging3-S0001463 |
| WDW | BAPP0251195 | stage | promotion-svc-stage-live | packaging2-S0001463 |
| WDW | BAPP0251195 | load | promotion-svc-load-live | packaging-S0001463 |
| WDW | BAPP0251195 | prod | promotion-svc-prod-live | packaging-S0001463 |

### DPE Promotion UI

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0251141 | latest | promotion-ui-latest-live | packaging3-S0001463 |
| WDW | BAPP0251141 | stage | promotion-ui-stage-live | packaging2-S0001463 |
| WDW | BAPP0251141 | load | promotion-ui-load-live | packaging-S0001463 |
| WDW | BAPP0251141 | prod | promotion-ui-prod-live | packaging-S0001463 |

### DPE Currency Conversion Service

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| DLP | BAPP0245632 | latest | dpe-currsvc-latest-live | packaging2-S0001647 |
| DLP | BAPP0245632 | latest2 | dpe-currsvc-latest2-live | packaging3-S0001647 |
| DLP | BAPP0245632 | stage | dpe-currsvc-stage-live | packaging2-S0001647 |
| DLP | BAPP0245632 | load | dpe-currsvc-load-live | packaging-S0001647 |
| DLP | BAPP0245632 | prod | dpe-currsvc-prod-live | packaging-S0001647 |

### DPE Cache Service

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0252964 | latest | dpe-cache-service-latest-live | packaging3-S0014993 |
| WDW | BAPP0252964 | latest2 | dpe-cache-service-latest2-live | packaging3-S0014993 |
| WDW | BAPP0252964 | stage | dpe-cache-service-stage-live | packaging3-S0014993 |
| WDW | BAPP0252964 | stage2 | dpe-cache-service-stage2-live | packaging3-S0014993 |
| WDW | BAPP0252964 | load | dpe-cache-service-load-live | packaging3-S0014993 |
| WDW | BAPP0252964 | prod | dpe-cache-service-prod-live | packaging3-S0014993 |
| DLR | BAPP0256865 | latest | dpe-cache-service-latest-live | packaging2-S0015220 |
| DLR | BAPP0256865 | latest2 | dpe-cache-service-latest2-live | packaging2-S0015220 |
| DLR | BAPP0256865 | stage | dpe-cache-service-stage-live | packaging2-S0015220 |
| DLR | BAPP0256865 | stage2 | dpe-cache-service-stage2-live | packaging2-S0015220 |
| DLR | BAPP0256865 | load | dpe-cache-service-load-live | packaging-S0015220 |
| DLR | BAPP0256865 | prod | dpe-cache-service-prod-live | packaging2-S0015220 |
| DLP | BAPP0256867 | latest | dpe-cache-service-latest-live | packaging3-S0031268 |
| DLP | BAPP0256867 | latest2 | dpe-cache-service-latest2-live | packaging3-S0031268 |
| DLP | BAPP0256867 | stage | dpe-cache-service-stage-live | packaging3-S0031268 |
| DLP | BAPP0256867 | load | dpe-cache-service-load-live | packaging3-S0031268 |
| DLP | BAPP0256867 | prod | dpe-cache-service-prod-live | packaging3-S0031268 |

---

## Lambda Functions

### Impact Analysis

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0243246 | latest | dpeimpals | packaging3-S0001693 |
| WDW | BAPP0243246 | stage | dpeimpals | packaging2-S0001693 |
| WDW | BAPP0243246 | load | dpeimpals | packaging-S0001693 |
| WDW | BAPP0243246 | prod | dpeimpals | packaging-S0001693 |
| DLR | BAPP0247009 | latest | dpeimpals | packaging-S0001691 |
| DLR | BAPP0247009 | latest2 | dpeimp | packaging-S0001691 |
| DLR | BAPP0247009 | stage | dpeimpals | packaging-S000169 |
| DLR | BAPP0247009 | stage2 | dpeimp | packaging-S000169 |
| DLR | BAPP0247009 | load | dpeimpals | packaging-S000169 |
| DLP | BAPP0247009 | latest | dpeimpals | packaging3-S0001647 |
| DLP | BAPP0247009 | latest2 | dpeimp | packaging3-S0001647 |
| DLP | BAPP0247009 | stage | dpeimpals | packaging2-S0001647 |
| DLP | BAPP0247009 | stage2 | dpeimp | packaging3-S0001647 |
| DLP | BAPP0247009 | load | dpeimpals | packaging2-S0001647 |
| DLP | BAPP0247009 | prod | dpeimpals | packaging2-S0001647 |

### Product Adapter

| Site | BAPP ID | Env | Service Name | Site Name |
|------|---------|-----|--------------|-----------|
| WDW | BAPP0246564 | latest | dpe_adpt | packaging2-S0014993 |
| WDW | BAPP0246564 | stage | dpe_adpt | packaging2-S0014993 |
| WDW | BAPP0246564 | load | dpe_adpt | packaging2-S0014993 |
| DLR | BAPP0246564 | latest | as | packaging2-S0001691 |
| DLR | BAPP0246564 | latest2 | as | packaging2-S0001691 |
| DLR | BAPP0246564 | stage | as | packaging2-S0001691 |
| DLR | BAPP0246564 | stage2 | as | packaging2-S0001691 |
| DLR | BAPP0246564 | prod | as | packaging2-S0001691 |
| DLP | BAPP0247009 | latest | as | packaging3-S0015887 |
| DLP | BAPP0247009 | latest2 | as | packaging3-S0015887 |
| DLP | BAPP0247009 | stage | as | packaging2-S0015887 |
| DLP | BAPP0247009 | stage2 | as | packaging3-S0015887 |
| DLP | BAPP0247009 | load | as | packaging-S0015887 |

---

## Triage Quick Reference

When triaging an incident, use the service name and site to identify the affected application:

| Keyword in logs/alert | Application | Type |
|-----------------------|-------------|------|
| `dpe-svc`, `pricingengine-svc`, `calcsvc` | Price Calculation Service | ECS |
| `dpe-admin-ui`, `pricingengine-admin-ui`, `adminui` | Admin UI | ECS |
| `pricingengine-data`, `datasvc` | Data Service | ECS |
| `promotion-svc` | Promotion Service | ECS |
| `promotion-ui` | Promotion UI | ECS |
| `dpe-currsvc` | Currency Conversion Service | ECS |
| `dpe-cache-service` | Cache Service | ECS |
| `dpeimpals`, `dpeimp` | Impact Analysis | Lambda |
| `dpe_adpt`, `as` (product-adapter context) | Product Adapter | Lambda |

### Environment from site name pattern

| Site Name Prefix | Environment |
|------------------|-------------|
| `packaging3-*` or `packaging2-*` | latest / latest2 (dev account) |
| `packaging2-*` | stage / stage2 (test account) |
| `packaging-*` | load / prod |
