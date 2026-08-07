# Runbook — WDPR Commerce StopSales Manager

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/Stop+Sales+Admin+UI+-+Runbook)

**Objective**

Stop Sales Admin is a full-stack application that leverages the Vaadin framework and is deployed to an ECS instance in AWS. The UI is used to create and manage Stop Sale Configurations that use a variety of filters to stop sale on groups of similar tickets for specific dates. 

 | 
# Application Overview

 | # | Item Description | Answer
 | 1 | 
**Application Description**:
 | The UI is used to create and manage Stop Sale Configurations that use a variety of filters to stop sale on groups of similar tickets for specific dates. Configurations use a combination of product filters to group tickets.  Current available filters are: Category (only ThemePark is supported), Parks, Add-Ons, and Duration. Dates placed on stop sale are determined by the "Stop Sale Start Date" and "Stop Sale End Date" specified on the configuration. Additionally, each configuration includes an "Effective Start Date" and "Effective End Date" which are used to determine the window during which affected SKUs and affected dates are placed on a stop sale. Sku/Date level stop sale records are not generated until a configuration is "Published" and will not be sent to downstream services until a configuration has reached it's "Effective Start Date"
 | 2 | **Collaboration Tools**: Any links Slack channels or other methods to communicate besides email | 
[#dprd-studio-control](https://disney.slack.com/archives/C04KVCS62)

 | 3 | **Stop Sale Admin Access** | 
Stop Sale Admin uses MyID and Keystone to control access. A Keystone Role for Stop Sale Admin can be added to any user and will be automatically read by the application when the user signs in with MyID. Administrators can add Keystone roles to user via Keystone Admin ([https://ui.keystone-stg.disney.com/](https://ui.keystone-stg.disney.com/) for lowers and [https://ui.keystone.disney.com/](https://ui.keystone.disney.com/) for production).

Stop Sales Admin Access List: [Stop Sale Admin Access.xlsx](https://twdc.sharepoint.com/:x:/r/sites/Pearl/Shared%20Documents/General/QA/_Commerce%20Milestone%202/Stop%20Sale%20Admin%20Access.xlsx?d=wbae9f972e32f46e6b38b6c97025f4045&csf=1&web=1&e=aV58yS)

 | 
# Technical Architecture

 | # | Item Description | Answer
 | 1 | **Security Assessment**: Has an application security assessment been completed? | **TBC**
 | 2 | **Security Penetration Test**: Has a Penetration test been performed?  If so, have all findings been addressed? | REQ6868154 [RITM7024001](https://disney.service-now.com/dtoolsitsp?id=ticket&table=sc_req_item&sys_id=b46604abc318f190d84734df0501312b&view=sp)
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
 | Internal Load Balancer | https://<env>.stopsales-admin-wdw.wdprapps.disney.com/ssales/healthcheck | No | No
 | Akamai | **TBC** | N/A | N/A
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface?

** **
 | **TBC**
 | 5 | **AID Links**: | [https://docs.google.com/drawings/d/1N4-a1po5guY650KNoYc7YPZmXfjWON80NpfT4p49GF0](https://docs.google.com/drawings/d/1N4-a1po5guY650KNoYc7YPZmXfjWON80NpfT4p49GF0/edit)
 | 6 | **Application Functionality**:  | Stop Sales Admin is a full-stack application that leverages the Vaadin framework and is deployed to an ECS instance in AWS. The UI is used to create and manage Stop Sale Configurations that use a variety of filters to stop sale on groups of similar tickets for specific dates. 
 | 7 | **JMeter**:  | 
Performance JMeter

scripts: **TBC**

 | 8 | 
**Code Quality Enabled: **Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

POM file:  **TBC**

 | 9 | 
**Code coverage:** Unit test coverage >= 80% 

 | 
Yes. Current Code coverage at the moment of writing is 82.5% 
**TBC**

 | 10 | 
**Integrated with Sonar: **The services need to appear here: [https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations. 

 | 
Yes:** **[https://sonar.cicd.wdprapps.disney.com/dashboard?branch=develop&id=com.disney.wdpr.ecommerce%3Astop-sales-admin](https://sonar.cicd.wdprapps.disney.com/dashboard?branch=develop&id=com.disney.wdpr.ecommerce%3Astop-sales-admin)

 | 11 | 
**API documentation**: It can be swagger or any other kind of documentation on the API (endpoints, requests and responses)
 | 
[Stop Sales Admin - Rest API](https://confluence.disney.com/display/DPRDStudioControl/Stop+Sales+Admin+-+Rest+API)

Swagger:
Documentation: **TBC**

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
Last test at the moment of writing:

**TBC**

 | 15 | 
**Stop Sale Configuration create & publish flow**
 | 

 | 
# ServiceNow Processes and Configuration

 | # | Item Description | Answer
 | 1 | **BAPPID**: Has the Business Application CI
been created in SNOW?
 | **BAPP0243824**

 | 
# Build, Test, and Deployment

 | # | Item Description | Answer
 | 1 | 
**Source Code**: Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | stop-sales-admin | [https://github.disney.com/commerce/wdpr-ecommerce-stopsales-admin](https://github.disney.com/commerce/wdpr-ecommerce-stopsales-admin)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes**: Provide link or other applicable location on the details. | **TBC**
 | 3 | **Credential Management: **Have all service accounts and passwords been entered in Vault? | N/A
 | 4 | **Performance Testing**: Provide links to the PE results | 
Last test at the moment of writing:

**TBC**

 | 5 | **AWS / Region / Cluster** | 
wdpr-ecommerce-<env> / us-west-2 / wdw-ecommerce-S0001479-usw2-<env>

 | 6 | **Harness** | 
[https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Commerce/projects/WDPR_Commerce_StopSales_Manager/pipelines](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Commerce/projects/WDPR_Commerce_StopSales_Manager/pipelines)

 | 
# Monitoring and Alert Configuration

 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
**QA**: index=wdpr_stopsalesadmin source=*<env>*

**PROD**: index=wdpr_stopsalesadmin

cribl: index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2-<env>" ecs_task_definition="stopsalesadmin-ssales*"

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
**Splunk Dashboard **[PREPROD]

Stop Sales Main: [https://sta

---
*[Truncated — see full runbook in Confluence]*
