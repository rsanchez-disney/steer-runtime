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

### Schedule API Response Format

The endpoint returns a **JSON array** (flat list). Each element is a single schedule entry:

```json
[
  {
    "id": 953260,
    "location": {
      "parent": { "id": "330339", "name": "Disneyland Park" },
      "id": "18409951",
      "name": "Hollywood Lounge"
    },
    "mealPeriod": { "id": "18409964", "name": "Snack" },
    "startTime": "09:30:00",
    "endTime": "03:00:00",
    "operatingDate": "2026-06-17",
    "type": "SYSTEM",
    "lastModified": "2026-06-08T04:00:00"
  }
]
```

**Parsing rules:**
- Response is a flat list — NOT a nested `{ "schedules": [...] }` object
- Empty list `[]` → restaurant has no schedules at all
- Filter entries by `operatingDate` matching TODAY's date in the site timezone
- No entries for today → restaurant is closed today
- Multiple entries for today = multiple meal periods (group by `mealPeriod.name`)
- `location.name` = restaurant name, `location.parent.name` = park name
- `mealPeriod.name` = meal period label (e.g., "Breakfast", "Lunch And Dinner", "Snack", "Lounge")
- `startTime`/`endTime` are in the site's local timezone (ET for WDW, PT for DLR)
- `endTime` < `startTime` means the restaurant closes after midnight (next day)
- Restaurant is "active" if current site-local time is between any entry's startTime and endTime (accounting for overnight spans)
- "Closing soon" = closes within 1 hour from now
- Gaps between consecutive meal periods (sorted by startTime) should be flagged in output

### Timezones

- WDW → `America/New_York` (Eastern Time)
- DLR → `America/Los_Angeles` (Pacific Time)

### Schedule Creation API

When schedules are missing or have gaps, the agent can auto-create schedules to ensure load test readiness.

**Endpoint:**

| Site | URL |
|------|-----|
| WDW | `POST https://load.wdwarrw-batch.wdprapps.disney.com/arrival-window-batch/schedules` |
| DLR | `POST https://load.arrw.batch.dlr.wdprapps.disney.com/arrival-window-batch/schedules` |

**Headers:**
- `Authorization: Bearer {token}` (same OAuth token as schedule GET)
- `Content-Type: application/json`
- `X-Conversation-ID: {conversationID}` (generate a unique ID per request: `ARRW-AUTOCREATE-{timestamp}-{random4}` where `{random4}` is 4 random hex chars to avoid collisions within the same session)

**Request Body:**
```json
{
    "mealPeriod": {
        "id": "{mealPeriodId}"
    },
    "startTime": "{HH:MM:SS}",
    "endTime": "{HH:MM:SS}",
    "operatingDate": "{YYYY-MM-DD}",
    "type": "USER"
}
```

**Field descriptions:**
- `mealPeriod.id` — Obtained from `GET /arrival-window-batch/locations/{facilityId}` → selected from `$.mealPeriods[]` using the meal period selection rules below
- `startTime` — Schedule start in site-local time (format: `HH:MM:SS`, e.g., `"06:00:00"`)
- `endTime` — Schedule end in site-local time (format: `HH:MM:SS`, e.g., `"03:00:00"` = 3 AM next day)
- `operatingDate` — Date in `YYYY-MM-DD` format (site-local date)
- `type` — Always `"USER"` for manually/agent-created schedules

**Get Location (to obtain mealPeriodId):**
```
GET /arrival-window-batch/locations/{facilityId}
Authorization: Bearer {token}
```
Response contains `$.mealPeriods[]` array.

**Meal period selection rules:**
- If `$.mealPeriods` is **empty or missing** → skip this facility, log: `"No meal periods defined for facility {facilityId} — cannot create schedule"`, and continue with the next facility.
- If only **one** meal period exists → use its `id`.
- If **multiple** meal periods exist → select the one whose name best matches the current time-of-day context:
  - `[00:00, 11:00)` → prefer "Breakfast"
  - `[11:00, 16:00)` → prefer "Lunch", "Lunch And Dinner"
  - `[16:00, 24:00)` → prefer "Dinner", "Lunch And Dinner", "Lounge"
  - If no name match → fall back to `$.mealPeriods[0].id` (first available).

