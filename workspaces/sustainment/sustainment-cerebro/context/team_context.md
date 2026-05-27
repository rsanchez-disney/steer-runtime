# ADM PCS · DX Profile (Cerebro) — Team Context

> **Last verified: 2026-05** — Review quarterly or after infrastructure changes.

## Assignment Group & On-Call

- **AG**: web-global-Digital Profile
- **On-Call Phone**: +1 934 647 4549
- **ECS Regions**: us-east-1 (primary) + us-west-2 (DR)
- **PagerDuty**: ADM PCS Escalation Policy

## ServiceNow

- **Assignment Group**: web-global-Digital Profile
- **Configuration Item**: Per BAPP (see below)
- **Category**: Software
- **Subcategory**: Application
- **Contact Type**: Event Management

## BAPPs (Business Applications)

| BAPP Name | Type | Criticality |
|-----------|------|-------------|
| DX Profile Web | Web Application | High |
| DX Profile API | API/BFF | High |
| Config Services | Microservice | High |
| Photo Services | Media Processing | Medium |
| VAS Integration | Payment/Add-ons | High |
| Content Publisher | CMS Pipeline | Medium |
| Facilities Publisher | Location Data | Medium |
| Characters Publisher | Character Data | Low |
| Facility Status | Real-time Status | Medium |

## Architecture (5 Layers)

1. **CDN & Edge** — CloudFront, WAF
2. **API Gateway & ALB** — Routing, rate limiting, TLS termination
3. **Application (ECS Fargate)** — Node.js BFF, Angular SSR, Java microservices
4. **Data & Messaging** — RDS PostgreSQL, DynamoDB, SQS/SNS, ElastiCache Redis
5. **External Integrations** — Disney IdP (OneID), VAS APIs, Photo Services, ServiceNow, PagerDuty

## ECS Services

| Service | Cluster | Desired | CPU/Mem |
|---------|---------|---------|---------|
| dx-profile-web | dx-profile-prod | 4 | 512/1024 |
| dx-profile-api | dx-profile-prod | 6 | 1024/2048 |
| config-services | dx-profile-prod | 4 | 2048/4096 |
| photo-processor | dx-profile-prod | 2-8 (auto) | 1024/2048 |

## Databases

| Database | Engine | Role | Region |
|----------|--------|------|--------|
| dx-profile-primary | PostgreSQL 14 | Read/Write | us-east-1 |
| dx-profile-replica | PostgreSQL 14 | Read-only | us-west-2 |
| dx-profile-cache | Redis 7 | Session/Cache | us-east-1 |
| dx-profile-dynamo | DynamoDB | Config Store | Global |

## Routing / Reassignment Groups

| Root Cause Category | Reassign To |
|---------------------|-------------|
| Login / OTP / OneID Issues | Escalate via Jira to **IDY-** (no ServiceNow) |
| 502 Errors / Network / Akamai | **ops-global-parks-se-guestexp** |
| Internal Technical Escalation (L4) | **app-global-cerebro** |
| Legacy Reservation / Physical Network | **Enterprise Technology** |
| Photos or Watermark Issues | **PhotoPass** |
| Profile Sync / DX Profile API | **web-global-Digital Profile** (self) |
| Payment / VAS | **web-global-VAS-support** |
| Content / CMS | **web-global-content-publishing** |

## Alert Channels

| Severity | Channel | Notification |
|----------|---------|--------------|
| P1 | #dx-profile-p1-alerts | PagerDuty + Slack + Phone |
| P2 | #dx-profile-incidents | PagerDuty + Slack |
| P3 | #dx-profile-incidents | Slack only |
| P4 | #dx-profile-backlog | Daily digest |

# Studio Cerebro — Team Context

## Applications (17)

| BAPP ID | Application |
|---------|-------------|
| BAPP0063791 | DLR Mobile Application (Profile) |
| BAPP0063818 | WDW Mobile Application (Profile) |
| BAPP0063824 | WDW Mobile Application (Family and Friends) |
| BAPP0082601 | WDPRD Profile Node WAM |
| BAPP0082610 | WDPRD Profile JWT service |
| BAPP0170520 | WDPRD Preference Service |
| BAPP0180489 | WDPRD WDW/DLR/DCL Web Application (Profile) |
| BAPP0180565 | WDPRD WDW/DLR/DCL Web Application (Magic Bands + Cards) |
| BAPP0192854 | WDPRD Preference Admin |
| BAPP0225663 | WDPR Child Authorization Service |
| BAPP0229223 | WDPR Mobile Device Notification Optin Service |
| BAPP0242566 | WDPR Profile View Assembly Service |
| BAPP0245892 | WDPR Profile B2C |
| BAPP0246132 | WDPR Profile B2B |
| BAPP0247007 | FNF New Connection Methods SPA |
| BAPP0248309 | WDPR AuthenticatorJS |
| BAPP0253435 | WDPRT GAM Profile Web API Service |

## ServiceNow

- **Assignment group(s):** web-global-Digital Profile
