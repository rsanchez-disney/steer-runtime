# Load Test Configuration

## ⛔ Mandatory Rules

1. **One operation at a time.** Never chain operations automatically.
2. **Confirm before executing jobs.** When a job is found, always show the job name and ask for user confirmation before running `play_job`. This applies to load test jobs and setup jobs (e.g., setup-dining-reservations).
3. **Retry on next pipeline if job fails.** If `play_job` fails (Unplayable Job or other error), ask the user if they want to search in the next most recent successful pipeline.
4. **DISCO setup rule.** Before running a DISCO load test, ask **once**: "Do you want to run the setup-dining-reservations job first?" Do not ask again if already asked or acknowledged in the session.
5. **Load environment only.** Reject any other environment.
6. **Prefer MCP tools over shell/curl.** Use GitLab MCP tools (`list_pipelines`, `get_pipeline_bridges`, `get_pipeline_jobs`, `play_job`) and Splunk/Compass tools for their respective operations. Only fall back to shell when MCP lacks required functionality. When using shell as fallback, use tokens from `~/.kiro/tokens.env`.
7. **Never store or expose secrets.** Read from `~/.kiro/tokens.env` inline without echoing. Never print, log, or expose secret values in output.

---

## 1. Pre-Validation (Schedule Verification)

### ⛔ Rules for this step
- **Application + Site are required.** If the user does not specify WDW or DLR, ask which one. Never run both sites unless the user explicitly says "both" or "all sites".
- **Secret usage example** for OAuth:
  ```bash
  SECRET=$(grep '^ARRW_CLIENT_SECRET=' ~/.kiro/tokens.env | cut -d'=' -f2) && curl -s -X POST ... -d "client_secret=$SECRET" ...
  ```

### Facility IDs (from GitLab)

Read dynamically using `gitlab_get_file` with `project=studio-lumiere/workshop-ltiab`, `ref=develop`.

| App | Site | GitLab File Path |
|-----|------|------------------|
| Arrival Windows UI/Batch | WDW | `jmeter/FnB_Lumiere_WDW_ArrivalWindows_UI.yml` |
| Arrival Windows UI/Batch | DLR | `jmeter/FnB_Lumiere_DLR_ArrivalWindows_UI.yml` |
| Arrival Windows Service | WDW | `jmeter/FnB_Lumiere_WDW_ArrivalWindows.yml` |
| Arrival Windows Service | DLR | `jmeter/FnB_Lumiere_DLR_ArrivalWindows.yml` |
| MOO | WDW | `jmeter/FnB_Lumiere_WDW_MOO.yml` |
| MOO | DLR | `jmeter/FnB_Lumiere_DLR_MOO.yml` |

Extract all values from the `facilityId` list/field in the YAML.

### OAuth Token

- **Token URL:** `https://perf-cloud.authorization.corp.dig.com/token`
- **Method:** POST
- **Content-Type:** `application/x-www-form-urlencoded`
- **Parameters:**
  - `grant_type=client_credentials`
  - `client_id` → `ARRW_CLIENT_ID` from `~/.kiro/tokens.env`
  - `scope=RETURN_ALL_CLIENT_SCOPES`
  - `client_secret` → `ARRW_CLIENT_SECRET` from `~/.kiro/tokens.env`

### Schedule Endpoint

| Site | Base URL |
|------|----------|
| WDW | `https://load.wdwarrw-batch.wdprapps.disney.com` |
| DLR | `https://load.arrw.batch.dlr.wdprapps.disney.com` |

**Path:** `GET /arrival-window-batch/locations/{facilityId}/schedules`
**Auth:** `Authorization: Bearer {token}`

### Timezones

- WDW → `America/New_York` (Eastern Time)
- DLR → `America/Los_Angeles` (Pacific Time)

### Output format (MUST follow exactly)

```
## Schedule Verification — {site} ({date}, {site_timezone})
⏰ Current time: HH:MM {user_tz} → HH:MM {site_tz}

| Restaurant | Facility ID | Park | Opens | Closes | Meal Periods | Gaps | Status |
|------------|-------------|------|-------|--------|--------------|------|--------|
| ...        | ...         | ...  | ...   | ...    | ...          | ...  | ...    |

### Readiness
(Show only ONE of these lines)
- ✅ **Ready to execute** — all restaurants are open.
- ⏳ **Not ready** — {N} restaurants open at {earliest_open} {site_tz} (in {minutes} min). All open by {latest_open}.
- ⚠️ **Window closing** — {N} restaurants already closed.

### ⚠️ Alerts
- No schedules: ...
- Closing soon (<1h): ...
- Has gaps: ...

### 📊 Summary
- Active: X, Closed: Y, No schedules: Z
- First to close: {name} at {time} ({remaining})
- Last to close: {name} at {time} ({remaining})
```

