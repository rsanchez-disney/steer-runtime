# Runbook — DLP Ticket Management Service Database

## RDS Instances

| Environment | Instance Name | Account ID | Role |
|-------------|--------------|------------|------|
| Prod | dlp-tms-mariadb-prod | 725065748993 | dlp-apps-prod |
| Stage | dlp-tms-mariadb-stage | 564479547993 | dlp-apps-test |
| Load | dlp-tms-mariadb-load | 564479547993 | dlp-apps-test |
| Latest | dlp-tms-mariadb-latest | 301080195839 | dlp-apps-dev |

---

## Monitoring

### AppDynamics
| Environment | Dashboard |
|-------------|-----------|
| Prod | Available |
| Load | Available |
| Stage | Available |
| Latest | N/A |

---

## Restart Procedures

RDS is a managed service — restart via AWS Console if needed (requires Cloud OPS).

**Validation:** Check TMS Provider health endpoints after DB recovery.

---

## Scaling

- Managed by AWS RDS — scale instance class via AWS Console (Cloud OPS)

## Failover

- RDS automated failover (if Multi-AZ configured)

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| RDS Infrastructure | ops-frdlp-cloudops | Instance health, scaling, failover |
| Database schema/queries | app-frdlp-guestprofile (Luigi Squad) | Performance tuning, schema changes |
