# Troubleshooting — DLP Guest Extended Profile

## Common Issues

### Issue: CI Consent Extractor files missing or shorter than expected

**Symptoms:** Exported consent files on S3 are missing or contain fewer records than expected.

**Root Cause:** RabbitMQ cluster is down. The error will show in the Guest Extended Profile Provider logs.

**Resolution:** Check RabbitMQ cluster health. Start troubleshooting from the Extended Profile Provider. Verify RabbitMQ connectivity and queue status. Once RabbitMQ is restored, re-run the batch.

---

### Issue: Extended Profile Provider API errors

**Symptoms:** 5xx errors on profile API endpoints (External IDs, Consent, Avatar, Golden Question).

**Root Cause:** MariaDB connectivity issue, ECS task health degradation, or RabbitMQ unavailability.

**Resolution:** Check AppDynamics dashboard `PROD_DLP_BAPP0177719_wdpr-dlp-is-guest-extended-profile-provider`. Verify MariaDB (dlp-profile-mariadb-prod) health. Check ECS service health in cluster dlp-apps-S0001481-euw1.

---

### Issue: GEP Consent Cleaner Lambda not executing

**Symptoms:** Stale consent data accumulating in database. Lambda not triggering daily.

**Root Cause:** Lambda trigger/schedule misconfiguration or Extended Profile API endpoint unavailable.

**Resolution:** Check Lambda execution in AWS Console (dlp-apps-B0177719-euw1-prd-guest-gep-consentcleaner-f0). Verify the Extended Profile API purge endpoint is responding. Check Splunk dashboard "GEP Consent Cleaner".

---

### Issue: Purge Processor not processing accounts

**Symptoms:** Inactive accounts not being deleted from DLP databases.

**Root Cause:** Purge Extractor batch not running, or Purge Processor not receiving CNS events via RabbitMQ.

**Resolution:** Check Purge Extractor batch execution in Splunk. Verify OID Purge Processor health endpoint. Check RabbitMQ connectivity for CNS event delivery.

---

### Issue: MariaDB connectivity issues

**Symptoms:** Multiple components failing simultaneously (Provider, Consent Extractor, Purge jobs).

**Root Cause:** RDS MariaDB instance (dlp-profile-mariadb-prod) degradation or connectivity issue.

**Resolution:** Check RDS health in AWS Console. Verify security groups and network connectivity. Escalate to Cloud OPS if infrastructure issue.

---

## Escalation Decision Tree

- If RabbitMQ issue → escalate to infrastructure/messaging team
- If MariaDB / RDS issue → escalate to Cloud OPS
- If application logic issue → Luigi Squad (app-frdlp-guestprofile)
- If ECS / infrastructure issue → Cloud OPS
- If Lambda execution issue → check AWS Lambda console, then Luigi Squad

## Known Quirks

- CI Consent Extractor is the most sensitive to RabbitMQ outages
- GEP Consent Cleaner is a simple URL invoker — if it fails, the issue is in the Extended Profile Provider
- Purge Extractor identifies accounts inactive >2 years (GDPR requirement)
- Purge Processor can be triggered by both Purge Extractor AND CNS events