**Formatting rules:**
- Detect user's local timezone via `date +%Z`. Show conversion in header.
- Park names: Abbreviate (e.g., "Disney's Hollywood Studios" → "Hollywood Studios")
- Meal periods: Simplify — use `+` for multiple (e.g., "Breakfast + Lunch And Dinner")
- Status column: ✅ active, ⚠️ closing soon (<1h) or has gaps, ❌ closed

---

## 2. Execute Load Tests

### GitLab

**Project:** `studio-lumiere/workshop-ltiab` (ID: 83233)
**Host:** `https://gitlab.disney.com`
**Pipeline source:** Always use the **latest successful pipeline** on `develop` branch.
**Downstream pipeline:** Jobs are inside the downstream pipeline triggered by the `trigger-ltiab` bridge job. Use the bridges API to find it.

### How to find jobs

1. `GET /projects/83233/pipelines?ref=develop&status=success&per_page=1` → get latest pipeline ID
2. `GET /projects/83233/pipelines/{id}/bridges` → find `trigger-ltiab` bridge → get `downstream_pipeline.id`
3. `GET /projects/83233/pipelines/{downstream_id}/jobs?per_page=100` (paginate) → filter by application

### Applications

Match by app name or any abbreviation listed. The `$ltiabApp$` value is used in Splunk queries.

#### Arrival Windows

- **Abbreviations:** arrival windows, arrw, arrivalwindows
- **Sites:** WDW, DLR
- **Splunk `$ltiabApp$`:** `WDW_ArrivalWindows`, `DLR_ArrivalWindows`
- **GitLab YAML:** `FnB_Lumiere_{site}_ArrivalWindows[_UI].yml`
- **Variants:**
  - **UI/Batch** — job pattern: `ltiab/{site}-arrivalwindows-{load}-with-ui`
  - **Service** — job pattern: `ltiab/{site}-arrivalwindows-{load}` (WITHOUT `-with-ui`)

| Variant | SiteId | 1x | 2x | 3x |
|---------|--------|----|----|-----|
| UI/Batch | WDW | `wdw-arrivalwindows-1x-with-ui` | `wdw-arrivalwindows-2x-with-ui` | `wdw-arrivalwindows-3x-with-ui` |
| UI/Batch | DLR | `dlr-arrivalwindows-1x-with-ui` | `dlr-arrivalwindows-2x-with-ui` | `dlr-arrivalwindows-3x-with-ui` |
| Service | WDW | `wdw-arrivalwindows-1x` | `wdw-arrivalwindows-2x` | `wdw-arrivalwindows-3x` |
| Service | DLR | `dlr-arrivalwindows-1x` | `dlr-arrivalwindows-2x` | `dlr-arrivalwindows-3x` |

**Job selection:** "Arrival Windows UI" or "Batch" → `-with-ui`. "Arrival Windows Service" → without.

#### DISCO

- **Abbreviations:** disco
- **Sites:** WDW, DLR
- **Splunk `$ltiabApp$`:** `WDW_DISCO`, `DLR_DISCO`
- **GitLab YAML:** `FnB_Lumiere_{site}_DISCO.yml`
- **Job pattern:** `ltiab/{site}-disco-{load}`

| SiteId | 1x | 2x | 3x |
|--------|----|----|-----|
| WDW | `wdw-disco-1x` | `wdw-disco-2x` | `wdw-disco-3x` |
| DLR | `dlr-disco-1x` | `dlr-disco-2x` | `dlr-disco-3x` |

DISCO jobs include a Genie companion job (extends `.ltiab-run-genie`). The 1x also has a `no-genie` variant.

**Pre-requisite: Setup Dining Reservations (optional)**
Before running DISCO, the `ltiab/setup-dining-reservations` job may need to run. Find it by searching jobs in the downstream pipeline for name containing `setup-dining-reservations`. Stage: `setup`, When: `manual`.

#### MOO

- **Abbreviations:** moo
- **Sites:** WDW, DLR
- **Splunk `$ltiabApp$`:** `WDW_MOO`, `DLR_MOO`
- **GitLab YAML:** `FnB_Lumiere_{site}_MOO.yml`
- **Job pattern:** `ltiab/{site}-moo-{load}`

#### ROO

- **Abbreviations:** roo
- **Sites:** WDW, DLR
- **Splunk `$ltiabApp$`:** `WDW_ROO`, `DLR_ROO`
- **GitLab YAML:** `FnB_Lumiere_{site}_ROO.yml`
- **Job pattern:** `ltiab/{site}-roo-{load}`

