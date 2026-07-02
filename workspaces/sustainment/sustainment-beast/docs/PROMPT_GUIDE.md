# Beast Sustainment — Prompt Guide

Quick reference for all available tasks and prompts in the `sustainment-beast` workspace. Use these prompts in `koda chat` to trigger workflows via the sustainment orchestrator.

---

## How It Works

The **sustainment orchestrator** automatically detects your intent and delegates to the right specialist agent. You don't need to pick an agent manually — just describe what you need.

**Routing logic:**
- Shift operations → `monitoring_ops_agent`
- Alert/error investigation → `alert_response_agent`
- CHG communications → `chg_comms_agent`
- Reports (shift/weekly) → `beast_reporting_agent`
- Sprint planning → `sprint_planning_agent`
- Incident investigation/RCA → `incident_triage_agent` / `rca_agent`
- Stability validation → `stability_validator_agent`
- GSM/SLA reporting → `gsm_analyst_agent`
- Network diagnostics → `network_diagnostics_agent`
- Post-release follow-up → `release_followup_agent`
- DB upgrade analysis → `db_upgrade_analyzer_agent`

---

## Shift Operations

**Agent:** `monitoring_ops_agent`

| Prompt                             | What it does                                                                      |
|------------------------------------|-----------------------------------------------------------------------------------|
| `shift start`                      | Runs full shift start checklist: pending INCs, RITMs, scheduled CHGs, handover notes |
| `check incidents`                  | Queries ServiceNow for open INCs assigned to Beast AG                             |
| `check RITMs`                      | Queries pending RITMs and flags overdue items                                     |
| `what CHGs are scheduled today?`   | Lists today's planned change requests with start times                            |
| `shift end summary`                | Compiles shift activity into handover notes                                       |

**Tips:**
- The agent uses dual AG+CI query strategy for ServiceNow
- Results are sorted by priority (P1 first)
- Stale INCs (>24h without update) are flagged automatically

---

## Alert Response

**Agent:** `alert_response_agent`

| Prompt                              | What it does                                                                          |
|-------------------------------------|---------------------------------------------------------------------------------------|
| `investigate alert [ALERT_NAME]`    | Full 6-step triage: gather → ACK → Splunk → known issues → priority → escalation     |
| `we got an alert for [APP_NAME]`    | Identifies the app, checks runbooks, starts investigation                             |
| `check error rate for [APP_NAME]`   | Runs Splunk query scoped to ±30min for the app                                        |
| `is this a known issue?`            | Compares current error pattern against known issues catalog                           |
| `escalate to P2/P1`                    | Creates/updates INC and posts to ITOC channel                                         |

**Tips:**
- The 5-alert rule applies: 5+ alerts in 10min for same app = treat as P1/P2
- Splunk queries start with ±30min window and maxresults=200
- ACK messages are posted to Teams with user confirmation

---

## CHG Communications

**Agent:** `chg_comms_agent`

| Prompt                                          | What it does                                                        |
|-------------------------------------------------|---------------------------------------------------------------------|
| `generate pre-CHG communication for CHG[NUMBER]` | Fetches CHG details, generates ITOC + comms channel messages        |
| `CHG[NUMBER] is starting now`                   | Generates "during" status update for all channels                   |
| `CHG[NUMBER] completed successfully`            | Generates versions-validated + final status messages                |
| `CHG[NUMBER] failed, rolling back`              | Generates failure notices + creates INC if guest impact             |
| `post daily CHG summary`                        | Compiles all planned CHGs for today into one message                |

**Tips:**
- Always shows draft messages before posting (requires your confirmation)
- Uses templates from monitoring-templates for consistent formatting
- Routes messages to correct channel (ITOC, Communication, Beast Internal)

---

## Reporting

**Agent:** `beast_reporting_agent`

| Prompt                                | What it does                                                                    |
|---------------------------------------|---------------------------------------------------------------------------------|
| `shift report` or `generate shift report` | Compiles shift log into formatted Teams message (plain text + HTML)             |
| `weekly highlights`                   | Generates weekly highlights from ITOC, cross-team chats, and shift summaries    |
| `add to shift log: [ENTRY]`          | Appends a new entry to shift-updates-log.md                                     |
| `summarize today's shift activity`    | Quick summary of alerts, INCs, and deployments for the day                      |

**Tips:**
- Weekly highlights classify events as "Most Relevant" vs "Less Relevant"
- Squad assignment is automatic (Storm vs Cruz Ramirez based on app ownership)
- Deduplication rules prevent duplicate entries in the shift log

---

## Sprint Planning

**Agent:** `sprint_planning_agent`

