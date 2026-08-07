# Studio Control — Team Context

## Overview

Studio Control manages WDW ticketing, lexicon services, availability calendars, entitlement view assembly, stop sales, and commerce UI flows (Special Events, Claim, Memory Maker, Water Parks). Focused on WDW-centric sustainment.

## Jira

- **Project:** COM
- **Board:** [COM 3411 - Studio Control](https://disneyexperiences.atlassian.net/jira/software/c/projects/COM/boards/3411)
- **Board ID:** 3411
- **Instance:** disneyexperiences.atlassian.net

## Applications

### Services

| BAPP ID | Application | Description | Splunk Index |
|---------|-------------|-------------|--------------|
| BAPP0244050 | Entitlement Availability Service (EAS) | Entitlement availability checks | `wdpr_wdw_eas` |
| BAPP0060613 | Lexicon Service | Core lexicon domain service | `index=wdpr-ecommerce ecs_task_definition="lexicon-svc*"` |
| BAPP0244008 | Stop Sales Service | Stop sales engine | `wdpr_wdw_sss stream=stopsales-use1-<env>-stopsales-fargate` |
| BAPP0244008 | Stop Sales Updater Lambda | Stop sales updater | `wdpr_wdw_sss stream IN (*ssupdater-use1-<env>-ssupdater-lambda*)` |
| BAPP0081984 | WDW LexVAS | Lexicon View Assembler Service (WDW) | `index=wdpr-ecommerce ecs_task_definition="lexvas-api*"` |
| BAPP0242760 | TTC LexVAS | TTC Lexicon View Assembler Service | `index=wdpr-ecommerce ecs_task_definition="ttc-lexvas*"` |
| BAPP0090879 | Lexicon Admin | Lexicon administration app | `index=wdpr-ecommerce ecs_task_definition="lexicon-admin*"` |
| BAPP0243824 | Stop Sales Admin | Stop Sales Manager UI | `index=wdpr-ecommerce ecs_task_definition="stopsalesadmin-ssales*"` |
| BAPP0061980 | EVAS | Entitlement View Assembly Service | `index=wdpr-ecommerce ecs_task_definition="evas-svc-wdw*"` |
| BAPP0081809 | TMS | Ticket Management Service | `index=wdpr-ecommerce ecs_task_definition="tms-svc*"` |
| BAPP0105586 | DTC | DTI Traffic Controller | `index=wdpr-apps ecs_cluster="wdpr-dtc-<env>*"` |
| BAPP0218784 | Commerce Shared API | Commerce UI Shared API | `wdpr_wdw_com_shared_api`, `wdpr_dlr_com_shared_api` |
| BAPP0106395 | PAAS | Park Activity Availability Service | `index=wdpr_tixsale_dlr source=*paas*` |
| BAPP0104838 | PARS | Park Activity Reservation Service | `index=wdpr_tixsale_dlr source="*pars*"` |
| BAPP0105160 | PACS | Park Activity Calendar Service | `index=wdpr-ecommerce ecs_task_definition="pacs-main*"` |
| BAPP0247964 | TPAC | Tickets Price Avail Cache Service | `index=wdpr-ecommerce ecs_task_definition="tpac-svc*"` |

### UI Applications

| BAPP ID | Application | Description | Splunk Index |
|---------|-------------|-------------|--------------|
| BAPP0090435 | Mods SPA | WDW Modifications SPA | `wdpr_commerce_ui` |
| BAPP0090435 | Tickets SPA | WDW Tickets Sales SPA | `wdpr_commerce_ui` |
| BAPP0060616 | Lexicon UI | Lexicon administration UI | `index=wdpr-ecommerce ecs_task_definition="lexicon-ui*"` |
| BAPP0199784 | WDW Availability Calendar | Availability calendar (UI + Service) | `wdw_avail_cal` |
| BAPP0178687 | Commerce UI Flows | Special Events, Claim, Memory Maker, Water Parks | `wdpr_commerce_ui` |

### Collaboration Apps (shared ownership)

| BAPP ID | Flow | App Name |
|---------|------|----------|
| BAPP0103580 | Product Finder Service | WDPR Product Finder Service |
| BAPP0178687 | Special Events | Commerce - UI |
| BAPP0178687 | Memory Maker | Commerce - UI |
| BAPP0178687 | Water Parks | Commerce - UI |
| BAPP0178687 | Claim/Link | Commerce - UI |
| BAPP0179541 | Ticket Sales | WDPR Ticket Sales SPA |

## Environments

Configuration Items in ServiceNow follow this pattern: `<App Name> - AWS <env>`

| Environment | Purpose |
|-------------|---------|
| Latest | Development / integration |
| Stage | Pre-production / SIT / FIT |
| Load Test | Performance testing (L2 executes, PE approves) |
| Production | Live |

## Runbooks

| Application | Runbook |
|-------------|---------|
| EAS | [EAS Runbook](https://confluence.disney.com/pages/viewpage.action?spaceKey=WDPROS&title=EAS+-+Entitlement+Availability+Service+-+Runbook) |
| Lexicon Service | [Lexicon Service Runbook](https://confluence.disney.com/display/WDPROS/Lexicon+Service+-+Runbook) |
| Stop Sales Service | [Stop Sales Service Runbook](https://confluence.disney.com/display/WDPROS/Stop+Sales+Service+-+Runbook) |
| Stop Sales Updater | [Stop Sales Updater Runbook](https://confluence.disney.com/display/WDPROS/Stop+Sales+Updater+-+Runbook) |
| WDW LexVAS | [LexVAS WDW](https://confluence.disney.com/display/WDPROS/LexVAS+WDW) |
| TTC LexVAS | [TTC LexVAS Runbook](https://confluence.disney.com/display/WDPROS/TTC+LexVAS+WDW+-+Runbook) |
| Lexicon Admin | [Lexicon Admin Runbook](https://confluence.disney.com/display/WDPROS/Lexicon+Admin+App+-+Runbook) |
| Stop Sales Admin | [Stop Sales Admin Runbook](https://confluence.disney.com/display/WDPROS/Stop+Sales+Admin+UI+-+Runbook) |
| EVAS | [WDW EVAS Runbook](https://confluence.disney.com/display/WDPROS/WDW+EVAS+Runbook) |
| TMS | [WDW TMS Runbook](https://confluence.disney.com/display/WDPROS/WDW+TMS+Runbook) |
| DTC | [DTC Runbook](https://confluence.disney.com/pages/viewpage.action?pageId=681694957) |
| PACS | [PACS WDW Runbook](https://confluence.disney.com/display/WDPROS/PACS+WDW+-+Runbook) |
| PAAS | [PAAS Runbook](https://confluence.disney.com/display/WDPROS/PAAS+%28Park+Activity+Availability+Service%29-Runbook) |
| PARS | [PARS Runbook](https://confluence.disney.com/display/WDPROS/PARS+%28Park+Activity+Reservation+Service%29+Runbook) |
| TPAC | [TPAC WDW Runbook](https://confluence.disney.com/spaces/WDPROS/pages/1860708661/TPAC+WDW+-+Runbook) |
| Commerce UI | [COM-UI Dockerization](https://confluence.disney.com/display/WDPROS/COM-UI+Dockerization) |
| WDW Avail Calendar | [WDW Availability Calendar](https://disneyexperiences.atlassian.net/wiki/spaces/StudioControl/pages/365790210/WDW+Availability+Calendar) |
| Mods SPA | [WDW Mods SPA](https://disneyexperiences.atlassian.net/wiki/spaces/StudioControl/pages/365789561) |
| Tickets SPA | [WDW Tickets SPA](https://disneyexperiences.atlassian.net/wiki/spaces/StudioControl/pages/365789244) |

## Splunk — Cribl Apps Dashboard

- **Lowers:** [Studio Control Cribl Apps (Stage)](https://stage.splunk.wdprapps.disney.com/en-US/app/launcher/studio_control_cribl_apps)
- **Production:** [Studio Control Cribl Apps (Prod)](https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_control_cribl_apps)

## ServiceNow

- **Assignment group:** web-global-salestickets

## Wiki

- [Studio Control Space](https://disneyexperiences.atlassian.net/wiki/spaces/StudioControl)
- [Apps Supported](https://disneyexperiences.atlassian.net/wiki/spaces/StudioControl/pages/365789219)