#### Dining Menus

- **Abbreviations:** dining menus, menus, menusvc
- **Sites:** WDW, DLR, ALL (only app that supports ALL)
- **Splunk `$ltiabApp$`:** `WDW_MENUSVC`, `DLR_MENUSVC`, `ALL_MENUSVC`
- **GitLab YAML:** `FnB_Lumiere_{site}_DiningMenuService.yml`
- **Job pattern:** `ltiab/{site}-menusvc-{load}`

#### Admin UI Config Service

- **Abbreviations:** admin, admin config, adminconfig
- **Sites:** WDW, DLR
- **Splunk `$ltiabApp$`:** `WDW_ADMINCONFIG`, `DLR_ADMINCONFIG`
- **GitLab YAML:** `FnB_Lumiere_{site}_Admin_UI_config.yml`
- **Job pattern:** `ltiab/{site}-adminconfig-{load}`

#### Find Merch

- **Abbreviations:** find merch, merch, findmerch
- **Sites:** WDW, DLR
- **Splunk `$ltiabApp$`:** `WDW_FindMerch`, `DLR_FindMerch`
- **GitLab YAML:** `FnB_Lumiere_{site}_FindMerch.yml`
- **Job pattern:** `ltiab/{site}-find-merch-{load}`

#### Payment Service

- **Abbreviations:** payment, paymentsvc
- **Sites:** WDW, DLR
- **Splunk `$ltiabApp$`:** `WDW_PAYMENTSVC`, `DLR_PAYMENTSVC`
- **GitLab YAML:** `FnB_Lumiere_{site}_PaymentService.yml`
- **Job pattern:** `ltiab/{site}-paymentsvc-{load}`

---

## 3. Verify Results in Splunk

### ⛔ Rules for this step
- **ALWAYS use `splunk-stage` connection.** Never use `splunk-prod`. All load test data lives in the stage Splunk instance. If the tool asks which connection, select `splunk-stage`.
- **Query prefix:** All queries MUST start with the `search` command (e.g., `search index="wdpr_pe_ltiab" ...`).
- **Regex syntax:** Use `(?P<name>...)` for named capture groups (NOT `(?<name>...)`).
- **Time range format:** Use `earliest="MM/DD/YYYY:HH:MM:SS"` and `latest="MM/DD/YYYY:HH:MM:SS"` for specific dates, or `earliest=-24h@h latest=now` for relative.
- **Copy queries exactly** from below, only replacing `$variables$`.

### Job Discovery Query

Find executed load test jobs for a given app. Replace `$ltiabApp$` with the value from the Application Registry.
Default time range: last 24 hours (adjust per user request).

```spl
search index="wdpr_pe_ltiab" sourcetype=jmeter_jtl app::*$ltiabApp$* kpiName="AppVersion" earliest=-24h@h latest=now
 | rex field=_raw "Job: (?P<jobId>[0-9]+)"
 | rex field=_raw "Factor: (?P<factor>[0-9]x)"
 | rex field=_raw "Version: (?P<version>[^ ]+)"
 | rex field=_raw "Boost: (?P<boost>[0-9]+)"
 | rex field=_raw "Latency: (?P<latency>[0-9]+)"
 | where isnotnull(jobId)
 | dedup jobId sortby -factor
 | table _time, app, application, destination, jobId, factor, version, boost, latency
 | eval started = strftime(_time,"%d %b %I:%M%p")
 | strcat factor " " started " v" version title
 | table _time, app, title, jobId
 | sort -_time
```

### KPI Validation Query

Validates KPIs for a specific job. Replace `$ltiabApp$` and `$jobId$` with values from the job discovery step.
Time range: from the job start time (from discovery query `_time`) to 1 hour after.

