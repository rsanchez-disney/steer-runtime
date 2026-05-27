# Runbook — WDPR AuthenticatorJS

## Restart Procedures

1. N/A — Static JS bundle served from S3 via Akamai CDN. No running service to restart.
2. If bundle is corrupted or missing: redeploy via Harness pipeline (authenticatorbundlejs_deploy for V4, authenticatorv5js for V5).

**Validation:** Verify bundle is accessible via CDN URL. Check Splunk for new errors after deploy.

---

## Scaling

- **Scale up:** N/A — Static asset served by Akamai CDN (auto-scales)
- **Scale down:** N/A

## Failover

- Akamai CDN provides edge caching and failover. If S3 origin is down, cached copies may still be served from edge nodes.
- No active-active failover for the bundle itself — single S3 source of truth.

## Rollback

- Redeploy previous version via Harness pipeline
- V4: authenticatorbundlejs_deploy pipeline
- V5: authenticatorv5js pipeline
- Harness Org: Guest_Account_Capabilities / Guest_Account_Management (V4) | WDPR_OneID_Integration (V5)
- Functional User: WDPR-CICD-dpep-devops (owner: Lokesh Krishnappa) — access to digital-media S3 bucket and KMS key

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| OneID (V4/V5) | IDY Jira | When OneID-side issue confirmed (token expiry, Trust State mismatch) |
| Profile JWT Service | Andrew Southwick | When JWT token generation fails after login |
| Akamai CDN | ops-global-parks-se-guestexp | When CDN is not serving bundle or returning errors |
| S3 (digital-media bucket) | Lokesh Krishnappa (WDPR-CICD-dpep-devops) | When S3 access/KMS key issues |