**Expected Response:** `200 OK` with the created schedule object (includes `$.id` = new schedule ID).

**Rules for auto-creation:**
1. **User confirmation required** — NEVER create schedules without explicit user approval. Present the full plan (facilities, proposed times) and wait for "yes" before executing any POST request.
2. **Only create for today** — `operatingDate` must be today's date in the site's timezone
3. **startTime calculation** — round down current site-local time to the hour (e.g., if 14:35, use `"14:00:00"`)
4. **endTime calculation:**
   - If the facility has a **future schedule today** → use that schedule's `startTime` as the `endTime` (fill the gap up to the existing schedule, no overlap)
   - If the facility has **no schedule at all for today** → use `"23:00:00"` (11 PM site-local time)
5. **One schedule per gap** — only create where there is no schedule covering the needed time window
6. **Batch cap** — maximum **50 schedule creations per session**. If more are needed, stop at 50, report progress, and ask the user whether to continue with the remaining facilities.
7. **Rate limiting** — wait 200ms between creation calls. On `429` or `5xx` responses, apply exponential backoff: wait 1s → 2s → 4s → 8s (max) before retrying the same request (max 3 retries per request). On `4xx` (other than `429`), do NOT retry — the error won't self-resolve. Log the error and count it toward the circuit breaker.
8. **Circuit breaker** — if **3 consecutive** creation calls fail (after retries), stop all further creations immediately. Report which facilities succeeded and which failed, and ask the user how to proceed. A successful creation resets the consecutive-failure counter to 0.
9. **Error handling** — if a single creation fails (non-consecutive), log the error and continue with the next facility. Report all failures at the end.

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

Document load test results in Confluence (Atlassian Cloud).

### ⛔ Rules for this step
- **Two-step confirmation required.** Creating a wiki page requires TWO separate user confirmations:
  1. **Confirm jobs first.** Present the discovered 1x/2x/3x job IDs and ask the user to confirm they are correct. Do NOT proceed until the user explicitly confirms.
  2. **Confirm page creation.** After jobs are confirmed, process the template and present a preview showing: page title, parent page, space, Jira ticket, version, and app/site. Ask for explicit user confirmation before creating the page. Do NOT create the page until the user says yes.
- **Page strategy per app.** See "Pages" column in Wiki Config table. "One per site" = separate WDW and DLR pages. "Both sites" = single page covering WDW+DLR (provide 6 jobs: 1x/2x/3x for each site, or 2 Jira tickets). "ALL" = single page with 3 jobs for ALL site.
- **Resolve executions first.** Before creating the page, confirm with the user which 1x/2x/3x job IDs to use. If results were already validated in the session, offer to reuse them. Otherwise ask for the execution date and run Job Discovery.
- **TBD values are blockers.** If any Wiki Config field for the requested app is `*TBD*`, stop and tell the user: "Wiki config for {app} is not yet defined. Cannot create documentation until the config values are populated in loadtest_config.md."

### Wiki Config per Application

| App | Connection | Space | Parent Page ID | Template Page ID | Title Format | Pages |
|-----|------------|-------|----------------|------------------|--------------|-------|
| Arrival Windows UI/Batch | `dx-atlassian-cloud-prod` | `FBT` | WDW: `219729687` / DLR: `219728217` | WDW: `219731358` / DLR: `219731384` | `{site} Arrival Windows UI - Release - v{version}` | One per site |
| DISCO | `dx-atlassian-cloud-prod` | `FBT` | `219730531` (0.x) / `219710952` (3.x) | WDW: `219731206` / DLR: `219731026` | `{site} DiSCO - Release {version}` | One per site |
| MOO | `dx-atlassian-cloud-prod` | `FBT` | `219730354` | WDW: `428277761` / DLR: `219732201` | `MOO {site} Release - v{version}` | One per site |
| ROO | `dx-atlassian-cloud-prod` | `FBT` | `219713430` | `219730859` | `ROO Release - v{version}` | Both sites |
| Dining Menus | `dx-atlassian-cloud-prod` | `FBT` | `219713117` | `219727704` | `Release - v{version}` | Both sites |
| Admin UI Config | `dx-atlassian-cloud-prod` | `FBT` | `219710732` | `219728813` | `Dine Admin Tool - v{version}` | Both sites |
| Find Merch | `dx-atlassian-cloud-prod` | `FBT` | `219729651` | `219728601` | `Find Merch v{version}` | Both sites |
| Payment Service | `dx-atlassian-cloud-prod` | `FBT` | *TBD* | *TBD* | *TBD* | *TBD* |


