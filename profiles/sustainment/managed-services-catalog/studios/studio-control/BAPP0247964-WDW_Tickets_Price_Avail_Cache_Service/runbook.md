# Runbook — WDW Tickets Price Avail Cache Service

Source: [Confluence WDPROS](https://confluence.disney.com/display/WDPROS/TPAC+WDW+-+Runbook)

| 
# 1. Application Overview

 
 | # | Item Description | Answer
 | 1 | 
**Application Description** :
 | TPAC is a microservice that handles price retrieval and lowest prices calculation with Dynamic Prices Engine (DPE) as source of record. It also stores Stop Sales data, which is assembled along product pricing calendar in the client response. 
 | 2 | **Collaboration Tools** : Any links Teams channels or other methods to communicate besides email | 
 [ DX - Studio Control | DX - Commerce Ticketing and Checkout Verticals | Microsoft Teams ](https://teams.microsoft.com/l/channel/19%3AN7ofY17C8fye-1cs5yLhUrSLaWsp4ggdGhUEBA24bIM1%40thread.tacv2/DX%20-%20Studio%20Control?groupId=35a13470-e675-44b7-810e-f062466cffb5&tenantId=56b731a8-a2ac-4c32-bf6b-616810e913c6&ngc=true&allowXTenantAccess=true) 

 
 | 
# 2. Technical Architecture

 
 | # | Item Description | Answer
 | 1 | **Security Assessment** : Has an application security assessment been completed? | RITM8280254
 | 2 | **Security Penetration Test** : Has a Penetration test been performed?  If so, have all findings been addressed? | RITM8280254
 | 3 | 
**Additional Security Questions:**
- Has the infrastructure been “hardened” to allow for the minimum required to access, port restrictions, appropriate encryption, etc?
- If any Open Source is being employed, has it been identified and appropriately reviewed?
- Has the application source code undergone a security review (Either static or dynamic?)  If so, have all findings been addressed?
 | 

- TBC
- Didn't use any open source.
- TBC

 | 4 | 
**Interfaces/URLs** : Provide a list of interfaces or web URLs (Please see list in section 5 for explicit urls)

 | TPAC WDW
 | Environment and Type | Link/Path | INTERNET-FACING * | Primary**
 | Internal Load Balancer  | https://<env>.tpac-svc-wdw.wdprapps.disney.com/price-avail/actuator/health | No | No
 | Akamai | No. It's an internal app | No | No
* = Is the interface accessible outside the Disney network? ** = Can business users access this interface? ** **
 | Please enter your answer within the "Item Description" area
 | 5 | **AID Links** : | [ https://docs.google.com/drawings/d/1Ah01cX9AVxO_zahYv5747xDwnAvPMrYFQsPF8Up7_FI ](https://docs.google.com/drawings/d/1Ah01cX9AVxO_zahYv5747xDwnAvPMrYFQsPF8Up7_FI)
 | 6 | **Application Functionality** :  | TPAC is a microservice that handles price retrieval and lowest prices calculation with Dynamic Prices Engine (DPE) as source of record. It also stores Stop Sales data, which is assembled along product pricing calendar in the client response. 
 | 7 | **JMeter** :  | 
Performance JMeter
[https://github.disney.com/PE/PE_Scripts/tree/master/Online/TPAC](https://github.disney.com/PE/PE_Scripts/tree/master/Online/TPAC)
scripts:
[https://github.disney.com/PE/PE_Scripts/blob/master/Online/TPAC/TPAC_hardcoded_updated_v6.jmx](https://github.disney.com/PE/PE_Scripts/blob/master/Online/TPAC/TPAC_hardcoded_updated_v6.jmx)

Deprecated [https://github.disney.com/PE/PE_Scripts/blob/master/Online/TPAC/LexVAS_EXT/Peach_lexicon-view-assembler-service_load_test_wdw_cluster.jmx
](https://github.disney.com/PE/PE_Scripts/blob/master/Online/TPAC/LexVAS_EXT/Peach_lexicon-view-assembler-service_load_test_wdw_cluster.jmx)

 | 8 | 
** Code Quality Enabled: ** Enabling PMD, Checkstyle, and Findbugs and code coverage validations in the pom file.

 | 
Yes, the application has the standard quality control plugins enabled as part of its build life cycle:

  POM file: [ https://github.disney.com/commerce/wdpr-ecommerce-tpac-svc/blob/develop/pom.xml ](https://github.disney.com/commerce/wdpr-ecommerce-tpac-svc/blob/develop/pom.xml) 

 | 9 | 
Code coverage: Unit test coverage >= 80% 

 | 
TBC

 | 10 | 
** Integrated with Sonar: ** The services need to appear here: [ https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New ](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Scott-DePriest_Service_New) and pass all sonar validations.  

 | 
 TBC

 | 11 | 
 **API documentation** : It can be swagger or any other kind of documentation on the API (endpoints, requests and responses) 
 | 
  Swagger: [ https://latest.tpac-svc-wdw.wdprapps.disney.com/price-avail/api/api-docs?url=/price-avail/api/openapi.json ](https://latest.tpac-svc-wdw.wdprapps.disney.com/price-avail/api/api-docs?url=/price-avail/api/openapi.json) 

 | 12 | 
** Sequence Diagrams   **

 
 | 
[https://mywiki.disney.com/pages/viewpage.action?pageId=767396301&spaceKey=PEACH&title=06%2BDeployment%2BArchitecture](https://mywiki.disney.com/pages/viewpage.action?pageId=767396301&spaceKey=PEACH&title=06%2BDeployment%2BArchitecture)

 | 13 | 
** Component Diagrams   **
 | 
TBC

 | 14 | 
** Component Load Tested: ** Nice to have but optional as the service needs to be load tested before reaching production. 

 | 
Last test at the moment of writing:

 
 | 
# 3. ServiceNow Processes and Configuration

 
 | # | Item Description | Answer
 | 1 | **BAPPID** : Has the Business Application CI
been created in SNOW?
 | BAPP0247964

 
 | 
# 4. Build, Test, and Deployment

 
 | # | Item Description | Answer
 | 1 | 
**Source Code** : Provide details on the source code's location (GIT)

 | COMPONENT NAME | PATH
 | WDPRT Tickets Price Avail Cache Service | [https://github.disney.com/commerce/wdpr-ecommerce-tpac-svc](https://github.disney.com/commerce/wdpr-ecommerce-tpac-svc)

 | Please enter your answer within the "Item Description" area
 | 2 | **Build and Deployment Processes** : Provide link  or other applicable location on the details. | 
Harness:   [ https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDW_Tickets_Price_Avail_Cache_Service/overview ](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDW_Tickets_Price_Avail_Cache_Service/overview)

 | 3 | **Credential Management:** Have all service accounts and passwords been entered in Vault? | N/A
 | 5 | **Performance Testing** : Provide links to the PE results | 
Last test at the moment of writing:

 
 | 
# 5. Monitoring and Alert Configuration

 
 | # | Item Description | Answer
 | 1 | **Splunk Indexes** | 
**QA** : index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0014492-use1-<env>" ecs_task_definition="tpac-svc*" 

where <env> can be:
- lst
- stg
- lod
- prd

For Latest, Stage, Load and Prod respectively.

 | 2 | 
**Infrastructure Monitoring** : Indicate what is being monitored (Server, Database, and Storage), who is doing the monitoring, the alert thresholds, and the destination for the alerts.

 | RESOURCE TYPE | RESOURCE NAME | MONITOR | THRESHOLD | ALERT RECIPIENTS
 | Server | No value | No value | No value | No value
 | Database | No value | No value | No value | No value
 | Storage | No value | No value | No value | No value

 | Please enter your answer within the "Item Description" area
 | 3 | 
**Application Monitoring** : Indicate what is being monitored(APM, Synthetics, etc.), who is doing the monitoring, the alert thresholds, and the destination for the alerts.
 | 
[PREPROD] [https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=7089&component=7562720&dashboardMode=forcehttps://disney-preprod.saas.appdynamics.com/controller/](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=7089&component=7562720&dashboardMode=forcehttps://disney-preprod.saas.appdynamics.com/controller/)

 [PROD] [ https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=1761&component=368656&dashboardMode=force ](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=1761&component=368656&dashboardMode=force) 

 | 4 | 
**Splunk Alerts**
 | 
Monitoring ad Alerts [https://mywiki.disney.com/pages/viewpage.action?spaceKey=PEACH&title=Monitoring+and+Alerts](https://mywiki.disney.com/pag

---
*[Truncated — see full runbook in Confluence]*
