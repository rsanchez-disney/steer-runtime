# 📝 Monitoring Message Templates

## Template: CHGs Daily Post (Teams - 📋 CHGs log channel)

```
CHG's (<Current Day> e.g. 04/20)

Hello Team, for today we will have the following activities:

• <N> active monitoring changes
  - <Jira Ticket link> - Assigned to <Beast member>
• <N> reactive monitoring changes

See changes dashboard: https://disney.service-now.com/now/platform-analytics-workspace/dashboards/params/edit/false/tab-sys-id/34fc3b1cd39d066a6984f47207b9be84/sys-id/5ea6dc9d78bdcaadc75fa1bb86b1dc85

CHGXXXX - <Short Description>
| Deployment Windows | <YYYY-MM-DD HH:MM:SS - YYYY-MM-DD HH:MM:SS> Paris Time |
| Changes | CHGXXXX |
| Scope | DGE Impact / E-commerce Train |
```

---

## Template: ITOC Post (P1/P2 Issues)

```
Hi @ITOC team,

🐞 We are getting the following issue

• Summary: <Brief description of the issue>
• Scope: <Mobile / Web / Mobile & Web>

🕛 Started at: <HH:MM> Paris Time - <🔴 ongoing / ✅ resolved at HH:MM>

📱 Business Impact
• <Guests/Cast members/Guests & Cast members> using the mobile app faced <describe what the guest experienced>. Hence, they could have experienced temporal difficulties when <flow impacted>.

👥 Guest Impact: X guests

📳 Impacted apps:
• 🔴/🟡/🟢 <Application name 1>
• 🔴/🟡/🟢 <Application name 2>

📈 Technical Impact
• Description: <Brief description of the root cause>
• Splunk timechart: <link> + <image>

🚨 INC number: <P1/P2> <INCXXXXX>

cc. DLP stakeholders
```

---

## Template: DLP Communication Channel Post (P1/P2 Issues)

```
Hi team,

🐞 We are getting the following issue

• Summary: <Brief description of the issue>
• Scope: <Mobile / Web / Mobile & Web>

🕛 Started at: <HH:MM> Paris Time - <🔴 ongoing / ✅ resolved at HH:MM>

📱 Business Impact
• <Guests/Cast members/Guests & Cast members> using the mobile app faced <describe what the guest experienced>. Hence, they could have experienced temporal difficulties when <flow impacted>.

👥 Guest Impact: X guests

📳 Impacted apps:
• 🔴/🟡/🟢 <Application name 1>
• 🔴/🟡/🟢 <Application name 2>

📈 Technical Impact
• Description: <Brief description of the root cause>
• Splunk timechart: <link> + <image>

🚨 INC number: <P1/P2> <INCXXXXX>

🔗 ITOC engage link

cc. DLP stakeholders
```

---

## Template: ITOC Pre-CHG Notification

```
Hi @ITOC team, there are some alerts that will be triggered due to some scheduled CHGs.

Time window: <YYYY-MM-DD HH:MM:SS - YYYY-MM-DD HH:MM:SS>

Please see the details in the following table/s:

CHGXXXX - <Name>
| Activity Window | <YYYY-MM-DD HH:MM:SS - YYYY-MM-DD HH:MM:SS> Paris Time |
| Description | <Short description of the CHG> |
| Scope | Digital DGE Train Impact / E-commerce Train |

We will provide regular updates on the status of the change request. If any issue or event occurs, we will notify you promptly to help prevent the creation of incidents. Please do not hesitate to contact the @DLP-BEAST-TEAM if you find any issues with the services.

Thank you
```

---

## Template: Communication Channel Pre-CHG Notification

```
CHGXXXX - <Name>

There is a scheduled activity for <Activity Name> on <Month DD>.

CHGXXXX - <Name>
| Activity Window | <YYYY-MM-DD HH:MM:SS - YYYY-MM-DD HH:MM:SS> Paris Time |
| Description | <Short description of the CHG> |
| Scope | Digital DGE Train Impact / E-commerce Train |

cc. @APM squad, @TL squad
```

---

## Template: Shift Updates Post (Teams - ADM Beast Team channel)

This is the end-of-shift or mid-shift update posted as a reply to the daily shift thread in the ADM Beast Team channel. It consolidates all alerts, incidents, and deployments handled during the shift.

