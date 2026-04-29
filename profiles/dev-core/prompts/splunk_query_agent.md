---
name: Splunk Query
description: Execute Splunk queries via Chrome MCP browser automation with SSO authentication and service catalog lookup.
inclusion: manual
---

# Splunk Query Skill

Execute Splunk queries via Chrome MCP browser automation. Authenticates through SSO, then uses Splunk REST API directly from the authenticated browser session.

## Prerequisites

- **Chrome MCP** must be installed and configured (see README at `.kiro/skills/splunk-query/README.md`)
- User must have Okta SSO access to Splunk

## Environment URLs

| Environment | Splunk URL | Env Codes |
|---|---|---|
| Latest, Stage, Load | `https://stage.splunk.wdprapps.disney.com` | latest, stage, load |
| Prod | `https://splunk.wdprapps.disney.com` | prod |

---

## Execution Flow (FOLLOW THIS EXACTLY)

### Step 1: Determine Splunk Instance
- `prod` → `https://splunk.wdprapps.disney.com`
- Everything else (`latest`, `stage`, `load`) → `https://stage.splunk.wdprapps.disney.com`

### Step 2: Check for Existing Authenticated Session
Use `mcp_chrome_devtools_list_pages` to check if a Splunk page for the target instance is already open.
- If a matching page exists, select it with `mcp_chrome_devtools_select_page` and skip to Step 5.
- If no matching page exists, proceed to Step 3.

### Step 3: Launch Chrome and Open Splunk

If no browser pages are available at all (list_pages returns empty or fails), Chrome may not be running with remote debugging. Launch it automatically:

**Detect OS and launch Chrome with remote debugging:**

Use `mcp_chrome_devtools_list_pages` first. If it fails or returns no pages, run the appropriate command via `executeBash`:

- **macOS**: 
  ```bash
  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-debug-profile" &
  ```
- **Windows** (detect via `uname` or check for `/c/` paths):
  ```bash
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%USERPROFILE%\.chrome-debug-profile"
  ```
  Or via Git Bash:
  ```bash
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-debug-profile" &
  ```

After launching, wait 3 seconds, then open the Splunk URL:
```
mcp_chrome_devtools_new_page(url=<SPLUNK_URL>)
```

### Step 4: Wait for SSO Authentication

**DO NOT ask the user to confirm login. Poll automatically.**

```
mcp_chrome_devtools_wait_for(
  text=["Search & Reporting", "splunk", "New Search", "Search"],
  timeout=60000
)
```

This waits up to 60 seconds for SSO to complete. The user just needs to approve the Okta push on their phone.

If the wait times out, inform the user: "SSO authentication timed out. Please approve the Okta Verify push notification and try again."

### Step 5: Execute Query via Splunk REST API

Select the correct Splunk page, then use `mcp_chrome_devtools_evaluate_script` with this pattern:

```javascript
async () => {
  const cookies = document.cookie;
  const csrfMatch = cookies.match(/splunkweb_csrf_token_\d+=([^;]+)/);
  if (!csrfMatch) return { error: 'No CSRF token found — session may have expired' };
  const csrfToken = csrfMatch[1];
  
  const baseUrl = window.location.origin;
  
  // Create search job
  const formData = new URLSearchParams();
  formData.append('search', 'search <SPL_QUERY>');
  formData.append('earliest_time', '<EARLIEST>');  // default: -15m
  formData.append('latest_time', '<LATEST>');       // default: now
  formData.append('output_mode', 'json');
  
  const createResp = await fetch(`${baseUrl}/en-US/splunkd/__raw/services/search/jobs`, {
    method: 'POST',
    headers: {
      'X-Splunk-Form-Key': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    credentials: 'include',
    body: formData.toString()
  });
  
  const createData = await createResp.json();
  if (!createData.sid) return { error: 'Failed to create job', createData };
  const sid = createData.sid;
  
  // Poll until done
  let isDone = false;
  let attempts = 0;
  while (!isDone && attempts < 40) {
    await new Promise(r => setTimeout(r, 3000));
    const statusResp = await fetch(`${baseUrl}/en-US/splunkd/__raw/services/search/jobs/${encodeURIComponent(sid)}?output_mode=json`, {
      headers: { 'X-Splunk-Form-Key': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include'
    });
    const statusData = await statusResp.json();
    isDone = statusData.entry?.[0]?.content?.isDone;
    attempts++;
  }
  
  if (!isDone) return { error: 'Search timed out', sid, attempts };
  
  // Fetch results
  const resultsResp = await fetch(`${baseUrl}/en-US/splunkd/__raw/services/search/jobs/${encodeURIComponent(sid)}/results?output_mode=json&count=<MAX_RESULTS>`, {
    headers: { 'X-Splunk-Form-Key': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
    credentials: 'include'
  });
  const results = await resultsResp.json();
  
  return {
    resultCount: results.results ? results.results.length : 0,
    results: results.results ? results.results.map(r => ({
      _time: r._time,
      source: r.source,
      _raw: r._raw ? r._raw.substring(0, 500) : 'N/A'
    })) : []
  };
}
```

