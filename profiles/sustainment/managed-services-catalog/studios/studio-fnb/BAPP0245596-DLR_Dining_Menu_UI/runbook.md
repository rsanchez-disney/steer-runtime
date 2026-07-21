# Runbook — DLR Dining Menu UI

## Restart Procedures

1. Lambda-based — no ECS restart needed
2. If Lambda issues: redeploy via GitLab Cassian pipeline
3. If S3/CDN issues: check Akamai cache and S3 bucket cgssre-wdpr-revmgmt-prod-usw2-spa

**Validation:**
- Live URL: `https://disneyland.disney.go.com/dining/disney-california-adventure/corn-dog-castle/menus/`
- API Gateway console for 5xx errors

---

## Scaling

- Lambda auto-scales

## Failover

- S3 + Lambda are highly available by design

## Rollback

- Redeploy previous version via GitLab pipeline

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Akamai CDN | CDN team | Cache/routing issues |
| CGS SRE | cgs-sre | S3/API Gateway infra issues |