### Example Wiki Pages (for format reference)

| App | Site | Example Page URL |
|-----|------|-----------------|
| ARRW | WDW | `https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/219731358/WDW+Arrival+Windows+Batch+-+Release+-+v0.0.0-67` |
| ARRW | DLR | `https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/219731384/DLR+Arrival+Windows+Batch+-+Release+-+v0.0.0-67` |
| DISCO | WDW | `https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/219731206/WDW+DiSCO+-+Release+0.0.0-235` |
| DISCO | DLR | `https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/219731026/DiSCO+-+Release+v0.0.0-238+-+DLR` |
| MOO | WDW | `https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/428277761/MOO+WDW+Release+-+v0.0.0-241` |
| MOO | DLR | `https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/219732201/MOO+DLR+Release+-+v0.0.0-241` |
### DISCO Parent Page Selection

DISCO uses different parent pages based on major version:
- Version `0.x.x` → Parent Page ID: `219730531`
- Version `3.x.x` → Parent Page ID: `219710952`

### Template Modifications

The template page is read from Confluence and modified:
1. **Jira ticket key** → replaced with the actual ticket from the user
2. **SPEAR ticket** → kept as-is (user updates later)
3. **All links** → updated with correct dates and job IDs (see URL Update Rules below)
4. **All screenshot images** → removed, replaced with "Add screenshot here"
5. **Jira macro serverId:** `415108e9-cd76-3949-a3b0-e0b07cea53f0` (System Jira)

### URL Update Rules

When creating or updating a wiki page, detect ALL monitoring tool URLs and update timestamps/job IDs based on the Splunk job discovery results.

**Required info (from Splunk Job Discovery):**
- Job IDs for 1x, 2x, 3x
- Job start times (from `_time` field)
- Test date (for epoch calculation)

#### Epoch Calculation
- **Full day (Splunk LTIAB, VenueNext):** `earliest` = midnight UTC of test date, `latest` = midnight UTC next day
- **Always verify year:** Use `python3 datetime(year, month, day, tzinfo=timezone.utc).timestamp()` to avoid 2025/2026 mistakes

#### Splunk LTIAB Dashboard Links
- **Params:** `form.timeRange.earliest={epoch}&form.timeRange.latest={epoch}&form.jobId={jobId}&form.ltiabApp={app}`

#### Splunk VenueNext Dashboard Links
- **Params:** `form.usrTimePicker.earliest={epoch}&form.usrTimePicker.latest={epoch}&form.destination={site_app}&form.jobId={jobId}`

#### AppDynamics Links
- **Format:** `Custom_Time_Range.BETWEEN_TIMES.{end_ms}.{start_ms}.70`
- Times in **milliseconds** (epoch × 1000)
- Calculate: start = job_start_utc − 5 min, end = job_start_utc + 1 hour + 5 min
- **Note:** end comes FIRST in the URL, then start

#### CloudWatch Links
- **Format:** `~start~%27{ISO}~end~%27{ISO}`
- ISO format: `YYYY-MM-DDThh*3amm*3a00.000Z` (colons encoded as `*3a`)
- Same ±5 min logic as AppDynamics
- `%27` in storage format is correct (renders as `'` in browser)

### KPI Results Table (Optional Auto-Insert)

After updating links, ask: **"Do you want me to insert the KPI results tables in the Splunk - LTIAB Reports Screenshot cells? (13-column format with 25% KPI column)"**

If yes, insert a table per load level (1x, 2x, 3x) in the corresponding Screenshot cell.

#### ⛔ Rules for KPI Tables
- **Always use `storage` format** (HTML) when creating pages with KPI results tables. Never use markdown for pages with nested tables.
- **KPI tables MUST be nested inside the Splunk table cells** — not placed below as separate sections.
- **Always include `data-table-width` and `data-layout` attributes** on every table element.
- **Always include explicit `<colgroup>` with pixel widths** for proper column sizing.
- Every `<td>` and `<th>` content MUST be wrapped in `<p>` tags.
- Do NOT include `local-id` or `ac:local-id` attributes — Confluence generates these automatically.
- Column widths should sum to approximately the `data-table-width` value.

