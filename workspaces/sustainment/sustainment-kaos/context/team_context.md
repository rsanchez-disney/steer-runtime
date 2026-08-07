# Studio Kaos — Team Context

> Last updated: 2026-08-07

## Overview

Studio Kaos manages DLR ticketing, availability calendars, entitlement sales, park access, and commerce UI shared services. Focused on DLR-centric sustainment.

## Jira

- **Project:** COM
- **Board:** [COM - Kaos | Nair](https://disneyexperiences.atlassian.net/jira/software/c/projects/COM/boards/6657)
- **Board ID:** 6657
- **View:** Planning (backlog + sprint)
- **Instance:** disneyexperiences.atlassian.net

## Applications

### DLR Services (shared BAPP with WDW — same codebase, different cluster)

| BAPP ID | Application | DLR Cluster | Splunk |
|---------|-------------|-------------|--------|
| BAPP0061980 | DLR EVAS | dlr-ecommerce-S0001477-usw2-\<env\> | `index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2-*" ecs_task_definition="evas*"` |
| BAPP0081809 | DLR TMS | dlr-ecommerce-S0001477-usw2-\<env\> | `index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2-*" ecs_task_definition="tms*"` |
| BAPP0081984 | DLR LexVAS | dlr-ecommerce-S0001477-usw2-\<env\> | `index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2-*" ecs_task_definition="lexvas*"` |
| BAPP0105160 | DLR PACS | dlr-commerce2-01323-* | `index=wdpr-ecommerce ecs_cluster="dlr-commerce2-01323-*" ecs_task_definition="pacs-svc*"` |
| BAPP0105586 | DLR DTC | *dtc* | `index=wdpr-apps ecs_cluster=*dtc* ecs_task_definition=*dtc*` |
| BAPP0242760 | DLR TTC LexVAS | wdpr-ecommerce-S0001663-usw2-\<env\> | `index=wdpr-ecommerce ecs_cluster="wdpr-ecommerce-S0001663-usw2-*" ecs_task_definition="ttc-lexvas-*"` |

### DLR-specific Applications

| BAPP ID | Application | Description | Splunk |
|---------|-------------|-------------|--------|
| BAPP0176629 | DLR Entitlement Sales App | DLR ticket sales SPA | `index=wdpr_dlr_tixsales_api` |
| BAPP0193062 | Dory For Tickets | Ticket processing (shared Control/Kaos) | `index=wdpr_dory_for_tickets` |
| BAPP0200020 | DLR Availability Calendar | DLR availability calendar | `index=dlr_avail_cal` |
| BAPP0201120 | DLR Claim SPA | Claim/link entitlements | `index=dlr_claim_spa` |
| BAPP0218688 | DLR Park Access Hub | Park access management | `index=dlr_park_access_hub` |
| BAPP0218784 | Commerce UI Shared API | BFF for DLR SPAs (Lambda) | `index=wdpr_dlr_com_shared_api` |
| BAPP0250676 | Bolt Landing SPA | PIN-based promotional tickets | `index=wdpr_bolt` |
| BAPP0244434 | DLR Tickets Mods | DLR ticket modifications (Lambda + SPA) | `index=dlr_tickets_mods` |

### Shared Services (with Studio Control)

| BAPP ID | Application | Notes |
|---------|-------------|-------|
| BAPP0060613 | Lexicon Service | Shared — same cluster (wdpr-ecommerce-S0001323-usw2) |
| BAPP0060616 | Lexicon UI | Shared — same cluster |
| BAPP0090879 | Lexicon Admin | Shared — same cluster |

## Environments

| Environment | Purpose |
|-------------|---------|
| Latest (lst) | Development / integration |
| Stage (stg) | Pre-production / SIT / FIT |
| Load Test (lod) | Performance testing (L2 executes, PE approves) |
| Production (prd) | Live |

## Splunk Notes

- `<env>` = lst, stg, lod, prd
- Shared `wdpr-ecommerce` Cribl index — use `ecs_cluster` and `ecs_task_definition` to filter
- DTC uses shared `wdpr-apps` index — filter with `ecs_cluster=*dtc*`
- Commerce UI Shared API also logs SPA traffic with AppSource filter: `| rex "\"AppSource\":\"(?<AppSource>[^\"]+)\""` 

## Escalation

- **On-call:** +1 (620) 557-8415 (24x7, P1/P2 only)
- **Email:** WDPROPEPCOMSTUDIOKAOS@disney.com
- **Slack:** #dprd-studio-kaos
- **Assignment group:** web-global-salestickets

## Wiki

- [Studio Kaos Space](https://disneyexperiences.atlassian.net/wiki/spaces/StudioKaos)
- [Apps General Information](https://disneyexperiences.atlassian.net/wiki/spaces/StudioKaos/pages/363201195)
