# Runbook — Lexicon UI

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/Lexicon+UI+App+-+Runbook)

**Objective**

Lexicon UI is a tool used by producers to manage data in the Lexicon DB.  Lexicon UI uses Lexicon Service as a RESTful database abstraction layer.  Entities such as product types, product instances, booking info, names, descriptions, policies, blockout dates, etc are managed in Lexicon UI.

 | 
# Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | 
Lexicon-UI is just an UI. It has different Product Types, where producers can manage Product Categories, Product Policies, Features, etc. for both WDW and DLR.

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
 | Internal Load Balancer | [https://<env>.lexicon.ui.wdprapps.disney.com/login](https://latest.lexicon.ui.wdprapps.disney.com/login) | No | No
 | Akamai | No. It's an internal app | N/A | N/A
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links**: | 
Load / Prod: [https://bluedolphin.app/twdc/drafts/68c2cb044b12863b85821c36](https://bluedolphin.app/twdc/drafts/68c2cb044b12863b85821c36)

Latest / Stage: [https://bluedolphin.app/twdc/drafts/68c2cb0465050136be32ba8b](https://bluedolphin.app/twdc/drafts/68c2cb0465050136be32ba8b)

 | 6 | **Application Functionality**:  | Lexicon-UI is just an UI.
 | 7 | **JMeter**:  | 
Performance JMeter

N/A - Ask for Sign-off from Studio Nike for release.

 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Lexicon-UI is just an UI.

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
Yes. 

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: [https://sonar.cicd.wdprapps.disney.com/dashboard?id=lexicon-ui](https://sonar.cicd.wdprapps.disney.com/dashboard?id=lexicon-ui)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
Swagger  NA

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
N/A

 | 
# ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | **BAPP0060616**

 | 
# Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | lexicon-ui | [https://github.disney.com/commerce/wdpr-ecommerce-lexicon-ui](https://github.disney.com/commerce/wdpr-ecommerce-lexicon-ui)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | 
Harness: [https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/Lexicon_UI/deployments](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/Lexicon_UI/deployments)

Jenkins: [https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexicon-ui/job/wdpr-ecommerce-lexicon-ui-single-repo/](https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexicon-ui/job/wdpr-ecommerce-lexicon-ui-single-repo/) (to be decommissioned)

 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 5 | **Performance Testing**: Provide links to the PE results | 
N/A

 | 
# Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
**QA**: index=wdpr_lexicon_ui source=*<env>*

**PROD**: index=wdpr_lexicon_ui

index=wdpr-ecommerce ecs_cluster="wdpr-ecommerce-S0001323-usw2-<env>" ecs_task_definition="lexicon-ui*"

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

[AppD - Lexicon UI - Latest](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4438&component=7462287&dashboardMode=force)[PROD][AppD - Lexicon UI - Prod](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=884&component=306951&dashboardMode=force)

 | 
# Application URLS 

 | Application | Environment | URL
 | AppD | Latest | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4438&component=7462287&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4438&component=7462287&dashboardMode=force)
 | Stage | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4453&component=7462338&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4453&component=7462338&dashboardMode=force)
 | Load | [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4462&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=4462&dashboardMode=force)
 | Production | [https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=884&component=306951&dashboardMode=force](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=884&component=306951&dashboardMode=force)
 | Access | Latest | 
[https://latest.lexicon.ui.wdprapps.disney.com/login](https://latest.lexicon.ui.wdprapps.disney.com/login)

 | Stage | 
[https://

---
*[Truncated — see full runbook in Confluence]*
