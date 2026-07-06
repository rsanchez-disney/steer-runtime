# Finder Services — Team Context

## Architecture Overview

Source: [Figma — GIT Discovery Services Architecture](https://www.figma.com/board/LpVVRlzjiO0iKyrIiji3K1/GIT---Discovery-Services-Architecture) (Feb 2026)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Dash / Dash Secure Pipeline                              │
│                                                                                 │
│  Parks Mobile App ◄──► Sync Gateway ◄──► Couchbase Server ◄── All Publishers   │
│  (CB Lite SDK)              │                    │                               │
│                        OneID ──►            Eventing Functions                   │
│                        External clients ◄──                                     │
│  Dash Secure Auth ◄──► Sync Gateway                                            │
│  HKDL Profile ◄──► Dash Secure Auth                                            │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         Dash Microservice Publishers                             │
│                                                                                 │
│  ┌─────────────────────┐   ┌──────────────────────┐   ┌─────────────────────┐  │
│  │ Facility Status Pub  │   │ Content Publisher     │   │ Facilities Publisher│  │
│  │ ← Radish (dine wt)  │   │ ← ALB                │   │ ← Watcher           │  │
│  │ ← Forecaster (fcst) │   │ ← Content Pub SQS    │   │ ← Launch Darkly     │  │
│  │ ← Kafka (wait times)│   │ → CB Server           │   │ ← Explorer Service  │  │
│  │ ← OpSheet (retiring)│   └──────────────────────┘   │ ← Profile VAS       │  │
│  │ → CB Server          │                              │ → CB Server          │  │
│  └─────────────────────┘   ┌──────────────────────┐   └─────────────────────┘  │
│                             │ Characters Publisher  │                             │
│  ┌─────────────────────┐   │ ← OpSheet            │   ┌─────────────────────┐  │
│  │ Schedules Publisher  │   │ ← Explorer Service   │   │ Config Publisher     │  │
│  │ ← Explorer Service   │   │ → CB Server          │   │ ← Launch Darkly     │  │
│  │ → CB Server          │   └──────────────────────┘   │ → CB Server          │  │
│  └─────────────────────┘                               └─────────────────────┘  │
│                             ┌──────────────────────┐                             │
│                             │ Transportation Pub    │                             │
│                             │ ← Transportation Sys  │                             │
│                             │ ← Explorer Service    │                             │
│                             │ → CB Server           │                             │
│                             └──────────────────────┘                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         Infrastructure                                           │
│                                                                                 │
│  ALB ──► All publishers (HTTP APIs)                                             │
│    ← D-Scribe (public writes → Content Publisher)                               │
│    ← Trips, Shuri (private writes → API GW → SQS → Content Publisher)          │
│                                                                                 │
│  NC Batch Lambda ← API Gateway ← Shuri, Messaging Platforms                    │
│  NC Batch Lambda → NC Lambda ◄──► ALB (private reads/writes to Content Pub)     │
│                                                                                 │
│  Location Service → Kinesis Stream → LS to CP Lambda → Content Pub SQS         │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                         Underminer Pipeline                                      │
│                                                                                 │
│  D-Scribe → Yellowjacket(SNS) → SQS → FAS                                     │
│  Watcher, OpSheet, Launch Darkly ──► FAS                                        │
│  Vendomatic via Lists Svc, Remy Product Svc ──► FAS                             │
│  Lodging Facility Svc, Lodging Svc, Lexicon Svc ──► FAS                         │
│  Transportation System ──► FAS (being retired → Transportation Publisher)        │
│                                                                                 │
│  FAS ──► Redis ──► Explorer Service                                             │
│  FAS ──► SNS ──► Search Indexing Svc (Raya), KB Ingress Lambda, Parks website   │
│  FAS ──► CB Server (being retired)                                              │
│                                                                                 │
│  Explorer Service ──► external/internal clients (guest discovery data)           │
│  Explorer Service ──► KB Ingress Lambda (guest & cast discovery data)            │
│                                                                                 │
│  Guest Context Service ← CB Server → Discovery Service (Raya)                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Team Ownership

| Team | Services |
|------|----------|
| **Studio Triumph & Incredibles** | All publishers, FAS, Explorer Service, Redis, SNS (Underminer), Guest Context Service, NC Lambda, NC Batch Lambda, LS to CP Lambda, Kinesis Stream, ALB, API Gateways, SQSs, Sync Gateway, Couchbase Server, Eventing Functions, Dash Secure Auth Service |
| Studio Raya | Search Indexing Service, Elasticsearch, Search Service, Discovery Service |
| GCx | Watcher, Yellowjacket (SNS) |
| OpSheet | OpSheet, Kafka |

### Key Data Flows

| Flow | Path | Type |
|------|------|------|
| Mobile app updates | Publishers → CB Server → Sync Gateway → Parks Mobile App | Near real-time |
| Wait times | Kafka (source: OpSheet) → Facility Status Publisher → CB Server | Near real-time |
| Dine wait times | Radish → Facility Status Publisher → CB Server | Near real-time |
| Forecasted wait times | Forecaster Service → Facility Status Publisher → CB Server | Near real-time |
| Content writes (public) | D-Scribe → ALB → Content Publisher → CB Server | Near real-time |
| Content writes (private) | Trips/Shuri → ALB → API GW → SQS → Content Publisher → CB Server | Near real-time |
| Location-based content | Location Service → Kinesis → LS to CP Lambda → SQS → Content Publisher | Near real-time |
| Facility data | Watcher/LaunchDarkly/Explorer Service → Facilities Publisher → CB Server | Non-real-time |
| Schedules | Explorer Service → Schedules Publisher → CB Server | Non-real-time |
| Characters | OpSheet + Explorer Service → Characters Publisher → CB Server | Non-real-time |
| Bus arrival times | Transportation System → Transportation Publisher → CB Server | Near real-time |
| Underminer assembly | D-Scribe → Yellowjacket → SQS → FAS → Redis → Explorer Service | Near real-time |
| Underminer notifications | FAS → SNS → Search Indexing (Raya), KB Ingress Lambda, Parks website | Near real-time |
| Guest discovery (subscribed) | Explorer Service → SNS subscribers | Near real-time |
| Guest discovery (on-demand) | Explorer Service → external/internal clients | Non-real-time |
| Notification Center | Shuri/Messaging Platforms → API GW → NC Batch Lambda → NC Lambda ↔ ALB ↔ Content Publisher | Near real-time |

### Integrations Being Retired

| Integration | Replacement |
|-------------|-------------|
| OpSheet → Facility Status Publisher (direct) | Kafka (source still OpSheet) |
| Transportation System → FAS | Transportation System → Transportation Publisher |
| FAS → CB Server (transportation data) | Transportation Publisher → CB Server |

## Tech Stack

- **Backend Services**: Java / Spring Boot (Java 17 for most, Java 11 for Characters Publisher Lambda)
- **Lambda Functions**: Java (AWS Lambda via SAM)
- **Data Store**: Couchbase Server (migrating to Capella), Redis (Underminer pipeline)
- **Real-time Sync**: Couchbase Sync Gateway + Couchbase Lite (mobile)
- **Messaging**: AWS SQS, AWS SNS, AWS Kinesis, Apache Kafka
- **Cloud**: AWS (Lambda, S3, API Gateway, ALB, EventBridge)
- **Feature Flags**: LaunchDarkly
- **Secrets**: Vault + Jasypt
- **Configuration**: RA Configuration library + Nimbus
- **Monitoring**: Splunk, AppDynamics, CloudWatch, Grafana (migrating CB metrics to Prometheus)
- **Contract Testing**: Edna (wdpr-edna)
- **Load Testing**: Rick Dicker, JMeter (PE_Scripts)
- **Local Dev**: dash-local-env, local-sonar, LocalStack
- **CI/CD**: Harness
- **Source Control**: GitHub Enterprise (github.disney.com/wdpro-development)

## Jira

- **Project**: GIT (shared across Finder Services teams)
- **Instance**: disneyexperiences.atlassian.net
- **Workflow**: Not Started → Open → In Analysis → Ready for Development → Ready for Build → In Progress → Peer Review → In Review → Ready for Testing → In Testing → Blocked → Rejected → Closed

## Teams

| Team | Board | Type | Scope |
|------|-------|------|-------|
| Studio Triumph | [8644](https://disneyexperiences.atlassian.net/jira/software/boards/8644) | Kanban | Sustainment and development |
| Studio Incredibles | [4972](https://disneyexperiences.atlassian.net/jira/software/boards/4972) | Scrum | Development |

## Repositories

### Releasable Applications

| Repo | Description |
|------|-------------|
| [`contpub-svc`](https://github.disney.com/wdpro-development/contpub-svc) | Content Publisher (ARTU) — generic content write/read API |
| [`schedules-publisher`](https://github.disney.com/wdpro-development/schedules-publisher) | Schedule content publishing |
| [`facility-status-publisher`](https://github.disney.com/wdpro-development/facility-status-publisher) | Facility status / wait times publishing |
| [`facilities-publisher`](https://github.disney.com/wdpro-development/facilities-publisher) | Facility data publishing |
| [`characters-publisher-lambda`](https://github.disney.com/wdpro-development/characters-publisher-lambda) | Character content publishing (Lambda) |
| [`wdpr-experience-01431-fas`](https://github.disney.com/wdpro-development/wdpr-experience-01431-fas) | Finder Assembler Service — cache assembly layer |
| [`wdpr-experience-01431-explr`](https://github.disney.com/wdpro-development/wdpr-experience-01431-explr) | Explorer Service — content discovery API |
| [`wdpr-content-inspection-lambda`](https://github.disney.com/wdpro-development/wdpr-content-inspection-lambda) | Eve — content inspection tool |
| [`dash-batch-lambda`](https://github.disney.com/wdpro-development/dash-batch-lambda) | NC Batch Lambda — batch processing |
| [`notification-center`](https://github.disney.com/wdpro-development/notification-center) | NC Lambda — Dash Push notifications |

### Internal Tools & Libraries

| Repo | Description |
|------|-------------|
| [`realtime-content-wrapper`](https://github.disney.com/wdpro-development/realtime-content-wrapper) | Shared content retrieval abstraction |
| [`wdpr-edna`](https://github.disney.com/wdpro-development/wdpr-edna) | Edna — contract testing tool |
| [`local-sonar`](https://github.disney.com/wdpro-development/local-sonar) | Local SonarQube setup |
| [`finder-services-developer-setup`](https://github.disney.com/wdpro-development/finder-services-developer-setup) | Developer environment setup |
| [`dash-local-env`](https://github.disney.com/wdpro-development/dash-local-env) | Dash local development environment |
| [`rick-dicker-load-test-launcher`](https://github.disney.com/wdpro-development/rick-dicker-load-test-launcher) | Rick Dicker — load test launcher |
| [`finder-cache-models`](https://github.disney.com/wdpro-development/finder-cache-models) | Finder cache data models |
| [`finder-services-utils`](https://github.disney.com/wdpro-development/finder-services-utils) | Shared utilities |
| [`PE_Scripts`](https://github.disney.com/PE/PE_Scripts) | JMeter performance/load test scripts |
| [`finder-services-bruno-collections`](https://github.disney.com/wdpro-development/finder-services-bruno-collections) | Bruno API test collections |

## Branch Naming

- Feature: `feat/GIT-{ticket}-{short-description}`
- Bugfix: `fix/GIT-{ticket}-{short-description}`
- Hotfix: `hotfix/GIT-{ticket}-{short-description}`

## Parks Served

WDW, DLR, HKDL, Disney Springs, and other Disney digital properties.