```spl
search index="wdpr_pe_ltiab" sourcetype=jmeter_jtl app::*$ltiabApp$* kpiName="KPI*" "$jobId$" earliest="$start$" latest="$end$"
| eval APP = case(
 like(app, "MobileOrder_%"), "MOO",
 like(app, "%_MOO"), "MOO",
 like(app, "%_MOO_%"), "MOO",
 like(app, "%_ARRW%"), "ArrivalWindows",
 like(app, "%_ArrivalWindows"), "ArrivalWindows",
 like(app, "%_ArrivalWindows_UI"), "ArrivalWindows",
 like(app, "ScanAndGo_%"), "ROO",
 like(app, "%_ROO_%"), "ROO",
 like(app, "%_ROO"), "ROO",
 like(app, "%_MMC_%"), "ROO",
 like(app, "FullRadish_%"), "DISCO",
 like(app, "%_DISCO"), "DISCO",
 like(app, "%_DISCO_%"), "DISCO",
 like(app, "%_MENUSVC"), "MENUSVC",
 like(app, "%_MENUSVC_%"), "MENUSVC",
 like(app, "%_ADMINCONFIG"), "ADMINCONFIG",
 like(app, "%_DINESYNC"), "DINESYNC",
 like(app, "%_DINESYNC_%"), "DINESYNC",
 like(app, "%_FindMerch%"), "FINDMERCHSVC",
 like(app, "%_PAYMENTSVC"), "PAYMENTSVC",
 like(app, "%_PAYMENTSVC_%"), "PAYMENTSVC",
 1=1, app)
| rex "20\d+-\d+-\d*T\d+:\d+:\d+[^,]*,(?P<kpiElapssd>\d+),(?P<KPI>(?=\").*\"|[^,]*),(?P<ResponseCode>[^,]*),[^,]*,(?P<kpiPassedTrans>[true|false]+),(?P<URL>(?=\").*\"|[^,]*),[^,]*,[^,]*,(?P<ConvId>(?=\").*\"|[^,]*),.+"
| eval kpiElapssd=if(kpiElapssd>0, kpiElapssd-0, kpiElapssd)
| stats count(kpiPassedTrans) as Volume count(eval(kpiPassedTrans="true")) as passed count(eval(kpiPassedTrans="false")) as failed perc95(eval(if(kpiPassedTrans="true",kpiElapssd,""))) as p95s min(eval(if(kpiPassedTrans="true",kpiElapssd,""))) as mins avg(eval(if(kpiPassedTrans="true",kpiElapssd,""))) as avgs max(eval(if(kpiPassedTrans="true",kpiElapssd,""))) as maxs by APP, KPI
| table APP, KPI, Volume, passed, failed, p95s, mins, avgs, maxs
| lookup FnB_ALL_Performance_SLA.csv APP, KPI
| table KPI, ProjectedVolume_ReqHr, Volume, passed, failed, ExpectedSLA_millis, p95s, mins, avgs, maxs
| eval deviation=(round(((Volume-ProjectedVolume_ReqHr)/ProjectedVolume_ReqHr),2)*100)
| eval actualLoad=round(Volume/ProjectedVolume_ReqHr,2)
| eval deviationPct=deviation+"%"
| convert num(ExpectedSLA_millis) as expectedSLA, num(p95s) as p95Value
| eval errorRate=round((failed/Volume)*100, 2)
| eval underSLA=if(p95Value<=expectedSLA,"Yes","No")
| eval p95s=round(p95s, 3)
| rename ProjectedVolume_ReqHr as ProjectedVol, Volume as ActualVol, actualLoad as Load, passed as Pass, failed as Fail, ExpectedSLA_millis as SLA, p95s as P95
| table KPI, ProjectedVol, ActualVol, Load, Pass, Fail, errorRate, SLA, P95, underSLA, mins, avgs, maxs
```

### Output format (MUST follow exactly)

**Job Discovery** — simple table:
| # | Title | App | Job ID |
|---|-------|-----|--------|

**KPI Validation** — split into Service KPIs and UI KPIs if both present:
| KPI | Volume | Load | Pass | Fail | Error% | SLA | P95 | Under SLA |
|-----|--------|------|------|------|--------|-----|-----|-----------|

Formatting rules:
- ✅ = Under SLA, ❌ = Over SLA
- Round P95 to integer, Error% to 2 decimals
- Bold rows with SLA breaches or error rate > 1%
- End with **📊 Resumen**: total KPIs passed/failed, overall error rate, notable findings

**Error Correlation** — key findings:
- Response code, facility/endpoint affected, conversation ID sample
- Root cause analysis based on service logs

### Error Correlation Query

When KPI validation shows failures, drill into the root cause by correlating with service logs.

**Step 1:** Get failed transactions with conversation IDs from the load test index:
```spl
search index="wdpr_pe_ltiab" sourcetype=jmeter_jtl app::*$ltiabApp$* kpiName="KPI*" "$jobId$" earliest="$start$" latest="$end$"
| rex "20\d+-\d+-\d*T\d+:\d+:\d+[^,]*,(?P<kpiElapssd>\d+),(?P<KPI>(?=\").*\"|[^,]*),(?P<ResponseCode>[^,]*),[^,]*,(?P<kpiPassedTrans>[true|false]+),(?P<URL>(?=\").*\"|[^,]*),[^,]*,[^,]*,(?P<ConvId>(?=\").*\"|[^,]*),.+"
| where kpiPassedTrans="false"
| table _time, KPI, ResponseCode, URL, ConvId
| head 20
```

