# Incident Patterns — Studio PhotoPass (DPI)

## Top 8 Known Patterns

Derived from 80+ real resolved ServiceNow incidents (AG: app-flwdw-dpi). Use for rapid triage and pattern matching.

---

### 1. PP+ Entitlement Failed to Remove Watermarks
**Frequency**: Daily (5-10 per day) | **Volume**: ~52% of all INCs  
**Park**: Primarily DLR (Disneyland Resort)  
**Symptoms**: Guest purchased PhotoPass+ subscription but images still display watermarks. Guest contacts Guest Services for resolution.  
**Trigger**: Entitlement system fails to propagate PP+ status to photo rendering pipeline.  
**Resolution**:
1. GS team applies workaround (manual watermark removal per guest)
2. Issue tracked via **PRB0076145** — recurring platform bug, fix in development
3. Close as "Solved (Work Around)"

**Work Note Template**:
```
GS team has recovered the incident with a workaround. The team is already working on the solution and is monitoring the issue via PRB0076145.
```

**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi

---

### 2. Possible Black Hole (AGMC Photos Missing)
**Frequency**: Daily (2-4 per day) | **Volume**: ~20% of all INCs  
**Park**: WDW (PFTH, Frozen, Pandora, Boathouse, rides)  
**Symptoms**: Guest reports photos missing from their PhotoPass account. Camera captured but photos never delivered. Gap between expected and actual photo count.  
**Investigation Steps**:
1. Check camera trigger count vs delivered photos for the specific gap/location
2. Verify the consecutive shot count is correct (camera was firing)
3. If E-Team replaced camera between gaps → photos from previous camera are lost
4. Search by guest PPID for any linked photos that may have been misassociated

**Resolution Outcomes** (from real INCs):
- Most common: "No photos found for this gap. Camera trigger count appears correct." → Close as workaround
- Sometimes: Photos found on different gap → link to guest profile
- Rare: Camera replacement between sessions caused the gap

**Work Note Template**:
```
We investigated this, and unfortunately, no photos were found for this gap at this location. The camera's consecutive trigger count appears to be correct, and no photos are available for this case.
```

**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi

---

### 3. AGMC Camera Issues (Freeze/Reset/Not Capturing)
**Frequency**: Daily (1-3 per day) | **Volume**: ~10% of all INCs  
**Source**: PagerDuty alerts from park Entertainment team  
**Locations**: Primarily PFTH (A1, A2, B1, B2, C1, C2, D1, D2), TST, Frozen  
**Symptoms**: Camera freezing mid-session, resetting during character meet, not capturing posed photos, grainy images, out of focus.  
**Resolution**:
1. Restart scene (PFTH process) via AGMC management console
2. If scene restart fails → restart KM services on the camera host
3. If no errors found → restart services preventively ("just in case")
4. If recurring/hardware → report to E-Team for physical inspection

**Work Note Templates**:
```
Solved by restarting scene and KM services. Team will inspect camera light configuration.
```
```
I haven't found any specific errors. The poses are being detected normally. The services were restarted just in case.
```

**Close Code**: Solved (Work Around) or Solved (Permanently)  
**Routing**: Retain in app-flwdw-dpi

---

### 4. CM3 Performance Degradation / Crashes
**Frequency**: Weekly (batch of 4-6 reported together) | **Volume**: ~7% of all INCs  
**Symptoms**: CM3 application freezing, extremely slow response times, blank squares in UI, "Unhandled exception" errors, kernel crash (BSOD), searches taking minutes.  
**Self-Resolving**: Yes — Cast Members restart the application themselves.  
**Resolution**:
1. Cast Member restarts CM3 → issue resolves
2. If multiple users affected simultaneously → check DPI backend health
3. Most tickets are "for documentation purposes" — already resolved by Cast Member

**Work Note Template**:
```
Issue is already taken care by Cast Member. Hence closing the INC.
```
```
CM3 is back to normal, and there have been no further reports regarding this issue.
```

**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi  
**Note**: These are informational tickets. No engineering action needed unless pattern persists across multiple PCs.

---

### 5. Memory Finder — No Scan Time Populations
**Frequency**: Bi-weekly (1-4 per occurrence, grouped by date) | **Volume**: ~5% of all INCs  
**Symptoms**: Memory Finder not populating scan times for a specific date. Guest photos appear but missing time metadata.  
**Root Cause**: Snowflake ETL pipeline error — data not processed for that date.  
**Resolution**:
1. Confirm the affected date(s)
2. Trigger data reprocessing in Snowflake for the failed batch
3. Verify scan times populate after reprocessing
4. Close with confirmation

