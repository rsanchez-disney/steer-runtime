# Runbook — WDPRD Lexicon View Assembler Service

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/LexVAS+WDW)

| 
# Table of Contents

## Objective

The objective of the Operations Readiness Review Checklist is to determine if the application is ready for go-live and to be successfully supported by the e-commerce Sustainment team.  

 | 
# 1. Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | Lexicon View Assembler Service (LexVAS) is a RESTful java web service used as a product catalog for theme park tickets through digital channels. 
 | 2 | **Collaboration Tools**: Any links Slack channels or other methods to communicate besides email | 
#dprd-studio-control

 | 
# 2. Technical Architecture

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

 | Lexvas WDW
 | Environment and Type | Link/Path | INTERNET-FACING * | Primary**
 | Internal Load Balancer West | https://<env>.lexvas-wdw.wdprapps.disney.com/lexicon-view-assembler-service/health/deep
 | No | No
 | Internal Load Balancer East | [https://](https://load.lexiconvas-wdw.wdprapps.disney.com/lexicon-view-assembler-service/health/deep)<env>.lexiconvas-wdw.wdprapps.disney.com/lexicon-view-assembler-service/health/deep | No | No
 | Akamai | [https://api.wdpro.disney.go.com](https://api.wdpro.disney.go.com)/lexicon-view-assembler-service | Yes | No

* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links**: | 
[https://bluedolphin.app/twdc/drafts/68b056aa4b12863b85477fcc](https://bluedolphin.app/twdc/drafts/68b056aa4b12863b85477fcc)

 | 6 | **Application Functionality**:  | Java-based RESTful service used to support theme park tickets, photo pass, and AnnualPasses digital sales among others.
 | 7 | **JMeter**:  | 
Performance JMeter scripts:
[https://github.disney.com/PE/PE_Scripts/tree/master/Online/TPAC/LexVAS_EXT](https://github.disney.com/PE/PE_Scripts/tree/master/Online/TPAC/LexVAS_EXT)

Deprecated: [https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineLexVASService/lexvas_wdw](https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineLexVASService/lexvas_wdw)

 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file: [https://github.disney.com/commerce/wdpr-ecommerce-lexvas-api/blob/develop/pom.xml](https://github.disney.com/commerce/wdpr-ecommerce-lexvas-api/blob/develop/pom.xml)

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 85.1% 

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: [https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Alexicon-view-assembler-service](https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Alexicon-view-assembler-service)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
Swagger: [https://latest.lexvas-wdw.wdprapps.disney.com/lexicon-view-assembler-service/docs/index.html](https://latest.lexvas-wdw.wdprapps.disney.com/lexicon-view-assembler-service/docs/index.html)

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

 | 
# 3. ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | BAPP0081984

 | 
# 4. Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | Lexicon View Assembler Service | [https://github.disney.com/commerce/wdpr-ecommerce-lexvas-api/](https://github.disney.com/commerce/wdpr-ecommerce-lexvas-api/)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | 
Harness: [https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_Lexicon_View_Assembler_Service/deployments](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_Lexicon_View_Assembler_Service/deployments)

Jenkins: [https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexvas-api/](https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-lexvas-api/) (to be decommissioned)

Rundeck: [https://rundeck.wdprapps.disney.com/project/wdpr-ecommerce-lexvas-api_aws/jobs](https://rundeck.wdprapps.disney.com/project/wdpr-ecommerce-lexvas-api_aws/jobs)

 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 5 | **Performance Testing**: Provide links to the PE results | 
Last test at the moment of writing:

 | 
# 5. Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
wdpr_lexvas
int: (index=wdpr_lexvas) (source="*us-west-2*") 
ext: (index=wdpr_lexvas) (source=*us-east-1*)

index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001591-use1-<env>*" ecs_task_definition="lexvas-api*"

index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001591-usw2-<env>*" ecs_task_definition="lexvasint*"

 | 2 | 
**Infrastructure Monitoring**: Indicate what is being monitored (Server, Database, and Storage), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

 | RESOURCE TYPE | RESOURCE NAME | MONITOR | THRESHOLD | ALERT RECIPIENTS
 | Server | No value | No value | No value | No value
 | Database | No value | No value | No value | No value
 | Storage | No value | No value | No value | No value

 | Please enter your answer within the "Item Description" area
 | 3 | 
**Application Monitoring**: Indicate what is being monitored(APM, Synthetics, etc.), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

Please refer to the Booking Service section on 
 | 
LOAD: Lexvas ext: [LexStack LT - External](https://stage.splunk.wdprapps.disney.com/en-US/app/launcher/lexvas_lt_results?form.generalTimePicker.earliest=-15m&form.generalTimePicker.latest=now&form.index=wdpr_lexvas&form.source=*us-east-1*&form.generalTimeSpan=1m&form.endpointExclusion=GET%20%2Flexicon-view-assembler-service%2Fhealth&form.endpointExclusion=GET%20%2Flexicon-view-assembler-service%2Fcache-key-query&form.endpointExclusion=GET%20%2Flexicon-view-assembler-service%2Fcaches)

LOAD: Lexvas int: [LexStack LT - Internal](https://stage.splunk.wdprapps.disney.com/en-US/app/launcher/lexvas_lt_results?form.generalTimePicker.earliest=-15m&form.generalTimePicker.latest=now&form.index=wdpr_lexvas&form.source=*load*&form.source=*lt*&form.generalTimeSpan=1m&form.endpointExclusion=GET%20%2Flexicon

---
*[Truncated — see full runbook in Confluence]*
