# Studio Last Dragon — Team Context

## Team Overview

Studio Last Dragon is the search tech sustainment team. The team owns and operates the search infrastructure that powers internal search across Disney's digital properties: WDW, DLR, HKDL, DCL, Disney Springs, DVC, and more.

**MyWiki Home**: https://mywiki.disney.com/spaces/DPEPSD/pages/445256067/DX+Studio+Raya
**Jira Board**: https://myjira.disney.com/secure/RapidBoard.jspa?rapidView=12243 (Kanban)
**Jira Prefix**: GIT-
**ServiceNow Assignment Group**: app-global-finder-search

## Services & Tools Supported

| Service | Tech | BAPP | Description |
|---------|------|------|-------------|
| **Search Service** | Java | BAPP0142700 | Relevancy tuning, analytics, data translation, boosts/blocks. Sits between clients and Elasticsearch |
| **Search Web API** | Node.js | — | Web security, authentication, proxies requests to Search Service |
| **Search Indexing Service** | Java | BAPP0231005 | Ingests content from DScribe/Explorer into Elasticsearch via SNS. Includes site crawler |
| **Apache Nutch** | Java | — | Web crawler for indexing non-leisure site content into Elasticsearch |
| **Spring Batch** | Java | — | Pulls data from Disney services and pushes to Elasticsearch |
| **PINs Load Batch** | Java | BAPP0064887 | AWS Batch jobs pulling data from Disney services into Elasticsearch |
| **Elasticsearch** | Elastic Cloud | BAPP0135740 | Multi-region east/west. Indices, search templates, boost/block config |
| **PE Scripts** | JMeter | — | Performance/load testing for Search Service |

## Repositories

| Repo | Tech | Purpose |
|------|------|---------|
| `StudioRaya/wdpr-content-search-api` | Java | Search Service — relevancy tuning, analytics, data translation between clients and Elasticsearch |
| `StudioRaya/wdpr-content-search-webapi` | Node.js | Search Web API — web security, authentication, proxies requests to Search Service |
| `StudioRaya/wdpr-content-search-indexing-svc` | Java | Search Indexing Service — ingests content from DScribe/Explorer into Elasticsearch via SNS |
| `StudioRaya/Elastic` | Config | Elasticsearch indices, search templates, boost/block configuration |
| `StudioRaya/spring-batch-app` | Java/Spring | Spring Batch — pulls data from Disney services and pushes to Elasticsearch |
| `StudioRaya/ApacheNutch` | Java | Apache Nutch web crawler — indexes non-leisure content into Elasticsearch |
| `WDPR-Sales-SVCS/wdpr-pins-load-batch` | Java | PINs Load Batch — AWS Batch jobs pushing to Elasticsearch |
| `PE/PE_Scripts` | JMeter | Performance test scripts (path: DevStudios/Raya/SearchService/) |

## Tech Stack

- **Search Service**: Java / Spring Boot
- **Web API**: Node.js
- **Indexing Service**: Java
- **Batch Processing**: Java / Spring Batch, AWS Batch
- **Web Crawler**: Apache Nutch
- **Search Engine**: Elasticsearch (Elastic Cloud, multi-region east/west)
- **Content Source**: DScribe / Explorer (CMS), SNS-driven notifications
- **Performance Testing**: JMeter
- **CI/CD**: Jenkins (Search Service, Indexing Service, PINs)
- **Source Control**: GitHub Enterprise (github.disney.com)
- **Artifact Repository**: Nexus3

## Monitoring & Observability

### Dashboards

