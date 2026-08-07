# Runbook — WDPRD Entitlement View Assembly Service

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/WDW+EVAS+Runbook)

## Objective

The objective of the Operations Readiness Review Checklist is to determine if the application is ready for go-live and to be successfully supported by the e-commerce Sustainment team.  

 | 
# 1. Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | Entitlement View Assembly Service (EVAS) is an application used on top TMS to aggregate product instance information on top of TMS responses.
 | 2 | **Collaboration Tools**: Any links Slack channels or other methods to communicate besides email | 
#dpeptd-studio-mars

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

 | Environment and Type | Link/Path | INTERNET-FACING * | Primary**
 | Internal | [https://<env>.evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/shallow](https://evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/shallow) | No | No
 | External | [https://<env>.evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/shallow](https://evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/shallow) | Yes | No
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links**: | [https://bluedolphin.app/twdc/drafts/68b0550c0a658c7350b86fbc](https://bluedolphin.app/twdc/drafts/68b0550c0a658c7350b86fbc)
 | 6 | **Application Functionality**:  | Entitlement View Assembly Service (EVAS) is an application used on top TMS to aggregate product instance information on top of TMS responses. It adds information like product instances or policies to the TMS response 
 | 7 | **JMeter**:  | Performance JMeter scripts: [https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS](https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS)
 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file: [https://github.disney.com/commerce/wdpr-ecommerce-evas-svc/blob/develop/pom.xml](https://github.disney.com/commerce/wdpr-ecommerce-evas-svc/blob/develop/pom.xml)

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 80.7% 

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: [https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aentitlement-view-assembly-service](https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aentitlement-view-assembly-service)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
 Internal: [https://evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html](https://evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html)

 External: [https://evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html](https://evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html)

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
 | BAPP0061980

 | 
# 4. Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | EVAS | [https://github.disney.com/commerce/wdpr-ecommerce-evas-svc/](https://github.disney.com/commerce/wdpr-ecommerce-evas-svc/)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | Harness: [https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_EntitlementViewAssemblyService/deployments](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_EntitlementViewAssemblyService/deployments)

[https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-evas-svc/view/Deploy/job/wdpr-ecommerce-evas-svc-aws-live/](https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-evas-svc/view/Deploy/job/wdpr-ecommerce-evas-svc-aws-live/) -> this link is used to deploy the artifacts into the different environments 
 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 5 | **Performance Testing**: Provide links to the PE results | 
Last test at the moment of writing:

 | 
# 5. Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1-<env>*" ecs_task_definition="evas-svc-wdw*"

 | 2 | 
**Infrastructure Monitoring**: Indicate what is being monitored (Server, Database, and Storage), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

 | RESOURCE TYPE | RESOURCE NAME | MONITOR | THRESHOLD | ALERT RECIPIENTS
 | Server | No value | No value | No value | No value
 | Database | No value | No value | No value | No value
 | Storage | No value | No value | No value | No value

 | Please enter your answer within the "Item Description" area
 | 3 | 
**Application Monitoring**: Indicate what is being monitored(APM, Synthetics, etc.), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

Please refer to the EVAS section on 
 | 
WDW 

[WDW_EVAS - Unexpected level of 4xx](https://splunk.wdprapps.disney.com/en-US/app/launcher/alert?s=%2FservicesNS%2Fnobody%2Flauncher%2Fsaved%2Fsearches%2FWDW_EVAS%2520-%2520Unexpected%2520level%2520of%25204xx) 

[WDW_EVAS - Unexpected level of 5xx](https://splunk.wdprapps.disney.com/en-US/app/launcher/alert?s=%2FservicesNS%2Fnobody%2Flauncher%2Fsaved%2Fsearches%2FWDW_EVAS%2520-%2520Unexpected%2520level%2520of%25205xx) 

[EVAS_wdw | High time responses](https://wdpr-splunk-prod.wdprapps.disney.com/en-US/app/launcher/alert?s=%2FservicesNS%2Fnobody%2Flauncher%2Fsaved%2Fsearches%2FEVAS_wdw%2520%257C%2520High%2520time%2520responses) 

[EVAS by dependecies| High time responses](https://wdpr-splunk-prod.wdprapps.disney.com/en-US/app/launcher/alert?s=%2FservicesNS%2Fnobody%2Flauncher%2Fsaved%2Fsearches%2FEVAS%2520by%2520dependecies%257C%2520High%2520time%2520responses) 

 

[EVAS - Dependency timeout](https://wdpr-splunk-prod.wdprapps.disney.com/en-US/app/launcher/alert?s=%2FservicesNS%2Fnobody%2Flauncher%2Fsaved%2Fsearches%2FEVAS%2520-%2520Dependency%2520timeout&dispatch_view=alert) DLR and WDW 

[https://confluence.d

---
*[Truncated — see full runbook in Confluence]*
