# 💂‍♂️ Monitoring Processes Guideline - Beast Team

## Overview
This steering file contains the complete monitoring process for the Beast Team at DLP.
The monitoring person is responsible for: reviewing INCs, CHGs, alerts, RITMs, and P1/P2 issues.

## Shift Regions & Paris Time Coverage
- **Philippines**: 11PM - 8AM Paris (low load, ask for engagements timely)
- **India**: 6AM - 3PM Paris (high load, immediate action required)
- **LATAM**: 1PM - 12AM Paris (high load, immediate action required)

## Key Dashboards & Links
- Beast SNOW Dashboard: https://disney.service-now.com/now/nav/ui/classic/params/target/%24dashboards.do%3Fsysparm_dashboard%3Dd730f18a47b056d84d56db1b116d43dc
- CHGs Calendar (Active): Beast Dashboard > [PROD] CHGs Calendar tab
- CHGs Calendar (External/Reactive): Beast Dashboard > [PROD] External CHGs Calendar tab

## Teams Channels to Monitor
### APP Scope
- 🔔 Monitoring Alerts (Production) - DLP Digital DGE Train
- 🔔 Incidents - DLP Digital DGE Train
- 🆘 Global Production Support - DLP Digital DGE Train
- Click and Collect (group chat)
- DGE & DRS (group chat)
- DGE & Opera OHIP (group chat)
- DLP DPA incident (group chat)

### ECO Scope
- Alerts (prod) - DLP The Forky Team
- 🛟 ARS-CME support - DLP Ecommerce Train

### Both Scopes
- DLP ITOC - DLP ITOC (IT Operations Center)

## Communication Channels for Posts
- **Digital DGE Train (APP)** → Global Production Support channel
- **E-commerce Train (ECO)** → ARS-CME support channel

## Stakeholders
- **APP** → Lorry + Fabien + Squad TL + PO
- **ECO** → Bertrand + Vianney + Valentina

## Squad Tags (ServiceNow)
- beastXCruzRamirez
- beastXForky
- beastXStorm

## CausedBy Tags

> For the full mapping of each tag to its external system, AG, and escalation path, use `#external-systems-index` (global/user-level steering file).

causedByAgilysys, causedByAirship, causedByAWSPatching, causedByBmacs, causedByBug,
causedByCdn, causedByConfiguration, causedByContentAPI, causedByCoreApi, causedByDocusign,
causedByDRS, causedByGalaxy, causedByInfra, causedByInPark, causedByLineberty,
causedByMarketing, causedByMPG, causedByNetwork, causedByOneId, causedByOnPremises,
causedByOpera, causedByPending, causedByRelease, causedBySecurity, causedBySBC,
causedBySparkpost, causedByTbx, causedByTitus, causedByWorldpay

## Other Tags
- PRBmonitoredByBeast → PRB that impact our scope
- reviewedByBeastTeam → AG is external
- prodIssueImpactBeastScope → Major issues impacted our scope, AG is external
- jiraFixRelated → INC can't be closed until Jira Ticket is promoted

## INC Closure Codes
- Close code, Cause Code Area, Cause Code SubArea must be selected
- Caused by Change: CHG_UNDOC (changes outside ServiceNow) or CHG_NOCHG (not caused by change)

## When to Close an INC
**YES**: Spike dropped to 0, issue doesn't persist for guest/flow/scenario
**NO**: Need inputs from another team, errors haven't dropped, issue persists, waiting for CHG (use Pending Change status)
**Special**: If caller is from "CRC A & S Bus. Tech. & Expert Ass. (JM)" → assign to prd-global-CRO instead

## Shift Start Validations
When starting your shift, after reviewing the CHGs scheduled for the day:
- Validate that the active and reactive CHGs from the **[PROD] CHGs Calendar** match the post in the 📋 CHGs log channel
- Validate that all active CHGs have a **Jira ticket** assigned

## Scheduled CHGs Process

### Before the CHG Starts
**Posts to send:**
- ITOC → To skip INCs creation for the applications impacted during that timeframe
- PROD Communication Channel → To inform stakeholders about the CHG

**Pre-CHG Validations (for Beast scope releases):**
1. Log in to AWS with PROD role
2. Go to ECS and find the application/s to be released
3. Open cluster → Open task definition (e.g. `tms03a-prod`)
4. Go to JSON to find the current version (e.g. `v1.0.0-204`)
5. Go to GitHub and compare previous vs new version using: `/compare/<old_version>...<new_version>`
6. Identify breaking changes — this tells you what to pay closer attention to during the CHG
7. Open the Splunk dashboards related to the applications being released and validate they still work

### During the CHG
- Post regular status updates in the main thread for **ITOC** and **Global Production Support** for each application:
  - 🟢 Healthy
  - 🟡 Degraded / showing signs of recovery
  - 🔴 Down
- If something is 🔴 or 🟡, include screenshots and Splunk links
- Send confirmation: "Previous and new versions validated" & "Splunk Dashboards validated"
- Send a final status for the release: deployed successfully or rolled back
- For more details related to the release, use the Jira ticket created for the CHG

### After the CHG
Update both posts:
- ITOC → To resume monitoring
- PROD Communication Channel → To provide final status

### 5-Alert Rule for External CHGs
If an alert is triggered **5 times or more** AND it's caused by an External CHG, **start active monitoring** (same process as Beast scope releases).

## RITM Handling
RITMs assigned to Beast AG are usually misrouted. Cancel with the standard message (French preferred).
