# DGE Team Context

## Team

- **Name:** DGE (Digital Guest Experience)
- **Org:** Disneyland Paris (DLP)
- **Domain:** Guest operations — attractions, shows, virtual queues, tickets, wallet

## Jira

- **Instance:** Jira Cloud (https://dxtdlp.atlassian.net)
- **Projects:** APP, DST, DS, ECO
- **Board:** 156
- **Prefixes:** APP- (primary), DST-, DS-, ECO-

## Repositories

| Alias | Service | Repository |
|-------|---------|------------|
| DPAO | Premier Entry Access — Attractions | wdpr-dlp-is-operations-pea-attraction-provider |
| DPAU | DPA All Access — Shows | wdpr-dlp-is-operations-dpa-all-access-show-provider |
| VQ | Virtual Queue | wdpr-dlp-is-operations-virtual-queue-provider |
| TMS | Ticket Management Service | wdpr-dlp-is-guest-tms-ticket-management-service-provider |
| — | Wallet Server Proxy | wdpr-dlp-is-guest-wallet-server-proxy-provider |
| — | TMS Tickets Linking | wdpr-dlp-is-guest-tms-tickets-linking-provider |

## CI/CD

- **Platform:** Harness
- **Org:** Disneyland_Paris
- **Project:** DLP_DGE_API_ORION_services
- **URL:** https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Disneyland_Paris/projects/DLP_DGE_API_ORION_services/pipelines

## Tech Stack

- Java (Spring Boot)
- DLP IS platform services
- GitHub Enterprise (github.disney.com)

## Conventions

- Conventional commits
- Branch naming: `{type}/{ticket-id}-description`
- PR targets: `develop` or `main` depending on service