| System | Dashboard |
|--------|-----------|
| Search Service | [Splunk Dashboard](https://splunk.wdprapps.disney.com/en-GB/app/search_services_studio/search_service?form.environment=latest&form.time.earliest=-24h%40h&form.time.latest=now&form.span=30s&form.scale=linear) |
| Search Indexing Service | [Splunk Dashboard](https://splunk.wdprapps.disney.com/en-US/app/search_services_studio/search_indexing_service?form.brand=*&form.locale=*&form.time.earliest=-4h%40m&form.time.latest=now&form.span=10m&form.scale=linear) |
| Search Indexing (Stage) | [Splunk Dashboard (Stage)](https://stage.splunk.wdprapps.disney.com/en-US/app/search_services_studio/search_indexing_service) |
| Elasticsearch | [Elastic Monitoring](https://dpep-obs.kb.us-east-1.aws.found.io/app/monitoring#/overview?_g=(cluster_uuid:e5PGIeiZQqyX1bkff8OB0A,refreshInterval:(pause:!f,value:10000),time:(from:now-15m,to:now))) |
| PINs Load Batch | [Splunk Dashboard](https://splunk.wdprapps.disney.com/en-US/app/COMO/wdpr-pins-load-batch) |
| PINs Load Batch (Stage) | [Splunk Dashboard (Stage)](https://stage.splunk.wdprapps.disney.com/en-US/app/COMO/wdpr-pins-load-batch) |

### Alerts

| System | Alerts Link |
|--------|-------------|
| Search Service & Indexing | [Splunk Alerts](https://splunk.wdprapps.disney.com/en-US/app/search_services_studio/alerts) |
| Elasticsearch | [Elastic Alerts](https://dpep-obs.kb.us-east-1.aws.found.io/app/management/insightsAndAlerting/triggersActions/rules) |

### Splunk Indexes

| Index | Service |
|-------|---------|
| `wdpr_sis` | Search Indexing Service |
| Splunk App: `search_services_studio` | Search Service, Indexing Service |
| Splunk App: `COMO` | PINs Load Batch |

### MS Teams Webhook Integrations

| Service | Environment | Endpoint |
|---------|-------------|----------|
| Search Indexing Service | Lowers | `https://prod-161.westus.logic.azure.com:443/workflows/86ace0e09fa94eeb9c63934b4684be84/triggers/manual/paths/invoke` |
| Search Indexing Service | Prod | `https://prod-136.westus.logic.azure.com:443/workflows/9e3c1214595443f58917938ff2c27d85/triggers/manual/paths/invoke` |
| Elasticsearch | Prod | `https://prod-78.westus.logic.azure.com:443/workflows/3ae7698dd66748bdbb450bc705a19a94/triggers/manual/paths/invoke` |
| Elasticsearch | Lowers | `https://prod-66.westus.logic.azure.com:443/workflows/9a09a5f58ecb49ac8ffa1b0f23766d82/triggers/manual/paths/invoke` |

Note: All MS Teams webhooks need URI variables. Check application properties files and/or Vault for those.

## Code Quality

| Service | SonarQube |
|---------|-----------|
| Search Service (Java) | [SonarQube](https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpr.search%3Asearch-service-parent) |
| Search Web API (Node.js) | [SonarQube](https://sonar.cicd.wdprapps.disney.com/dashboard?id=wdpr-content-search-webapi) |
| Search Indexing Service | [SonarQube](https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpr.sis%3Asearch-indexing-service-parent) |

## Elasticsearch Infrastructure

### Cluster Endpoints by Environment

| Cluster | Env | Kibana | Elasticsearch | APM |
|---------|-----|--------|---------------|-----|
| DPEP Production | Prod East | https://dpep-prod.kb.us-east-1.aws.found.io | https://dpep-prod.es.us-east-1.aws.found.io | — |
| DX Production - West | Prod West | https://dx-prod-west.kb.us-west-2.aws.found.io | https://dx-prod-west.es.us-west-2.aws.found.io | — |
| DPEP Stage | Stage East | https://dpep-stage.kb.us-east-1.aws.found.io | https://dpep-stage.es.us-east-1.aws.found.io | — |
| DX Stage - West | Stage West | https://dx-stage-west.kb.us-west-2.aws.found.io | https://dx-stage-west.es.us-west-2.aws.found.io | — |
| DPEP Latest | Latest | https://dpep-latest.kb.us-east-1.aws.found.io | https://dpep-latest.es.us-east-1.aws.found.io | https://dpep-latest.apm.us-east-1.aws.found.io |
| DPEP Observability | Obs East | https://dpep-obs.kb.us-east-1.aws.found.io | https://dpep-obs.es.us-east-1.aws.found.io | https://dpep-obs.apm.us-east-1.aws.found.io |
| DPEP Observability - West | Obs West | https://dx-obs.kb.us-west-2.aws.found.io | https://dx-obs.es.us-west-2.aws.found.io | https://dx-obs.apm.us-west-2.aws.found.io |

### Boosts & Blocks

Boosts and blocks are stored in the `boost_block` Elasticsearch index. They control search result ordering and filtering:

- **Boost**: Artificially reorders search results for specific keywords. References documents in entity indices (e.g., `wdw_entities_en-us`). Supports `pc` (web) and `mobile` targeting. Keywords are EXACT match only.
- **Block**: Removes documents from search results for specific keywords. Special keyword `block_all` removes from all searches.
- **Featured Listing**: CMS-driven object (Title, Description, Media) with triggering keywords. Always appears as first result. Created by producers, not the search team.

Methods of hiding documents from search results:
1. Remove the `finder-listing` facet for web/mobile (may affect other apps)
2. Add the `finder-not-searchable` facet (hides from both web and mobile)
3. Add a block in the `boost_block` index (can target web only, mobile only, or both; can be keyword-specific or all searches)

## Search Service Infrastructure

### Application Info
- **BAPP ID**: BAPP0142700
- **Hosting**: AWS (multi-region active-active)
- **ServiceNow CI (Stage)**: WDPR Search Service - AWS Stage
- **ServiceNow CI (Prod)**: WDPR Search Service - AWS Production

### CI/CD — Jenkins

| Pipeline | URL |
|----------|-----|
| Main Pipeline | https://gam.cicd.wdprapps.disney.com/job/wdpr-content-search-api/ |
| Single Repo Build | https://gam.cicd.wdprapps.disney.com/job/wdpr-content-search-api/job/wdpr-content-search-api-single-repo/ |
| WebAPI Package (unit tests) | https://gam.cicd.wdprapps.disney.com/job/wdpr-content-search-api/job/wdpr-content-search-webapi-package/ |
| Publish Docker | https://gam.cicd.wdprapps.disney.com/job/wdpr-content-search-api/view/Deploy/job/wdpr-content-search-api-publish-docker/ |
| Deploy AWS (Latest, auto) | https://gam.cicd.wdprapps.disney.com/job/wdpr-content-search-api/view/Deploy/job/wdpr-content-search-api-aws-live/ |
| Deploy AWS (Stage/Prod, manual) | https://gam.cicd.wdprapps.disney.com/job/wdpr-content-search-api/view/Deploy/job/wdpr-content-search-webapi-aws-live/ |

### Nexus Artifacts

| Environment | Nexus URL |
|-------------|-----------|
| Latest | https://nexus3.disney.com/service/rest/repository/browse/WDPRT-latest/com/disney/wdpr/search/search-service/ |
| Stage | https://nexus3.disney.com/service/rest/repository/browse/WDPRT-stage/com/disney/wdpr/search/search-service/ |
| Release | https://nexus3.disney.com/service/rest/repository/browse/WDPRT-release/com/disney/wdpr/search/search-service/ |
| Main | https://nexus3.disney.com/service/rest/repository/browse/WDPRT-master/com/disney/wdpr/search/search-service/ |

### Deployment Process

**Latest**: Automatic on PR merge → build → Docker publish → AWS deploy

**Stage**: Manual deployment requiring:
1. Create ServiceNow CHG ticket (CI: `WDPR Search Service - AWS Stage`, Assignment Group: `app-global-finder-search`, Template: `DPEP Live`)
2. Add CTASK for deployment + validation
3. Trigger Jenkins deploy with parameters: Environment=stage, Tag=version, Skip-Canary=TRUE

**Production**: Manual deployment requiring:
1. Create ServiceNow CHG ticket (CI: `WDPR Search Service - AWS Production`, Assignment Group: `app-global-finder-search`, Template: `DPEP Live`)
2. Add CTASK for `ops-global-ApplicationDeploymentServices` to deploy
3. Add CTASK for `app-global-finder-search` to validate
4. Fill out Risk Assessment
5. Obtain Finance Approval if during Blackout period
6. Email `WDAT.DL-Application.Deployment.Services@disney.com` for deployment CTASK assignment

## Search Indexing Service Infrastructure

### Application Info
- **BAPP ID**: BAPP0231005
- **Jenkins**: https://gam.cicd.wdprapps.disney.com/job/wdpr-content-search-indexing-svc/
- **AuthZ (Launchpad)**: https://authz.launchpad.go.com/product/20a05aba-8207-49b9-bcf3-7ea4f7d37769
- **SID**: https://sid.disney.com/display/feb949e11be3249092ab326fdc4bcbee

### SNS Integration
The Search Indexing Service subscribes to Amazon SNS topics that deliver notifications on CRUD operations to documents in FAS. On notification:
- **Delete operation** → removes document from Elasticsearch
- **Create/Update** → pulls document from Explorer Service and pushes to Elasticsearch

SNS Topic filter sends only messages with tags: `NO_SCHEDULE_CHANGE`, `DELETE_CHANGE`

## PINs Load Batch Infrastructure

### Application Info
- **BAPP ID**: BAPP0064887
- **GitHub**: https://github.disney.com/WDPR-Sales-SVCS/wdpr-pins-load-batch/
- **Jenkins**: https://rev-mgmt.cicd.wdprapps.disney.com/job/wdpr-pins-load-batch/
- **Runbook**: https://confluence.disney.com/pages/viewpage.action?spaceKey=EESE&title=WDPR+Pins+Load+Batch+-+BAPP0064887

### AWS Accounts & Roles

| Environment | AWS Role |
|-------------|----------|
| Latest | `wdpr-packaging-dev` |
| Stage & Load | `wdpr-packaging-test` |
| Prod | `wdpr-packaging-prod` |

### AWS Batch (Prod)
- **Job Queue**: `wdpr-packaging-use1-prd-c5xlarge-med-queue`
- **Job Definition**: `wdpr-pinsload-batch-prod`
- **Console**: https://us-east-1.console.aws.amazon.com/batch/home?region=us-east-1#jobs

### CloudWatch Logs (Prod)
- Batch logs: `/aws/batch/job` (filter: `pinsload-batch-prod`)
- Lambda logs: `/aws/lambda/wdpr-packaging-S0001795-use1-prd-pinsload-awsbatch-cw`

## ServiceNow

| Assignment Group | Scope |
|-----------------|-------|
| `app-global-finder-search` | Search Service, Indexing Service, Elasticsearch |
| `ops-global-ApplicationDeploymentServices` | Production deployments (CTASK assignment) |

## Team Responsibilities

### Search Indexing Service
Configuring and maintaining the service that collects, parses, and indexes content from DScribe/CMS into Elasticsearch for Disney's digital properties. SNS-driven with filter for `NO_SCHEDULE_CHANGE` and `DELETE_CHANGE` events.

### Elasticsearch Operations
Operating and monitoring the Elastic Cloud-based search infrastructure with multi-region (east/west) active-active setup across environments (latest, stage, prod). Managing the observability clusters for monitoring.

### Search Service
Maintaining the backend search service that powers search across Disney web and mobile apps. Handles relevancy tuning, analytics, and data translation between clients and Elasticsearch.

### Boosts/Blocks & Crawl List
Configuring search relevancy tuning via the `boost_block` Elasticsearch index:
- Boosting specific results for keywords (exact match, web/mobile targeting)
- Blocking results from appearing
- Managing the crawl list for non-organic pages

### PINs Load Batch
AWS Batch jobs pulling data from Disney services into Elasticsearch.

### Sustainment & Troubleshooting
- Removing stale/unpublished pages from search results (via facets or boost_block)
- Investigating indexing failures
- Triaging production search issues

### Monitoring & Alerting
Maintaining Splunk dashboards and Elastic alerts for all services.

## Key Wiki Pages

| Page | Content |
|------|---------|
| [Team Home](https://mywiki.disney.com/spaces/DPEPSD/pages/445256067/DX+Studio+Raya) | Team overview and navigation |
| [Monitoring Overview](https://mywiki.disney.com/pages/viewpage.action?pageId=1166840422) | Dashboards and alerts summary |
| [Search Service Ops](https://mywiki.disney.com/pages/viewpage.action?pageId=453995544) | AWS, Jenkins, deployment process, Nexus, Sonar |
| [Indexing Service](https://mywiki.disney.com/pages/viewpage.action?pageId=470280924) | BAPP, SNS, Jenkins, Sonar, Teams webhooks |
| [Elasticsearch](https://mywiki.disney.com/pages/viewpage.action?pageId=473804351) | Elastic Cloud endpoints, boost/block config |
| [PINs Load Batch](https://mywiki.disney.com/pages/viewpage.action?pageId=534891384) | AWS Batch, CloudWatch |