| Prompt                                      | What it does                                                                |
|---------------------------------------------|-----------------------------------------------------------------------------|
| `sprint planning` or `plan next sprint`     | Full sprint analysis: capacity, velocity, backlog review                    |
| `calculate team capacity for next sprint`   | Computes available hours per developer with operational overhead             |
| `create ticket for [DESCRIPTION]`           | Generates Jira ticket (shows preview, requires confirmation)                |
| `evaluate current sprint workload`          | Checks assigned vs capacity per developer, flags imbalances                 |
| `sprint health check`                       | Reports on progress, burn-down, and at-risk items                           |

**Tips:**
- Ticket creation ALWAYS requires explicit confirmation before submitting to Jira
- Capacity formula accounts for monitoring rotation, incident review, ceremonies
- Responds in Spanish by default (team preference) — ask in English if you prefer English

---

## Incident Investigation (Koda Built-in)

**Agents:** `incident_triage_agent`, `rca_agent`

| Prompt                                | What it does                                                    |
|---------------------------------------|-----------------------------------------------------------------|
| `investigate INC[NUMBER]`             | Fetches INC, classifies severity, starts RCA                    |
| `root cause analysis for INC[NUMBER]` | Deep investigation: Splunk traces, timeline, 5 Whys             |
| `classify INC[NUMBER]`               | Determines causedBy tag and reassignment target                 |
| `what caused INC[NUMBER]?`           | Quick root cause summary from work notes and Splunk             |

---

## Stability Validation (Koda Built-in)

**Agent:** `stability_validator_agent`

| Prompt                                            | What it does                                                    |
|---------------------------------------------------|-----------------------------------------------------------------|
| `validate stability for [APP_NAME]`               | Checks metrics, logs, health after incident or release          |
| `is [APP_NAME] stable after the deployment?`      | Post-deploy validation with error rate comparison               |
| `stability check after INC[NUMBER] resolution`    | Confirms the fix is holding                                     |

---

## GSM Reporting (Koda Built-in)

**Agent:** `gsm_analyst_agent`

| Prompt                        | What it does                                            |
|-------------------------------|---------------------------------------------------------|
| `GSM report for this week`    | Impact summaries, SLA tracking, incident trends         |
| `SLA status for our incidents` | Checks which INCs are at risk of breaching SLA          |
| `service health summary`      | Overall health across managed services                  |

---

## Network Diagnostics (Koda Built-in)

**Agent:** `network_diagnostics_agent`

| Prompt                                  | What it does                                                    |
|-----------------------------------------|-----------------------------------------------------------------|
| `check connectivity to [ENDPOINT]`      | DNS resolution, certificate validation, connectivity test       |
| `is on-premises network up?`            | Checks connectivity to dlp-microservice-production              |
| `diagnose network timeout for [APP]`    | Full network diagnostic workflow                                |

---

## Post-Release Follow-up (Koda Built-in)

**Agent:** `release_followup_agent`

| Prompt                                    | What it does                                        |
|-------------------------------------------|-----------------------------------------------------|
| `release follow-up for [APP_NAME]`        | Crash rates, adoption rates from New Relic          |
| `how is the latest release performing?`   | Post-release metrics comparison                     |

---

## DB Upgrade Analysis (Koda Built-in)

**Agent:** `db_upgrade_analyzer_agent`

| Prompt                                      | What it does                                                        |
|---------------------------------------------|---------------------------------------------------------------------|
| `analyze DB upgrade for [DATABASE]`         | Before/after performance, regressions, parameter audit              |
| `check MariaDB performance after upgrade`   | CloudWatch + Splunk log analysis                                    |

---

## General Tips

1. **Be direct** — The orchestrator detects intent from natural language. No special syntax needed.
2. **Provide context** — Include INC/CHG numbers, app names, or time ranges when relevant.
3. **Language** — The system responds in whatever language you use. Team default is Spanish for sprint planning.
4. **Confirmation gates** — Destructive actions (Jira creation, Teams posting, INC updates) always ask for confirmation first.
5. **Splunk guards** — The system automatically validates your Splunk queries: no `index=*`, initial window ±30min, maxresults=200.
6. **Check agent registry** — Run `what agents do you have available?` to see all active agents.

---

## Troubleshooting

| Issue                              | Solution                                                                          |
|------------------------------------|-----------------------------------------------------------------------------------|
| Orchestrator doesn't delegate      | Try being more explicit: "use the alert response agent to investigate..."         |
| Agent can't find context files     | Run `koda ws apply sustainment-beast` to reapply workspace                        |
| ServiceNow queries return empty    | Check VPN connection, verify sys_ids in servicenow-reference-ids.md               |
| Teams posting fails                | Verify Teams MCP is connected: check MCP status in Koda                           |
| Splunk query blocked               | You probably used `index=*` — specify the correct index from splunk-reference.md  |

---

*Last updated: 2026-07-02*
*Workspace: sustainment-beast v0.2.139*