### Step 6: Handle Session Expiry

If the query returns `"No CSRF token found"`, the session has expired:
1. Navigate to the Splunk URL again: `mcp_chrome_devtools_navigate_page(type="url", url=<SPLUNK_URL>)`
2. Wait for SSO (Step 4)
3. Retry the query (Step 5)

---

## Query Building Rules

### Required User Input
- **Index** (always required) — ask if not provided
- **Environment** (always required): latest, stage, load, or prod — ask if not provided

### Optional User Input
- **Brand**: DLR or WDW
- **Additional source/filter conditions**
- **Time range** (defaults to `-15m` to `now`)
- **Max results** (defaults to 10)

---

## Pattern 1: Legacy Source-Based Query

Used by services that log with `source` field containing environment and region info.

### Query Template
```
index=<INDEX> source=*<ENVIRONMENT>* [source=*<BRAND_REGION>*] | head <LIMIT>
```

### Environment Mapping (source pattern)
| Environment | Source Pattern |
|---|---|
| latest | `source=*latest*` |
| stage | `source=*stage*` |
| load | `source=*load*` |
| prod | `source=*prod*` |

### Brand Mapping (source pattern)
| Brand | Source Pattern |
|---|---|
| DLR | `source=*west-2*` |
| WDW | `source=*east-1*` |

### Example Queries
```spl
# Cart Service latest
index=wdpr_commerce_cart source=*latest* | head 10

# Order Service latest DLR
index=*core_api* source=*order-svc* source=*latest* source=*west-2* | head 10

# Order Service prod
index=*core_api* source=*order-svc* source=*prod* | head 10
```

---

## Pattern 2: ECS-Based Query (New Pattern)

Used by services running on ECS with `ecs_cluster` and `ecs_task_definition` fields.

### Query Template
```
index=<INDEX> ecs_cluster=*<BRAND_ACCOUNT>* ecs_cluster=*<ENV_CODE>* ecs_task_definition=*<SERVICE_NAME>* | head <LIMIT>
```

### Environment Mapping (ECS pattern)
| Environment | ECS Suffix |
|---|---|
| latest | `*lst*` |
| stage | `*stg*` |
| load | `*lod*` |
| prod | No env filter needed (only 1 prod cluster) |

### Brand Mapping (ECS pattern)
| Brand | Cluster Pattern |
|---|---|
| DLR | `ecs_cluster=*dlr*` |
| WDW | `ecs_cluster=*wdw*` |

### Example Queries
```spl
# TMS Internal DLR latest
index=*wdpr-ecommerce* ecs_cluster=*dlr-ecommerce-S0001477* ecs_cluster=*lst* ecs_task_definition=*tmsint-svc* | head 10

# LexVAS API WDW stage
index=*wdpr-ecommerce* ecs_cluster=*wdw-ecommerce-S0001591* ecs_cluster=*stg* ecs_task_definition=*lexvas-api* | head 10

# TixSale API DLR latest
index=*wdpr-apps* ecs_cluster=*dlr-commerce2-01323* ecs_cluster=*latest* ecs_task_definition=*tixsale-api-dlr* | head 10
```

---

## Service Registry (Pre-loaded Catalog)

Use this registry to help users find the right service. When a user mentions a service name, look it up here to determine the index, pattern, cluster, and task definition — so you can build the query without asking extra questions.

### Legacy Pattern Services

| Service Name | Index | Extra Source Filter | Brand | Pattern |
|---|---|---|---|---|
| Cart Service | `wdpr_commerce_cart` | — | Both | Legacy |
| Order Service | `*core_api*` | `source=*order-svc*` | Both | Legacy |
| Package Order Service | `*core_api*` | `source=*order-svc*` | Both | Legacy |
| Accommodation Package Order Service | `*core_api*` | `source=*order-svc*` | Both | Legacy |

