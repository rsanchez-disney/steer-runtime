# 📊 Weekly Highlights Process - Beast Team

## Overview
This process generates a weekly summary of production highlights organized by squad (Cruz Ramirez and Storm). The process prioritizes **critical engagements** (posts in ITOC, Global Production Support, and cross-team chats) over routine shift alerts, then supplements with shift summary data.

## Sources (in priority order)

### Priority 1: Critical Engagement Channels
These indicate escalations, P1/P2 incidents, or cross-team coordination. Check these FIRST.
- **DLP ITOC**: channel `19:f6_FGGAzTXySL5GrMgHLtIKeNNeT0Et3JqpspkwgU-c1@thread.tacv2` (team: `19:xMeynCdEXM6szxcgvWzsboMEo-xCm9iC_T8N5fiF__w1@thread.tacv2`)
- **🆘 Global Production Support**: channel `19:algipF4HZchtlekwsaAOwfaJE-bSluddLzlgXhe_Ma41@thread.tacv2` (team: `19:59Kpldwk9yGKD7JLJ9NOXWhPWD8XVcuwvgyW5ezbCA41@thread.tacv2`)

### Priority 2: Cross-Team Group Chats
Beast team posts here indicate active engagement with external teams on specific issues.
- **Click and Collect**: `19:5e0a4b0ab37d4cecaeb07636bf7db7dd@thread.v2`
- **DGE & Opera OHIP**: `19:53fbb4fd2fba4d209aa15441c68541c6@thread.v2`
- **DGE & DRS**: `19:b697c27d3e6149e49c45df4cb0ecce96@thread.v2`
- **DLP DPA incident**: `19:405678237ed04d8b88b0d49799f96315@thread.v2`

### Priority 3: Shift Summaries & Monitoring
Routine alert data from shift posts and automated alert feeds.
- **🌎🌍🌍 ADM Beast Team**: channel `19:PtJi1Yz8fVcxOAnz-1jIyhMewSdp_GryL_p4jv24l5s1@thread.tacv2` (team: `19:PtJi1Yz8fVcxOAnz-1jIyhMewSdp_GryL_p4jv24l5s1@thread.tacv2`)
- **🔔 Monitoring Alerts (Production)**: channel `19:VxOdz0FL0eglF9n-_ijLV5-hRQIaWgRCJR0NxpLo3Z41@thread.tacv2` (team: `19:59Kpldwk9yGKD7JLJ9NOXWhPWD8XVcuwvgyW5ezbCA41@thread.tacv2`)