**Work Note Template**:
```
This was caused by an error with Snowflake. Data was reprocessed and scan times are showing now as expected.
```

**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi

---

### 6. AGMC Photo Crop Error / PHOTOBOMB Error
**Frequency**: Weekly (1-3 per week) | **Volume**: ~4% of all INCs  
**Symptoms**: Photo cropping incorrect on ride/character photos. PHOTOBOMB overlay error on auto-capture photos.  
**Locations**: PFTH, TS Theater, Tiana's Bayou Adventure, various rides  
**Resolution**:
1. Report to DS (Digital Services) team for photo correction
2. GS resolves with guest (redelivers corrected photo)
3. Assign to respective problem for tracking

**Work Note Template**:
```
It has been reported to the DS team. Resolved by GS and assigned to the respective problem.
```

**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi

---

### 7. Can't Complete Purchase (Magneto)
**Frequency**: Weekly (1-2 per week) | **Volume**: ~4% of all INCs  
**Symptoms**: Guest unable to complete PhotoPass purchase on app. Payment flow fails.  
**Resolution**:
1. Check order status in Magneto system (order ID)
2. If order exists → guide guest to retry or complete on website
3. If app issue → recommend web purchase as workaround
4. Log Magneto order reference in work notes

**Work Note Template**:
```
Order in magneto: [order-uuid]. Guest completed purchase on second attempt / via website.
```

**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi

---

### 8. Association Kiosk Issues (Windows Logo / Errors / Slow)
**Frequency**: Weekly (2-3 per week) | **Volume**: ~4% of all INCs  
**Source**: PagerDuty + Entertainment team reports  
**Locations**: Frozen C, Olaf A/B, PFTH association kiosks  
**Symptoms**: Kiosk displaying Windows logo, error messages on screen, very slow session changes, software update prompts.  
**Resolution**:
1. Restart kiosk session via AGMC management console (remote)
2. If software update prompt → TCO (Team Coordination) handles
3. If recurring → physical restart or hardware review

**Work Note Template**:
```
Solved by restarting kiosk session.
```

**Close Code**: Solved (Work Around) or Solved (Permanently)  
**Routing**: Retain in app-flwdw-dpi

---

## Pattern Statistics (June 2026 — 80+ INCs)

| # | Pattern | Volume | Priority | Typical MTTR |
|---|---------|--------|----------|--------------|
| 1 | PP+ Watermarks | 52% | P4 | 24-48h (batch) |
| 2 | Black Hole | 20% | P4 | 1-3 days |
| 3 | Camera Issues | 10% | P4 | 2-8h |
| 4 | CM3 Crashes | 7% | P4 | <1h (self-resolve) |
| 5 | Memory Finder | 5% | P4 | 1-2 days |
| 6 | Crop/PHOTOBOMB | 4% | P4 | 1-2 days |
| 7 | Can't Purchase | 4% | P4 | 1-2 days |
| 8 | Kiosk Issues | 4% | P4 | 1-4h |

**Note**: All PhotoPass incidents are P4 (Normal priority). No P1/P2 incidents in the analyzed period.

---

## Additional Patterns (Discovered in 3-Month Deep Analysis — 250+ INCs)

### 9. iOS Memory Maker / PP+ Failed Titus
**Frequency**: Weekly (3-5 per week) | **Volume**: ~8%  
**Park**: WDW + DLR  
**Symptoms**: Guest purchased Memory Maker or PP+ via iOS app, but entitlement stuck in "Titus" fulfillment system. Order exists in Magneto but PP+ not activated.  
**Resolution**:
1. Verify order in Magneto (find order UUID)
2. Check Titus fulfillment status
3. If stuck: Manually trigger fulfillment or GS workaround
4. If resolved: Entitlement will propagate automatically

**Work Note Template**:
```
iOS MM purchase verified in Magneto. Entitlement fulfilled / Awaiting Titus reprocessing.
```
**Close Code**: Solved (Work Around) or Solved (Permanently)  
**Routing**: Retain in app-flwdw-dpi

---

