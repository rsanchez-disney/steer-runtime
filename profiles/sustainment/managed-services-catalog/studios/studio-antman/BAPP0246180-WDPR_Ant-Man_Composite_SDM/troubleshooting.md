# Troubleshooting — WDPR Ant-Man Composite SDM

## Common Issues

### Issue: SDM Notifications Not Reaching Downstream

**Symptoms:** Notifications not received by downstream consumers; schedule updates not processed.

**Resolution:**
1. Verify notification was generated — check Splunk for the EnterpriseId:
   ```
   index="wdpr_d-scribe" source="*sdm*prod/*" AND ("Sdm*" OR "PublishEvent*" OR "*Builder*" OR "Schedule*" OR "ERROR" OR "*Exception*" OR "SUCCESS" OR "Connection") AND (<ENTERPRISE_ID>)
   ```
2. Look for successful flow patterns:
   - `processScheduleUpdate(): Schedule Update COMPLETE: Tx ContentType=ActivityProduct: Tx EnterpriseId=<EID>`
   - `HTTP 200: Request received: /sdm/ScheduleUpdate?EnterpriseId...`
   - `sendRabbitMQ... message SENT: Tx contentType=MealPeriod: Tx enterpriseId=<EID>`
3. If no SENT confirmation, check for SKIP: `index="wdpr_d-scribe" source="*sdm*prod/*" SKIP <ENTERPRISE_ID>`
4. Confirm XML stored in S3: look for `S3 : Store : d-scribe-content-live : sdm/Schedule/{CT}/{Location}/{EID}.xml`

---

### Issue: Notification Skipped (sendDownstream not executed)

**Symptoms:** Log shows processing but no downstream send; SKIP signal in logs.

**Root Cause:** `sendDownstream()` flag is False for the content.

**Resolution:**
1. Check for SKIP: `index="wdpr_d-scribe" source="*sdm*prod/*" SKIP <ENTERPRISE_ID>`
2. Manual republish via GCX Tools API Gateway:
   ```
   GET https://gcx-tools-api.wdprapps.disney.com/sdm/publishnotification?EnterpriseId={EID}&ContentType={CT}&Status=Stored&TargetType=Live&Language=en-US
   ```
3. Example: `/sdm/PublishNotification?EnterpriseId=18475670&ContentType=MealPeriod&Status=Stored&TargetType=Live&Language=en-US`

---

### Issue: RabbitMQ Connectivity Failures

**Symptoms:** Notifications processed but not sent to RabbitMQ; no "SENT" confirmation in logs.

**Root Cause:** RabbitMQ broker (BAPP0234155) connectivity issues.

**Resolution:**
1. Check Splunk for RMQ errors: `index="wdpr_d-scribe" source="*composite-sdm-prod/*" "RabbitMQ" OR "connection" level=ERROR`
2. Verify RabbitMQ health: https://collector-rmq.wdprapps.disney.com/
3. If RMQ is down, see BAPP0234155 troubleshooting

---

### Issue: S3 Storage Failures

**Symptoms:** Notifications processed but XML not stored in S3.

**Root Cause:** S3 write failures, permissions, or bucket issues.

**Resolution:**
1. Check Splunk for S3 errors: `index="wdpr_d-scribe" source="*composite-sdm-prod/*" "S3" level=ERROR`
2. Verify S3 bucket access (d-scribe-content-live in account 876496569223)
3. Escalate to Platform Engineering if infrastructure issue

---

## Escalation Decision Tree

- If RabbitMQ issues → check BAPP0234155 (RMQ for Collector)
- If content/data errors → fix data and manually republish via GCX Tools API
- If SE dependency issues → create incident with SE team
- If infrastructure/ECS/S3 → escalate to Cloud Platform team
- If application logic bugs → escalate to Ant-Man Dev team

## Known Quirks

- Uses Java 11.0.23 (older runtime)
- Uses shared ECS cluster (wdpr-content-S0001431-usw2-prd)
- S3 path pattern: `sdm/Schedule/{ContentType}/{Location}/{EnterpriseId}.xml`
- Manual republish available via GCX Tools API Gateway (not directly on Composite SDM)
- Latest environment service name differs: `antman-composite-sdm-latest-live` (vs `composite-sdm-{env}-live` for others)
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*composite-sdm-prod/*"` for production
- Troubleshooting tools: https://mywiki.disney.com/pages/viewpage.action?pageId=650185839