---

### ECS Pattern — `wdpr-ecommerce` Index — DLR Services

| Service Name | Task Definition | ECS Cluster | Region |
|---|---|---|---|
| TMS Internal (DLR) | `tmsint-svc` | `dlr-ecommerce-S0001477` | usw2 |
| TMS (DLR) | `tms-svc` | `dlr-ecommerce-S0001477` | usw2 |
| TMS Service (DLR) | `tms-service-svc` | `dlr-ecommerce-S0001477` | usw2 |
| CME Reservation (DLR) | `cme-res` | `dlr-ecommerce-S0001477` | usw2 |
| CME Availability (DLR) | `cme-avail` | `dlr-ecommerce-S0001477` | usw2 |
| CME Eligibility (DLR) | `cme-elig` | `dlr-ecommerce-S0001477` | usw2 |
| CME Retrieval (DLR) | `cme-rtrvl` | `dlr-ecommerce-S0001477` | usw2 |
| CME Admin (DLR) | `cme-admin` | `dlr-ecommerce-S0001477` | usw2 |
| EVAS (DLR) | `evas-svc` | `dlr-ecommerce-S0001477` | usw2 |
| EVAS Internal (DLR) | `evasint-svc` | `dlr-ecommerce-S0001477` | usw2 |
| SA VAS (DLR) | `sa-vas` | `dlr-ecommerce-S0001477` | usw2 |
| LexVAS API (DLR) | `lexvas-api` | `dlr-ecommerce-S0001477` | usw2 |
| LexVAS Internal (DLR) | `lexvasint-api` | `dlr-ecommerce-S0001477` | usw2 |
| CME Eligibility Java17 (DLR) | `cme-elig-java-17` | `dlr-ecommerce-S98628` | usw2 |
| CME Availability Java17 (DLR) | `cme-avail-java17` | `dlr-ecommerce-S98628` | usw2 |
| CME Admin Java17 (DLR) | `cme-admin-java17` | `dlr-ecommerce-S98628` | usw2 |
| CME Admin Java-17 (DLR) | `cme-admin-java-17` | `dlr-ecommerce-S98628` | usw2 |
| CME Retrieval Java17 (DLR) | `cme-rtrvl-java17` | `dlr-ecommerce-S98628` | usw2 |
| CME Reservation Java17 (DLR) | `cme-res-java17` | `dlr-ecommerce-S98628` | usw2 |
| CME Product Consumer (DLR) | `cme-product-consumer` | `dlr-ecommerce-S98628` | usw2 |
| TPAC (DLR) | `tpac-svc` | `dlr-ecommerce-S0014857` | usw2 |
| LexVAS v3 (DLR) | `lexvas-v3-dlr` | `dlr-ecommerce-S0015927` | usw2 |
| Entitlement Photo Service (DLR) | `entitlement-photo-svc` | `dlr-ecommerce-S0015927` | usw2 |
| PACS (DLR) | `pacs-svc` | `dlr-commerce2-01323` | usw2 |

### ECS Pattern — `wdpr-ecommerce` Index — WDW Services

