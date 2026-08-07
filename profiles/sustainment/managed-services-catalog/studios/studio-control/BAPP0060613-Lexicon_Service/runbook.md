# Runbook — Lexicon Service

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/Lexicon+Service+-+Runbook)

**Objective**

Lexicon Service is an internal purposed tool which gives the capability to Disney Digital Producers to create, edit and delete Stand Alone Tickets, this data is used to maintain the product catalog from which the consumers can perform their purchases

This application is not directly guest facing, the data is managed on Lexicon then it's published to a Redis Cluster from which Lexicon View Assembler Service is feed..

 | 
# Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | Lexicon Service is a simple CRUD Restful Java API abstraction layer used by Lexicon UI and Lexicon View Assembler Service to update Lexicon data
 | 2 | **Collaboration Tools**: Any links Slack channels or other methods to communicate besides email | 
[#dprd-studio-control](https://disney.slack.com/archives/C04KVCS62)

 | 
# Technical Architecture

 | # | Item Description | Answer
 | 1 | **Security Assessment**: Has an application security assessment been completed? | Yes
 | 2 | **Security Penetration Test**: Has a Penetration test been performed?  If so, have all findings been addressed? | Yes
 | 3 | 
**Additional Security Questions: **
- Has the infrastructure been “hardened” to allow for the minimum required to access, port restrictions, appropriate encryption, etc?
- If any Open Source is being employed, has it been identified and appropriately reviewed?
- Has the application source code undergone a security review (Either static or dynamic?)  If so, have all findings been addressed? 
 | 

1.- Yes
2.- Yes
3.- Yes

 | 4 | 
**Interfaces/URLs**: Provide a list of interfaces or web URLs (Please see list in section 5 for explicit urls)

 | Environment and Type | Link/Path | INTERNET-FACING * | Primary**
 | Internal Load Balancer | [http://<env>.us.lexiconsvc.wdprapps.disney.com/lexicon-service/lexicon/health/deep](http://latest.us.lexiconsvc.wdprapps.disney.com/lexicon-service/lexicon/health/deep) | No | No
 | Akamai | No. It's an internal app | N/A | N/A
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links**: | 
Load / Prod: [https://bluedolphin.app/twdc/drafts/68c2cb044b12863b85821c36](https://bluedolphin.app/twdc/drafts/68c2cb044b12863b85821c36)

Latest / Stage: [https://bluedolphin.app/twdc/drafts/68c2cb0465050136be32ba8b](https://bluedolphin.app/twdc/drafts/68c2cb0465050136be32ba8b)

 | 6 | **Application Functionality**:  | Lexicon Service is a simple CRUD Restful Java API abstraction layer used by Lexicon UI and Lexicon View Assembler Service to update Lexicon data.
 | 7 | **JMeter**:  | 
Performance JMeter

scripts: [https://github.disney.com/PE/PE_Scripts/blob/master/DevStudios/LexiconService/lexicon_service_Jmeter.jmx](https://github.disney.com/PE/PE_Scripts/blob/master/DevStudios/LexiconService/lexicon_service_Jmeter.jmx)

 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file:  [https://github.disney.com/commerce/wdpr-ecommerce-lexicon-service/blob/develop/pom.xml](https://github.disney.com/commerce/wdpr-ecommerce-lexicon-service/blob/develop/pom.xml)

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 82.5% 

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: 

[https://sonar.cicd.wdprapps.disney.com/dashboard?branch=develop&id=com.disney.wdpro.service%3Awdpr-ecommerce-lexicon-service](https://sonar.cicd.wdprapps.disney.com/dashboard?branch=develop&id=com.disney.wdpro.service%3Awdpr-ecommerce-lexicon-service)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
Swagger: [https://latest.us.lexiconsvc.wdprapps.disney.com/lexicon-service/lexicon/docs/index.html](https://latest.us.lexiconsvc.wdprapps.disney.com/lexicon-service/lexicon/docs/index.html)

More detailed documentation can be found at:

 | 12 | 
**Sequence Diagrams **

 
 | 
NA

 | 13 | 
**Component Diagrams **
 | 

 | 14 | 
**Component Load Tested: **Nice to have but optional as the service needs to be load tested before reaching production. 

 | 
Last test at the moment of writing:

 | 
 | 
**Github repo**
 | 
[https://github.disney.com/commerce/wdpr-ecommerce-lexicon-service](https://github.disney.com/commerce/wdpr-ecommerce-lexicon-service)

 | 
 | 
**LEXICON API Library**
 | 
[https://github.disney.com/commerce/wdpr-ecommerce-lex-api-library](https://github.disney.com/commerce/wdpr-ecommerce-lex-api-library)

 | 
# ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | **BAPP0060613**

 | 
# Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | Lexicon-Service | [https://github.disney.com/commerce/wdpr-ecommerce-lexicon-service](https://github.disney.com/commerce/wdpr-ecommerce-lexicon-service)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | 
Harness: [https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/Lexicon_Service/deployments](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/Lexicon_Service/deployments)

Jenkins: [https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexicon-service/](https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexicon-service/) (to be decommissioned)

 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 5 | **Performance Testing**: Provide links to the PE results | 
Last test at the moment of writing:

 | 
# Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
**QA**: index=wdpr_lexicon_service source=*<env>*

**PROD**: index=wdpr_lexicon_service

**CRIBL:** index=wdpr-ecommerce ecs_cluster="wdpr-ecommerce-S0001323-usw2-<env>" ecs_task_definition="lexicon-svc*" 

index=wdpr-ecommerce ecs_cluster="*" ecs_task_definition="lexicon-svc-*" | stats count by ecs_cluster, ecs_task_definition

where <env> can be:
- lst
- stg
- lod
- prd

For Latest, Stage, Load and Prod respectively.

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
[PREPROD]

[https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2983&component=7462363&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2983&component=7462363&dashboardMode=force)[PROD][https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=515&component=306696&dashboardMode=force](https://disney

---
*[Truncated — see full runbook in Confluence]*
