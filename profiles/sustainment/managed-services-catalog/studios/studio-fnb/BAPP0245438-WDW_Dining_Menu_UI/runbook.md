# Runbook — WDW Dining Menu UI

## Restart Procedures

1. Lambda-based — no ECS restart needed
2. If Lambda issues: redeploy via GitLab Cassian pipeline
3. If S3/CDN issues: check Akamai cache and S3 bucket cgssre-wdpr-revmgmt-prod-use1-spa

**Validation:**
- Live URL: `https://disneyworld.disney.go.com/dining/hollywood-studios/mama-melrose-ristorante-italiano/menus`
- API Gateway console for 5xx errors

---

## Scaling

- Lambda auto-scales — no manual intervention needed

## Failover

- S3 + Lambda are highly available by design

## Rollback

- Redeploy previous version via GitLab pipeline

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Akamai CDN | CDN team | Cache/routing issues |
| CGS SRE | cgs-sre | S3/API Gateway infra issues |