| Service Name | Task Definition | ECS Cluster | Region |
|---|---|---|---|
| TMS Internal (WDW) | `tmsint-svc` | `wdw-ecommerce-S0001479` | usw2 |
| TMS (WDW) | `tms-svc` | `wdw-ecommerce-S0001479` | usw2 |
| TMS WDW | `tms-svc-wdw` | `wdw-ecommerce-S0001479` | use1 |
| CME Reservation (WDW) | `cme-res` | `wdw-ecommerce-S0001479` | use1 |
| CME Availability (WDW) | `cme-avail` | `wdw-ecommerce-S0001479` | use1 |
| CME Eligibility (WDW) | `cme-elig` | `wdw-ecommerce-S0001479` | use1 |
| CME Retrieval (WDW) | `cme-rtrvl` | `wdw-ecommerce-S0001479` | use1 |
| CME Admin (WDW) | `cme-admin` | `wdw-ecommerce-S0001479` | use1 |
| EVAS WDW | `evas-svc-wdw` | `wdw-ecommerce-S0001479` | use1 |
| EVAS WDW (alt) | `evas-wdw-svc` | `wdw-ecommerce-S0001479` | usw2 |
| EVAS Internal WDW | `evasint-wdw-svc` | `wdw-ecommerce-S0001479` | usw2 |
| EVAS Internal WDW (alt) | `evasint-svc-wdw` | `wdw-ecommerce-S0001479` | usw2 |
| SA VAS (WDW) | `sa-vas` | `wdw-ecommerce-S0001479` | use1 |
| APLEX VAS (WDW) | `aplex-vas` | `wdw-ecommerce-S0001479` | use1 |
| PACS Main (WDW) | `pacs-main` | `wdw-ecommerce-S0001479` | use1 |
| LexVAS API (WDW) | `lexvas-api` | `wdw-ecommerce-S0001591` | use1 |
| LexVAS Internal (WDW) | `lexvasint-api` | `wdw-ecommerce-S0001591` | usw2 |
| CME Eligibility Java17 (WDW) | `cme-elig-java17` | `wdw-ecommerce-S00892` | use1 |
| CME Availability Java17 (WDW) | `cme-avail-java17` | `wdw-ecommerce-S00892` | use1 |
| CME Admin Java17 (WDW) | `cme-admin-java17` | `wdw-ecommerce-S00892` | use1 |
| CME Retrieval Java17 (WDW) | `cme-rtrvl-java17` | `wdw-ecommerce-S00892` | use1 |
| CME Reservation Java17 (WDW) | `cme-res-java17` | `wdw-ecommerce-S00892` | use1 |
| TPAC (WDW) | `tpac-svc` | `wdw-ecommerce-S0014492` | use1 |
| Order VAS v2 (WDW) | `order-vas-v2` | `wdw-ecommerce-S0015463` | use1 |

### ECS Pattern — `wdpr-ecommerce` Index — Shared Services (brand-agnostic)

| Service Name | Task Definition | ECS Cluster | Region |
|---|---|---|---|
| Lexicon UI | `lexicon-ui` | `wdpr-ecommerce-S0001323` | usw2 |
| Lexicon Service | `lexicon-svc` | `wdpr-ecommerce-S0001323` | usw2 |
| TTC LexVAS | `ttc-lexvas` | `wdpr-ecommerce-S0001663` | usw2, use1 |
| BSGA API | `bsga-api` | `wdpr-ecommerce-S0015371` | usw2 |

### ECS Pattern — `wdpr-apps` Index

| Service Name | Task Definition | ECS Cluster | Brand |
|---|---|---|---|
| Aplex (DLR) | `aplex` | `dlr-commerce2-01323` | DLR |
| TixSale API (DLR) | `tixsale-api-dlr` | `dlr-commerce2-01323` | DLR |
| PACS (DLR, apps) | `pacs-svc` | `dlr-commerce2-01323` | DLR |
| TixSale API (WDW) | `tixsale-api` | `tixsale-{env}` | WDW |
| DTC DLR | `dtc-dlr` | `dlr-dtc-{env}` | DLR |
| DTC WDPR | `dtc-wdpr` | `wdpr-dtc-{env}` | Shared |
| FAS (Content) | `fas` | `wdpr-content-B0060601-usw2-lst-explr-fas` | Shared |

---

### Quick Lookup: Service Name → Query

When a user says "I want logs for X", use this to build the query instantly:

