# Runbook — WDPRD Ticket Management Service

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/WDW+TMS+Runbook)

| 

# 

## Objective

The objective of the Operations Readiness Review Checklist is to determine if the application is ready for go-live and to be successfully supported by the e-commerce Sustainment team.  

 | 
# 1. Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | Ticket Management Service (TMS) is an application used for digital services to support post-purchase and some park operation flows.
 | 2 | **Collaboration Tools**: Any links Slack channels or other methods to communicate besides email | 
#dpeptd-studio-mars

 | 
# 2. Technical Architecture

 | # | Item Description | Answer
 | 1 | **Security Assessment**: Has an application security assessment been completed? | Yes
 | 2 | **Security Penetration Test**: Has a Penetration test been performed?  If so, have all findings been addressed? | Yes
 | 3 | 
**Additional Security Questions: **
- Has the infrastructure been “hardened” to allow for minimum required access, port restrictions, appropriate encryption, etc?
- If any Open Source is being employed, has it been identified and appropriately reviewed?
- Has the application source code undergone a security review (Either static or dynamic?)  If so, have all findings been addressed? 
 | 

1.- Yes
2.- Yes
3.- Yes

 | 4 | 
**Interfaces/URLs**: Provide a list of interfaces or web URLs (Please see list in section 5 for explicit urls)

 | Environment and Type | Link/Path | INTERNET-FACING * | Primary**
 | DLR / Internal | [https://<env>.tms.int.wdw.wdpro.disney.com/ticket-management-service/health/shallow](https://tms.int.wdw.wdpro.disney.com/ticket-management-service/health/shallow) | No | No
 | DLR / External | [https://<env>.tms.wdw.wdpro.disney.com/ticket-management-service/health/shallow](https://tms.int.wdw.wdpro.disney.com/ticket-management-service/health/shallow) | Yes | No
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links**: | 
Load / Prod: [https://bluedolphin.app/twdc/drafts/68b054c66d7835ffc0081b8f](https://bluedolphin.app/twdc/drafts/68b054c66d7835ffc0081b8f)

Latest / Stage: [https://bluedolphin.app/twdc/drafts/68b054c60a658c7350b84cdf](https://bluedolphin.app/twdc/drafts/68b054c60a658c7350b84cdf)

 | 6 | **Application Functionality**:  | Ticket Management Service (TMS) is an application used for digital services to support post-purchase flow as well as some park operation activities. It provides endpoints for the mobile and web flows to retrieve guest's entitlements. It completely relies on GAM for entitlement retrieval.
 | 7 | **JMeter**:  | Performance JMeter scripts: [https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS](https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS)
 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file: [https://github.disney.com/commerce/wdpr-ecommerce-tms-svc/blob/develop/pom.xml](https://github.disney.com/commerce/wdpr-ecommerce-tms-svc/blob/develop/pom.xml)

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 84.5%

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: [https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aticket-management-service](https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aticket-management-service)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
 Internal: [https://tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html](https://tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html)

 External: [https://tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html](https://tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html)

 | 12 | 
**Sequence Diagrams **

 
 | 
TODO 

 | 13 | 
**Component Diagrams **
 | 
TODO

 | 14 | 
**Component Load Tested: **Nice to have but optional as the service needs to be load tested before reaching production. 

 | 
Last test at the moment of writing:

Internal: 

External: 

 | 
# 3. ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | BAPP0081809

 | 
# 4. Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | TMS | [https://github.disney.com/commerce/wdpr-ecommerce-tms-svc](https://github.disney.com/commerce/wdpr-ecommerce-tms-svc)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide a link or other applicable location on the details. | Harness: [https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_Ticket_Management_Service/deployments](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_Ticket_Management_Service/deployments)
 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | No. The DB password is encrypted in Nimbus.
 | 5 | **Performance Testing**: Provide links to the PE results | 
Last test at the moment of writing:

Internal: 

External: 

 | 
# 5. Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
WDW: wdw_tms

Cribl changes done for WDW TMS 2.49 in lowers and prod, the index to use is:

index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="tms-svc*"
index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="tmsint-svc*" 
 | 2 | 
**Infrastructure Monitoring**: Indicate what is being monitored (Server, Database, and Storage), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

 | RESOURCE TYPE | RESOURCE NAME | MONITOR | THRESHOLD | ALERT RECIPIENTS
 | Server | No value | No value | No value | No value
 | Database | MOSA | No value | No value | No value
 | Storage | No value | No value | No value | No value

 | Please enter your answer within the "Item Description" area
 | 3 | 
**Application Monitoring**: Indicate what is being monitored(APM, Synthetics, etc.), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

Please refer to the TMS section on 

 | 
# 6. Application URLS 

Please provide in the section below the ulrs per environment and brand for the different elements needed to work with the service like:
- AppD
- ECS Cluster
- Swagger documentation
- Health Check Endpoints
- Dependencies like MQ or Redis

AWS Account: commerce

 | Cluster | Application | Environment | URL
 | Internal | AppD | Latest | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=2846&component=6394101&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=2846&component=6394101&dashboardMode=force)
 | Stage | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=3056&component=6401643&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.

---
*[Truncated — see full runbook in Confluence]*
