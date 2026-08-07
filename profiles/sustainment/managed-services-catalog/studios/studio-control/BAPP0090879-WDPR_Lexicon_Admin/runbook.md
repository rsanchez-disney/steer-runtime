# Runbook — WDPR Lexicon Admin

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/Lexicon+Admin+App+-+Runbook)

**Objective**

Lexicon Admin is a tool for migrating Product Types from one environment to another. It is meant to be used by producers and managers to provide a means of data migration.

 | 
# Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | Lexicon Admin is for the administration of Lexicon service.

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
 | Internal Load Balancer | [https://<env>.lexicon-admin.wdprapps.disney.com/ui#!login](https://latest.lexicon-admin.wdprapps.disney.com/ui#!login) | No | No
 | Akamai | No. It's an internal app | N/A | N/A
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links**: | 
Load / Prod: [https://bluedolphin.app/twdc/drafts/68c2cb044b12863b85821c36](https://bluedolphin.app/twdc/drafts/68c2cb044b12863b85821c36)

Latest / Stage: [https://bluedolphin.app/twdc/drafts/68c2cb0465050136be32ba8b](https://bluedolphin.app/twdc/drafts/68c2cb0465050136be32ba8b)

 | 6 | **Application Functionality**:  | Lexicon Admin is for the administration of Lexicon service. Tool for migrating Product Types from one environment to another**
**
 | 7 | **JMeter**:  | 
Performance JMeter

N/A - Ask for Sign-off from Studio Nike for release.

 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file: [https://github.disney.com/commerce/wdpr-ecommerce-lexicon-admin/blob/develop/pom.xml](https://github.disney.com/commerce/wdpr-ecommerce-lexicon-admin/blob/develop/pom.xml)

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 89.3% 

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: [https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro:LexiconAdmin](https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro:LexiconAdmin)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
Swagger  NA
Documentation: 

 | 12 | 
**Sequence Diagrams **

 
 | 
NA

 | 13 | 
**Component Diagrams **
 | 
[https://github.disney.com/se-wdprd/AIDS/raw/master/SHDR/LexiconAdmin.pdf](https://github.disney.com/se-wdprd/AIDS/raw/master/SHDR/LexiconAdmin.pdf)

 | 14 | 
**Component Load Tested: **Nice to have but optional as the service needs to be load tested before reaching production. 

 | 
N/A

 | 
# ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | **BAPP0090879**

 | 
# Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | lexicon-admin | [https://github.disney.com/commerce/wdpr-ecommerce-lexicon-admin](https://github.disney.com/commerce/wdpr-ecommerce-lexicon-admin)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | 
Harness: [https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPR_Lexicon_Admin/pipelines](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPR_Lexicon_Admin/pipelines)

Jenkins: [https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexicon-admin/job/wdpr-ecommerce-lexicon-admin-single-repo/](https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexicon-admin/job/wdpr-ecommerce-lexicon-admin-single-repo/) (to be decommissioned)

 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 5 | **Performance Testing**: Provide links to the PE results | 
N/A

 | 
# Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
**QA**: index=wdpr_lexicon_admin source=*<env>*

**PROD**: index=wdpr_lexicon_admin

The app was migrated to Cribl on 2025-09-04, new index is for all envs:

index=wdpr-ecommerce ecs_cluster="wdpr-ecommerce-S0001323-usw2-<env>" ecs_task_definition="lexicon-admin*"

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

[AppD - Lexicon Admin - Latest](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=4252&component=7459809&dashboardMode=force)[PROD][AppD - Lexicon Admin - Prod](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=811&component=306659&dashboardMode=force)

 | 
# Application URLS 

 | Application | Environment | URL
 | **AppD** | Latest | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=4252&component=7459809&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=4252&component=7459809&dashboardMode=force)
 | Stage | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4260&component=7461213&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4260&component=7461213&dashboardMode=force)
 | Load | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4261&component=7461222&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4261&component=7461222&dashboardMode=force)
 | Production | [https://disney-prod.saas.appdynamics.com/con

---
*[Truncated — see full runbook in Confluence]*