**Step 2:** Search the service index using the conversation ID (extract the `PERFARRW-CONV-*` portion):
```spl
search index=$serviceIndex$ "$conversationId$" earliest="$start$" latest="$end$"
```

### Service Indexes (for error correlation)

| App | Site | Service Index |
|-----|------|---------------|
| Arrival Windows | WDW | `wdw_arrw` |
| Arrival Windows | DLR | `wdpr_arrival_window` |
| DISCO | WDW | `wdpr_disco` |
| DISCO | DLR | `wdpr_disco_dlr` |
| MOO | WDW | `wdw_ddpmw` |
| MOO | DLR | `dlr_moo` |
| ROO | WDW | `wdw_ro_service` |
| ROO | DLR | `dlr_ro_service` |
| Dining Menus | WDW | `wdpr_diningmenu_service` |
| Dining Menus | DLR | `wdpr_diningmenu_service` |
| Admin UI Config Service | WDW | `wdpr_dineadmintool` |
| Admin UI Config Service | DLR | `wdpr_dineadmintool_dlr` |
| Find Merch | WDW | `cpc-disneyretail` |
| Find Merch | DLR | `cpc-disneyretail` |
| Payment Service | WDW | *TBD* |
| Payment Service | DLR | *TBD* |

---



## 4. Wiki Documentation

Document load test results in Confluence (MyWiki).

### ⛔ Rules for this step
- **Confirm before creating.** Present a preview showing: page title, parent page, space, Jira ticket, version, and app/site. Always ask for explicit user confirmation before creating the page.
- **One page per site** — WDW and DLR are separate pages (only for Arrival Windows UI/Batch).
- **Single page for both sites** — DISCO, MOO, ROO, Dining Menus, Admin UI Config, Find Merch use one page for both WDW+DLR.
- **TBD values are blockers.** If any Wiki Config field for the requested app is `*TBD*`, stop and tell the user: "Wiki config for {app} is not yet defined. Cannot create documentation until the config values are populated in loadtest_config.md."

### Wiki Config per Application

| App | Connection | Space | Parent Page ID | Template Page ID | Title Format | Pages |
|-----|------------|-------|----------------|------------------|--------------|-------|
| Arrival Windows UI/Batch | `mywiki-prod` | `FBT` | `790430555` | `1232412025` | `{site} Arrival Windows UI - Release - v{version}` | One per site |
| DISCO | `mywiki-prod` | `FBT` | `1230704003` (0.x) / `790430795` (3.x) | `1127710822` | `DiSCO - Release {version}` | Both sites |
| MOO | `mywiki-prod` | `FBT` | `790430467` | `882386422` | `MOO Release - v{version}` | Both sites |
| ROO | `mywiki-prod` | `FBT` | `790430403` | `884281052` | `ROO Release - v{version}` | Both sites |
| Dining Menus | `mywiki-prod` | `FBT` | `790430358` | `1026207044` | `Release - v{version}` | Both sites |
| Admin UI Config | `mywiki-prod` | `FBT` | `790430683` | `974692879` | `Dine Admin Tool - v{version}` | Both sites |
| Find Merch | `mywiki-prod` | `FBT` | `1152164630` | `1152164632` | `Find Merch v{version}` | Both sites |
| Payment Service | `mywiki-prod` | `FBT` | *TBD* | *TBD* | *TBD* | *TBD* |

### DISCO Parent Page Selection

DISCO uses different parent pages based on major version:
- Version `0.x.x` → Parent Page ID: `1230704003`
- Version `3.x.x` → Parent Page ID: `790430795`

### Template Modifications

The template page is read from Confluence and modified:
1. **Jira ticket key** → replaced with the actual ticket from the user
2. **SPEAR ticket** → kept as-is (user updates later)
3. **All links** (Splunk, AppDynamics, CloudWatch, any external URL) → replaced with `http://www.example.com`
4. **All screenshot images** → removed, replaced with "Add screenshot here"
5. **Jira macro serverId:** `fe1ef74e-9748-3791-94b2-744480a01f2b` (MyJira)

### Jira Ticket Parsing

Read ticket via MyJira REST API using PAT from `~/.kiro/tokens.env` (`JIRA_PAT_myjira`):
```
GET https://myjira.disney.com/rest/api/2/issue/{key}?fields=summary
Authorization: Bearer {JIRA_PAT_myjira}
```
Extract from summary: App name, Site (WDW/DLR), Version.
