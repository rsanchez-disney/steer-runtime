# Runbook — WDPR TTC LexVAS

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/TTC+LexVAS+WDW+-+Runbook)

**Objective**

TTC LexVas is a service that will provide ticket catalog and ticket offer services for tickets specifically for 3rd party sales via the TTC platform. It will support WDW.

 | 
# Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | TTC LexVas is a service that will provide ticket catalog and ticket offer services for tickets specifically for 3rd party sales via the TTC platform. It will support both WDW and DLR.
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
 | Internal Load Balancer | https://<env>.ttc-lexvas-wdw.wdprapps.disney.com/ttc-lexvas/health/deep | No | No
 | Akamai | No. It's an internal app | N/A | N/A
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links**: | [https://bluedolphin.app/twdc/drafts/68b055474b12863b8546c9df](https://bluedolphin.app/twdc/drafts/68b055474b12863b8546c9df)
 | 6 | **Application Functionality**:  | TTC LexVas is a service that will provide ticket catalog and ticket offer services for tickets specifically for 3rd party sales via the TTC platform. It will support both WDW and DLR.
 | 7 | **JMeter**:  | 
Performance JMeter

scripts: [https://github.disney.com/PE/PE_Scripts/blob/master/DevStudios/OnlineLexVASService/ttc_lexvas/ttc_lexicon-view-assembler-service_load_test.jmx](https://github.disney.com/PE/PE_Scripts/blob/master/DevStudios/OnlineLexVASService/ttc_lexvas/ttc_lexicon-view-assembler-service_load_test.jmx)

 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file: [https://github.disney.com/commerce/wdpr-ecommerce-ttc-lexvas/blob/develop/pom.xml](https://github.disney.com/commerce/wdpr-ecommerce-ttc-lexvas/blob/develop/pom.xml)

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 81.1% 

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes: [https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Attc-lexvas](https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Attc-lexvas)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 

Swagger  [https://latest.ttc-lexvas-wdw.wdprapps.disney.com/ttc-lexvas/docs/index.html#](https://latest.ttc-lexvas-wdw.wdprapps.disney.com/ttc-lexvas/docs/index.html)

 | 12 | 
**Sequence Diagrams **

 
 | 
NA

 | 13 | 
**Component Diagrams **
 | 
NA

 | 14 | 
**Component Load Tested: **Nice to have but optional as the service needs to be load tested before reaching production. 

 | 
Latest test at the moment of writing:

 | 
# ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | **BAPP0242760**

 | 
# Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | TTC Lexvas | [https://github.disney.com/commerce/wdpr-ecommerce-ttc-lexvas](https://github.disney.com/commerce/wdpr-ecommerce-ttc-lexvas)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | Harness: [https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPR_TTC_LexVAS/deployments](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPR_TTC_LexVAS/deployments)
 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 5 | **Performance Testing**: Provide links to the PE results | 
Last test at the moment of writing:

 | 
# Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
**QA**: index=wdpr_ttc_lexvas source=*us-east-1*<env>* 

**PROD**: index=wdpr_ttc_lexvas source=*us-east-1* 

Dashboard:

QA [https://stage.splunk.wdprapps.disney.com/en-US/app/search/studio_control__ttc_lexvas?form.generalTimePicker.earliest=-24h%40h&form.generalTimePicker.latest=now&form.index=wdpr_ttc_lexvas&form.source=*us-east-1*load*&form.generalTimeSpan=1m&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealthcheck&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealth%2Fdeep](https://stage.splunk.wdprapps.disney.com/en-US/app/search/studio_control__ttc_lexvas?form.generalTimePicker.earliest=-24h%40h&form.generalTimePicker.latest=now&form.index=wdpr_ttc_lexvas&form.source=*us-east-1*load*&form.generalTimeSpan=1m&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealthcheck&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealth%2Fdeep)

PROD 

[https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_control__ttc_lexvas?form.generalTimePicker.earliest=-60m%40m&form.generalTimePicker.latest=now&form.index=wdpr_ttc_lexvas&form.source=*us-east-1*&form.generalTimeSpan=1m&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealthcheck&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealth%2Fdeep](https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_control__ttc_lexvas?form.generalTimePicker.earliest=-60m%40m&form.generalTimePicker.latest=now&form.index=wdpr_ttc_lexvas&form.source=*us-east-1*&form.generalTimeSpan=1m&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealthcheck&form.endpointExclusion=GET%20%2Fttc-lexvas%2Fhealth%2Fdeep)

cribl: index=wdpr-ecommerce ecs_cluster="wdpr-ecommerce-S0001663-use1-<env>" ecs_task_definition=ttc-lexvas-*

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

[https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_15_minutes.BEFORE_NOW.-1.-1.15&application=5675&dashboardMode=force](https://disney-preprod.saas.appdynamics.com/

---
*[Truncated — see full runbook in Confluence]*