**Format rules:**
- Three sections in this exact order: **Alerts**, **Incidents**, **Deployments**
- No emojis
- Each alert is a bullet with sub-bullets: Summary, RCA, Guest Impact, Date/Time Window
- Each incident is a bullet with INC number, short description, and status
- Each deployment is a bullet or "No active deployments for today."
- When multiple alerts share the same root cause (e.g., a CHG), include the CHG number in each alert title but keep them as separate bullets
- Splunk links should use FIXED date/time ranges and be hyperlinked as [Splunk]

```
Alerts:

- <Alert name> (<CHG number if applicable>)
  - Summary: <Brief description of the issue>
  - RCA: <Root cause description>
  - Guest Impact: <N> guests/requests [Splunk]
  - Date/Time Window: <YYYY-MM-DD HH:MM> to <YYYY-MM-DD HH:MM> Paris Time (CEST)

- <Alert name 2>
  - Summary: <Brief description>
  - RCA: <Root cause>
  - Guest Impact: <N> guests [Splunk]
  - Date/Time Window: <YYYY-MM-DD HH:MM> to <YYYY-MM-DD HH:MM> Paris Time (CEST)

Incidents:

- <INC number> : <Short description>
  - Status: <Resolved / Reassigned to <AG> / WIP / Ongoing>

- <INC number 2> : <Short description>
  - Status: <Status>

Deployments:

- <CHG number> - <Description> - <Status>
OR
- No active deployments for today.
```

---

## Shift Updates Log Format

For shift log entry formats, deduplication rules, and valid field values, see `#shift-log-format`.

---

## Template: Alert First Reply

```
General analysis

🚨 Summary: <Brief description of the issue> [Splunk]
🐞 RCA: <Description of the root cause>
👥 Guest Impact: X guests. [Splunk]
📅 Date/Time Window: From <Date/Time> to <Date/Time>

<Include a screenshot with a timechart/table that would best summarize the issue>
```

---

## Template: INC Resolved/Reassigned Post (Incidents Channel)

### Closed by Beast:

Use the **INC Final Report HTML template** (see `#incident-templates`) to generate the closure report. The HTML output should be wrapped in `[code]...[/code]` for ServiceNow work notes. For the Teams channel post, use this plain-text summary:

```
Incident Details

• Short Description: <Include an interpretation of the incident>
• Affected APPs: <List the affected applications/flows and briefly describe how they are impacted>
• Timeline: The issue is currently <ongoing/resolved>. It was initially observed as a spike in the system. It has been happening consistently since <start date/time>. Duration: <duration>.
• Impact:
  - <List affected applications/flows and impact>
  - <Number of guests/CorrelationIds impacted>
• Root Cause: <Brief description of the application/component/dependency causing the problem>
• Tag: <APM, TL and PO of the squad impacted>
```

### Reassigned to other AG:
```
Incident Details

• Assignment Group: <Include the assignment group>
• Short Description: <Include an interpretation of the incident>
• Tag: @Lorry, @Fabien
```

---

## Template: RITM Cancellation Message (French preferred)

```
Cher demandeur,

Veuillez noter que ce groupe d'affectation est dédié au support de l'application mobile DLP Guest et n'est pas lié à la mise en œuvre de votre demande.

Veuillez trouver le groupe d'affectation approprié et ouvrir une nouvelle demande d'intervention.

Nous allons annuler celle-ci.

Cordialement,
Équipe Beast
```

---

## Template: CHG Status Updates (During deployment)

```
🟢 <Application name> - Healthy
🟡 <Application name> - Degraded (showing signs of recovery)
🔴 <Application name> - Down

<Include screenshots and Splunk links with fixed time ranges>
```

---

## Template: CHG Versions & Dashboards Validated

```
✅ Previous and new versions validated
  - <Application name>: <old_version> → <new_version>
  - GitHub comparison: <link to /compare/old_version...new_version>

✅ Splunk Dashboards validated
  - <Dashboard name/link>: No anomalies detected
```

---

## Template: CHG Final Status

```
✅ CHGXXXX - <Name> - Deployed successfully
OR
❌ CHGXXXX - <Name> - Rolled back. Reason: <brief explanation>
```

---

## ServiceNow HTML Templates

For ServiceNow HTML templates (Research Working Notes, Final Report), see `#incident-templates`.