| User says... | Query |
|---|---|
| "Cart Service" | `index=wdpr_commerce_cart source=*{env}*` |
| "Order Service" | `index=*core_api* source=*order-svc* source=*{env}*` |
| "TMS Internal DLR" | `index=wdpr-ecommerce ecs_cluster=*dlr-ecommerce-S0001477* ecs_cluster=*{env}* ecs_task_definition=*tmsint-svc*` |
| "TMS WDW" | `index=wdpr-ecommerce ecs_cluster=*wdw-ecommerce-S0001479* ecs_cluster=*{env}* ecs_task_definition=*tms-svc*` |
| "CME Reservation DLR" | `index=wdpr-ecommerce ecs_cluster=*dlr-ecommerce-S0001477* ecs_cluster=*{env}* ecs_task_definition=*cme-res*` |
| "CME Availability WDW" | `index=wdpr-ecommerce ecs_cluster=*wdw-ecommerce-S0001479* ecs_cluster=*{env}* ecs_task_definition=*cme-avail*` |
| "LexVAS API DLR" | `index=wdpr-ecommerce ecs_cluster=*dlr-ecommerce-S0001477* ecs_cluster=*{env}* ecs_task_definition=*lexvas-api*` |
| "LexVAS API WDW" | `index=wdpr-ecommerce ecs_cluster=*wdw-ecommerce-S0001591* ecs_cluster=*{env}* ecs_task_definition=*lexvas-api*` |
| "EVAS DLR" | `index=wdpr-ecommerce ecs_cluster=*dlr-ecommerce-S0001477* ecs_cluster=*{env}* ecs_task_definition=*evas-svc*` |
| "TPAC DLR" | `index=wdpr-ecommerce ecs_cluster=*dlr-ecommerce-S0014857* ecs_cluster=*{env}* ecs_task_definition=*tpac-svc*` |
| "TPAC WDW" | `index=wdpr-ecommerce ecs_cluster=*wdw-ecommerce-S0014492* ecs_cluster=*{env}* ecs_task_definition=*tpac-svc*` |
| "TTC LexVAS" | `index=wdpr-ecommerce ecs_cluster=*wdpr-ecommerce-S0001663* ecs_cluster=*{env}* ecs_task_definition=*ttc-lexvas*` |
| "Lexicon" | `index=wdpr-ecommerce ecs_cluster=*wdpr-ecommerce-S0001323* ecs_cluster=*{env}* ecs_task_definition=*lexicon-svc*` |
| "TixSale DLR" | `index=wdpr-apps ecs_cluster=*dlr-commerce2-01323* ecs_cluster=*{env}* ecs_task_definition=*tixsale-api-dlr*` |
| "TixSale WDW" | `index=wdpr-apps ecs_cluster=*tixsale-{env}* ecs_task_definition=*tixsale-api*` |
| "Aplex DLR" | `index=wdpr-apps ecs_cluster=*dlr-commerce2-01323* ecs_cluster=*{env}* ecs_task_definition=*aplex*` |
| "DTC DLR" | `index=wdpr-apps ecs_cluster=*dlr-dtc-{env}* ecs_task_definition=*dtc-dlr*` |
| "DTC WDPR" | `index=wdpr-apps ecs_cluster=*wdpr-dtc-{env}* ecs_task_definition=*dtc-wdpr*` |
| "BSGA" | `index=wdpr-ecommerce ecs_cluster=*wdpr-ecommerce-S0015371* ecs_cluster=*{env}* ecs_task_definition=*bsga-api*` |
| "Order VAS v2" | `index=wdpr-ecommerce ecs_cluster=*wdw-ecommerce-S0015463* ecs_cluster=*{env}* ecs_task_definition=*order-vas-v2*` |
| "SA VAS DLR" | `index=wdpr-ecommerce ecs_cluster=*dlr-ecommerce-S0001477* ecs_cluster=*{env}* ecs_task_definition=*sa-vas*` |
| "APLEX VAS WDW" | `index=wdpr-ecommerce ecs_cluster=*wdw-ecommerce-S0001479* ecs_cluster=*{env}* ecs_task_definition=*aplex-vas*` |
| "LexVAS v3 DLR" | `index=wdpr-ecommerce ecs_cluster=*dlr-ecommerce-S0015927* ecs_cluster=*{env}* ecs_task_definition=*lexvas-v3-dlr*` |

---

## Discovery Query

To discover new ECS services or verify current ones:
```spl
index=wdpr-ecommerce OR index=wdpr-apps | dedup ecs_cluster,ecs_task_definition | table index, ecs_cluster, ecs_task_definition
```

## Important Rules

1. **Always ask for index and environment** — these are mandatory.
2. **Brand is optional** — only add brand filter if user specifies DLR or WDW.
3. **Prod environment**: For legacy pattern, use `source=*prod*`. For ECS pattern, do NOT add environment filter (only 1 prod cluster exists).
4. **Do NOT ask user to confirm SSO** — poll automatically with `wait_for`.
5. **Reuse existing browser sessions** — check `list_pages` before opening new tabs.
6. **Launch Chrome automatically** if not running — detect OS and use appropriate command.
7. **Time range defaults** to `-15m` unless user specifies otherwise.
8. **Result limit defaults** to 10 unless user specifies otherwise.
9. **Truncate `_raw` field** to 500 chars when displaying results to avoid overwhelming output.
10. **Handle session expiry** — if CSRF token is missing, re-navigate and re-auth automatically.