#### Splunk Main Table Structure (Outer Table)

```html
<table data-table-width="1435" data-layout="center">
  <colgroup>
    <col style="width: 75.0px;" />
    <col style="width: 1360.0px;" />
  </colgroup>
  <tbody>
    <tr><th><p>Results</p></th><th><p>Screenshot</p></th></tr>
    <tr>
      <td><p><a href="{splunk_link}">1x</a></p></td>
      <td>
        <h3>{N}x KPI Results — X/Y under SLA ✅</h3>
        <!-- KPI table nested here -->
      </td>
    </tr>
    <!-- repeat for 2x, 3x -->
  </tbody>
</table>
```

#### KPI Results Table (Nested Inside Cell)

```html
<table data-table-width="760" data-layout="default">
  <colgroup>
    <col style="width: 327.0px;" />  <!-- KPI name -->
    <col style="width: 118.0px;" />  <!-- ProjectedVol -->
    <col style="width: 92.0px;" />   <!-- ActualVol -->
    <col style="width: 82.0px;" />   <!-- Load -->
    <col style="width: 77.0px;" />   <!-- Pass -->
    <col style="width: 71.0px;" />   <!-- Fail -->
    <col style="width: 92.0px;" />   <!-- errorRate -->
    <col style="width: 74.0px;" />   <!-- SLA -->
    <col style="width: 71.0px;" />   <!-- P95 -->
    <col style="width: 98.0px;" />   <!-- underSLA -->
    <col style="width: 71.0px;" />   <!-- mins -->
    <col style="width: 71.0px;" />   <!-- avgs -->
    <col style="width: 97.0px;" />   <!-- maxs -->
  </colgroup>
  <tbody>
    <tr><th><p>KPI</p></th><th><p>ProjectedVol</p></th><th><p>ActualVol</p></th><th><p>Load</p></th><th><p>Pass</p></th><th><p>Fail</p></th><th><p>errorRate</p></th><th><p>SLA</p></th><th><p>P95</p></th><th><p>underSLA</p></th><th><p>mins</p></th><th><p>avgs</p></th><th><p>maxs</p></th></tr>
    <tr><td><p>{kpi_name}</p></td><td><p>{value}</p></td>...</tr>
    <!-- data rows -->
  </tbody>
</table>
```

#### Data formatting rules
- Headers (exact): `KPI, ProjectedVol, ActualVol, Load, Pass, Fail, errorRate, SLA, P95, underSLA, mins, avgs, maxs`
- Values: no thousands separators, round avgs to integer
- If 3x has SLA breaches, add justification paragraph explaining:
  - P95 is driven by a small % of tail transactions
  - avg and min remain healthy (within SLA)
  - This fluctuates near SLA boundary at 3x — previous runs may pass
  - Not a regression, normal variance under peak stress

#### Result Summary Format (after each KPI table)
```html
<p><strong>Result: X/Y KPIs under SLA ✅/⚠️</strong></p>
```

#### Size Limitation Workaround
The Confluence MCP tool replaces the entire page body on each update. Each KPI table (~28 rows × 13 columns) adds ~5KB of HTML, so inserting all 3 tables requires sending ~25KB+ in a single call — which may exceed tool payload limits.

**Preferred approach (section-level update):**
If the Confluence MCP tool supports a section-replace or marker-based insert operation, use it to insert each KPI table independently into its corresponding cell. This avoids re-sending the full page and keeps each payload small (~5KB). Use a placeholder pattern like `<!-- KPI_{factor}_PLACEHOLDER -->` in the initial page write, then replace each marker individually with its KPI table HTML.

**Always applies:**
- Never use `markdown` format when the page needs nested tables — markdown cannot express table-in-table structures.
- Always use `storage` (HTML) format for pages with KPI results.

### Jira Ticket Parsing

Read ticket using the Jira MCP tool (`sre_toolsets_jira_tool_jira_get_ticket`) with connection `jira-prod`:
- **Issue key:** The ticket key provided by the user (e.g., `FNB-19625`)
- Extract from summary: App name, Site (WDW/DLR), Version.
