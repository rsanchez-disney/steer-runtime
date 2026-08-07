# Runbook — Dory For Tickets

Source: [Confluence WDPROS](https://confluence.disney.com/spaces/WDPROS/pages/1872850834/Dory+For+Tickets+-+Runbook)

## Overview

Dory For Tickets is a webhook-based API for ticket processing. Shared between Studio Control (WDW) and Studio Kaos (DLR).

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/commerce/wdpr-ecommerce-doryfortickets-api |
| Harness | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/ci/orgs/Commerce/projects/WDPRD_Dory_For_Tickets/deployments |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?branch=develop&id=com.disney.wdat.api%3Adory-for-tickets-api |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineDoryWebhook |

## Health Check

| Environment | URL |
|-------------|-----|
| Latest | https://latest.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck |
| Stage | https://stage.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck |
| Load | https://load.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck |
| Production | https://doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck |

## Splunk

- **Index:** `wdpr_dory_for_tickets`
- **Dashboard (Prod):** https://wdpr-splunk-prod.wdprapps.disney.com/en-US/app/launcher/dory_for_tickets
