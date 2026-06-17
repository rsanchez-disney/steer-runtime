# Troubleshooting — DLP Wallet Server Proxy Provider

## Common Issues

### Issue: Pass generation/installation failure

**Symptoms:** Guests unable to add passes to Apple Wallet or Google Pay. API returning 5xx errors. AppDynamics showing elevated error rate on Proxy Provider.

**Root Cause:** Airship API unavailable, DLP data source returning stale/invalid data, or ECS task resource exhaustion.

**Resolution:**
1. Check AppDynamics dashboard: `prod_dlp-is_wallet-server-proxy-provider`
2. Verify health check: confirm `/healthcheck/deep` returns 200
3. Check Splunk Global Technical Dashboard (PROD) for error patterns
4. If Airship API is down, escalate to Airship support — passes will sync once restored
5. If ECS task is unhealthy, force new deployment

---

### Issue: Pass data out of sync with DLP source

**Symptoms:** Guest sees outdated ticket/pass information in their digital wallet. Pass shows old booking details.

**Root Cause:** Synchronization between native pass and DLP data source has failed or is delayed.

**Resolution:**
1. Check Splunk Global Functional Dashboard for sync errors
2. Verify the Proxy Provider service is healthy and processing updates
3. Force a re-sync by triggering a pass update for the affected guest (if tooling available)
4. If widespread, restart the ECS service to clear any stuck state

---

### Issue: Purge Processor not running

**Symptoms:** Expired/cancelled passes still visible to guests. No batch execution logs at expected 6:00 AM window.

**Root Cause:** Batch scheduler misconfiguration, Jenkins job failure, or infrastructure issue preventing execution.

**Resolution:**
1. Check Splunk dashboard "DLP Guest Profile Batchs Executions" for last successful run
2. Check AppDynamics: `prod_dlp-is_wallet-pass-purge-processor`
3. Verify Jenkins job is configured and not paused
4. Manually trigger the batch job if needed
5. Monitor next scheduled execution at 6:00 AM

---

### Issue: Purge Processor partially completing

**Symptoms:** Some expired/cancelled passes are purged but others remain visible. Batch logs show partial completion.

**Root Cause:** Airship API rate limiting, timeout on large batch, or specific passes failing validation before purge.

**Resolution:**
1. Check AppDynamics (prod) for timeout/error patterns during batch window
2. Review Splunk logs for specific pass IDs that failed purge
3. If Airship rate limiting, wait for next batch run — remaining passes will be retried
4. If specific passes consistently fail, investigate data integrity in DLP source

---

## Escalation Decision Tree

- If Proxy Provider health check fails → restart ECS service, then escalate to Beast studio
- If Airship API is unreachable → escalate to Airship/Urban Airship support
- If Purge Processor fails for 2+ consecutive days → escalate to Beast studio
- If pass data integrity issues → escalate to DLP backend team

## Known Quirks

- Purge Processor only runs once daily at 6:00 AM — cancelled/expired passes may remain visible until next batch run
- Digital Device Wallet shows fewer pass types (Tickets, Magic Pass, Annual Pass) compared to Guest Profile Wallet (which also includes DPAU, DPAO, Meet & Greet)
