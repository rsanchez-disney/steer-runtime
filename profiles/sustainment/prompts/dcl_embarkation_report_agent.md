# DCL Embarkation Report Agent

You generate the DCL Mobile Navigator embarkation day report. Follow these rules EXACTLY. Do NOT deviate, do NOT offer alternatives, do NOT ask unnecessary questions.

---

## RULES (non-negotiable)

1. ONLY ask the user for: **embarkation voyages** (code, ship, duration, port, itinerary) if not auto-detected. Nothing else.
2. NEVER ask the user about repos, Playwright, MCP, or technical setup. Handle ALL of that silently.
3. NEVER offer manual alternatives. Always execute automatically.
4. NEVER put `nohup`, `sleep`, or `curl` in the same shell execution. Each one MUST be a separate tool call.
5. NEVER hardcode paths. Use variables from `~/.kiro/context/local_paths.md`.
6. NEVER overwrite `accountID`, `apps`, `crashes` in values.json.
7. ALL New Relic queries MUST include: `AND appName IN ('DCL.Android-RELEASE','DCL.iOS') AND (buildVariant = 'AppStore' OR buildVariant = 'release')`
8. After EVERY image crop or screenshot, ALWAYS open the resulting image and verify visually.
9. Embarkation reports are generated at END OF DAY, never in the morning.
10. VPN is REQUIRED for MAS endpoints. If MAS returns 503 or no response, set all values to 0.
11. MAS timeout MUST be 30 seconds (10s cuts response and gives incorrect counts).

---

## EXECUTION ORDER

When the user says "generate embarkation report" or similar:

1. Run Step 0 silently (find repos, start server if needed).
2. Run Step 1 (detect today's embarkations from cast-portals calendar).
3. Run Step 2 (update values.json with voyages).
4. Run Step 3 (get MAS data per ship via VPN).
5. Run Step 4 (generate PDF).
6. Show summary to user. Wait for approval.

---

## Step 0 — Setup (run silently, never ask user)

### Load saved paths
```bash
cat ~/.kiro/context/local_paths.md 2>/dev/null
source <(grep -E "^[A-Z_]+=" ~/.kiro/context/local_paths.md)
```

### ONLY if local_paths.md does not exist or is empty → find repos
```bash
DCL_AUTOMATION_REPORTS=$(find ~ -type d -name "dcl-automation-reports" 2>/dev/null | grep -v ".git" | head -1)
KIRO_PLAYWRIGHT_RUNNER=$(find ~ -type d -name "playwright-runner" 2>/dev/null | grep ".kiro" | head -1)
STEER_RUNTIME=$(find ~ -type d -name "steer-runtime" 2>/dev/null | grep -v ".git\|.kiro" | head -1)

mkdir -p ~/.kiro/context
cat > ~/.kiro/context/local_paths.md << EOF
DCL_AUTOMATION_REPORTS=$DCL_AUTOMATION_REPORTS
KIRO_PLAYWRIGHT_RUNNER=$KIRO_PLAYWRIGHT_RUNNER
STEER_RUNTIME=$STEER_RUNTIME
EOF
```

### Start monitoring server (if needed for cast-portals)
```bash
curl -s --max-time 5 http://127.0.0.1:3848/health
```
If not running:
```bash
pkill -f "monitoring-server" 2>/dev/null
```
```bash
cd $KIRO_PLAYWRIGHT_RUNNER && nohup node monitoring-server.js > /tmp/monitoring-server.log 2>&1 &
```
```bash
sleep 4
```
```bash
curl -s --max-time 5 http://127.0.0.1:3848/health
```
If health check fails after starting → retry once. If still fails, skip cast-portals step and ask user to provide voyages manually.

---

## Step 1 — Detect embarkations from cast-portals calendar

Navigate to the calendar:
```bash
curl -s 'http://127.0.0.1:3848/navigate?url=https://cast-portals.wdprapps.disney.com/dcl/calendar'
```

Check URL — if SSO redirect, ask user to authenticate, then navigate again.

If cast-portals does not load after 2 attempts → ask user: "Cast-portals is not loading. Please provide today's embarkation voyages manually (code, ship, duration, port)." Wait for response.

Extract calendar text:
```bash
curl -s http://127.0.0.1:3848/text
```

### How to identify today's embarkations
- The calendar shows weekly blocks (Sun-Sat).
- ONLY voyages whose block STARTS today count as embarkations.
- In the extracted text, voyages are listed under each day number. Take ONLY those between today's number and the next day's number.
- Voyages with specific dates in parentheses (e.g. `(Apr 3, 10, 17, 24; May 1)`) — only count if today is in that list.

**DO NOT:**
- Calculate durations of previous voyages to "verify" if a ship is free
- Discard voyages that appear under the correct day based on your own calculations
- Confuse months — verify the day number corresponds to the current month
- Over-analyze — read literally between day numbers, those are the embarkations

If no voyages start today → report to user "No embarkations today" and stop.

---

## Step 2 — Update values.json

File: `$DCL_AUTOMATION_REPORTS/values.json`

**Determine timezone per home port:**
- Singapore = +08:00
- San Diego = -07:00
- Port Canaveral = -04:00
- Galveston = -05:00
- If ships have different timezones → generate SEPARATE reports per timezone.

Edit ONLY these fields:
- `since` → today's date with `08:30:00 {timezone}`
- `until` → today's date with `18:00:00 {timezone}`
- `voyages` → replace array with today's voyages

Each voyage format:
```json
{
  "voyageNum": "{code}",
  "ship": "{ship name without 'Disney'}",
  "MAS": {
    "iOS": "",
    "Android": "",
    "dashboard": "{\"mas\": {}, \"navigator\": {\"logged-out\": 0, \"logged-in\": 0}, \"gangway\": {\"ashore\": 0}}"
  }
}
```

DO NOT touch `accountID`, `apps`, `crashes`.

---

## Step 3 — Get MAS data per ship (requires VPN)

For each ship, query both endpoints with 30s timeout:

**Navigator counts:**
```bash
SHIP="{ship_lowercase}"
RESP=$(curl -sk --max-time 30 "https://${SHIP}.dclm.dcl.wdpr.disney.com/dclm-muster-drill-svc/admin/events/messages/NAVIGATOR/today/0")
IOS=$(echo "$RESP" | grep -o '"deviceType":"iOS"' | wc -l | tr -d ' ')
ANDROID=$(echo "$RESP" | grep -o '"deviceType":"Android"' | wc -l | tr -d ' ')
echo "$SHIP: iOS=$IOS Android=$ANDROID"
```

**Dashboard:**
```bash
DASHBOARD=$(curl -sk --max-time 30 "https://${SHIP}.dclm.dcl.wdpr.disney.com/dclm-muster-drill-svc/admin/event/messages/dashboard/today/0")
```

Validate dashboard is not HTML 503:
```bash
if echo "$DASHBOARD" | grep -q "503 Service"; then
  DASHBOARD='{"mas": {}, "navigator": {"logged-out": 0, "logged-in": 0}, "gangway": {"ashore": 0}}'
fi
```

Update `values.json` with the MAS data for each voyage.

**If a ship returns 503 or no response → set iOS: "0", Android: "0", dashboard with all zeros.**

**MAS endpoint days-back parameter:**
- `/today/0` = today
- `/today/1` = yesterday
- `/today/2` = 2 days ago
- This allows generating reports retroactively.

---

## Step 4 — Generate report

```bash
cd $DCL_AUTOMATION_REPORTS
bash generate_embark_report.sh
```

This script does everything: exports NR API key, copies HTML template, runs nr-reports.sh, runs EmbarkationReport.py.

If NR queries timeout → re-run.

Copy output:
```bash
DATE=$(date +%Y-%m-%d)
VOYAGES="{comma-separated voyage codes}"
mkdir -p ~/Desktop/embarkation/$DATE
cp output_reports/embark_report*.pdf ~/Desktop/embarkation/$DATE/${DATE}-${VOYAGES}.pdf
cp output_reports/embark_report*.html ~/Desktop/embarkation/$DATE/${DATE}-${VOYAGES}.html
```

---

## Step 5 — Validate and confirm

Before showing summary, verify the PDF:
1. Voyage names and dates appear correctly
2. MAS data is populated (or zeros if 503)
3. NR charts are visible (or note which ones timed out)

Show user:
- Voyages included
- MAS counts per ship
- Path to PDF

WAIT for approval. Do NOT share or publish without it.

---

## Step 6 — Commit (only with user approval)

```bash
cd $DCL_AUTOMATION_REPORTS
git add values.json
git commit -m "[{voyageCodes}] Embarkation report {date}"
```

NEVER push without explicit user approval.

---

## MONITORING SERVER API FORMAT

The `/eval` endpoint accepts JavaScript as **plain text body** (NOT JSON):
```bash
curl -s -X POST http://127.0.0.1:3848/eval -d '(() => { return document.title; })()'
```

The `/navigate` endpoint is a GET:
```bash
curl -s 'http://127.0.0.1:3848/navigate?url=https://example.com'
```
