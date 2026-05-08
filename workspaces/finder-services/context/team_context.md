# Finder Services — Team Context

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Content Publishers                          │
│  content-publisher │ schedules-publisher │ facilities-publisher│
│  facility-status-publisher │ characters-publisher-lambda       │
├──────────────────────────────────────────────────────────────┤
│                    Core Services                              │
│  Facility Service (wdpr-content-facility-svc)                │
│  Finder Assembler Service (wdpr-experience-01431-fas)        │
│  Explorer Service (wdpr-experience-01431-explr)              │
├──────────────────────────────────────────────────────────────┤
│                    Lambda / Batch                              │
│  dash-batch-lambda │ notification-center (Dash Push)          │
│  wdpr-content-inspection-lambda (Eve)                        │
│  realtime-content-wrapper                                    │
├──────────────────────────────────────────────────────────────┤
│                    Shared Libraries & Tools                    │
│  finder-cache-models │ finder-services-utils │ wdpr-edna     │
│  dash-local-env │ finder-services-developer-setup             │
│  rick-dicker (load testing) │ local-sonar │ PE_Scripts        │
│  finder-services-bruno-collections                           │
└──────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Backend Services**: Java / Spring Boot
- **Lambda Functions**: Java (AWS Lambda)
- **Data Store**: Couchbase (Server + Lite + Sync Gateway)
- **Cloud**: AWS (Lambda, S3, SNS, Kinesis)
- **Monitoring**: Splunk, AppDynamics
- **Contract Testing**: Edna (wdpr-edna)
- **Load Testing**: Rick Dicker, JMeter (PE_Scripts)
- **API Testing**: Bruno (finder-services-bruno-collections)
- **Local Dev**: dash-local-env, local-sonar
- **CI/CD**: Jenkins, Harness
- **Source Control**: GitHub Enterprise (github.disney.com/wdpro-development)

## Jira

- **Project**: GIT (shared across Finder Services teams)
- **Instance**: myjira.disney.com
- **Workflow**: 13 states — Not Started → Open → In Analysis → Ready for Development → Ready for Build → In Progress → Peer Review → In Review → Ready for Testing → In Testing → Blocked → Rejected → Closed

## Teams

| Team | Board | Type | Scope |
|------|-------|------|-------|
| Studio Triumph | [8644](https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=8644) | Kanban | 50% development, 50% sustainment |
| Studio Incredibles | [4972](https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=4972) | Scrum | 100% development |

## Repositories

### Releasable Applications

| Repo | Description |
|------|-------------|
| [`content-publisher`](https://github.disney.com/wdpro-development/content-publisher) | Content propagation and publishing |
| [`schedules-publisher`](https://github.disney.com/wdpro-development/schedules-publisher) | Schedule content publishing |
| [`facility-status-publisher`](https://github.disney.com/wdpro-development/facility-status-publisher) | Facility status publishing |
| [`facilities-publisher`](https://github.disney.com/wdpro-development/facilities-publisher) | Facility data publishing |
| [`characters-publisher-lambda`](https://github.disney.com/wdpro-development/characters-publisher-lambda) | Character content publishing (Lambda) |
| [`wdpr-content-facility-svc`](https://github.disney.com/wdpro-development/wdpr-content-facility-svc) | Facility Service — core facility data API |
| [`wdpr-experience-01431-fas`](https://github.disney.com/wdpro-development/wdpr-experience-01431-fas) | Finder Assembler Service — aggregates content for Finder pages |
| [`wdpr-experience-01431-explr`](https://github.disney.com/wdpro-development/wdpr-experience-01431-explr) | Explorer Service — content discovery and exploration |
| [`wdpr-content-inspection-lambda`](https://github.disney.com/wdpro-development/wdpr-content-inspection-lambda) | Eve — content inspection tool |
| [`dash-batch-lambda`](https://github.disney.com/wdpro-development/dash-batch-lambda) | Batch processing Lambda |
| [`notification-center`](https://github.disney.com/wdpro-development/notification-center) | Dash Push Lambda — notification center |

### Internal Tools & Libraries

| Repo | Description |
|------|-------------|
| [`wdpr-edna`](https://github.disney.com/wdpro-development/wdpr-edna) | Edna — contract testing tool |
| [`local-sonar`](https://github.disney.com/wdpro-development/local-sonar) | Local SonarQube setup |
| [`finder-services-developer-setup`](https://github.disney.com/wdpro-development/finder-services-developer-setup) | Developer environment setup |
| [`dash-local-env`](https://github.disney.com/wdpro-development/dash-local-env) | Dash local development environment |
| [`rick-dicker-load-test-launcher`](https://github.disney.com/wdpro-development/rick-dicker-load-test-launcher) | Rick Dicker — load test launcher |
| [`realtime-content-wrapper`](https://github.disney.com/wdpro-development/realtime-content-wrapper) | Realtime content wrapper |
| [`finder-cache-models`](https://github.disney.com/wdpro-development/finder-cache-models) | Finder cache data models |
| [`finder-services-utils`](https://github.disney.com/wdpro-development/finder-services-utils) | Shared utilities |
| [`PE_Scripts`](https://github.disney.com/PE/PE_Scripts) | JMeter performance/load test scripts |
| [`finder-services-bruno-collections`](https://github.disney.com/wdpro-development/finder-services-bruno-collections) | Bruno API test collections |

## Branch Naming

- Feature: `feat/GIT-{ticket}-{short-description}`
- Bugfix: `fix/GIT-{ticket}-{short-description}`
- Hotfix: `hotfix/GIT-{ticket}-{short-description}`

## Parks Served

WDW, DLR, HKDL, DCL, Disney Springs, and other Disney digital properties.