### Priority 4: Confluence & ServiceNow
- **Postmortem Reports page**: List child pages of [☠️ Postmortem Reports](https://disneyexperiences.atlassian.net/wiki/spaces/SBH/pages/1001885404) (page ID: `1001885404`). Any postmortem with a date in the week's range is a highlight — regardless of whether the root cause app is in Beast scope. If the INC was assigned to Beast AG or the postmortem is in the Beast wiki, it must be included.
- **Confluence incident pages**: Search `space = "SBH" AND title ~ "P1" OR title ~ "P2"` for the date range

## Date Range
- Sunday to Saturday of the previous week
- **Focus**: Alerts section from shift summary posts (1 post per shift, 3 shifts per day)

## Squad Assignment Rules
1. **Primary rule**: Assign the highlight to the squad that owns the **root cause application** (per #[[file:.kiro/steering/business-flows.md]])
2. **Fallback rule**: If the root cause application is **external** (not part of any squad scope — e.g., Opera, Lineberty, DRS, TravelBox, Marketing website), assign to the squad that owns the **most impacted application**
3. **No maximum**: Include all occurrences for the week

## What to Highlight

Each squad section must be split into two sub-sections: **Most Relevant** and **Less Relevant**.

### Most Relevant
Use the detailed formatting templates below. Include only highlights that meet at least one of these criteria:
- A big issue that lasted for 1 hour or more
- The impact was big (many guests affected)
- Engagements were needed (ITOC, DBA, external teams)
- P1/P2 incidents
- New PRBs opened
- New trends in alerts

### Less Relevant
Use the **same formatting templates** as Most Relevant (not compact bullets). The difference is only in the selection criteria — Less Relevant items are those that don't meet the "Most Relevant" thresholds but still occurred during the week.

### Grouping Rules

- **Do NOT group occurrences across different days.** Each day's occurrence of the same issue is a separate highlight.
- **DO group occurrences on the same day.** If the same alert/issue fired multiple times on the same day, combine them into a single highlight for that day (e.g., "On May 25, there were 3 spikes of HTTP 500 errors in Mobile Order at 10:15 AM, 12:30 PM, and 3:45 PM Paris Time...").
- Never use vague language like "multiple hours", "multiple triggers", or "throughout the week" to merge different days into one point.

### Output Structure per Squad

Within each sub-section (Most Relevant / Less Relevant), highlights must be **ordered by occurrence date** (earliest first).

```
## 🏎️ Cruz Ramirez Squad

### Most Relevant
1. [formatted highlight using templates]
2. [formatted highlight using templates]
...

### Less Relevant
1. [formatted highlight using templates — same format as Most Relevant]
2. [formatted highlight using templates — same format as Most Relevant]
...
```

## Formatting Templates

All times must be in **Paris Time**.

### Guest Impact Numbers

- **Always use real numbers** — never write "multiple guests impacted", "several guests", or "few guests". Use the actual count from the shift post, Splunk query, or alert analysis.
- If the shift post says "Guest Impact: X guests" or "X requests" or "X correlation IDs", use that number.
- If after querying you still cannot determine the number, write "guest impact unknown (data not available)" — never guess or use vague words.

### P1/P2
```
[P1/P2] On <Month Day>, there was an outage in <Application> during <X hours/minutes> at <time AM/PM> Paris Time caused by <Reason>. There were <number> guests impacted <Optional: among multiple applications (application 1, application 2, application 3, application 4)>.
```

### Outages
```
On <Month Day>, there was a <blip/outage> in <Application> which was down during <X hours/minutes> at <time AM/PM> Paris Time caused by <Reason>. There were <number> guests impacted.
```

### High Error Rate / Connection lost / Specific error
```
On <Month Day>, there was a <type of error> in <Application> during <X hours/minutes> at <time AM/PM> Paris Time caused by <Reason>. There were <number> guests impacted.
```

### PRBs or Parent INCs
```
The <PRB/Parent INC> impacting <Application> caused by <Reason> has <number> INCs so far. The child INCs during this week impacted <single/number of guests> guests.
```

### INC created for an external dependency
```
On <Month Day>, an <Incident number> was created for <Application> which was down during <X hours/minutes> at <time AM/PM> Paris Time caused by <Reason>. There were <Number> guests impacted.
```

### New trend in alerts
```
On <Month Day>, a new trend in alerts started for <Application> (caused by <Reason> OR . The investigation is still ongoing). There were <number> guests impacted.
```

### Support during the weekend
```
Support provided for <Application Name>, <Flow/Group> during the Weekend: On <Month Day>, some alerts were triggered due to errors thrown by <Application> at <time AM/PM> Paris Time. There were <Number> guests impacted.
```

### Incident
```
On <Month Day>, an <Incident number> was resolved for <Application> caused by <Reason>. There were <Number> guests impacted.
```

## Process Steps

### Phase 1: Critical Engagements (check FIRST — these are highest priority)

1. **Determine date range**: The previous week (Sunday to Saturday). Use message IDs (Unix epoch in milliseconds) to filter.

2. **Check DLP ITOC channel** for Beast team member posts during the week:
   - Channel: `19:f6_FGGAzTXySL5GrMgHLtIKeNNeT0Et3JqpspkwgU-c1@thread.tacv2` (Team: `19:xMeynCdEXM6szxcgvWzsboMEo-xCm9iC_T8N5fiF__w1@thread.tacv2`)
   - Posts here indicate P1/P2 engagements or critical CHG communications

3. **Check Global Production Support channel** for Beast team member posts:
   - Channel: `19:algipF4HZchtlekwsaAOwfaJE-bSluddLzlgXhe_Ma41@thread.tacv2` (Team: `19:59Kpldwk9yGKD7JLJ9NOXWhPWD8XVcuwvgyW5ezbCA41@thread.tacv2`)
   - Posts here indicate P1/P2 comms, CHG pre/during/post, or critical escalations

4. **Check cross-team group chats** for Beast team interactions:
   - **Click and Collect**: `19:5e0a4b0ab37d4cecaeb07636bf7db7dd@thread.v2` — C&C / Mobile Order issues with Agilysys & POS
   - **DGE & Opera OHIP**: `19:53fbb4fd2fba4d209aa15441c68541c6@thread.v2` — Opera/OHIP latency & I/O errors coordination
   - **DGE & DRS**: `19:b697c27d3e6149e49c45df4cb0ecce96@thread.v2` — Book Dine / DRS issues with Didier/Guillaume
   - **DLP DPA incident**: `19:405678237ed04d8b88b0d49799f96315@thread.v2` — DPA One/SYS/ULT incidents with EA & BIO teams
   - Any Beast team member post in these chats during the week = a highlight candidate

5. **Transform engagement posts into highlights**: Posts found in steps 2-4 should be transformed into highlights using the formatting templates. These are typically the most important items of the week.

### Phase 2: Shift Summaries & Alerts

6. **Fetch shift summary posts** from the ADM Beast Team channel. Use `top=50` and **paginate until the oldest message ID is before the start of the date range**. Message IDs are Unix epoch in milliseconds — compare them against the Sunday 00:00 Paris Time epoch to know when to stop. If the first batch doesn't cover the full week, fetch the next batch (older messages) until the entire Sunday-to-Saturday window is covered.
7. **Fetch monitoring alerts** from the Monitoring Alerts (Production) channel. Same pagination strategy: keep fetching batches of 50 until the oldest message is before the start of the date range.
8. **Check Confluence** for any P1/P2 incident pages created during the week (space: SBH). Also list child pages of the [☠️ Postmortem Reports](https://disneyexperiences.atlassian.net/wiki/spaces/SBH/pages/1001885404) page (ID: `1001885404`) and include any postmortem whose title date falls within the week's range — regardless of whether the root cause app is in Beast scope.
9. **Extract alert data** from shift posts: look for posts containing "Alert/s:", "Alerts:", or "Alert/s" headers.
10. **For each alert**, extract:
    - Application name
    - Summary / RCA
    - Guest impact (requests, guests, correlation IDs)
    - Duration and time: **Calculate duration from the "Date/Time Window" field** in the shift post (e.g., "09:44 → 09:48 Paris Time" = 4 minutes). If only a start time is given with no end time, note "duration unknown". Do not guess durations.

### Phase 3: Compile & Format

11. **Assign to squad** using the squad assignment rules above.
12. **Apply the correct format template** based on the type of highlight.
13. **Output** the report as a markdown file: `weekly-highlights-<start-date>.md`

## Output File Location
Save to: `reports/weekly/<YYYY-MM>/weekly-highlights-<MonthDD-MonthDD>.md`

- Format: `weekly-highlights-<mmmDD-DD>.md` where `mmm` is the first three letters of the month in lower camel case (e.g., `may`, `apr`, `jun`)
- Days are always the Sunday–Saturday range (e.g., `may18-24`, `apr26-02`)
- Use the month of the **start date** (Sunday) to determine both the folder and the filename prefix

Examples:
- `reports/weekly/2026-05/weekly-highlights-may18-24.md`
- `reports/weekly/2026-04/weekly-highlights-apr26-02.md`

## Additional Data Sources (if available)
- **ServiceNow**: Check for P1/P2 incidents assigned to Beast assignment groups
- **Beast Daily Task Tracker**: Google Sheets (https://docs.google.com/spreadsheets/d/1g3BbGIwsBZzNlidBPURi5Xyz8d0EvKTe-OanxOBtMNY/edit) — for precise guest impact numbers
