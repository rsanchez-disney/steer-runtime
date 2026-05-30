# Troubleshooting — WDPR Ant-Man Collector

## Common Issues

### Issue: Messages Published to D-Scribe But Not Updated to S3

**Symptoms:** Content published in D-Scribe but not appearing in S3 bucket.

**Flow:** D-Scribe → Local Queue → SDM Courier → Collector → (calls Schedule Service) → S3

**Resolution:**
1. Check if Collector received XML using Enterprise ID:
   ```
   index="wdpr_d-scribe" source="*collector-prod/*" AND ("Sdm*" OR "PublishEvent*" OR "*Builder*" OR "Schedule*" OR "ERROR" OR "*Exception*" OR "SUCCESS" OR "Connection") AND ( <ENTERPRISE_ID> ) AND NOT("CombineService" OR "BucketUtils")
   ```
2. Common error: `taxGroupId=null` → tell reporter to update message with correct taxGroupId and republish
3. Check S3 path: `sdm/Schedule/{DEW|DPMSCampus}/{ContentType}/{EnterpriseID}.xml`

---

### Issue: Schedule Process Not Completing (SKIP sendDownstream)

**Symptoms:** Schedule update notification received but not sent downstream. Log shows "SKIP sendDownstream()".

**Root Cause:** isSendDownstreamFlag() returns False for the content.

**Resolution:**
1. Verify notification arrived: check for "Schedule Update Complete" log
2. Check for SKIP: `index="wdpr_d-scribe" source="*collector-prod/*" AND ( <ENTERPRISEID> ) "SKIP sendDownstream()"`
3. Resend manually with force=true:
   - `https://{env}.d-scribe-collector-internal.wdprapps.disney.com/sdm/ScheduleUpdate?EnterpriseId={EID}&ContentType={CT}&force=true`
   - Or via Composite SDM: `https://{env}.composite-sdm.wdprapps.disney.com/sdm/ScheduleUpdate?EnterpriseId={EID}&ContentType={CT}&force=true`
4. Example INC: INC20351218

---

### Issue: MMA Queue Logs Empty

**Symptoms:** MMA DEW/DPMSCampus queries return no results; downstream Composite/FACSVC not receiving data.

**Resolution:**
1. Check MMA DEW: `index=wdpr_product_content_mma Logger=ENDPOINT_LOGGING_INTERCEPTOR "x_mma_destination=DEW_AND_FACSV" <conversationId>`
2. Check MMA DPMSCampus: `index=wdpr_product_content_mma Logger=ENDPOINT_LOGGING_INTERCEPTOR "x_mma_destination=DPMSCampus" <conversationId>`
3. If empty → problem is SDM Courier or MMA → contact SE
4. Get EnterpriseIDs to republish and use republish script
5. Example INC: INC20413528

---

### Issue: Pricing View Doesn't Show Schedules (Pipeline Works)

**Symptoms:** All GCx Ant-Man pipeline works correctly but Pricing View/Dream doesn't display schedules.

**Resolution:**
1. Review schedule process flow — verify all steps completed
2. If flow is correct, verify with A La Carte team (for MealPeriod) or schedule owner
3. Contact: **Manojkumar Dash** (Dream/Pricing View team)
4. Owner team must publish schedules as last resort

---

### Issue: Collector Calls Not Showing POIs for es-US

**Symptoms:** POIs available in en-US but returning empty for es-US.

**Resolution:**
1. Get POI list from working en-US Collector call
2. For each POI, call Watcher combine: `https://prod-stage.d-scribe-watcher.wdprapps.disney.com/combine/preview2/es-US/pointofinterest/<POI_ID>`
3. Call twice (first returns 404, second returns valid response — refreshes neoteric cache)

---

### Issue: Collector Calls Returning 404 for ticket/atscode URLs

**Symptoms:** `https://d-scribe-collector.wdprapps.disney.com/services/guest/v1/ticket/atscode/{code}` returns 404.

**Resolution:**
1. This is a content issue requiring republish
2. Assign INC to AG: **app-flwdw-TBXLoad**
3. Contact: **Melissa Hunt**
4. Related INCs: INC22149979, INC22143773, INC22152457

---

### Issue: Collector Calls Returning 404 After Host Forwarding

**Symptoms:** External Collector URL returns 404 for a facet ID.

**Resolution:**
1. Call internal endpoint: `https://prod-stage.d-scribe-collector-internal.wdprapps.disney.com/services/guest/v1/facet/{facetId}`
2. This creates the content in S3 and returns 200 OK

---

### Issue: Hung Task (100% CPU for > 1 hour)

**Symptoms:** AppDynamics shows Process CPU Usage at 100% for more than an hour without recovery.

**Resolution:**
1. In AppDynamics: Tiers & Nodes → Expand node list → Double click node → JMX → View JMX matrix
2. Expand JMX → Process CPU Usage %
3. If 100% for > 1 hour → task is hung, kill/restart the ECS task

---

### Issue: Facets Not Updated in Collector but Present in Watcher/Transform

**Symptoms:** Watcher and Transform show updated facets but Collector still returns old data.

**Resolution:**
1. Ask producer to republish content with a small change
2. Alternative: Call Watcher combine with header `processCombine: true`

---

## Escalation Decision Tree

- If SDM Courier / MMA issues → contact SE (Site Engineering)
- If ticket/atscode content → assign to AG: app-flwdw-TBXLoad (Melissa Hunt)
- If Pricing View/Dream → contact Manojkumar Dash
- If facilities not published → contact Jyl Deshler, Cindy Lovejoy
- If infrastructure/ECS → escalate to Cloud Platform team
- If Collector logic bugs → escalate to Ant-Man Dev team

## Known Quirks

- Only prod and prod-load environments are active; prod-stage, prod-latest, stage, latest are **retired**
- Uses Java 11 (older than other Ant-Man services which use Java 17)
- ECS cluster is `d-scribe-prod` in account 876496569223 (wdpr-apps) — different from other services
- Watcher combine calls sometimes need to be called twice (first 404, second 200) to refresh neoteric cache
- S3 paths: `sdm/Schedule/{DEW|DPMSCampus}/{ContentType}/{EnterpriseID}.xml` and `legacy/preview2/{locale}/legacy/{type}/{id}.json`
- Additional Splunk index: `wdpr_product_content_mma` for MMA queue tracing
- Databases: OS_PROD_CAMPUS, OS_PROD_D3 (table: SDM_JOB_INFO)
