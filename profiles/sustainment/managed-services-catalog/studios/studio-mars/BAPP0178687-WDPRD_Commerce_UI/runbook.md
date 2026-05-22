# WDPRD Commerce UI — Runbook

Source: [Operational Readiness Review - COM UI Docker](https://confluence.disney.com/spaces/WDPROS/pages/765343654/Operational+Readiness+Review+-+COM+UI+Docker)

## Owner Team

- Studio Mars — web-global-salescart
- Slack: #dockerization_com_ui
- DL: WDPROPEPCOMSTUDIOMARS@disney.com

## Code & Pipeline

- Repo: https://github.disney.com/commerce/pci-apps-commerce-ui
- Pipeline: https://gam.cicd.wdprapps.disney.com/job/pci-apps-commerce-ui/job/pci-apps-commerce-ui-single-repo/
- Terraform (prod): https://github.disney.com/cgs-infra-config/pci-apps-prod/tree/master/dlr-S0001593-usw2-prd

## Front-End URLs (Internet-Facing via Akamai)

| Brand | Production | Stage | Load | Latest |
|-------|-----------|-------|------|--------|
| WDW | https://disneyworld.disney.go.com/cart | https://stage.disneyworld.disney.go.com/cart | https://lt01.disneyworld.disney.go.com/cart | https://latest.disneyworld.disney.go.com/cart |
| DLR | https://disneyland.disney.go.com/cart | https://stage.disneyland.disney.go.com/cart | https://lt01.disneyland.disney.go.com/cart | https://latest.disneyland.disney.go.com/cart |
| Vero Beach | https://verobeach.disney.go.com/cart | https://stage.verobeach.disney.go.com/cart | https://lt01.verobeach.disney.go.com/cart | https://latest.verobeach.disney.go.com/cart |
| Hilton Head | https://hiltonhead.disney.go.com/cart | https://stage.hiltonhead.disney.go.com/cart | https://lt01.hiltonhead.disney.go.com/cart | https://latest.hiltonhead.disney.go.com/cart |

## Infrastructure (AWS pci-apps us-west-2)

### ECS Clusters

| Env | Account | Cluster |
|-----|---------|---------|
| Latest | pci-apps-dev (332771620964) | dlr-pci-S0001593-usw2-lst |
| Stage | pci-apps-test (725629254132) | dlr-pci-S0001593-usw2-stg |
| Load | pci-apps-test (725629254132) | dlr-pci-S0001593-usw2-lod |
| Prod | pci-apps-prod (517471039377) | dlr-pci-S0001593-usw2-prd |

## Monitoring

- AppD (Prod): prod_docker-commerce-ui (app_id=1235)
- AppD (Lower): load_docker-commerce-ui (app_id=5681)
- Splunk index: wdpr_commerce_ui
- Splunk dashboards:
  - https://splunk.wdprapps.disney.com/en-US/app/launcher/commerce_ui_docker
  - https://splunk.wdprapps.disney.com/en-US/app/launcher/com_ui_cutover
- CloudWatch (Load): PACE-DLR-dlr-pci-S0001593-usw2-lod-Ver5

## Rolling Restarts

ECS-based: Go to AWS PCI account (pci-apps-env) → Elastic Container Service → cluster `dlr-pci-S0001593-usw2-<env>` → Tasks tab → select tasks → click STOP. New tasks will spin up automatically.

## Application Validation

Validate by navigating to the front-end URLs above (e.g., `/cart` pages). Validated by app team, SDETs, and GQE.