### 10. UK Memory Maker Did Not Activate Upon Entry
**Frequency**: Weekly (4-6 per week) | **Volume**: ~7%  
**Park**: WDW (UK guests purchasing Memory Maker)  
**Symptoms**: UK guest purchased Memory Maker before arriving but it didn't activate when they entered the park. Photos remain watermarked.  
**Resolution**:
1. Check activation trigger in guest account
2. Verify MM purchase includes park entry activation rule
3. Manual activation via GS tool if needed
4. Confirm photos become unwatermarked after activation

**Work Note Template**:
```
UK Memory Maker activation issue resolved. Guest entitlement was manually activated.
```
**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi

---

### 11. DLR App Not Allowing Download
**Frequency**: Batch (concentrated around app releases) | **Volume**: ~6%  
**Park**: DLR  
**Symptoms**: Guest with valid PP+/LLMP/Magic Key entitlement unable to download photos from Disneyland app. Shows "Buy Photos" CTA instead of "Download".  
**Resolution**:
1. Confirm guest's entitlement status in Magneto
2. If entitled: Have guest try Disneyland website as workaround
3. Known issue tracked in PRB0075606
4. App update usually resolves — guide guest to update app

**Work Note Template**:
```
Guest unable to download from DLR app despite valid entitlement. Workaround: Download from Disneyland website. Issue tracked via PRB0075606.
```
**Close Code**: Solved (Permanently) or Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi  
**Related PRB**: PRB0075606

---

### 12. Photos on Media in CM3 but Not in Magneto (Association Issue)
**Frequency**: Weekly (1-2 per week) | **Volume**: ~2%  
**Park**: WDW  
**Symptoms**: Photos visible in CM3 tool but not linked/visible in Magneto commerce system. Guest can't see/purchase their photos.  
**Resolution**:
1. Find media ID in CM3
2. Check association between media and guest PPID in Magneto
3. Fix association (link media to correct PPID)
4. Confirm photos appear in guest's account

**Work Note Template**:
```
Association was fixed. Photos linked to guest profile.
```
**Close Code**: Solved (Work Around)  
**Routing**: Retain in app-flwdw-dpi

---

## Updated Statistics (March-June 2026 — 250+ INCs + 18 PRBs)

| # | Pattern | Volume | Priority | Typical MTTR |
|---|---------|--------|----------|--------------|
| 1 | PP+ Watermarks (DLR) | ~30% | P4 | 24-48h (batch) |
| 2 | Possible Black Hole | ~20% | P4 | 1-3 days |
| 3 | iOS MM Failed Titus | ~8% | P4 | 1-2 days |
| 4 | Camera Issues (PagerDuty) | ~8% | P4 | 2-8h |
| 5 | UK MM Did Not Activate | ~7% | P4 | 1-2 days |
| 6 | PHOTOBOMB / Crop Error | ~7% | P4 | 1-2 days |
| 7 | DLR App Not Allowing Download | ~6% | P4 | 24h |
| 8 | CM3 Crashes/Performance | ~4% | P4 | <1h |
| 9 | Can't Complete Purchase | ~3% | P4 | 1-2 days |
| 10 | Kiosk Issues | ~3% | P4 | 4h |
| 11 | Photos Not in Magneto | ~2% | P4 | 1 day |
| 12 | Memory Finder (Snowflake) | ~2% | P4 | 1-2 days |

## Known Problems (PRBs) — Active

| PRB | Description | Status | Impact |
|-----|-------------|--------|--------|
| PRB0076145 | PP+ Watermark removal fails (DLR) | Assigned (new) | ~30% of volume |
| PRB0076101 | Could not find matching order item | Assigned | Purchase failures |
| PRB0075606 | DLR iOS Unwatermarked Photos show "Buy" CTA | Solved | DLR download issues |
| PRB0075959 | PhotoPass DMS task failures not triggering incidents | WIP | Monitoring gap |
| PRB0074522 | TMS DLR publish omits usage records | WIP | PhotoPass entitlement |
| PRB0074178 | Android unable to purchase in DLR app | WIP | Purchase flow |
| PRB0070242 | AGMC PHOTOBOMB Error | WIP (Known Error) | Photo quality |
| PRB0066844 | AGMC Photo Crop Error | WIP (Known Error) | Photo quality |
| PRB0066876 | Unable to view photos on In-Park Viewing Stations | WIP | In-park experience |

**Total training data**: 250+ INCs (3 months) + 80+ detailed (June) + 18 PRBs = comprehensive PhotoPass knowledge base.
