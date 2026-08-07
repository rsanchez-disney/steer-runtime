# Runbook — WDPR Commerce StopSales Engine

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/Stop+Sales+Service+-+Runbook)

**Objective**

Stop Sales Service is an AWS Fargate service which returns stop sold data from AWS Redis cache.

 | 
# Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | This Service handles all stop sale rules related to modifications (using the hard stop flag or needsAvailCheck). Entitlement Availability Service access modifications options API to get availability by SKU/Date to get ALL stop sale data. Additionally, all API's are equipped with read a time-machine header to bypass Redis cache (i.e. make a call directly to Stop Sales Admin Service instead of Redis cache) when this header is included.
 | 2 | **Collaboration Tools**: Any links Slack channels or other methods to communicate besides email | 
[#dprd-studio-control](https://disney.slack.com/archives/C04KVCS62)

 | 
# Technical Architecture

 | # | Item Description | Answer
 | 1 | **Security Assessment**: Has an application security assessment been completed? | Yes
 | 2 | **Security Penetration Test**: Has a Penetration test been performed?  If so, have all findings been addressed? | REQ6868116 - [RITM7023963](https://disney.service-now.com/dtoolsitsp?id=ticket&table=sc_req_item&sys_id=32240cafc394f190d84734df050131d5&view=sp)
 | 3 | 
**Additional Security Questions: **
- Has the infrastructure been “hardened” to allow for the minimum required to access, port restrictions, appropriate encryption, etc?
- If any Open Source is being employed, has it been identified and appropriately reviewed?
- Has the application source code undergone a security review (Either static or dynamic?)  If so, have all findings been addressed? 
 | 

1.- **TBC**
2.- **TBC**
3.- **TBC**

 | 4 | 
**Interfaces/URLs**: Provide a list of interfaces or web URLs (Please see list in section 5 for explicit urls)

 | Environment and Type | Link/Path | INTERNET-FACING * | Primary**
 | Internal Load Balancer | https://<env>.stopsales-wdw.wdprapps.disney.com/ | No | No
 | Akamai | N/A | N/A | N/A
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | **TBC**
 | 5 | **AID Links**: | [https://docs.google.com/drawings/d/1ApPORTciSsukE4KO_An1S9eUAAQydy0RI6UNuIcJXeo/edit](https://docs.google.com/drawings/d/1ApPORTciSsukE4KO_An1S9eUAAQydy0RI6UNuIcJXeo/edit)
 | 6 | **Application Functionality**:  | Stop Sales Service is an AWS Fargate service which returns stop sold data from AWS Redis cache. This Service handles all stop sale rules related to modifications (using the hard stop flag or needsAvailCheck).
 | 7 | JMeter:  | 
Performance JMeter

scripts: **TBC**

 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file: **TBC**

 | 9 | 
**Code coverage:** Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 82.5% 

**TBC**

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: **TBC**

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
[Stop Sales Service - REST API](https://confluence.disney.com/display/DPRDStudioControl/Stop+Sales+Service+-+Rest+API)

Swagger:
Documentation: [https://stopsales-wdw.wdprapps.disney.com/stopsales/](https://stopsales-wdw.wdprapps.disney.com/stopsales/)

 | 12 | 
**Sequence Diagrams **

 
 | 
NA

 | 13 | 
**Component Diagrams **
 | 
**TBC**

 | 14 | 
**Component Load Tested: **Nice to have but optional as the service needs to be load tested before reaching production. 

 | 
**TBC**

 | 
# ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | **BAPP0244008**

 | 
# Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | stopsales-fargate-terraform | [https://gitlab.disney.com/cgs-wdw/stopsales/stopsales-fargate-terraform](https://gitlab.disney.com/cgs-wdw/stopsales/stopsales-fargate-terraform)
 | stopsales-fg-stopsales | [https://gitlab.disney.com/cgs-wdw/stopsales/stopsales-fg-stopsales](https://gitlab.disney.com/cgs-wdw/stopsales/stopsales-fg-stopsales)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | **TBC**
 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 4 | **Performance Testing**: Provide links to the PE results | 
N/A

**TBC**

 | 5 | **AWS / Region / Cluster** | 
wdpr-ecommerce-<env> / us-east-1 / stopsales-use1-<env>-stopsales-cluster

 | 6 | **Version** | 
[https://stopsales-wdw.wdprapps.disney.com/stopsales/actuator/info](https://stopsales-wdw.wdprapps.disney.com/stopsales/actuator/info)

 | 
# Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
**QA**: index=wdpr_wdw_sss stream=stopsales-use1-<env>-stopsales-fargate

**PROD**: index=wdpr_wdw_sss stream=stopsales-use1-prd-stopsales-fargate

 | 2 | 
**Infrastructure Monitoring**: Indicate what is being monitored (Server, Database, and Storage), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

 | RESOURCE TYPE | RESOURCE NAME | MONITOR | THRESHOLD | ALERT RECIPIENTS
 | Server | No value | No value | No value | No value
 | Database | No value | No value | No value | No value
 | Storage | No value | No value | No value | No value

 | Please enter your answer within the "Item Description" area
 | 3 | 
**Application Monitoring**: Indicate what is being monitored(APM, Synthetics, etc.), who is doing the monitoring, the alert thresholds, and the destination for the alerts.
 | 
Splunk Dashboard [PREPROD]

**TBC**Splunk Dashboard [PROD]Stop Sales Main: [https://splunk.wdprapps.disney.com/en-US/app/launcher/pearl__stop_sales__services_dashboard?form.timeRange.earliest=-60m%40m&form.timeRange.latest=now](https://splunk.wdprapps.disney.com/en-US/app/launcher/pearl__stop_sales__services_dashboard?form.timeRange.earliest=-60m%40m&form.timeRange.latest=now)

 | 4 | 
Splunk Alerts
 | 
[PREPROD]

**TBC**[PROD]

"[Redis Cache - allStopSoldSkus Json Processing Exception Error](https://splunk.wdprapps.disney.com/en-US/app/launcher/alert?s=%2FservicesNS%2Fnobody%2Flauncher%2Fsaved%2Fsearches%2FRedis%2520Cache%2520-%2520allStopSoldSkus%2520Json%2520Processing%2520Exception%2520Error)"(Alert is triggered if there's an error processing Redis cache data)

"[Redis Cache - AllCurrentStopSoldDataJson Processing Exception Error](https://splunk.wdprapps.disney.com/en-US/app/launcher/alert?s=%2FservicesNS%2Fnobody%2Flauncher%2Fsaved%2Fsearches%2FRedis%2520Cache%2520-%2520AllCurrentStopSoldData%2520Json%2520Processing%2520Exception%2520Error)"(Alert is triggered if there's an error processing Redis cache data)

 | 
# Application URLS 

 | Application | Environment | URL
 | AppD | Latest | N/A
 | Stage | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_day.BEFORE_NOW.-1.-1.1440&application=6479&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_day.BEFORE_NOW.-1.-1.1440&application=6479&dashboardMode=force)
 | Load | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_day.BEFORE_NOW.-1.-1.1440&application=6480&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_day.BEFORE_NOW.-1.-1.14

---
*[Truncated — see full runbook in Confluence]*
